import { OrderStatus, PaymentStatus } from '../../../generated/prisma/enums'

export const toDbOrderStatus = (status?: string) => {
	switch (status) {
		case 'Accepted':
			return OrderStatus.ACCEPTED
		case 'Preparing':
			return OrderStatus.PREPARING
		case 'Ready':
			return OrderStatus.READY
		case 'Out for Delivery':
			return OrderStatus.OUT_FOR_DELIVERY
		case 'Delivered':
			return OrderStatus.DELIVERED
		case 'Cancelled':
			return OrderStatus.CANCELLED
		default:
			return OrderStatus.PLACED
	}
}

export const fromDbOrderStatus = (status: OrderStatus) => {
	switch (status) {
		case OrderStatus.ACCEPTED:
			return 'Accepted'
		case OrderStatus.PREPARING:
			return 'Preparing'
		case OrderStatus.READY:
			return 'Ready'
		case OrderStatus.OUT_FOR_DELIVERY:
			return 'Out for Delivery'
		case OrderStatus.DELIVERED:
			return 'Delivered'
		case OrderStatus.CANCELLED:
			return 'Cancelled'
		default:
			return 'Placed'
	}
}

export const toDbPaymentStatus = (status?: string) => {
	switch (status) {
		case 'Completed':
			return PaymentStatus.COMPLETED
		case 'Failed':
			return PaymentStatus.FAILED
		case 'Refunded':
			return PaymentStatus.REFUNDED
		default:
			return PaymentStatus.PENDING
	}
}

export const fromDbPaymentStatus = (status: PaymentStatus) => {
	switch (status) {
		case PaymentStatus.COMPLETED:
			return 'Completed'
		case PaymentStatus.FAILED:
			return 'Failed'
		case PaymentStatus.REFUNDED:
			return 'Refunded'
		default:
			return 'Pending'
	}
}
