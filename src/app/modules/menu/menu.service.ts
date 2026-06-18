import type { Prisma } from '@prisma/client'
import { prisma } from '@/config/prisma.config'
import AppError from '@/helpers/AppError'
import StatusCode from '@/utils/statusCode'
import { calculatePagination } from '@/utils/paginationHelper'

const createMenuItem = async (payload: Prisma.MenuItemCreateInput) => {
	return prisma.menuItem.create({
		data: payload,
	})
}

const getMenuItems = async (query: Record<string, unknown>) => {
	const { page, limit, skip } = calculatePagination({
		page: Number(query.page || 1),
		limit: Number(query.limit || query.pageSize || 20),
	})
	const search = typeof query.search === 'string' ? query.search : undefined
	const category = typeof query.category === 'string' ? query.category : undefined

	const where: Prisma.MenuItemWhereInput = {
		...(category && { category }),
		...(search && {
			OR: [
				{ name: { contains: search, mode: 'insensitive' } },
				{ description: { contains: search, mode: 'insensitive' } },
				{ category: { contains: search, mode: 'insensitive' } },
			],
		}),
	}

	const [data, total] = await Promise.all([
		prisma.menuItem.findMany({
			where,
			skip,
			take: limit,
			orderBy: { createdAt: 'desc' },
		}),
		prisma.menuItem.count({ where }),
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

const getMenuItemById = async (id: string) => {
	const item = await prisma.menuItem.findUnique({ where: { id } })
	if (!item) {
		throw new AppError(StatusCode.NOT_FOUND, 'Menu item not found')
	}
	return item
}

const updateMenuItem = async (id: string, payload: Prisma.MenuItemUpdateInput) => {
	await getMenuItemById(id)

	return prisma.menuItem.update({
		where: { id },
		data: payload,
	})
}

const deleteMenuItem = async (id: string) => {
	await getMenuItemById(id)
	await prisma.menuItem.delete({ where: { id } })
	return null
}

export const MenuService = {
	createMenuItem,
	getMenuItems,
	getMenuItemById,
	updateMenuItem,
	deleteMenuItem,
}
