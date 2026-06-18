export class ApiError extends Error {
	constructor(status, code, message, details = undefined) {
		super(message)
		this.name = 'ApiError'
		this.status = status
		this.code = code
		this.details = details
	}
}

export function notFound(message = 'Resource not found') {
	return new ApiError(404, 'NOT_FOUND', message)
}

export function badRequest(message = 'Bad request', details = undefined) {
	return new ApiError(400, 'BAD_REQUEST', message, details)
}
