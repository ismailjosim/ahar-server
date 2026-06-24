import { prisma } from '@/config/prisma.config'
import AppError from '@/helpers/AppError'
import { calculatePagination } from '@/utils/paginationHelper'
import StatusCode from '@/utils/statusCode'

import { ReservationStatus } from '../../../generated/prisma/enums'
import { EmailService } from '@/shared/email.service'

type ReservationPayload = Record<string, unknown>

// ── Status helpers ────────────────────────────────────────────────────────────

/** Map client-facing string → DB enum */
const toStatus = (status?: string): ReservationStatus => {
	switch (status) {
		case 'Approved':
			return ReservationStatus.APPROVED
		case 'Rejected':
			return ReservationStatus.REJECTED
		case 'Cancelled':
			return ReservationStatus.CANCELLED
		default:
			return ReservationStatus.PENDING
	}
}

/** Map DB enum → client-facing string */
const fromStatus = (status: ReservationStatus): string => {
	switch (status) {
		case ReservationStatus.APPROVED:
			return 'Approved'
		case ReservationStatus.REJECTED:
			return 'Rejected'
		case ReservationStatus.CANCELLED:
			return 'Cancelled'
		default:
			return 'Pending'
	}
}

/** Valid status transitions. Empty array = terminal state. */
const VALID_TRANSITIONS: Record<string, string[]> = {
	Pending: ['Approved', 'Rejected', 'Cancelled'],
	Approved: ['Cancelled'],
	Rejected: [],
	Cancelled: [],
}

// ── Date helper ───────────────────────────────────────────────────────────────

const parseReservationDate = (value: unknown) => {
	const date = new Date(String(value || ''))
	return Number.isNaN(date.getTime()) ? new Date() : date
}

// ── Response shaper ───────────────────────────────────────────────────────────

const toClient = (
	reservation: Awaited<ReturnType<typeof prisma.reservation.findFirst>>,
) => {
	if (!reservation) return null
	return {
		id: reservation.id,
		customer: reservation.customerName,
		phone: reservation.phone,
		email: reservation.email ?? null,
		guests: reservation.guests,
		time:
			reservation.displayTime ||
			reservation.reservationTime.toISOString(),
		table: reservation.tableCode || 'TBD',
		status: fromStatus(reservation.status),
		occasion: reservation.occasion ?? null,
		notes: reservation.notes ?? null,
		userId: reservation.userId ?? null,
	}
}

// ── Conflict detection ────────────────────────────────────────────────────────

/**
 * Throws CONFLICT (409) when the time slot already has maxTablesPerSlot or
 * more PENDING/APPROVED reservations within the configured slot gap window.
 *
 * @param displayTime - The human-readable reservation time string.
 * @param excludeId   - Reservation ID to exclude from the count (for updates).
 */
async function checkConflict(
	displayTime: string,
	excludeId?: string,
): Promise<void> {
	const settings = await prisma.restaurantSettings.findFirst({
		where: { id: 'default' },
	})
	const maxTables = settings?.maxTablesPerSlot ?? 10
	const slotHalfGap = ((settings?.reservationSlotGap ?? 30) / 2) * 60 * 1000

	const reservationDate = parseReservationDate(displayTime)
	const slotStart = new Date(reservationDate.getTime() - slotHalfGap)
	const slotEnd = new Date(reservationDate.getTime() + slotHalfGap)

	const conflicting = await prisma.reservation.count({
		where: {
			reservationTime: { gte: slotStart, lte: slotEnd },
			status: {
				in: [ReservationStatus.PENDING, ReservationStatus.APPROVED],
			},
			...(excludeId ? { NOT: { id: excludeId } } : {}),
		},
	})

	if (conflicting >= maxTables) {
		throw new AppError(
			StatusCode.CONFLICT,
			'This time slot is fully booked. Please choose a different time.',
		)
	}
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

const getReservations = async (query: Record<string, unknown>) => {
	const { page, limit, skip } = calculatePagination({
		page: Number(query.page || 1),
		limit: Number(query.limit || query.pageSize || 20),
	})
	const search = typeof query.search === 'string' ? query.search : undefined
	const status =
		typeof query.status === 'string' && query.status
			? toStatus(query.status)
			: undefined
	const where = {
		...(status && { status }),
		...(search && {
			OR: [
				{ id: { contains: search, mode: 'insensitive' as const } },
				{
					customerName: {
						contains: search,
						mode: 'insensitive' as const,
					},
				},
				{ phone: { contains: search, mode: 'insensitive' as const } },
				{
					tableCode: {
						contains: search,
						mode: 'insensitive' as const,
					},
				},
			],
		}),
	}
	const [data, total] = await Promise.all([
		prisma.reservation.findMany({
			where,
			skip,
			take: limit,
			orderBy: { createdAt: 'desc' },
		}),
		prisma.reservation.count({ where }),
	])
	return { data: data.map(toClient), total, page, limit }
}

const getReservationById = async (id: string) => {
	const reservation = await prisma.reservation.findUnique({ where: { id } })
	if (!reservation) {
		throw new AppError(StatusCode.NOT_FOUND, 'Reservation not found')
	}
	return toClient(reservation)
}

/**
 * Creates a new reservation.
 *
 * Validations:
 *  1. Reservation time must be in the future.
 *  2. Slot must not be at capacity.
 *
 * If `userId` is provided (logged-in user), it is persisted on the record.
 */
const createReservation = async (
	payload: ReservationPayload,
	userId?: string,
) => {
	// Support both field name conventions coming from the frontend.
	const displayTime = String(
		payload.displayTime || payload.time || '',
	)

	// 1. Must be in the future.
	const reservationDate = parseReservationDate(displayTime)
	if (reservationDate <= new Date()) {
		throw new AppError(
			StatusCode.BAD_REQUEST,
			'Reservation time must be in the future.',
		)
	}

	// 2. Conflict / capacity check.
	await checkConflict(displayTime)

	const reservation = await prisma.reservation.create({
		data: {
			customerName: String(
				payload.customerName ||
					payload.customer ||
					'Guest',
			),
			phone: String(payload.phone || ''),
			email: payload.email ? String(payload.email) : undefined,
			guests: Number(payload.guests || 2),
			reservationTime: reservationDate,
			displayTime,
			tableCode: String(
				payload.tableCode || payload.table || 'TBD',
			),
			status: toStatus(String(payload.status || 'Pending')),
			occasion: payload.occasion ? String(payload.occasion) : undefined,
			notes:
				payload.notes || payload.request
					? String(payload.notes || payload.request)
					: undefined,
			userId: userId ?? null,
		},
	})

	// Send reservation confirmation email
	EmailService.sendReservationConfirmation({
		customerName: reservation.customerName,
		email: reservation.email,
		phone: reservation.phone,
		id: reservation.id,
		guests: reservation.guests,
		displayTime: reservation.displayTime,
		tableCode: reservation.tableCode ?? undefined,
	}).catch((err) =>
		console.error('[Email] Reservation confirmation failed:', err)
	)

	return toClient(reservation)
}

const updateReservation = async (id: string, payload: ReservationPayload) => {
	const existing = await getReservationById(id)
	if (!existing) {
		throw new AppError(StatusCode.NOT_FOUND, 'Reservation not found')
	}

	// Validate status transition.
	if (payload.status !== undefined) {
		const currentStatus = existing.status
		const nextStatus = String(payload.status)
		const allowed = VALID_TRANSITIONS[currentStatus] ?? []
		if (!allowed.includes(nextStatus)) {
			throw new AppError(
				StatusCode.BAD_REQUEST,
				`Cannot transition reservation from "${currentStatus}" to "${nextStatus}".`,
			)
		}
	}

	// If rescheduling, validate future time and check capacity.
	const displayTime =
		payload.displayTime !== undefined
			? String(payload.displayTime)
			: payload.time !== undefined
				? String(payload.time)
				: undefined

	if (displayTime !== undefined) {
		const reservationDate = parseReservationDate(displayTime)
		if (reservationDate <= new Date()) {
			throw new AppError(
				StatusCode.BAD_REQUEST,
				'Reservation time must be in the future.',
			)
		}
		await checkConflict(displayTime, id)
	}

	const reservation = await prisma.reservation.update({
		where: { id },
		data: {
			...(payload.customer !== undefined && {
				customerName: String(payload.customer),
			}),
			...(payload.customerName !== undefined && {
				customerName: String(payload.customerName),
			}),
			...(payload.phone !== undefined && {
				phone: String(payload.phone),
			}),
			...(payload.email !== undefined && {
				email: payload.email ? String(payload.email) : null,
			}),
			...(payload.guests !== undefined && {
				guests: Number(payload.guests),
			}),
			...(displayTime !== undefined && {
				displayTime,
				reservationTime: parseReservationDate(displayTime),
			}),
			...(payload.tableCode !== undefined && {
				tableCode: String(payload.tableCode),
			}),
			...(payload.table !== undefined && {
				tableCode: String(payload.table),
			}),
			...(payload.status !== undefined && {
				status: toStatus(String(payload.status)),
			}),
			...(payload.notes !== undefined && {
				notes: String(payload.notes),
			}),
			...(payload.occasion !== undefined && {
				occasion: String(payload.occasion),
			}),
		},
	})

	// Send status update email for approved/rejected
	const newStatus = String(payload.status)
	if (
		newStatus &&
		['Approved', 'Rejected'].includes(newStatus) &&
		reservation.email
	) {
		EmailService.sendReservationStatusUpdate({
			customerName: reservation.customerName,
			email: reservation.email,
			id: reservation.id,
			status: newStatus,
		}).catch((err) =>
			console.error('[Email] Reservation status update failed:', err)
		)
	}

	return toClient(reservation)
}

const deleteReservation = async (id: string) => {
	await getReservationById(id)
	await prisma.reservation.delete({ where: { id } })
	return null
}

export const ReservationsService = {
	getReservations,
	getReservationById,
	createReservation,
	updateReservation,
	deleteReservation,
}
