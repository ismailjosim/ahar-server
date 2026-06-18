import { prisma } from '@/config/prisma.config'
import AppError from '@/helpers/AppError'
import { calculatePagination } from '@/utils/paginationHelper'
import StatusCode from '@/utils/statusCode'

import { fromDbPaymentStatus, toDbPaymentStatus } from '../orders/orders.utils'

type PaymentPayload = Record<string, unknown>

const toClient = (
	payment: Awaited<ReturnType<typeof prisma.payment.findFirst>>,
) => {
	if (!payment) return null
	return {
		id: payment.id,
		orderId: payment.orderId || undefined,
		transactionId: payment.providerTransactionId || undefined,
		method: payment.method,
		amount: payment.amount,
		status: fromDbPaymentStatus(payment.status),
		createdAt: payment.createdAt.toISOString(),
	}
}

const getPayments = async (query: Record<string, unknown>) => {
	const { page, limit, skip } = calculatePagination({
		page: Number(query.page || 1),
		limit: Number(query.limit || query.pageSize || 20),
	})
	const search = typeof query.search === 'string' ? query.search : undefined
	const status =
		typeof query.status === 'string' && query.status
			? toDbPaymentStatus(query.status)
			: undefined
	const where = {
		...(status && { status }),
		...(search && {
			OR: [
				{ id: { contains: search, mode: 'insensitive' as const } },
				{ orderId: { contains: search, mode: 'insensitive' as const } },
				{
					providerTransactionId: {
						contains: search,
						mode: 'insensitive' as const,
					},
				},
				{ method: { contains: search, mode: 'insensitive' as const } },
			],
		}),
	}
	const [data, total] = await Promise.all([
		prisma.payment.findMany({
			where,
			skip,
			take: limit,
			orderBy: { createdAt: 'desc' },
		}),
		prisma.payment.count({ where }),
	])
	return { data: data.map(toClient), total, page, limit }
}

const getPaymentById = async (id: string) => {
	const payment = await prisma.payment.findUnique({ where: { id } })
	if (!payment) throw new AppError(StatusCode.NOT_FOUND, 'Payment not found')
	return toClient(payment)
}

const createPayment = async (payload: PaymentPayload) => {
	const payment = await prisma.payment.create({
		data: {
			orderId: payload.orderId ? String(payload.orderId) : undefined,
			provider: String(payload.provider || payload.method || 'manual'),
			method: String(payload.method || 'Unknown'),
			amount: Number(payload.amount || 0),
			status: toDbPaymentStatus(String(payload.status || 'Pending')),
			providerTransactionId: payload.transactionId
				? String(payload.transactionId)
				: undefined,
		},
	})
	return toClient(payment)
}

const updatePayment = async (id: string, payload: PaymentPayload) => {
	await getPaymentById(id)
	const payment = await prisma.payment.update({
		where: { id },
		data: {
			...(payload.status !== undefined && {
				status: toDbPaymentStatus(String(payload.status)),
			}),
			...(payload.transactionId !== undefined && {
				providerTransactionId: String(payload.transactionId),
			}),
		},
	})
	return toClient(payment)
}

export const PaymentsService = {
	getPayments,
	getPaymentById,
	createPayment,
	updatePayment,
}
