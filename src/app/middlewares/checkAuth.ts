import type { NextFunction, Request, Response } from 'express'
import { jwtVerify } from 'jose-cjs'

import { envVars } from '@/config/env'
import { JWKS } from '@/config/jwks'
import { prisma } from '@/config/prisma.config'
import AppError from '@/helpers/AppError'
import StatusCode from '@/utils/statusCode'

import { UserStatus } from '../../generated/prisma/enums'
import { AuthPayload } from '../../types/auth'

declare module 'express' {
	interface Request {
		user?: AuthPayload
	}
}

const checkAuth =
	(...authRoles: string[]) =>
	async (req: Request, res: Response, next: NextFunction) => {
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

			if (authRoles.length && !authRoles.includes(user.role)) {
				throw new AppError(StatusCode.FORBIDDEN, 'Access denied')
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

export default checkAuth
