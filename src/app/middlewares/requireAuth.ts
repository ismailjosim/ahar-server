import { type NextFunction, type Request, type Response } from 'express'

import { auth } from '@/config/auth.config'
import AppError from '@/helpers/AppError'
import StatusCode from '@/utils/statusCode'

// Extend Express Request to carry the resolved user for downstream handlers.
declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Express {
		interface Request {
			user?: {
				id: string
				name: string
				email: string
				role: string
				isActive: boolean
				phone?: string | null
			}
		}
	}
}

// Builds a standard Headers object from Express IncomingHttpHeaders.
function toHeaders(incoming: Request['headers']): Headers {
	const headers = new Headers()
	for (const [key, value] of Object.entries(incoming)) {
		if (value === undefined) continue
		headers.set(key, Array.isArray(value) ? value.join(', ') : value)
	}
	return headers
}

/**
 * Requires a valid better-auth session.
 * Attaches the resolved user to req.user.
 * Returns 401 if no session, 403 if account is deactivated.
 */
export async function requireAuth(
	req: Request,
	_res: Response,
	next: NextFunction,
) {
	try {
		const session = await auth.api.getSession({
			headers: toHeaders(req.headers),
		})

		if (!session?.user) {
			return next(
				new AppError(
					StatusCode.UNAUTHORIZED,
					'Authentication required. Please sign in.',
				),
			)
		}

		const user = session.user as typeof session.user & {
			role?: string
			isActive?: boolean
			phone?: string | null
		}

		if (user.isActive === false) {
			return next(
				new AppError(
					StatusCode.FORBIDDEN,
					'Your account has been deactivated.',
				),
			)
		}

		req.user = {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role ?? 'customer',
			isActive: user.isActive ?? true,
			phone: user.phone ?? null,
		}

		next()
	} catch (error) {
		next(error)
	}
}

/**
 * Optionally reads the session if present, but never blocks the request.
 * Use on public routes where auth is beneficial but not required
 * (e.g. POST /reservations links the booking to a user when logged in).
 */
export async function optionalAuth(
	req: Request,
	_res: Response,
	next: NextFunction,
) {
	try {
		const session = await auth.api.getSession({
			headers: toHeaders(req.headers),
		})

		if (session?.user) {
			const user = session.user as typeof session.user & {
				role?: string
				isActive?: boolean
				phone?: string | null
			}

			req.user = {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role ?? 'customer',
				isActive: user.isActive ?? true,
				phone: user.phone ?? null,
			}
		}
	} catch {
		// Silently ignore — failing to read an optional session never blocks the request.
	}

	next()
}
