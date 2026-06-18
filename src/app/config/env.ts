import dotenv from 'dotenv'

dotenv.config()

const requiredEnvVars = [
	'DATABASE_URL',
	'JWT_ACCESS_SECRET',
	'JWT_REFRESH_SECRET',
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
	JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
	JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
	JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN as string,
	JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN as string,
	CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
	CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
	CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
	EMAIL_HOST: process.env.EMAIL_HOST as string,
	EMAIL_PORT: Number(process.env.EMAIL_PORT) as number,
	EMAIL_USER: process.env.EMAIL_USER as string,
	EMAIL_PASS: process.env.EMAIL_PASS as string,
	EMAIL_FROM: process.env.EMAIL_FROM as string,
}
