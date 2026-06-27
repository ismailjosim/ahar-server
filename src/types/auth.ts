import { type JWTPayload } from 'jose-cjs'
export interface AuthPayload extends JWTPayload {
	id: string
	name: string
	email: string
	role: string
	isActive: boolean
	phone?: string | null
}
