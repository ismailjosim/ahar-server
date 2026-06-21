import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'

import { envVars } from '@/config/env'
import { prisma } from '@/config/prisma.config'

// Mirror of ahar-frontend/src/lib/auth.ts
// Uses the same secret + same DB so sessions are shared transparently.
// This instance does NOT register an HTTP handler — it is only used for
// auth.api.getSession() inside requireAuth middleware.
export const auth = betterAuth({
	baseURL: envVars.BETTER_AUTH_URL,
	secret: envVars.BETTER_AUTH_SECRET,
	database: prismaAdapter(prisma, { provider: 'postgresql' }),
	user: {
		additionalFields: {
			phone: {
				type: 'string',
				required: false,
			},
			role: {
				type: 'string',
				required: false,
				defaultValue: 'customer',
				input: false,
			},
			isActive: {
				type: 'boolean',
				required: false,
				defaultValue: true,
				input: false,
			},
		},
	},
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8,
		maxPasswordLength: 128,
		autoSignIn: false,
	},
})
