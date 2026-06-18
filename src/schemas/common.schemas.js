import { z } from 'zod'
import { collectionNames } from '../config/collections.js'

export const collectionParamSchema = z.object({
	collection: z.enum(collectionNames),
})

export const collectionIdParamSchema = collectionParamSchema.extend({
	id: z.string().min(1),
})

export const paginationQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().positive().max(100).default(20),
	search: z.string().trim().optional(),
	status: z.string().trim().optional(),
	category: z.string().trim().optional(),
})

export const looseObjectSchema = z.record(z.string(), z.unknown())
