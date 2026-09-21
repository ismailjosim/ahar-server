import { Router } from 'express';

import { CategoryRoutes } from '@/modules/category/category.routes';
import { CouponRoutes } from '@/modules/coupons/coupons.routes';
import { HealthRoutes } from '@/modules/health/health.routes';
import { InventoryRoutes } from '@/modules/inventory/inventory.routes';
import { MenuRoutes } from '@/modules/menu/menu.routes';
import { NotificationsRoutes } from '@/modules/notifications/notifications.routes';
import { OrdersRoutes } from '@/modules/orders/orders.routes';
import { PaymentsRoutes } from '@/modules/payments/payments.routes';
import { ReportsRoutes } from '@/modules/reports/reports.routes';
import { ReservationsRoutes } from '@/modules/reservations/reservations.routes';
import { ReviewRoutes } from '@/modules/reviews/reviews.routes';
import { SettingsRoutes } from '@/modules/settings/settings.routes';
import { StaffRoutes } from '@/modules/staff/staff.routes';

const router = Router();

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
  {
    path: '/coupons',
    route: CouponRoutes,
  },
  {
    path: '/reviews',
    route: ReviewRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
