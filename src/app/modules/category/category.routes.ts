import { Router } from 'express'

import { fileUploader } from '@/config/multer.config'
import { UserRole } from '@/generated/prisma/enums'
import checkAuth from '@/middlewares/checkAuth'
import validateRequest from '@/middlewares/validateRequest'

import { CategoryController } from './category.controller'
import { CategoryValidation } from './category.validation'

const router = Router()

// Public — anyone can browse categories
router.get('/', CategoryController.getCategories)
router.get('/:id', CategoryController.getCategoryById)

// Protected — manager+ can create and edit categories
router.post(
    '/create',
    // checkAuth(UserRole.MANAGER, UserRole.OWNER),
    fileUploader.multerUpload.single('file'),
    validateRequest(CategoryValidation.createCategory),
    CategoryController.createCategory,
)

router.patch(
    '/:id',
    // checkAuth(UserRole.MANAGER, UserRole.OWNER),
    fileUploader.multerUpload.single('file'),
    validateRequest(CategoryValidation.updateCategory),
    CategoryController.updateCategory,
)

// Protected — owner only can delete categories
router.delete(
    '/:id',
    // checkAuth(UserRole.OWNER),
    CategoryController.deleteCategory,
)



export const CategoryRoutes = router