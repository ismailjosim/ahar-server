import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { collectionNames } from '../config/collections.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = join(__dirname, '../../data/db.json')

export async function readDb() {
	const db = JSON.parse(await readFile(dbPath, 'utf8'))

	for (const collection of collectionNames) {
		if (!Array.isArray(db[collection])) db[collection] = []
	}

	return db
}

export async function writeDb(db) {
	await writeFile(dbPath, `${JSON.stringify(db, null, 2)}\n`)
}

export async function listCollection(collection) {
	const db = await readDb()
	return db[collection]
}

export async function findInCollection(collection, id) {
	const items = await listCollection(collection)
	return items.find((item) => String(item.id) === String(id)) || null
}

export async function createInCollection(collection, payload) {
	const db = await readDb()
	const items = db[collection]
	const now = new Date().toISOString()
	const item = {
		id: payload.id || createId(collection),
		...payload,
		createdAt: payload.createdAt || now,
		updatedAt: payload.updatedAt || now,
	}

	db[collection] = [item, ...items]
	await writeDb(db)
	return item
}

export async function updateInCollection(collection, id, payload) {
	const db = await readDb()
	const items = db[collection]
	const index = items.findIndex((item) => String(item.id) === String(id))

	if (index === -1) return null

	items[index] = {
		...items[index],
		...payload,
		id: items[index].id,
		updatedAt: new Date().toISOString(),
	}
	db[collection] = items
	await writeDb(db)
	return items[index]
}

export async function deleteFromCollection(collection, id) {
	const db = await readDb()
	const items = db[collection]
	const nextItems = items.filter((item) => String(item.id) !== String(id))

	if (nextItems.length === items.length) return false

	db[collection] = nextItems
	await writeDb(db)
	return true
}

function createId(collection) {
	return `${collection}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
