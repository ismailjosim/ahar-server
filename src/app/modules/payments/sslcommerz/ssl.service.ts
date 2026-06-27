import SSLCommerzPayment from 'sslcommerz-lts'

import { envVars } from '@/config/env'
import AppError from '@/helpers/AppError'
import StatusCode from '@/utils/statusCode'

const SSLCommerz = (SSLCommerzPayment as any).default || SSLCommerzPayment

const sslcz = new SSLCommerz(
	envVars.SSL_COMMERZ.SSL_STORE_ID,
	envVars.SSL_COMMERZ.SSL_STORE_PASS,
	envVars.NODE_ENV === 'production',
)

export async function initSSLCommerz(order: {
	id: string
	total: number
	customerName: string
	phone: string
	email?: string
}): Promise<string> {
	const data = {
		total_amount: order.total,
		currency: 'BDT',
		tran_id: order.id,
		success_url: `${envVars.SSL_COMMERZ.SSL_SUCCESS_BACKEND_URL}?orderId=${order.id}`,
		fail_url: `${envVars.SSL_COMMERZ.SSL_FAIL_BACKEND_URL}?orderId=${order.id}`,
		cancel_url: `${envVars.SSL_COMMERZ.SSL_CANCEL_BACKEND_URL}?orderId=${order.id}`,
		ipn_url: envVars.SSL_COMMERZ.SSL_IPN_URL,
		cus_name: order.customerName,
		cus_email: order.email ?? 'noreply@ahar.com',
		cus_phone: order.phone,
		cus_add1: 'Dhaka',
		cus_city: 'Dhaka',
		cus_country: 'Bangladesh',
		shipping_method: 'NO',
		product_name: 'Ahar Restaurant Order',
		product_category: 'Food',
		product_profile: 'general',
	}

	try {
		const response = await sslcz.init(data)

		if (!response?.GatewayPageURL) {
			throw new AppError(
				StatusCode.BAD_GATEWAY,
				'Failed to initialize SSLCOMMERZ payment session.',
			)
		}

		return response.GatewayPageURL
	} catch (error: any) {
		throw new AppError(
			StatusCode.BAD_GATEWAY,
			error.message || 'SSLCOMMERZ gateway initialization error.',
		)
	}
}

export async function validateSSLCommerz(valId: string): Promise<boolean> {
	try {
		const response = await sslcz.validate({
			val_id: valId,
		})

		return response.status === 'VALID' || response.status === 'VALIDATED'
	} catch {
		return false
	}
}

export const SslService = {
	initSSLCommerz,
	validateSSLCommerz,
}
