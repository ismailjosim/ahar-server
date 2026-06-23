import SSLCommerzPayment from 'sslcommerz-lts'

import { envVars } from '@/config/env'
import AppError from '@/helpers/AppError'
import StatusCode from '@/utils/statusCode'

// The sslcommerz-lts package needs store_id, store_passwd, and isLive boolean.
// We cast default to any to avoid typescript module resolution/class typing issues if any.
const SSLCommerz = (SSLCommerzPayment as any).default || SSLCommerzPayment

const sslcz = new SSLCommerz(
	envVars.SSLCOMMERZ_STORE_ID,
	envVars.SSLCOMMERZ_STORE_PASS,
	envVars.SSLCOMMERZ_IS_LIVE === 'true',
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
		success_url: `${envVars.FRONTEND_URL}/checkout/success?orderId=${order.id}`,
		fail_url: `${envVars.FRONTEND_URL}/checkout/fail?orderId=${order.id}`,
		cancel_url: `${envVars.FRONTEND_URL}/checkout/cancel?orderId=${order.id}`,
		ipn_url: `${envVars.BACKEND_URL}/api/v1/payments/sslcommerz/ipn`,
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
		if (!response || !response.GatewayPageURL) {
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
		const response = await sslcz.validate({ val_id: valId })
		return response.status === 'VALID' || response.status === 'VALIDATED'
	} catch {
		return false
	}
}

export const SslService = {
	initSSLCommerz,
	validateSSLCommerz,
}
