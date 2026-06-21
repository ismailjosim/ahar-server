import { z } from 'zod'

const menuVariantSchema = z.object({
	name: z.string().min(1),
	markup: z.number().min(0).default(0),
})

const menuAddOnSchema = z.object({
	name: z.string().min(1),
	price: z.number().min(0).default(0),
})

const createMenuItem = z.object({
	body: z.object({
		name: z.string().min(1),
		description: z.string().optional().default(''),
		category: z.string().min(1),
		price: z.number().min(0),
		emoji: z.string().optional(),
		imageUrl: z.string().url().optional(),
		rating: z.number().min(0).max(5).optional(),
		prepTime: z.string().optional(),
		tags: z.array(z.string()).optional(),
		variants: z.array(menuVariantSchema).optional(),
		addOns: z.array(menuAddOnSchema).optional(),
		isFeatured: z.boolean().optional(),
		isSpicy: z.boolean().optional(),
		isAvailable: z.boolean().optional(),
	}),
})

const updateMenuItem = z.object({
	params: z.object({
		id: z.string().min(1),
	}),
	body: createMenuItem.shape.body.partial(),
})

export const MenuValidation = {
	createMenuItem,
	updateMenuItem,
}
