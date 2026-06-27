import type { NextFunction, Request, Response } from 'express'

import AppError from '@/helpers/AppError'
import StatusCode from '@/utils/statusCode'

export const requireRole = (...roles: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = req.user

			if (!user) {
				throw new AppError(
					StatusCode.UNAUTHORIZED,
					'Authentication required',
				)
			}

			const userRole = user.role.toLowerCase()
			const allowedRoles = roles.map((r) => r.toLowerCase())

			if (!allowedRoles.includes(userRole)) {
				throw new AppError(StatusCode.FORBIDDEN, 'Access denied')
			}

			next()
		} catch (error) {
			next(error)
		}
	}
}
