import type { JWTPayload } from 'jose-cjs' with { 'resolution-mode': 'import' };

export interface AuthPayload extends JWTPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  phone?: string | null;
}
