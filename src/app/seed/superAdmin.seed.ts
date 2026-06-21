import { envVars } from '@/config/env'
import { prisma } from '@/config/prisma.config'

// Super admin creation requires better-auth to hash the password and create the
// account row. This is set up in Feature 03. Until then, this seed only upgrades
// an existing user's role if needed, and logs a reminder when no admin exists yet.
export async function ensureSuperAdmin() {
	const email = envVars.SUPER_ADMIN_EMAIL.trim().toLowerCase()

	const existingUser = await prisma.user.findUnique({ where: { email } })

	if (existingUser) {
		if (existingUser.role !== 'super_admin') {
			await prisma.user.update({
				where: { email },
				data: { role: 'super_admin', isActive: true },
			})
			console.log(`Super admin role applied to existing user: ${email}`)
		} else {
			console.log(`Super admin already exists: ${email}`)
		}
		return
	}

	// No user found — admin will be created via better-auth signup in Feature 03.
	console.log(
		`Super admin not yet created. Run Feature 03 setup to create: ${email}`,
	)
}
