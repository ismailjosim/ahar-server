import { prisma } from '@/config/prisma.config'

type SettingsPayload = Record<string, unknown>
type SettingsRecord = NonNullable<
	Awaited<ReturnType<typeof prisma.restaurantSettings.findFirst>>
>

const defaultSettings = {
	id: 'default',
	restaurantName: 'আহার Premium Dining',
	supportPhone: '01755112233',
	supportEmail: 'support@ahar.example',
	address: 'Gulshan Avenue, Dhaka',
	openingTime: '11:00',
	closingTime: '23:00',
	deliveryFee: 80,
	freeDeliveryMin: 1500,
	vatRate: 5,
	serviceChargeRate: 10,
	acceptCod: true,
	acceptBkash: true,
	acceptNagad: true,
	acceptSslcommerz: false,
	lowStockAlerts: true,
	reservationAlerts: true,
	paymentAlerts: true,
	maxTablesPerSlot: 10,
	reservationSlotGap: 30,
}

const toClient = (settings: SettingsRecord | typeof defaultSettings) => ({
	restaurantName: settings.restaurantName,
	supportPhone: settings.supportPhone,
	supportEmail: settings.supportEmail || '',
	address: settings.address || '',
	openingTime: settings.openingTime || '',
	closingTime: settings.closingTime || '',
	deliveryFee: settings.deliveryFee,
	freeDeliveryMin: settings.freeDeliveryMin,
	vatRate: settings.vatRate,
	serviceChargeRate: settings.serviceChargeRate,
	acceptCod: settings.acceptCod,
	acceptBkash: settings.acceptBkash,
	acceptNagad: settings.acceptNagad,
	acceptSslcommerz: settings.acceptSslcommerz,
	lowStockAlerts: settings.lowStockAlerts,
	reservationAlerts: settings.reservationAlerts,
	paymentAlerts: settings.paymentAlerts,
	maxTablesPerSlot: settings.maxTablesPerSlot,
	reservationSlotGap: settings.reservationSlotGap,
})

const getSettings = async () => {
	const settings = await prisma.restaurantSettings.upsert({
		where: { id: 'default' },
		create: defaultSettings,
		update: {},
	})
	return toClient(settings)
}

const updateSettings = async (payload: SettingsPayload) => {
	const settings = await prisma.restaurantSettings.upsert({
		where: { id: 'default' },
		create: {
			...defaultSettings,
			...payload,
		},
		update: {
			...payload,
		},
	})
	return toClient(settings)
}

export const SettingsService = {
	getSettings,
	updateSettings,
}
