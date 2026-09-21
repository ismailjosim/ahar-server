import { UserRole } from '@generated/prisma/enums';
import { Router } from 'express';

import { checkAuth } from '@/middlewares/checkAuth';
import validateRequest from '@/middlewares/validateRequest';

import { SettingsController } from './settings.controller';
import { SettingsValidation } from './settings.validation';

const router = Router();

router.get('/public', SettingsController.getPublicSettings);

// manager+ can read full settings
router.get(
  '/',
  checkAuth(UserRole.MANAGER, UserRole.OWNER, UserRole.SUPER_ADMIN),
  SettingsController.getSettings,
);

// owner+ can change settings
router.patch(
  '/',
  checkAuth(UserRole.OWNER, UserRole.SUPER_ADMIN),
  validateRequest(SettingsValidation.updateSettings),
  SettingsController.updateSettings,
);

export const SettingsRoutes = router;
