import { type NextFunction, type Request, type Response } from 'express'

import { auth } from '@/config/auth.config'
import { envVars } from '@/config/env'
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
 *
 * Accepts two auth paths:
 * 1. Trusted internal headers from the Next.js proxy (preferred) — the
 *    frontend validates the session with its own auth instance and passes
 *    user identity as x-auth-user-* headers alongside x-internal-secret.
 * 2. Direct cookie-based session (fallback for non-proxied callers).
 */
export async function requireAuth(
	req: Request,
	_res: Response,
	next: NextFunction,
) {
	try {
		// Path 1: Trusted internal headers from the Next.js proxy.
		const internalSecret = req.headers['x-internal-secret']
		if (internalSecret && internalSecret === envVars.BETTER_AUTH_SECRET) {
			const userId = req.headers['x-auth-user-id'] as string | undefined
			if (!userId) {
				return next(
					new AppError(
						StatusCode.UNAUTHORIZED,
						'Authentication required. Please sign in.',
					),
				)
			}

			req.user = {
				id: userId,
				name: (req.headers['x-auth-user-name'] as string) ?? '',
				email: (req.headers['x-auth-user-email'] as string) ?? '',
				role: (req.headers['x-auth-user-role'] as string) ?? 'customer',
				isActive: true,
				phone: null,
			}
			return next()
		}

		// Path 2: Cookie-based session (direct backend access).
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
 * Use on public routes where auth is beneficial but not required.
 */
export async function optionalAuth(
	req: Request,
	_res: Response,
	next: NextFunction,
) {
	try {
		// Path 1: Trusted internal headers.
		const internalSecret = req.headers['x-internal-secret']
		if (internalSecret && internalSecret === envVars.BETTER_AUTH_SECRET) {
			const userId = req.headers['x-auth-user-id'] as string | undefined
			if (userId) {
				req.user = {
					id: userId,
					name: (req.headers['x-auth-user-name'] as string) ?? '',
					email: (req.headers['x-auth-user-email'] as string) ?? '',
					role:
						(req.headers['x-auth-user-role'] as string) ??
						'customer',
					isActive: true,
					phone: null,
				}
			}
			return next()
		}

		// Path 2: Cookie-based session.
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
