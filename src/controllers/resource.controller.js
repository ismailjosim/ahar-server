import {
	createResource,
	deleteResource,
	getResource,
	listResources,
	updateResource,
} from '../services/resource.service.js'

export async function list(req, res, next) {
	try {
		res.json(await listResources(req.params.collection, req.validated?.query || req.query))
	} catch (error) {
		next(error)
	}
}

export async function get(req, res, next) {
	try {
		res.json(await getResource(req.params.collection, req.params.id))
	} catch (error) {
		next(error)
	}
}

export async function create(req, res, next) {
	try {
		res.status(201).json(await createResource(req.params.collection, req.body))
	} catch (error) {
		next(error)
	}
}

export async function update(req, res, next) {
	try {
		res.json(await updateResource(req.params.collection, req.params.id, req.body))
	} catch (error) {
		next(error)
	}
}

export async function remove(req, res, next) {
	try {
		res.json(await deleteResource(req.params.collection, req.params.id))
	} catch (error) {
		next(error)
	}
}
