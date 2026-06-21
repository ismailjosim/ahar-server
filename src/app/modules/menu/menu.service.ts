import { prisma } from '@/config/prisma.config'
import AppError from '@/helpers/AppError'
import { calculatePagination } from '@/utils/paginationHelper'
import StatusCode from '@/utils/statusCode'

import type {
	MenuItemCreateInput,
	MenuItemUncheckedCreateInput,
	MenuItemUncheckedUpdateInput,
	MenuItemUpdateInput,
	MenuItemWhereInput,
} from '../../../generated/prisma/models/MenuItem'

type MenuItemCreatePayload = MenuItemCreateInput | MenuItemUncheckedCreateInput
type MenuItemUpdatePayload = MenuItemUpdateInput | MenuItemUncheckedUpdateInput

// Parse a query string value to boolean — "true" → true, anything else → false.
function parseBool(value: unknown): boolean | undefined {
	if (value === undefined || value === null || value === '') return undefined
	return String(value).toLowerCase() === 'true'
}

const createMenuItem = async (payload: MenuItemCreatePayload) => {
	return prisma.menuItem.create({ data: payload })
}

const getMenuItems = async (query: Record<string, unknown>) => {
	const { page, limit, skip } = calculatePagination({
		page: Number(query.page || 1),
		limit: Number(query.limit || query.pageSize || 20),
	})

	const search = typeof query.search === 'string' ? query.search : undefined
	const category =
		typeof query.category === 'string' ? query.category : undefined

	const isFeatured = parseBool(query.isFeatured)
	const isSpicy = parseBool(query.isSpicy)
	// Default: only show available items unless caller explicitly passes isAvailable=false
	const isAvailable =
		query.isAvailable !== undefined ? parseBool(query.isAvailable) : true

	const where: MenuItemWhereInput = {
		...(category && category !== 'all' ? { category } : {}),
		...(search
			? {
					OR: [
						{ name: { contains: search, mode: 'insensitive' } },
						{
							description: {
								contains: search,
								mode: 'insensitive',
							},
						},
						{ category: { contains: search, mode: 'insensitive' } },
					],
				}
			: {}),
		...(isFeatured !== undefined ? { isFeatured } : {}),
		...(isSpicy !== undefined ? { isSpicy } : {}),
		...(isAvailable !== undefined ? { isAvailable } : {}),
	}

	const [data, total] = await Promise.all([
		prisma.menuItem.findMany({
			where,
			skip,
			take: limit,
			orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
		}),
		prisma.menuItem.count({ where }),
	])

	return {
		meta: { page, limit, total },
		data,
	}
}

const getMenuItemById = async (id: string) => {
	const item = await prisma.menuItem.findUnique({ where: { id } })
	if (!item) throw new AppError(StatusCode.NOT_FOUND, 'Menu item not found')
	return item
}

const updateMenuItem = async (id: string, payload: MenuItemUpdatePayload) => {
	await getMenuItemById(id)
	return prisma.menuItem.update({ where: { id }, data: payload })
}

const deleteMenuItem = async (id: string) => {
	await getMenuItemById(id)
	await prisma.menuItem.delete({ where: { id } })
	return null
}

const uploadMenuItemImage = async (id: string, imageUrl: string) => {
	await getMenuItemById(id)
	return prisma.menuItem.update({ where: { id }, data: { imageUrl } })
}

export const MenuService = {
	createMenuItem,
	getMenuItems,
	getMenuItemById,
	updateMenuItem,
	deleteMenuItem,
	uploadMenuItemImage,
}
