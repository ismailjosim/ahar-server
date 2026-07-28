import { z } from 'zod';

const createMenuItem = z.object({
  body: z.object({
    name: z.string().min(1, 'Menu item name is required'),
    description: z.string().optional(),
    categoryId: z.cuid('Invalid category ID'),
    price: z.number().positive('Price must be greater than 0'),
    imageUrl: z.url().optional(),
    rating: z
      .number()
      .min(0, 'Rating must be at least 0')
      .max(5, 'Rating cannot exceed 5')
      .optional(),
    prepTime: z.string().optional(),
    tags: z.array(z.string()).optional(),
    variants: z.array(z.json()).optional(),
    addOns: z.array(z.json()).optional(),
    isFeatured: z.boolean().optional(),
    isSpicy: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
  }),
});

const updateMenuItem = z.object({
  params: z.object({
    id: z.uuid('Invalid menu item ID'),
  }),
  body: createMenuItem.shape.body.partial(),
});

export const MenuItemValidation = {
  createMenuItem,
  updateMenuItem,
};
