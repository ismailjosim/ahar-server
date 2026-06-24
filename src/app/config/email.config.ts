import nodemailer from 'nodemailer'
import { envVars } from './env'

export const transporter = nodemailer.createTransport({
	host: envVars.SMTP_HOST,
	port: envVars.SMTP_PORT,
	secure: envVars.SMTP_PORT === 465, // true for 465, false for 587
	auth: {
		user: envVars.SMTP_USER,
		pass: envVars.SMTP_PASS,
	},
})

// Verify connection on startup (non-fatal)
transporter
	.verify()
	.then(() => {
		console.log('[Email] Transporter ready.')
	})
	.catch((err) => {
		console.warn('[Email] Transporter failed to connect:', err.message)
	})
