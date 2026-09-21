import { UserRole } from '@generated/prisma/enums';
import { Router } from 'express';

import { checkAuth } from '@/middlewares/checkAuth';
import validateRequest from '@/middlewares/validateRequest';

import { InventoryController } from './inventory.controller';
import { InventoryValidation } from './inventory.validation';

const router = Router();

// All inventory routes require manager+
router.get(
  '/',
  checkAuth(UserRole.MANAGER, UserRole.OWNER, UserRole.SUPER_ADMIN),
  validateRequest(InventoryValidation.getInventoryItems),
  InventoryController.getInventoryItems,
);
router.post(
  '/',
  checkAuth(UserRole.MANAGER, UserRole.OWNER, UserRole.SUPER_ADMIN),
  validateRequest(InventoryValidation.createInventoryItem),
  InventoryController.createInventoryItem,
);
router.get(
  '/:id',
  checkAuth(UserRole.MANAGER, UserRole.OWNER, UserRole.SUPER_ADMIN),
  InventoryController.getInventoryItemById,
);
router.patch(
  '/:id',
  checkAuth(UserRole.MANAGER, UserRole.OWNER, UserRole.SUPER_ADMIN),
  validateRequest(InventoryValidation.updateInventoryItem),
  InventoryController.updateInventoryItem,
);
router.delete(
  '/:id',
  checkAuth(UserRole.MANAGER, UserRole.OWNER, UserRole.SUPER_ADMIN),
  InventoryController.deleteInventoryItem,
);

export const InventoryRoutes = router;
