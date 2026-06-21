import { type NextFunction, type Request, type Response } from 'express'

import AppError from '@/helpers/AppError'
import StatusCode from '@/utils/statusCode'

// Higher index = higher privilege.
const ROLE_HIERARCHY: Record<string, number> = {
	customer: 0,
	cashier: 1,
	kitchen: 2,
	manager: 3,
	owner: 4,
	super_admin: 5,
}

/**
 * Middleware factory that enforces a minimum role.
 *
 * Usage:
 *   router.get('/', requireAuth, requireRole('manager'), handler)
 *
 * requireRole('manager') — allows manager, owner, and super_admin.
 * requireRole('owner')   — allows owner and super_admin only.
 *
 * Always compose with requireAuth first — this middleware assumes req.user is set.
 */
export function requireRole(...allowedRoles: string[]) {
	return (req: Request, _res: Response, next: NextFunction) => {
		if (!req.user) {
			return next(
				new AppError(
					StatusCode.UNAUTHORIZED,
					'Authentication required.',
				),
			)
		}

		const userLevel = ROLE_HIERARCHY[req.user.role.toLowerCase()] ?? -1
		const minRequired = Math.min(
			...allowedRoles.map((r) => ROLE_HIERARCHY[r.toLowerCase()] ?? 999),
		)

		if (userLevel < minRequired) {
			return next(
				new AppError(
					StatusCode.FORBIDDEN,
					`Access denied. Required role: ${allowedRoles.join(' or ')}.`,
				),
			)
		}

		next()
	}
}
