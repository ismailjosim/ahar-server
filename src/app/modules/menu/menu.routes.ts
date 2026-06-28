import { Router } from 'express'

import checkAuth from '@/middlewares/checkAuth'

import validateRequest from '@/middlewares/validateRequest'

import { MenuController } from './menu.controller'
import { MenuValidation } from './menu.validation'
import { UserRole } from '@/generated/prisma/enums'
import { fileUploader } from '@/config/multer.config'

const router = Router()

// Public — anyone can browse the menu
router.get('/', MenuController.getMenuItems)
router.get('/:id', MenuController.getMenuItemById)

// Protected — manager+ to create / edit, owner+ to delete
router.post(
	'/create',
	// checkAuth(UserRole.MANAGER, UserRole.OWNER, UserRole.CUSTOMER),
	fileUploader.multerUpload.single('file'),
	validateRequest(MenuValidation.createMenuItem),
	MenuController.createMenuItem,
)
router.patch(
	'/:id',
	validateRequest(MenuValidation.updateMenuItem),
	MenuController.updateMenuItem,
)
router.delete(
	'/:id',

	MenuController.deleteMenuItem,
)

// Protected — manager+ to upload/replace the image for a menu item
router.post(
	'/:id/image',
	fileUploader.multerUpload.single('file'),
	MenuController.uploadImage,
)

export const MenuRoutes = router
