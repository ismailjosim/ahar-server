import { createRequire } from 'node:module';

import { envVars } from './env';

const jose = createRequire(__filename)('jose-cjs') as typeof import('jose-cjs', {
  with: { 'resolution-mode': 'import' },
});

export const JWKS = jose.createRemoteJWKSet(new URL(`${envVars.FRONTEND_URL}/api/auth/jwks`));
