import { prisma } from '@/config/prisma.config'

// Seed data mirrors ahar-frontend/src/lib/menu.constant.ts
// IDs are intentionally omitted — Prisma generates UUIDs.
const menuSeedData = [
	{
		name: 'Royal Mutton Kacchi Biryani',
		description:
			'Premium chinigura rice, slow-cooked mutton, aloo, and aromatic Bengali spices.',
		category: 'বিরিয়ানি',
		price: 420,
		emoji: '🍛',
		rating: 4.9,
		prepTime: '35 min',
		isFeatured: true,
		isSpicy: true,
		isAvailable: true,
		tags: ['Signature', 'Popular'],
		variants: [
			{ name: 'Regular', markup: 0 },
			{ name: 'Family Pack', markup: 360 },
		],
		addOns: [
			{ name: 'Extra Mutton', price: 140 },
			{ name: 'Borhani', price: 80 },
		],
	},
	{
		name: 'Chicken Roast Polao Combo',
		description:
			'Classic wedding-style chicken roast served with fragrant polao, salad, and gravy.',
		category: 'বিরিয়ানি',
		price: 360,
		emoji: '🍗',
		rating: 4.7,
		prepTime: '28 min',
		isFeatured: true,
		isSpicy: false,
		isAvailable: true,
		tags: ['Combo', 'Family'],
		variants: [
			{ name: 'Single', markup: 0 },
			{ name: 'Double', markup: 300 },
		],
		addOns: [
			{ name: 'Firni', price: 70 },
			{ name: 'Soft Drink', price: 60 },
		],
	},
	{
		name: 'Shorshe Ilish',
		description:
			'Hilsa cooked with mustard paste, green chili, and a rich traditional gravy.',
		category: 'মাছ',
		price: 520,
		emoji: '🐟',
		rating: 4.8,
		prepTime: '30 min',
		isFeatured: true,
		isSpicy: true,
		isAvailable: true,
		tags: ['Premium', 'Deshi'],
		variants: [
			{ name: 'Regular', markup: 0 },
			{ name: 'Large Piece', markup: 180 },
		],
		addOns: [
			{ name: 'Plain Rice', price: 60 },
			{ name: 'Dal', price: 50 },
		],
	},
	{
		name: 'Beef Seekh Kebab',
		description:
			'Char-grilled minced beef kebab with smoky spice, onion, and house chutney.',
		category: 'কাবাব',
		price: 280,
		emoji: '🥩',
		rating: 4.6,
		prepTime: '22 min',
		isFeatured: false,
		isSpicy: true,
		isAvailable: true,
		tags: ['Grill', 'Spicy'],
		variants: [
			{ name: '4 pcs', markup: 0 },
			{ name: '8 pcs', markup: 240 },
		],
		addOns: [
			{ name: 'Paratha', price: 35 },
			{ name: 'Mint Chutney', price: 25 },
		],
	},
	{
		name: 'Special Borhani',
		description:
			'Cooling yogurt drink with roasted spices, mint, and a classic Bengali finish.',
		category: 'পানীয়',
		price: 90,
		emoji: '🥤',
		rating: 4.7,
		prepTime: '5 min',
		isFeatured: false,
		isSpicy: false,
		isAvailable: true,
		tags: ['Drink', 'Refreshing'],
		variants: [
			{ name: 'Glass', markup: 0 },
			{ name: 'Bottle', markup: 120 },
		],
		addOns: [],
	},
	{
		name: 'Royal Firni',
		description:
			'Creamy rice pudding with cardamom, nuts, and rose essence.',
		category: 'মিষ্টান্ন',
		price: 120,
		emoji: '🍮',
		rating: 4.8,
		prepTime: 'Ready',
		isFeatured: true,
		isSpicy: false,
		isAvailable: true,
		tags: ['Sweet', 'Classic'],
		variants: [
			{ name: 'Cup', markup: 0 },
			{ name: 'Family Bowl', markup: 300 },
		],
		addOns: [{ name: 'Extra Nuts', price: 30 }],
	},
	{
		name: 'Morog Polao',
		description:
			'Traditional chicken polao with ghee, aromatic rice, and gentle Bengali spices.',
		category: 'বিরিয়ানি',
		price: 340,
		emoji: '🍚',
		rating: 4.5,
		prepTime: '25 min',
		isFeatured: false,
		isSpicy: false,
		isAvailable: false,
		tags: ['Traditional', 'Mild'],
		variants: [
			{ name: 'Regular', markup: 0 },
			{ name: 'Large', markup: 160 },
		],
		addOns: [{ name: 'Chicken Roast', price: 180 }],
	},
	{
		name: 'Chattogram Kala Bhuna',
		description:
			'Dark roasted beef curry with deep spices and slow-cooked gravy.',
		category: 'কাবাব',
		price: 390,
		emoji: '🍖',
		rating: 4.9,
		prepTime: '38 min',
		isFeatured: true,
		isSpicy: true,
		isAvailable: true,
		tags: ['Chef Special', 'Hot'],
		variants: [
			{ name: 'Regular', markup: 0 },
			{ name: 'Large', markup: 220 },
		],
		addOns: [
			{ name: 'Paratha', price: 35 },
			{ name: 'Plain Rice', price: 60 },
		],
	},
]

export async function seedMenu() {
	const count = await prisma.menuItem.count()
	if (count > 0) {
		console.log(`Menu already seeded (${count} items). Skipping.`)
		return
	}

	await prisma.menuItem.createMany({
		data: menuSeedData.map((item) => ({
			...item,
			variants: item.variants,
			addOns: item.addOns,
		})),
	})

	console.log(`Menu seeded with ${menuSeedData.length} items.`)
}
