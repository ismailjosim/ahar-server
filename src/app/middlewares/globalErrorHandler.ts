import type { ErrorRequestHandler } from 'express'
import { ZodError, type ZodIssue } from 'zod'

import StatusCode from '@/utils/statusCode'

const globalErrorHandler: ErrorRequestHandler = (error, req, res, _next) => {
	let statusCode = error.statusCode || StatusCode.INTERNAL_SERVER_ERROR
	let message = error.message || 'Something went wrong'
	let errorSources: unknown = undefined

	if (error instanceof ZodError) {
		statusCode = StatusCode.BAD_REQUEST
		message = 'Validation error'
		errorSources = error.issues.map((issue: ZodIssue) => ({
			path: issue.path.join('.'),
			message: issue.message,
		}))
	}

	res.status(statusCode).json({
		success: false,
		message,
		errorSources,
		stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
	})
}

export default globalErrorHandler
