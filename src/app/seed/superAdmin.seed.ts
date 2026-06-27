// import { envVars } from '@/config/env'
// import { prisma } from '@/config/prisma.config'

// export async function ensureSuperAdmin() {
// 	const email = envVars.SUPER_ADMIN_EMAIL.trim().toLowerCase()

// 	const existingUser = await prisma.user.findUnique({ where: { email } })

// 	if (existingUser) {
// 		if (existingUser.role !== 'super_admin') {
// 			await prisma.user.update({
// 				where: { email },
// 				data: { role: 'super_admin', isActive: true },
// 			})
// 			console.log(`Super admin role applied: ${email}`)
// 		} else {
// 			console.log(`Super admin exists: ${email}`)
// 		}
// 		return
// 	}

// 	// Create via better-auth — hashes the password and creates the account row.
// 	const result = await auth.api.signUpEmail({
// 		body: {
// 			name: 'Super Admin',
// 			email,
// 			password: envVars.SUPER_ADMIN_PASS,
// 		},
// 	})

// 	if (!result?.user) {
// 		console.error(
// 			'Super admin creation failed — check BETTER_AUTH_SECRET and DB connection.',
// 		)
// 		return
// 	}

// 	// better-auth creates users with role "customer" by default — upgrade it.
// 	await prisma.user.update({
// 		where: { email },
// 		data: { role: 'super_admin', isActive: true, emailVerified: true },
// 	})

// 	console.log(`Super admin created: ${email}`)
// }
