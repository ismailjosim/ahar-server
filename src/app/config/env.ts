import dotenv from 'dotenv'

dotenv.config()

const requiredEnvVars = [
	'DATABASE_URL',
	'BETTER_AUTH_SECRET',
	'SUPER_ADMIN_EMAIL',
	'SUPER_ADMIN_PASS',
] as const

requiredEnvVars.forEach((key) => {
	if (!process.env[key]) {
		throw new Error(`Missing required environment variable: ${key}`)
	}
})

export const envVars = {
	NODE_ENV: process.env.NODE_ENV || 'development',
	PORT: Number(process.env.PORT) || 3001,
	HOST: process.env.HOST || '127.0.0.1',
	CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
	DATABASE_URL: process.env.DATABASE_URL as string,

	// better-auth — must match BETTER_AUTH_SECRET in ahar-frontend .env.local
	BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
	BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',

	// Cloudinary
	CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
	CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
	CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,

	// SMTP (Feature 11)
	SMTP_HOST: process.env.SMTP_HOST as string,
	SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
	SMTP_USER: process.env.SMTP_USER as string,
	SMTP_PASS: process.env.SMTP_PASS as string,
	EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@ahar.com',

	// Super admin seed
	SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
	SUPER_ADMIN_PASS: process.env.SUPER_ADMIN_PASS as string,
}
