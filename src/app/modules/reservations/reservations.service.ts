import { prisma } from '@/config/prisma.config'
import AppError from '@/helpers/AppError'
import { calculatePagination } from '@/utils/paginationHelper'
import StatusCode from '@/utils/statusCode'

import { ReservationStatus } from '../../../generated/prisma/enums'

type ReservationPayload = Record<string, unknown>

const toStatus = (status?: string) =>
	status === 'Approved'
		? ReservationStatus.APPROVED
		: ReservationStatus.PENDING

const fromStatus = (status: ReservationStatus) =>
	status === ReservationStatus.APPROVED ? 'Approved' : 'Pending'

const parseReservationDate = (value: unknown) => {
	const date = new Date(String(value || ''))
	return Number.isNaN(date.getTime()) ? new Date() : date
}

const toClient = (
	reservation: Awaited<ReturnType<typeof prisma.reservation.findFirst>>,
) => {
	if (!reservation) return null
	return {
		id: reservation.id,
		customer: reservation.customerName,
		phone: reservation.phone,
		guests: reservation.guests,
		time:
			reservation.displayTime ||
			reservation.reservationTime.toISOString(),
		table: reservation.tableCode || 'TBD',
		status: fromStatus(reservation.status),
	}
}

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

const createReservation = async (payload: ReservationPayload) => {
	const displayTime = String(payload.time || '')
	const reservation = await prisma.reservation.create({
		data: {
			customerName: String(
				payload.customer || payload.customerName || 'Guest',
			),
			phone: String(payload.phone || ''),
			guests: Number(payload.guests || 2),
			reservationTime: parseReservationDate(displayTime),
			displayTime,
			tableCode: String(payload.table || payload.tableCode || 'TBD'),
			status: toStatus(String(payload.status || 'Pending')),
			notes: payload.request ? String(payload.request) : undefined,
		},
	})
	return toClient(reservation)
}

const updateReservation = async (id: string, payload: ReservationPayload) => {
	await getReservationById(id)
	const displayTime =
		payload.time === undefined ? undefined : String(payload.time)
	const reservation = await prisma.reservation.update({
		where: { id },
		data: {
			...(payload.customer !== undefined && {
				customerName: String(payload.customer),
			}),
			...(payload.phone !== undefined && {
				phone: String(payload.phone),
			}),
			...(payload.guests !== undefined && {
				guests: Number(payload.guests),
			}),
			...(displayTime !== undefined && {
				displayTime,
				reservationTime: parseReservationDate(displayTime),
			}),
			...(payload.table !== undefined && {
				tableCode: String(payload.table),
			}),
			...(payload.status !== undefined && {
				status: toStatus(String(payload.status)),
			}),
		},
	})
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
