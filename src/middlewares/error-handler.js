import { ZodError } from 'zod'
import { env } from '../config/env.js'

export function errorHandler(error, req, res, next) {
	if (res.headersSent) return next(error)

	if (error instanceof ZodError) {
		return res.status(400).json({
			error: {
				code: 'VALIDATION_ERROR',
				message: 'Request validation failed',
				fields: error.flatten().fieldErrors,
			},
		})
	}

	const status = error.status || 500
	const code = error.code || 'SERVER_ERROR'
	const message =
		status === 500 && env.nodeEnv === 'production'
			? 'Internal server error'
			: error.message || 'Internal server error'

	res.status(status).json({
		error: {
			code,
			message,
			...(error.details ? { details: error.details } : {}),
		},
	})
}
