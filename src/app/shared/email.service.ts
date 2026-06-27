import path from 'node:path'

import ejs from 'ejs'

import { transporter } from '@/config/email.config'
import { envVars } from '@/config/env'
const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'app', 'email-templates')

async function renderTemplate(
	template: string,
	data: Record<string, unknown>,
): Promise<string> {
	return ejs.renderFile(path.join(TEMPLATES_DIR, `${template}.ejs`), data)
}

async function sendMail(to: string, subject: string, html: string) {
	if (!envVars.EMAIL_SENDER.SMTP_USER) {
		console.warn('[Email] SMTP not configured. Skipping email:', subject)
		return
	}
	await transporter.sendMail({
		from: envVars.EMAIL_SENDER.SMTP_FROM,
		to,
		subject,
		html,
	})
}

export const EmailService = {
	async sendOrderConfirmation(order: {
		customerName: string
		email: string
		id: string
		items: Array<{ name: string; quantity: number; lineTotal: number }>
		total: number
		fulfillmentType: string
		paymentMethod: string
	}) {
		const html = await renderTemplate('order-confirmation', {
			order,
			restaurantName: 'আহার',
			frontendUrl: envVars.FRONTEND_URL,
		})
		await sendMail(
			order.email,
			`আহার — Order Confirmed #${order.id.slice(0, 8).toUpperCase()}`,
			html,
		)
	},

	async sendOrderStatusUpdate(order: {
		customerName: string
		email: string
		id: string
		status: string
	}) {
		const html = await renderTemplate('order-status', {
			order,
			restaurantName: 'আহার',
			frontendUrl: envVars.FRONTEND_URL,
		})
		await sendMail(
			order.email,
			`আহার — Your order is ${order.status}`,
			html,
		)
	},

	async sendReservationConfirmation(reservation: {
		customerName: string
		email?: string | null
		phone: string
		id: string
		guests: number
		displayTime: string
		tableCode?: string | null
	}) {
		if (!reservation.email) return // no email provided
		const html = await renderTemplate('reservation-confirmation', {
			reservation,
			restaurantName: 'আহার',
		})
		await sendMail(
			reservation.email,
			`আহার — Reservation Confirmed #${reservation.id.slice(0, 8).toUpperCase()}`,
			html,
		)
	},

	async sendReservationStatusUpdate(reservation: {
		customerName: string
		email?: string | null
		id: string
		status: string
	}) {
		if (!reservation.email) return
		const html = await renderTemplate('reservation-status', {
			reservation,
			restaurantName: 'আহার',
		})
		await sendMail(
			reservation.email,
			`আহার — Reservation ${reservation.status}`,
			html,
		)
	},

	async sendStaffInvite(invite: {
		email: string
		role: string
		token: string
		inviterName: string
	}) {
		const html = await renderTemplate('staff-invite', {
			invite,
			restaurantName: 'আহার',
			signupUrl: `${envVars.FRONTEND_URL}/auth/signup?invite=${invite.token}`,
		})
		await sendMail(
			invite.email,
			`আহার — You've been invited as ${invite.role}`,
			html,
		)
	},
}
