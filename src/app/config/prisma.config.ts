import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../../generated/prisma/client'
import { envVars } from './env'

const adapter = new PrismaPg({
	connectionString: envVars.DATABASE_URL,
})

export const prisma = new PrismaClient({
	adapter,
	log: ['error', 'warn'],
})
