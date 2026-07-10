import { Router } from 'express'

import { fileUploader } from '@/config/multer.config'
import validateRequest from '@/middlewares/validateRequest'

import { MenuController } from './menu.controller'
import { MenuItemValidation } from './menu.validation'

const router = Router()

// Public — anyone can browse the menu
router.get('/', MenuController.getMenuItems)
router.get('/:id', MenuController.getMenuItemById)

// Protected — manager+ to create / edit, owner+ to delete
router.post(
	'/create',
	// checkAuth(UserRole.MANAGER, UserRole.OWNER, UserRole.CUSTOMER),
	// fileUploader.multerUpload.single('file'),
	validateRequest(MenuItemValidation.createMenuItem),
	MenuController.createMenuItem,
)
router.patch(
	'/:id',
	validateRequest(MenuItemValidation.updateMenuItem),
	MenuController.updateMenuItem,
)

router.delete('/:id', MenuController.deleteMenuItem)

router.post(
	'/:id/image',
	fileUploader.multerUpload.single('file'),
	MenuController.uploadImage,
)

export const MenuRoutes = router
