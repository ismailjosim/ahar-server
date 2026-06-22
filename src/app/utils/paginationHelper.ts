export type IOptions = {
	page?: string | number
	limit?: string | number
	sortBy?: string
	orderBy?: string
}

export type IOptionsResult = {
	page: number
	limit: number
	skip: number
	sortBy: string
	orderBy: string
}

export const calculatePagination = (options: IOptions): IOptionsResult => {
	const page = Number(options?.page) || 1
	const limit = Number(options.limit) || 10
	const skip = (page - 1) * limit

	const sortBy = options.sortBy || 'createdAt'
	const orderBy = options.orderBy || 'desc'

	return { page, limit, skip, sortBy, orderBy }
}
