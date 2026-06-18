export function validate(schema) {
	return (req, res, next) => {
		try {
			const parsed = schema.parse({
				body: req.body,
				params: req.params,
				query: req.query,
			})

			req.validated = parsed
			req.body = parsed.body ?? req.body
			next()
		} catch (error) {
			next(error)
		}
	}
}
