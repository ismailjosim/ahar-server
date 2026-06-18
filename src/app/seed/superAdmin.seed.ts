import { envVars } from '@/config/env'
import { prisma } from '@/config/prisma.config'
import { hashPassword } from '@/helpers/passwordHash'

export async function ensureSuperAdmin() {
	const email = envVars.SUPER_ADMIN_EMAIL.trim().toLowerCase()
	const existingAdmin = await prisma.user.findUnique({
		where: { email },
	})

	if (existingAdmin) {
		if (existingAdmin.role !== 'SUPER_ADMIN') {
			await prisma.user.update({
				where: { email },
				data: {
					role: 'SUPER_ADMIN',
					isActive: true,
				},
			})
		}

		console.log('Super admin already exists')
		return
	}

	await prisma.user.create({
		data: {
			name: 'Super Admin',
			email,
			passwordHash: hashPassword(envVars.SUPER_ADMIN_PASS),
			role: 'SUPER_ADMIN',
			isActive: true,
		},
	})

	console.log('Super admin created')
}
