import { createRemoteJWKSet } from 'jose-cjs'

import { envVars } from './env'

export const JWKS = createRemoteJWKSet(
	new URL(`${envVars.FRONTEND_URL}/api/auth/jwks`),
)
