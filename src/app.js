import cors from 'cors'
import express from 'express'

import { env } from './config/env.js'
import { errorHandler } from './middlewares/error-handler.js'
import { requestLogger } from './middlewares/request-logger.js'
import { createApiRouter } from './routes/api.routes.js'
import { createHealthRouter } from './routes/health.routes.js'

export function createApp() {
	const app = express()

	app.use(
		cors({
			origin: env.corsOrigin,
			credentials: true,
		}),
	)
	app.use(express.json({ limit: '1mb' }))
	app.use(requestLogger)

	app.use('/health', createHealthRouter())
	app.use('/api', createApiRouter())

	app.use((req, res) => {
		res.status(404).json({
			error: {
				code: 'NOT_FOUND',
				message: `Route ${req.method} ${req.originalUrl} was not found`,
			},
		})
	})

	app.use(errorHandler)

	return app
}
