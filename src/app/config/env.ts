import dotenv from 'dotenv'

dotenv.config()

const requiredEnvVars = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const

requiredEnvVars.forEach((key) => {
	if (!process.env[key]) {
		throw new Error(`Missing required environment variable: ${key}`)
	}
})

export const envVars = {
	NODE_ENV: process.env.NODE_ENV || 'development',
	PORT: Number(process.env.PORT || 4000),
	CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
	DATABASE_URL: process.env.DATABASE_URL as string,
	JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
	JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
	JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '1d',
	JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
	CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
	CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
	CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
	EMAIL_HOST: process.env.EMAIL_HOST || '',
	EMAIL_PORT: Number(process.env.EMAIL_PORT || 587),
	EMAIL_USER: process.env.EMAIL_USER || '',
	EMAIL_PASS: process.env.EMAIL_PASS || '',
	EMAIL_FROM: process.env.EMAIL_FROM || 'Ahar <no-reply@ahar.local>',
}
