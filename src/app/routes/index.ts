import { Router } from 'express'

import { HealthRoutes } from '@/modules/health/health.routes'
import { MenuRoutes } from '@/modules/menu/menu.routes'

const router = Router()

const moduleRoutes = [
	{
		path: '/health',
		route: HealthRoutes,
	},
	{
		path: '/menu',
		route: MenuRoutes,
	},
]

moduleRoutes.forEach((route) => router.use(route.path, route.route))

export default router
