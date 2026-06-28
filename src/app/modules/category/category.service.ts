import { prisma } from '@/config/prisma.config'
import AppError from '@/helpers/AppError'
import { calculatePagination } from '@/utils/paginationHelper'
import StatusCode from '@/utils/statusCode'
import slugify from 'slugify'
import type { CategoryWhereInput } from '@/generated/prisma/models/Category'
import { Request } from 'express'
import crypto from 'crypto'
import { deleteFromCloudinary } from '@/config/multer.config'


const createCategory = async (req: Request) => {
	const payload = req.body
	const file = req.file as Express.Multer.File | undefined

	const slug =
		payload.slug ||
		`${slugify(payload.name, {
			lower: true,
			strict: true,
		})}-${crypto.randomBytes(3).toString('hex')}`

	const data = {
		...payload,
		image: file?.path ?? null,
		slug,
	}

	try {
		return await prisma.category.create({
			data,
		})
	} catch (error) {
		// Cleanup uploaded image if DB operation fails
		if (file?.path) {
			await deleteFromCloudinary(file.path)
		}

		throw error
	}
}

const getCategories = async (query: Record<string, unknown>) => {
	const { page, limit, skip } = calculatePagination({
		page: Number(query.page || 1),
		limit: Number(query.limit || query.pageSize || 20),
	})

	const search =
		typeof query.search === 'string' ? query.search : undefined

	const status =
		typeof query.status === 'string' ? query.status : undefined

	const where: CategoryWhereInput = {
		...(status && status !== 'all' ? { status: status as any } : {}),
		...(search
			? {
				OR: [
					{
						name: {
							contains: search,
							mode: 'insensitive',
						},
					},
					{
						slug: {
							contains: search,
							mode: 'insensitive',
						},
					},
					{
						description: {
							contains: search,
							mode: 'insensitive',
						},
					},
				],
			}
			: {}),
	}

	const [data, total] = await Promise.all([
		prisma.category.findMany({
			where,
			skip,
			take: limit,
			orderBy: {
				createdAt: 'desc',
			},
		}),
		prisma.category.count({
			where,
		}),
	])

	return {
		meta: {
			page,
			limit,
			total,
		},
		data,
	}
}

const getCategoryById = async (id: string) => {
	const category = await prisma.category.findUnique({
		where: {
			id,
		},
	})

	if (!category) {
		throw new AppError(
			StatusCode.NOT_FOUND,
			'Category not found',
		)
	}

	return category
}


const updateCategory = async (
	id: string,
	req: Request,
) => {
	const existingCategory = await getCategoryById(id)

	const payload = req.body
	const file = req.file as Express.Multer.File | undefined

	const data = {
		...payload,
	}

	if (file) {
		data.image = file.path
	}

	try {
		const updatedCategory = await prisma.category.update({
			where: {
				id,
			},
			data,
		})

		// Delete old image only after successful DB update
		if (file && existingCategory.image) {
			await deleteFromCloudinary(existingCategory.image)
		}

		return updatedCategory
	} catch (error) {
		// Remove newly uploaded image if DB update fails
		if (file?.path) {
			await deleteFromCloudinary(file.path)
		}

		throw error
	}
}


const deleteCategory = async (id: string) => {
	const category = await getCategoryById(id)

	await prisma.category.delete({
		where: {
			id,
		},
	})

	if (category.image) {
		try {
			await deleteFromCloudinary(category.image)
		} catch (error) {
			console.error(
				'Failed to delete image from Cloudinary:',
				error,
			)
		}
	}

	return null
}



export const CategoryService = {
	createCategory,
	getCategories,
	getCategoryById,
	updateCategory,
	deleteCategory
}