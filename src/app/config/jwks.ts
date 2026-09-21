import { envVars } from './env';

export const JWKS = import('jose-cjs').then(({ createRemoteJWKSet }) =>
  createRemoteJWKSet(new URL(`${envVars.FRONTEND_URL}/api/auth/jwks`)),
);
