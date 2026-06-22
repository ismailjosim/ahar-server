import dotenv from 'dotenv'
dotenv.config()

const requiredEnvVars = [
	'DATABASE_URL',
	'BETTER_AUTH_SECRET',
	'SUPER_ADMIN_EMAIL',
	'SUPER_ADMIN_PASS',
	'NODE_ENV',
	'PORT',
	'CORS_ORIGIN',
	'DATABASE_URL',
	'BETTER_AUTH_SECRET',
	'BETTER_AUTH_URL',
	'CLOUDINARY_CLOUD_NAME',
	'CLOUDINARY_API_KEY',
	'CLOUDINARY_API_SECRET',
	'SMTP_HOST',
	'SMTP_PORT',
	'SMTP_USER',
	'SMTP_PASS',
	'EMAIL_FROM',
	'SUPER_ADMIN_EMAIL',
	'SUPER_ADMIN_PASS',
] as const

requiredEnvVars.forEach((key) => {
	if (!process.env[key]) {
		throw new Error(`Missing required environment variable: ${key}`)
	}
})

export const envVars = {
	NODE_ENV: process.env.NODE_ENV as string,
	PORT: Number(process.env.PORT) as number,
	CORS_ORIGIN: process.env.CORS_ORIGIN as string,
	DATABASE_URL: process.env.DATABASE_URL as string,

	// better-auth — must match BETTER_AUTH_SECRET in ahar-frontend .env.local
	BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
	BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,

	// Cloudinary
	CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
	CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
	CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,

	// SMTP (Feature 11)
	SMTP_HOST: process.env.SMTP_HOST as string,
	SMTP_PORT: Number(process.env.SMTP_PORT) as number,
	SMTP_USER: process.env.SMTP_USER as string,
	SMTP_PASS: process.env.SMTP_PASS as string,
	EMAIL_FROM: process.env.EMAIL_FROM as string,

	// Super admin seed
	SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
	SUPER_ADMIN_PASS: process.env.SUPER_ADMIN_PASS as string,
}
