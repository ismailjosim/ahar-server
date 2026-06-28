import crypto from 'node:crypto'

import { prisma } from '@/config/prisma.config'
import AppError from '@/helpers/AppError'
import { EmailService } from '@/shared/email.service'
import { calculatePagination } from '@/utils/paginationHelper'
import StatusCode from '@/utils/statusCode'

import { UserRole, UserStatus } from '../../../generated/prisma/enums'

export const StaffService = {
	async listStaff(query: { page?: number; pageSize?: number }) {
		const { page, limit, skip } = calculatePagination(query)
		const NON_CUSTOMER_ROLES: UserRole[] = [
			'CASHIER',
			'KITCHEN',
			'MANAGER',
			'OWNER',
			'SUPER_ADMIN',
		]

		const [data, total] = await prisma.$transaction([
			prisma.user.findMany({
				where: { role: { in: NON_CUSTOMER_ROLES } },
				orderBy: { createdAt: 'desc' },
				skip,
				take: limit,
				select: {
					id: true,
					name: true,
					email: true,
					phone: true,
					role: true,
					status: true,
					createdAt: true,
				},
			}),
			prisma.user.count({ where: { role: { in: NON_CUSTOMER_ROLES } } }),
		])

		const formattedData = data.map((user) => ({
			id: user.id,
			name: user.name,
			email: user.email,
			phone: user.phone,
			role: user.role,
			isActive: user.status === UserStatus.ACTIVE,
			createdAt: user.createdAt,
		}))

		return { data: formattedData, total, page, limit }
	},

	async updateStaffRole(id: string, role: string, requesterId: string) {
		if (id === requesterId) {
			throw new AppError(
				StatusCode.BAD_REQUEST,
				'You cannot change your own role.',
			)
		}

		const user = await prisma.user.findUnique({ where: { id } })
		if (!user) {
			throw new AppError(StatusCode.NOT_FOUND, 'User not found.')
		}

		const upperRole = role.toUpperCase() as UserRole

		if (
			user.role === UserRole.SUPER_ADMIN &&
			upperRole !== UserRole.SUPER_ADMIN
		) {
			throw new AppError(
				StatusCode.FORBIDDEN,
				'Cannot demote another super admin.',
			)
		}

		return prisma.user.update({
			where: { id },
			data: { role: upperRole },
		})
	},

	async setStaffActive(id: string, isActive: boolean, requesterId: string) {
		if (id === requesterId) {
			throw new AppError(
				StatusCode.BAD_REQUEST,
				'You cannot deactivate your own account.',
			)
		}

		const user = await prisma.user.findUnique({ where: { id } })
		if (!user) {
			throw new AppError(StatusCode.NOT_FOUND, 'User not found.')
		}

		const status = isActive ? UserStatus.ACTIVE : UserStatus.INACTIVE

		return prisma.user.update({
			where: { id },
			data: { status },
		})
	},

	async inviteStaff(email: string, role: string, inviterName: string) {
		const existing = await prisma.user.findUnique({ where: { email } })
		if (existing) {
			throw new AppError(
				StatusCode.CONFLICT,
				'A user with this email already exists.',
			)
		}

		const pending = await prisma.staffInvite.findUnique({
			where: { email },
		})
		if (pending && pending.expiresAt > new Date()) {
			throw new AppError(
				StatusCode.CONFLICT,
				'An invite has already been sent to this email.',
			)
		}

		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

		const invite = await prisma.staffInvite.upsert({
			where: { email },
			update: {
				role,
				token: crypto.randomUUID(),
				expiresAt,
				usedAt: null,
			},
			create: { email, role, expiresAt, token: crypto.randomUUID() },
		})

		await EmailService.sendStaffInvite({
			email,
			role,
			token: invite.token,
			inviterName,
		})

		return {
			email: invite.email,
			role: invite.role,
			expiresAt: invite.expiresAt,
		}
	},

	async acceptInvite(token: string) {
		const invite = await prisma.staffInvite.findUnique({ where: { token } })
		if (!invite) {
			throw new AppError(StatusCode.NOT_FOUND, 'Invalid invite link.')
		}
		if (invite.usedAt) {
			throw new AppError(
				StatusCode.BAD_REQUEST,
				'This invite has already been used.',
			)
		}
		if (invite.expiresAt < new Date()) {
			throw new AppError(
				StatusCode.BAD_REQUEST,
				'This invite has expired.',
			)
		}

		return { email: invite.email, role: invite.role }
	},

	async markInviteUsed(token: string) {
		const invite = await prisma.staffInvite.findUnique({ where: { token } })
		if (!invite) {
			throw new AppError(StatusCode.NOT_FOUND, 'Invalid invite link.')
		}
		if (invite.usedAt) {
			throw new AppError(
				StatusCode.BAD_REQUEST,
				'This invite has already been used.',
			)
		}
		if (invite.expiresAt < new Date()) {
			throw new AppError(
				StatusCode.BAD_REQUEST,
				'This invite has expired.',
			)
		}

		// Find user by email and update their role if found
		const user = await prisma.user.findUnique({
			where: { email: invite.email },
		})
		if (user) {
			await prisma.user.update({
				where: { email: invite.email },
				data: { role: invite.role.toUpperCase() as UserRole },
			})
		}

		await prisma.staffInvite.update({
			where: { token },
			data: { usedAt: new Date() },
		})
	},
}
