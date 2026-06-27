import catchAsync from '@/shared/catchAsync'
import sendResponse from '@/shared/sendResponse'
import StatusCode from '@/utils/statusCode'

import { StaffService } from './staff.service'

const listStaff = catchAsync(async (req, res) => {
	const data = await StaffService.listStaff(req.query)
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Staff list retrieved successfully.',
		data,
	})
})

const updateStaffRole = catchAsync(async (req, res) => {
	const updated = await StaffService.updateStaffRole(
		String(req.params.id),
		req.body.role,
		req.user!.id,
	)
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Staff role updated successfully.',
		data: updated,
	})
})

const toggleActive = catchAsync(async (req, res) => {
	const updated = await StaffService.setStaffActive(
		String(req.params.id),
		req.body.isActive,
		req.user!.id,
	)
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Staff status updated successfully.',
		data: updated,
	})
})

const inviteStaff = catchAsync(async (req, res) => {
	const result = await StaffService.inviteStaff(
		req.body.email,
		req.body.role,
		req.user!.name,
	)
	sendResponse(res, {
		statusCode: StatusCode.CREATED,
		success: true,
		message: 'Staff invite sent successfully.',
		data: result,
	})
})

const acceptInvite = catchAsync(async (req, res) => {
	const data = await StaffService.acceptInvite(String(req.params.token))
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Invite token validated successfully.',
		data,
	})
})

const markInviteUsed = catchAsync(async (req, res) => {
	await StaffService.markInviteUsed(String(req.params.token))
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Invite marked as used.',
		data: null,
	})
})

export const StaffController = {
	listStaff,
	updateStaffRole,
	toggleActive,
	inviteStaff,
	acceptInvite,
	markInviteUsed,
}
