import { Router } from 'express'
import { env } from '../config/env.js'

export function createHealthRouter() {
	const router = Router()

	router.get('/', (req, res) => {
		res.json({
			ok: true,
			service: 'ahar-server',
			environment: env.nodeEnv,
			timestamp: new Date().toISOString(),
		})
	})

	return router
}
