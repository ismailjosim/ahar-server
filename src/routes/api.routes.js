import { Router } from 'express'

import * as resourceController from '../controllers/resource.controller.js'
import { validate } from '../middlewares/validate.js'
import {
	collectionIdParamSchema,
	collectionParamSchema,
	paginationQuerySchema,
} from '../schemas/common.schemas.js'
import { z } from 'zod'

export function createApiRouter() {
	const router = Router()

	router.get(
		'/:collection',
		validate(
			z.object({
				params: collectionParamSchema,
				query: paginationQuerySchema,
			}),
		),
		resourceController.list,
	)

	router.post(
		'/:collection',
		validate(
			z.object({
				params: collectionParamSchema,
				body: z.record(z.string(), z.unknown()),
			}),
		),
		resourceController.create,
	)

	router.get(
		'/:collection/:id',
		validate(
			z.object({
				params: collectionIdParamSchema,
			}),
		),
		resourceController.get,
	)

	router.patch(
		'/:collection/:id',
		validate(
			z.object({
				params: collectionIdParamSchema,
				body: z.record(z.string(), z.unknown()),
			}),
		),
		resourceController.update,
	)

	router.delete(
		'/:collection/:id',
		validate(
			z.object({
				params: collectionIdParamSchema,
			}),
		),
		resourceController.remove,
	)

	return router
}
