import { prisma } from '@/config/prisma.config'
import { Prisma } from '@/generated/prisma/client'

import type { Request } from 'express'

const createCategoryIntoDB = async (req: Request) => {
	const result = await prisma.category.create({
		data: req.body,
	})

	return result
}

const getCategoriesFromDB = async (
	req: Request,
	filters: any,
	options: IOptions,
) => {
	const { page, limit, skip, sortBy, orderBy } =
		paginationHelper.calcPagination(options)

	const whereConditions = buildWhereCondition<Prisma.CategoryWhereInput>(
		undefined,
		filters,
	)

	const result = await prisma.category.findMany({
		skip,
		take: limit,

		where: whereConditions,

		orderBy: {
			[sortBy]: orderBy,
		},
	})

	const total = await prisma.category.count({
		where: whereConditions,
	})

	return {
		meta: {
			page,
			limit,
			total,
		},
		data: result,
	}
}

const getCategoryById = async (req: Request) => {
	const { id } = req.params

	const result = await prisma.category.findUnique({
		where: {
			id,
		},
	})

	return result
}

const updateCategoryIntoDB = async (req: Request) => {
	const { id } = req.params

	const result = await prisma.category.update({
		where: {
			id,
		},
		data: req.body,
	})

	return result
}

const deleteCategoryFromDB = async (req: Request) => {
	const { id } = req.params

	const result = await prisma.category.delete({
		where: {
			id,
		},
	})

	return result
}

// export
const CategoryService = {
	createCategoryIntoDB,
	getCategoriesFromDB,
	getCategoryById,
	updateCategoryIntoDB,
	deleteCategoryFromDB,
}

export default CategoryService
