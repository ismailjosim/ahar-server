import type { NextFunction, Request, Response } from 'express'
import type { ZodObject } from 'zod'

const validateRequest = (schema: ZodObject) => {
	return async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			if (
				req.body?.data &&
				typeof req.body.data === 'string'
			) {
				try {
					req.body = JSON.parse(req.body.data)
				} catch {
					return next(new Error('Invalid JSON in data field'))
				}
			}

			await schema.parseAsync({
				body: req.body,
				query: req.query,
				params: req.params,
			})

			next()
		} catch (error) {
			next(error)
		}
	}
}

export default validateRequest