export const calculatePagination = (options: {
	page?: number
	limit?: number
}) => {
	const page = Number(options.page || 1)
	const limit = Number(options.limit || 20)
	const skip = (page - 1) * limit

	return {
		page,
		limit,
		skip,
	}
}
