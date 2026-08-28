import { Router } from 'express';

import { fileUploader } from '@/config/multer.config';
import validateRequest from '@/middlewares/validateRequest';

import { CategoryController } from './category.controller';
import { CategoryValidation } from './category.validation';

const router = Router();

// Public — anyone can browse categories
router.get('/', CategoryController.getCategories);
router.get('/insert/dummy', CategoryController.injectDummyCategories);
router.get('/:id', CategoryController.getCategoryById);

// Protected — manager+ can create and edit categories
router.post(
  '/create',
  fileUploader.multerUpload.single('file'),
  validateRequest(CategoryValidation.createCategory),
  CategoryController.createCategory,
);

router.patch(
  '/:id',
  fileUploader.multerUpload.single('file'),
  validateRequest(CategoryValidation.updateCategory),
  CategoryController.updateCategory,
);

// Protected — owner only can delete categories
router.delete('/:id', CategoryController.deleteCategory);

export const CategoryRoutes = router;
