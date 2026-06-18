import catchAsync from '@/shared/catchAsync'
import sendResponse from '@/shared/sendResponse'
import StatusCode from '@/utils/statusCode'

import { ReservationsService } from './reservations.service'

const getReservations = catchAsync(async (req, res) => {
	const result = await ReservationsService.getReservations(req.query)
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Reservations retrieved successfully',
		meta: {
			page: result.page,
			limit: result.limit,
			total: result.total,
		},
		data: result.data,
	})
})

const getReservationById = catchAsync(async (req, res) => {
	const result = await ReservationsService.getReservationById(
		String(req.params.id),
	)
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Reservation retrieved successfully',
		data: result,
	})
})

const createReservation = catchAsync(async (req, res) => {
	const result = await ReservationsService.createReservation(req.body)
	sendResponse(res, {
		statusCode: StatusCode.CREATED,
		success: true,
		message: 'Reservation created successfully',
		data: result,
	})
})

const updateReservation = catchAsync(async (req, res) => {
	const result = await ReservationsService.updateReservation(
		String(req.params.id),
		req.body,
	)
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Reservation updated successfully',
		data: result,
	})
})

const deleteReservation = catchAsync(async (req, res) => {
	await ReservationsService.deleteReservation(String(req.params.id))
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Reservation deleted successfully',
		data: null,
	})
})

export const ReservationsController = {
	getReservations,
	getReservationById,
	createReservation,
	updateReservation,
	deleteReservation,
}
