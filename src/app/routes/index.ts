import { Router } from 'express'

import { HealthRoutes } from '@/modules/health/health.routes'
import { InventoryRoutes } from '@/modules/inventory/inventory.routes'
import { MenuRoutes } from '@/modules/menu/menu.routes'
import { NotificationsRoutes } from '@/modules/notifications/notifications.routes'
import { OrdersRoutes } from '@/modules/orders/orders.routes'
import { PaymentsRoutes } from '@/modules/payments/payments.routes'
import { ReportsRoutes } from '@/modules/reports/reports.routes'
import { ReservationsRoutes } from '@/modules/reservations/reservations.routes'
import { SettingsRoutes } from '@/modules/settings/settings.routes'
import { StaffRoutes } from '@/modules/staff/staff.routes'
import { CategoryRoutes } from '@/modules/category/category.routes'

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
	{
		path: '/category',
		route: CategoryRoutes,
	},
	{
		path: '/orders',
		route: OrdersRoutes,
	},
	{
		path: '/reservations',
		route: ReservationsRoutes,
	},
	{
		path: '/payments',
		route: PaymentsRoutes,
	},
	{
		path: '/inventory',
		route: InventoryRoutes,
	},
	{
		path: '/settings',
		route: SettingsRoutes,
	},
	{
		path: '/notifications',
		route: NotificationsRoutes,
	},
	{
		path: '/reports',
		route: ReportsRoutes,
	},
	{
		path: '/staff',
		route: StaffRoutes,
	},
]

moduleRoutes.forEach((route) => router.use(route.path, route.route))

export default router
