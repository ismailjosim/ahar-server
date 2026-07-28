import { Router } from 'express';

import validateRequest from '@/app/middlewares/validateRequest';
import { fileUploader } from '@/config/multer.config';

import { MenuController } from './menu.controller';
import { MenuItemValidation } from './menu.validation';

const router = Router();

// Public Routes
router.get('/', MenuController.getMenuItems);
router.get('/:id', MenuController.getMenuItemById);

// Protected Routes
router.post(
  '/create',
  // checkAuth(UserRole.MANAGER, UserRole.OWNER),
  fileUploader.multerUpload.single('file'),
  validateRequest(MenuItemValidation.createMenuItem),
  MenuController.createMenuItem,
);

router.patch(
  '/:id',
  // checkAuth(UserRole.MANAGER, UserRole.OWNER),
  fileUploader.multerUpload.single('file'),
  validateRequest(MenuItemValidation.updateMenuItem),
  MenuController.updateMenuItem,
);

router.delete(
  '/:id',
  // checkAuth(UserRole.OWNER),
  MenuController.deleteMenuItem,
);

export const MenuRoutes = router;
