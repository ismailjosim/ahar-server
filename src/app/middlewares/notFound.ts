import type { RequestHandler } from 'express'

import StatusCode from '@/utils/statusCode'

const notFound: RequestHandler = (req, res) => {
	res.status(StatusCode.NOT_FOUND).json({
		success: false,
		message: 'API not found',
		error: {
			path: req.originalUrl,
			method: req.method,
		},
	})
}

export default notFound
