import type { NextFunction, Request, Response } from 'express'
import { jwtVerify } from 'jose-cjs'

import { envVars } from '@/config/env'
import { JWKS } from '@/config/jwks'
import { prisma } from '@/config/prisma.config'
import AppError from '@/helpers/AppError'
import StatusCode from '@/utils/statusCode'

import { UserStatus } from '../../generated/prisma/enums'
import { AuthPayload } from '../../types/auth'

export const requireAuth = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const authHeader = req.headers.authorization

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			throw new AppError(
				StatusCode.UNAUTHORIZED,
				'Token not provided',
			)
		}

		const token = authHeader.split(' ')[1]

		const { payload } = await jwtVerify(token, JWKS, {
			issuer: `${envVars.FRONTEND_URL}/api/auth`,
		})

		const email = payload.email as string

		if (!email) {
			throw new AppError(
				StatusCode.UNAUTHORIZED,
				'Invalid token payload',
			)
		}

		const user = await prisma.user.findUnique({
			where: {
				email,
			},
		})

		if (!user) {
			throw new AppError(StatusCode.NOT_FOUND, 'User does not exist')
		}

		if (user.status === UserStatus.BLOCKED) {
			throw new AppError(StatusCode.FORBIDDEN, 'User is blocked')
		}

		req.user = {
			...payload,
			role: user.role,
		} as AuthPayload

		next()
	} catch (error) {
		next(error)
	}
}

export const optionalAuth = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const authHeader = req.headers.authorization

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return next()
		}

		const token = authHeader.split(' ')[1]

		try {
			const { payload } = await jwtVerify(token, JWKS, {
				issuer: `${envVars.FRONTEND_URL}/api/auth`,
			})

			const email = payload.email as string

			if (email) {
				const user = await prisma.user.findUnique({
					where: {
						email,
					},
				})

				if (user && user.status !== UserStatus.BLOCKED) {
					req.user = {
						...payload,
						role: user.role,
					} as AuthPayload
				}
			}
		} catch (err) {
			// Ignore token errors for optional auth, just proceed as guest
		}

		next()
	} catch (error) {
		next(error)
	}
}
