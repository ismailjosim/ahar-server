import dotenv from 'dotenv'

dotenv.config()

interface EnvConfig {
	PORT: string
	DATABASE_URL: string
	NODE_ENV: string
	FRONTEND_URL: string

	CLOUDINARY: {
		CLOUDINARY_CLOUD_NAME: string
		CLOUDINARY_API_KEY: string
		CLOUDINARY_API_SECRET: string
	}

	EMAIL_SENDER: {
		SMTP_HOST: string
		SMTP_PORT: string
		SMTP_USER: string
		SMTP_PASS: string
		SMTP_FROM: string
	}

	SUPER_ADMIN: {
		SUPER_ADMIN_EMAIL: string
		SUPER_ADMIN_PASS: string
	}

	SSL_COMMERZ: {
		SSL_STORE_ID: string
		SSL_STORE_PASS: string
		SSL_PAYMENT_API: string
		SSL_VALIDATION_API: string
		SSL_IPN_URL: string

		SSL_SUCCESS_BACKEND_URL: string
		SSL_FAIL_BACKEND_URL: string
		SSL_CANCEL_BACKEND_URL: string

		SSL_SUCCESS_FRONTEND_URL: string
		SSL_FAIL_FRONTEND_URL: string
		SSL_CANCEL_FRONTEND_URL: string
	}

	REDIS: {
		REDIS_USERNAME: string
		REDIS_PASSWORD: string
		REDIS_HOST: string
		REDIS_PORT: string
	}
}

const loadEnvVars = (): EnvConfig => {
	const requiredEnvVars: string[] = [
		'PORT',
		'DATABASE_URL',
		'NODE_ENV',
		'FRONTEND_URL',

		'CLOUDINARY_CLOUD_NAME',
		'CLOUDINARY_API_KEY',
		'CLOUDINARY_API_SECRET',

		'SMTP_HOST',
		'SMTP_PORT',
		'SMTP_USER',
		'SMTP_PASS',
		'SMTP_FROM',

		'SUPER_ADMIN_EMAIL',
		'SUPER_ADMIN_PASS',

		'SSL_STORE_ID',
		'SSL_STORE_PASS',
		'SSL_PAYMENT_API',
		'SSL_VALIDATION_API',
		'SSL_IPN_URL',

		'SSL_SUCCESS_BACKEND_URL',
		'SSL_FAIL_BACKEND_URL',
		'SSL_CANCEL_BACKEND_URL',

		'SSL_SUCCESS_FRONTEND_URL',
		'SSL_FAIL_FRONTEND_URL',
		'SSL_CANCEL_FRONTEND_URL',

		'REDIS_USERNAME',
		'REDIS_PASSWORD',
		'REDIS_HOST',
		'REDIS_PORT',
	]

	requiredEnvVars.forEach((key) => {
		if (!process.env[key]) {
			throw new Error(`Missing required environment variable ${key}`)
		}
	})

	return {
		NODE_ENV: process.env.NODE_ENV as string,
		PORT: process.env.PORT as string,
		DATABASE_URL: process.env.DATABASE_URL as string,
		FRONTEND_URL: process.env.FRONTEND_URL as string,

		CLOUDINARY: {
			CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,

			CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,

			CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
		},

		EMAIL_SENDER: {
			SMTP_HOST: process.env.SMTP_HOST as string,
			SMTP_PORT: process.env.SMTP_PORT as string,
			SMTP_USER: process.env.SMTP_USER as string,
			SMTP_PASS: process.env.SMTP_PASS as string,
			SMTP_FROM: process.env.SMTP_FROM as string,
		},

		SUPER_ADMIN: {
			SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,

			SUPER_ADMIN_PASS: process.env.SUPER_ADMIN_PASS as string,
		},

		SSL_COMMERZ: {
			SSL_STORE_ID: process.env.SSL_STORE_ID as string,

			SSL_STORE_PASS: process.env.SSL_STORE_PASS as string,

			SSL_PAYMENT_API: process.env.SSL_PAYMENT_API as string,

			SSL_VALIDATION_API: process.env.SSL_VALIDATION_API as string,

			SSL_IPN_URL: process.env.SSL_IPN_URL as string,

			SSL_SUCCESS_BACKEND_URL: process.env
				.SSL_SUCCESS_BACKEND_URL as string,

			SSL_FAIL_BACKEND_URL: process.env.SSL_FAIL_BACKEND_URL as string,

			SSL_CANCEL_BACKEND_URL: process.env
				.SSL_CANCEL_BACKEND_URL as string,

			SSL_SUCCESS_FRONTEND_URL: process.env
				.SSL_SUCCESS_FRONTEND_URL as string,

			SSL_FAIL_FRONTEND_URL: process.env.SSL_FAIL_FRONTEND_URL as string,

			SSL_CANCEL_FRONTEND_URL: process.env
				.SSL_CANCEL_FRONTEND_URL as string,
		},

		REDIS: {
			REDIS_USERNAME: process.env.REDIS_USERNAME as string,

			REDIS_PASSWORD: process.env.REDIS_PASSWORD as string,

			REDIS_HOST: process.env.REDIS_HOST as string,

			REDIS_PORT: process.env.REDIS_PORT as string,
		},
	}
}

export const envVars = loadEnvVars()
