import {
	createInCollection,
	deleteFromCollection,
	findInCollection,
	listCollection,
	updateInCollection,
} from '../repositories/json-db.repository.js'
import { badRequest, notFound } from '../errors/api-error.js'
import { getCreateSchema, getUpdateSchema } from '../schemas/resource.schemas.js'

export async function listResources(collection, query) {
	const page = query.page || 1
	const pageSize = query.pageSize || 20
	const filtered = applyFilters(await listCollection(collection), query)
	const start = (page - 1) * pageSize

	return {
		data: filtered.slice(start, start + pageSize),
		total: filtered.length,
		page,
		pageSize,
	}
}

export async function getResource(collection, id) {
	const item = await findInCollection(collection, id)
	if (!item) throw notFound(`${collection} item ${id} was not found`)
	return { data: item }
}

export async function createResource(collection, payload) {
	const parsed = getCreateSchema(collection).safeParse(payload)
	if (!parsed.success) {
		throw badRequest('Request validation failed', parsed.error.flatten().fieldErrors)
	}

	const item = await createInCollection(collection, parsed.data)
	return { data: item }
}

export async function updateResource(collection, id, payload) {
	const parsed = getUpdateSchema(collection).safeParse(payload)
	if (!parsed.success) {
		throw badRequest('Request validation failed', parsed.error.flatten().fieldErrors)
	}

	const item = await updateInCollection(collection, id, parsed.data)
	if (!item) throw notFound(`${collection} item ${id} was not found`)
	return { data: item }
}

export async function deleteResource(collection, id) {
	const deleted = await deleteFromCollection(collection, id)
	if (!deleted) throw notFound(`${collection} item ${id} was not found`)
	return { success: true }
}

function applyFilters(items, query) {
	return items.filter((item) => {
		if (query.status && String(item.status) !== query.status) return false
		if (query.category && String(item.category) !== query.category) return false
		if (!query.search) return true

		const haystack = JSON.stringify(item).toLowerCase()
		return haystack.includes(query.search.toLowerCase())
	})
}
