import { z } from 'zod'

const createCategory = z.object({
    body: z.object({
        name: z.string().min(1, 'Category name is required'),
        description: z.string().optional(),
        image: z.string().url().optional(),
        icon: z.string().optional(),
        status: z
            .enum(['ACTIVE', 'INACTIVE', 'ARCHIVED'])
            .optional(),
    }),
})

const updateCategory = z.object({
    params: z.object({
        id: z.string().min(1),
    }),
    body: createCategory.shape.body.partial(),
})

export const CategoryValidation = {
    createCategory,
    updateCategory,
}