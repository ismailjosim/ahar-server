import {
  CategoryStatus,
  FulfillmentType,
  OrderStatus,
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  ReservationStatus,
  UserRole,
  UserStatus,
} from '@generated/prisma/enums';

import { prisma } from '@/config/prisma.config';

export async function populateDemoData() {
  console.log('🚀 Starting Ahar Restaurant Demo Data Population...');

  // ─────────────────────────────────────────────────────────────
  // 1. Restaurant Settings
  // ─────────────────────────────────────────────────────────────
  console.log('📦 Seeding Restaurant Settings...');
  await prisma.restaurantSettings.upsert({
    where: { id: 'default' },
    update: {
      restaurantName: 'আহার - ঐতিহ্যবাহী খাবার ও ক্যাটারিং',
      supportPhone: '+880 1711-234567',
      supportEmail: 'support@ahar-restaurant.com',
      address: 'House 42, Road 11, Block D, Banani, Dhaka-1213',
      openingTime: '10:00',
      closingTime: '23:30',
      deliveryFee: 60,
      freeDeliveryMin: 800,
      vatRate: 5,
      serviceChargeRate: 0,
      acceptCod: true,
      acceptBkash: true,
      acceptNagad: true,
      acceptSslcommerz: true,
      lowStockAlerts: true,
      reservationAlerts: true,
      paymentAlerts: true,
      maxTablesPerSlot: 12,
      reservationSlotGap: 30,
    },
    create: {
      id: 'default',
      restaurantName: 'আহার - ঐতিহ্যবাহী খাবার ও ক্যাটারিং',
      supportPhone: '+880 1711-234567',
      supportEmail: 'support@ahar-restaurant.com',
      address: 'House 42, Road 11, Block D, Banani, Dhaka-1213',
      openingTime: '10:00',
      closingTime: '23:30',
      deliveryFee: 60,
      freeDeliveryMin: 800,
      vatRate: 5,
      serviceChargeRate: 0,
      acceptCod: true,
      acceptBkash: true,
      acceptNagad: true,
      acceptSslcommerz: true,
      lowStockAlerts: true,
      reservationAlerts: true,
      paymentAlerts: true,
      maxTablesPerSlot: 12,
      reservationSlotGap: 30,
    },
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Users & Staff Roles
  // ─────────────────────────────────────────────────────────────
  console.log('👤 Seeding Users & Staff Accounts...');

  // Upgrade existing JASIM account to SUPER_ADMIN if present
  const jasim = await prisma.user.findUnique({
    where: { email: 'ismailjosim99@gmail.com' },
  });
  if (jasim) {
    await prisma.user.update({
      where: { email: 'ismailjosim99@gmail.com' },
      data: { role: UserRole.SUPER_ADMIN, status: UserStatus.ACTIVE },
    });
    console.log('  👑 Upgraded ismailjosim99@gmail.com to SUPER_ADMIN');
  }

  const staffUsers = [
    {
      id: 'staff-admin-01',
      name: 'সুপার এডমিন (Ahar Admin)',
      email: 'admin@ahar.com',
      phone: '+8801700000001',
      role: UserRole.SUPER_ADMIN,
    },
    {
      id: 'staff-chef-01',
      name: 'শেফ রফিক (Chef Rafiq)',
      email: 'chef.rafiq@ahar.com',
      phone: '+8801700000002',
      role: UserRole.KITCHEN,
    },
    {
      id: 'staff-cashier-01',
      name: 'তামিম আহমেদ (Tamim Cashier)',
      email: 'cashier.tamim@ahar.com',
      phone: '+8801700000003',
      role: UserRole.CASHIER,
    },
    {
      id: 'staff-manager-01',
      name: 'সাদিয়া ইসলাম (Sadia Manager)',
      email: 'manager.sadia@ahar.com',
      phone: '+8801700000004',
      role: UserRole.MANAGER,
    },
    {
      id: 'staff-owner-01',
      name: 'হাজী ফজলুর রহমান (Owner Fazlu)',
      email: 'owner.fazlu@ahar.com',
      phone: '+8801700000005',
      role: UserRole.OWNER,
    },
    {
      id: 'customer-rahim-01',
      name: 'রহিম চৌধুরী (Rahim Chowdhury)',
      email: 'rahim.chy@gmail.com',
      phone: '+8801819000001',
      role: UserRole.CUSTOMER,
    },
    {
      id: 'customer-fatima-01',
      name: 'ফাতিমা বেগম (Fatima Begum)',
      email: 'fatima.b@gmail.com',
      phone: '+8801912000002',
      role: UserRole.CUSTOMER,
    },
    {
      id: 'customer-tanvir-01',
      name: 'তানভীর হাসান (Tanvir Hasan)',
      email: 'tanvir.h@gmail.com',
      phone: '+8801615000003',
      role: UserRole.CUSTOMER,
    },
  ];

  for (const u of staffUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        phone: u.phone,
        role: u.role,
        status: UserStatus.ACTIVE,
      },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        status: UserStatus.ACTIVE,
        emailVerified: true,
      },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 3. Categories
  // ─────────────────────────────────────────────────────────────
  console.log('📂 Seeding Food Categories...');
  const categoriesData = [
    {
      name: 'বিরিয়ানি ও পোলাও',
      slug: 'biryani-polao',
      description: 'খাঁটি বাসমতি ও চিনিগুঁড়া চালের শাহী বিরিয়ানি ও সুগন্ধি পোলাও পদ।',
      icon: '🍛',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800',
    },
    {
      name: 'ঐতিহ্যবাহী মাছ',
      slug: 'traditional-fish',
      description: 'পদ্মার তাজা ইলিশ, গলদা চিংড়ি এবং রূপচাঁদার জিভে জল আনা দেশি রান্না।',
      icon: '🐟',
      image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?q=80&w=800',
    },
    {
      name: 'খাঁটি মাংসের পদ',
      slug: 'meat-specialties',
      description: 'চট্টগ্রামের ঐতিহ্যবাহী কালা ভুনা, মাটন রেজালা এবং সুস্বাদু রোস্ট।',
      icon: '🥩',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800',
    },
    {
      name: 'কাবাব ও স্টার্টার',
      slug: 'kebabs-starters',
      description: 'তান্দুরি গ্রিল কাবাব, সুস্বাদু স্পেশাল দই ফুচকা এবং ক্রিস্পি স্টার্টার।',
      icon: '🍢',
      image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?q=80&w=800',
    },
    {
      name: 'শাহী মিষ্টি ও পানীয়',
      slug: 'desserts-drinks',
      description: 'ঠাণ্ডা শাহী বোরহানি, মাটির হাঁড়ির ফিরনি এবং রিফ্রেশিং পানীয়।',
      icon: '🍨',
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=800',
    },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        image: cat.image,
        status: CategoryStatus.ACTIVE,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        image: cat.image,
        status: CategoryStatus.ACTIVE,
      },
    });
    categoryMap.set(cat.slug, record.id);
  }

  // ─────────────────────────────────────────────────────────────
  // 4. Menu Items
  // ─────────────────────────────────────────────────────────────
  console.log('🍽️ Seeding Menu Items...');
  const menuData = [
    {
      name: 'Royal Mutton Kacchi Biryani',
      description:
        'সুগন্ধি চিনিগুঁড়া চাল, নরম রসালো খাসির মাংস, জাফরান, আলু এবং আহারের বিশেষ শাহী মশলায় দমপোক্ত।',
      categorySlug: 'biryani-polao',
      price: 450,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800',
      rating: 4.9,
      prepTime: '30 min',
      isFeatured: true,
      isSpicy: true,
      isAvailable: true,
      tags: ['Signature', 'Popular', 'Spicy'],
      variants: [
        { name: 'Regular (১ প্লেট)', markup: 0 },
        { name: 'Family Pack (২-৩ জন)', markup: 420 },
      ],
      addOns: [
        { name: 'এক্সট্রা মাটন পিস', price: 160 },
        { name: 'শাহী বোরহানি গ্লাস', price: 80 },
        { name: 'আলু বোখারা চাটনি', price: 40 },
      ],
    },
    {
      name: 'Chicken Roast Polao Combo',
      description:
        'বিয়ে বাড়ির ঐতিহ্যবাহী ঘিয়ে ভাজা খাস চিকেন রোস্ট ও সুগন্ধি পোলাও, সাথে ডিম ও সালাদ।',
      categorySlug: 'biryani-polao',
      price: 380,
      imageUrl: 'https://images.unsplash.com/photo-1567337710282-00832b415979?q=80&w=800',
      rating: 4.8,
      prepTime: '25 min',
      isFeatured: true,
      isSpicy: false,
      isAvailable: true,
      tags: ['Combo', 'Popular'],
      variants: [
        { name: 'Single Combo', markup: 0 },
        { name: 'Double Feast', markup: 340 },
      ],
      addOns: [
        { name: 'মাটির হাঁড়ির ফিরনি', price: 70 },
        { name: 'কোল্ড ড্রিংকস', price: 50 },
      ],
    },
    {
      name: 'Old Dhaka Beef Tehari',
      description:
        'খাঁটি সরিষার তেলে রান্না করা ছোট ছোট নরম গরুর মাংসের টুকরা সমৃদ্ধ পুরান ঢাকার ঐতিহ্যবাহী তেহারি।',
      categorySlug: 'biryani-polao',
      price: 340,
      imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=800',
      rating: 4.7,
      prepTime: '20 min',
      isFeatured: false,
      isSpicy: true,
      isAvailable: true,
      tags: ['Mustard Oil', 'Old Dhaka'],
      variants: [{ name: 'Regular', markup: 0 }],
      addOns: [
        { name: 'সিদ্ধ ডিম', price: 30 },
        { name: 'বোরহানি', price: 80 },
      ],
    },
    {
      name: 'Padma Shorshe Ilish',
      description:
        'তাজা পদ্মার বড় ইলিশের পেটি খাঁটি ঝাঁঝালো সরিষা বাটা ও কাঁচা মরিচের রসে রান্না করা বাঙালির শ্রেষ্ঠ পদ।',
      categorySlug: 'traditional-fish',
      price: 580,
      imageUrl: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?q=80&w=800',
      rating: 4.9,
      prepTime: '30 min',
      isFeatured: true,
      isSpicy: true,
      isAvailable: true,
      tags: ['Premium', 'Padma', 'Signature'],
      variants: [{ name: '১ পিস পেটি', markup: 0 }],
      addOns: [{ name: 'সাদা ভাত বাটি', price: 50 }],
    },
    {
      name: 'Chingri Malai Curry',
      description:
        'তাজা বড় গলদা চিংড়ি নারকেলের দুধের ঘন ক্রিম ও হালকা গরম মশলায় তৈরি অপূর্ব স্বাদের মালাইকারি।',
      categorySlug: 'traditional-fish',
      price: 520,
      imageUrl: 'https://images.unsplash.com/photo-1559742811-822873691df8?q=80&w=800',
      rating: 4.8,
      prepTime: '25 min',
      isFeatured: true,
      isSpicy: false,
      isAvailable: true,
      tags: ['Creamy', 'Prawn', 'Popular'],
      variants: [{ name: '২ পিস গলদা', markup: 0 }],
      addOns: [{ name: 'পোলাও', price: 90 }],
    },
    {
      name: 'Chittagong Beef Kala Bhuna',
      description:
        'চট্টগ্রামের খাঁটি রেসিপিতে ঘণ্টার পর ঘণ্টা ভাজা কালো রঙের রসালো মশলাদার গরুর মাংসের ঐতিহ্যবাহী কালা ভুনা।',
      categorySlug: 'meat-specialties',
      price: 480,
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800',
      rating: 4.9,
      prepTime: '35 min',
      isFeatured: true,
      isSpicy: true,
      isAvailable: true,
      tags: ['Authentic', 'Spicy', 'Chittagong'],
      variants: [
        { name: 'Regular (১ বাটি)', markup: 0 },
        { name: 'Special Large', markup: 400 },
      ],
      addOns: [
        { name: 'স্পেশাল বাটার নান', price: 60 },
        { name: 'প্লেন পরোটা (২ পিস)', price: 50 },
      ],
    },
    {
      name: 'Mutton Shahi Rezala',
      description:
        'কাজুবাদাম বাটা, টক দই এবং সুগন্ধি মশলার অপূর্ব মেলবন্ধনে তৈরি মোঘলাই স্টাইলের মাটন রেজালা।',
      categorySlug: 'meat-specialties',
      price: 420,
      imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=800',
      rating: 4.7,
      prepTime: '30 min',
      isFeatured: false,
      isSpicy: false,
      isAvailable: true,
      tags: ['Mughlai', 'Rich'],
      variants: [{ name: 'Regular', markup: 0 }],
      addOns: [{ name: 'রুমালি রুটি (২ পিস)', price: 60 }],
    },
    {
      name: 'Chicken Reshmi Kebab',
      description:
        'কাজু ও পনিরের পেস্টে ম্যারিনেট করা একদম নরম তুলতুলে চিকেন রেশমি কাবাব, সাথে পুদিনা চাটনি।',
      categorySlug: 'kebabs-starters',
      price: 290,
      imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?q=80&w=800',
      rating: 4.8,
      prepTime: '20 min',
      isFeatured: false,
      isSpicy: false,
      isAvailable: true,
      tags: ['Tandoori', 'Starter'],
      variants: [{ name: '৪ পিস স্টিক', markup: 0 }],
      addOns: [{ name: 'গার্লিক নান', price: 70 }],
    },
    {
      name: 'Special Doi Fuchka (8 Pcs)',
      description: 'মুচমুচে ফুচকা, মিষ্টি-টক দই, আলু মটর ফিলিং এবং চটপটি মশলার অসাধারণ কম্বিনেশন।',
      categorySlug: 'kebabs-starters',
      price: 150,
      imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800',
      rating: 4.9,
      prepTime: '12 min',
      isFeatured: true,
      isSpicy: true,
      isAvailable: true,
      tags: ['Street Food', 'Snacks'],
      variants: [{ name: '৮ পিস প্লেট', markup: 0 }],
      addOns: [{ name: 'এক্সট্রা দই', price: 40 }],
    },
    {
      name: 'Royal Shahi Borhani',
      description:
        'টক দই, পুদিনা, ধনেপাতা, বিট লবণ ও বিশেষ মশলায় তৈরি আহারের সিগনেচার রিফ্রেশিং বোরহানি।',
      categorySlug: 'desserts-drinks',
      price: 90,
      imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=800',
      rating: 4.9,
      prepTime: '5 min',
      isFeatured: true,
      isSpicy: true,
      isAvailable: true,
      tags: ['Signature', 'Chilled', 'Digestive'],
      variants: [
        { name: 'গ্লাস (৩০০ মিলি)', markup: 0 },
        { name: 'বোতল (৫০০ মিলি)', markup: 80 },
      ],
      addOns: [],
    },
    {
      name: 'Shahi Firni Matka',
      description:
        'জাফরান, এলাচ ও পেস্তা বাদাম কুচি মিশ্রিত ঘন মালাই দুধ ও সুগন্ধি চালের খাঁটি মাটির পাত্রের ফিরনি।',
      categorySlug: 'desserts-drinks',
      price: 85,
      imageUrl: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?q=80&w=800',
      rating: 4.8,
      prepTime: '5 min',
      isFeatured: true,
      isSpicy: false,
      isAvailable: true,
      tags: ['Dessert', 'Sweet'],
      variants: [{ name: '১ মাটকা', markup: 0 }],
      addOns: [],
    },
  ];

  const menuItemMap = new Map<string, string>();
  for (const item of menuData) {
    const categoryId = categoryMap.get(item.categorySlug);
    if (!categoryId) continue;

    // Check if item exists by name
    const existing = await prisma.menuItem.findFirst({
      where: { name: item.name },
    });

    if (existing) {
      const updated = await prisma.menuItem.update({
        where: { id: existing.id },
        data: {
          description: item.description,
          price: item.price,
          imageUrl: item.imageUrl,
          rating: item.rating,
          prepTime: item.prepTime,
          isFeatured: item.isFeatured,
          isSpicy: item.isSpicy,
          isAvailable: item.isAvailable,
          tags: item.tags,
          variants: item.variants,
          addOns: item.addOns,
          categoryId,
        },
      });
      menuItemMap.set(item.name, updated.id);
    } else {
      const created = await prisma.menuItem.create({
        data: {
          name: item.name,
          description: item.description,
          price: item.price,
          imageUrl: item.imageUrl,
          rating: item.rating,
          prepTime: item.prepTime,
          isFeatured: item.isFeatured,
          isSpicy: item.isSpicy,
          isAvailable: item.isAvailable,
          tags: item.tags,
          variants: item.variants,
          addOns: item.addOns,
          categoryId,
        },
      });
      menuItemMap.set(item.name, created.id);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 5. Coupons & Promo Codes
  // ─────────────────────────────────────────────────────────────
  console.log('🎟️ Seeding Coupons & Promo Codes...');
  const couponsData = [
    {
      code: 'AHAR10',
      description: '১০% ছাড় (যেকোনো ৫০০ টাকার বেশি অর্ডারে প্রযোজ্য)',
      discountType: 'percent',
      discountValue: 10,
      minOrderValue: 500,
      maxUses: 500,
      usedCount: 42,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      code: 'WELCOME50',
      description: 'নতুন গ্রাহকদের জন্য ৫০ টাকা ইনস্ট্যান্ট ক্যাশ ছাড়',
      discountType: 'flat',
      discountValue: 50,
      minOrderValue: 300,
      maxUses: 1000,
      usedCount: 180,
      isActive: true,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
    {
      code: 'EATBIG',
      description: 'বড় ফ্যামিলি অর্ডারে ১৫০ টাকা বিশেষ ফ্ল্যাট ছাড়',
      discountType: 'flat',
      discountValue: 150,
      minOrderValue: 1000,
      maxUses: 200,
      usedCount: 65,
      isActive: true,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
    {
      code: 'BIRYANI20',
      description: 'বিরিয়ানি লাভারদের জন্য ২০% মেগা ডিসকাউন্ট',
      discountType: 'percent',
      discountValue: 20,
      minOrderValue: 700,
      maxUses: 150,
      usedCount: 148,
      isActive: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      code: 'EXPIRED30',
      description: 'মেয়াদোত্তীর্ণ ৩০% ডিসকাউন্ট ভাউচার (আর্কাইভ টেস্ট)',
      discountType: 'percent',
      discountValue: 30,
      minOrderValue: 400,
      maxUses: 50,
      usedCount: 50,
      isActive: false,
      expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const c of couponsData) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 6. Inventory Items & Stock Ledgers
  // ─────────────────────────────────────────────────────────────
  console.log('📦 Seeding Kitchen Inventory & Stock Items...');
  const inventoryData = [
    {
      name: 'চিনিগুঁড়া চাল (Chinigura Rice)',
      category: 'Grains & Rice',
      sku: 'ING-RICE-01',
      stock: 85,
      unit: 'kg',
      threshold: 30,
      supplier: 'দিনাজপুর রাইস এগ্রো',
      unitCost: 115,
      reason: 'নতুন স্টক যুক্ত করা হয়েছে',
    },
    {
      name: 'তাজা খাসির মাংস (Fresh Mutton)',
      category: 'Meat',
      sku: 'ING-MUT-01',
      stock: 12,
      unit: 'kg',
      threshold: 25, // LOW STOCK TRIGGER!
      supplier: 'মিরপুর মিট হাউস',
      unitCost: 1100,
      reason: 'আজকের কাচ্চি রান্নায় খরচ হয়েছে',
    },
    {
      name: 'সোনালী মুরগি (Farm Chicken)',
      category: 'Meat',
      sku: 'ING-CHK-01',
      stock: 35,
      unit: 'kg',
      threshold: 15,
      supplier: 'গাজীপুর পোল্ট্রি হাব',
      unitCost: 320,
      reason: 'সকালের চালান ইনভেন্টরিতে প্রবেশ করেছে',
    },
    {
      name: 'পদ্মার তাজা ইলিশ (Padma Hilsa)',
      category: 'Seafood',
      sku: 'ING-FISH-01',
      stock: 3,
      unit: 'pcs',
      threshold: 10, // CRITICAL LOW STOCK!
      supplier: 'মাওয়া ঘাট ফিশারিজ',
      unitCost: 1400,
      reason: 'দুপুরের অর্ডারে স্টক কমে গেছে',
    },
    {
      name: 'গলদা চিংড়ি (Tiger Prawns)',
      category: 'Seafood',
      sku: 'ING-PRWN-01',
      stock: 7,
      unit: 'kg',
      threshold: 10, // LOW STOCK!
      supplier: 'খুলনা সিফুড ট্রেডার্স',
      unitCost: 1200,
      reason: 'মালাইকারির প্রিপারেশনে ব্যবহার',
    },
    {
      name: 'খাঁটি গাওয়া ঘি (Pure Cow Ghee)',
      category: 'Dairy & Fats',
      sku: 'ING-GHEE-01',
      stock: 22,
      unit: 'kg',
      threshold: 8,
      supplier: 'মিল্কভিটা ডেইরি',
      unitCost: 1450,
      reason: 'সাপ্তাহিক রিস্টকিং সম্পন্ন',
    },
    {
      name: 'খাঁটি সরিষার তেল (Mustard Oil)',
      category: 'Oils',
      sku: 'ING-OIL-01',
      stock: 40,
      unit: 'L',
      threshold: 15,
      supplier: 'রাধুনী এগ্রো লিমিটেড',
      unitCost: 225,
      reason: 'তেহারি ও ভর্তা বিভাগের স্টক',
    },
    {
      name: 'দেশি পেঁয়াজ ও আলু (Onion & Potato)',
      category: 'Vegetables',
      sku: 'ING-VEG-01',
      stock: 130,
      unit: 'kg',
      threshold: 40,
      supplier: 'কাওরান বাজার আড়তদার্স',
      unitCost: 65,
      reason: 'পাইকারি বস্তা গ্রহণ করা হয়েছে',
    },
    {
      name: 'শাহী গরম মশলা (Royal Spice Mix)',
      category: 'Spices',
      sku: 'ING-SPC-01',
      stock: 18,
      unit: 'packs',
      threshold: 5,
      supplier: 'চকবাজার হোলসেল মশলা',
      unitCost: 450,
      reason: 'মাসিক মশলা ব্লেন্ডিং স্টক',
    },
    {
      name: 'টক দই (Fresh Yogurt / Curd)',
      category: 'Dairy',
      sku: 'ING-YOG-01',
      stock: 24,
      unit: 'kg',
      threshold: 10,
      supplier: 'বগুড়া দধি ভান্ডার',
      unitCost: 120,
      reason: 'বোরহানি ও মেরিনেশন স্টক',
    },
    {
      name: 'জাফরান ও কেওড়া জল (Saffron & Kewra)',
      category: 'Aromatics',
      sku: 'ING-SAFF-01',
      stock: 0,
      unit: 'bottles',
      threshold: 5, // OUT OF STOCK!
      supplier: 'নিউমার্কেট ইম্পোর্টস',
      unitCost: 850,
      reason: 'স্টক সম্পূর্ণ শেষ — অতিসত্বর রিঅর্ডার করুন',
    },
  ];

  for (const inv of inventoryData) {
    const existing = await prisma.inventoryItem.findFirst({
      where: { name: inv.name },
    });

    if (existing) {
      await prisma.inventoryItem.update({
        where: { id: existing.id },
        data: {
          stock: inv.stock,
          unit: inv.unit,
          threshold: inv.threshold,
          supplier: inv.supplier,
          unitCost: inv.unitCost,
          lastRestocked: new Date(),
        },
      });
    } else {
      await prisma.inventoryItem.create({
        data: {
          name: inv.name,
          category: inv.category,
          sku: inv.sku,
          stock: inv.stock,
          unit: inv.unit,
          threshold: inv.threshold,
          supplier: inv.supplier,
          unitCost: inv.unitCost,
          lastRestocked: new Date(),
          audits: {
            create: {
              change: inv.stock,
              previousStock: 0,
              nextStock: inv.stock,
              reason: inv.reason,
            },
          },
        },
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 7. Orders across Lifecycle States (Kitchen, Dashboard, History)
  // ─────────────────────────────────────────────────────────────
  console.log('📋 Seeding Live & Historical Orders...');

  const kacchiId = menuItemMap.get('Royal Mutton Kacchi Biryani');
  const roastId = menuItemMap.get('Chicken Roast Polao Combo');
  const ilishId = menuItemMap.get('Padma Shorshe Ilish');
  const kalaBhunaId = menuItemMap.get('Chittagong Beef Kala Bhuna');
  const reshmiId = menuItemMap.get('Chicken Reshmi Kebab');
  const fuchkaId = menuItemMap.get('Special Doi Fuchka (8 Pcs)');
  const borhaniId = menuItemMap.get('Royal Shahi Borhani');
  const firniId = menuItemMap.get('Shahi Firni Matka');

  const now = Date.now();

  const ordersToCreate = [
    // ── Ticket 1: PLACED (Dine-In New Ticket) ──────────────────
    {
      customerName: 'সোহাগ রিয়াদ',
      phone: '+8801712334455',
      email: 'sohag.r@gmail.com',
      fulfillmentType: FulfillmentType.PICKUP,
      address: null,
      notes: 'ঝাল একটু কম দিবেন, আলু যেন ভালো সিদ্ধ থাকে।',
      tableNumber: 'T-03',
      subtotal: 540,
      deliveryFee: 0,
      vat: 27,
      serviceCharge: 0,
      discount: 0,
      total: 567,
      paymentMethod: PaymentMethod.COD,
      paymentStatus: PaymentStatus.PENDING,
      status: OrderStatus.PLACED,
      createdAt: new Date(now - 4 * 60 * 1000), // 4 mins ago
      items: [
        {
          menuItemId: kacchiId,
          nameSnapshot: 'Royal Mutton Kacchi Biryani',
          quantity: 1,
          unitPrice: 450,
          lineTotal: 450,
        },
        {
          menuItemId: borhaniId,
          nameSnapshot: 'Royal Shahi Borhani',
          quantity: 1,
          unitPrice: 90,
          lineTotal: 90,
        },
      ],
    },

    // ── Ticket 2: ACCEPTED (Delivery New Ticket) ───────────────
    {
      customerName: 'আরিফুল হক',
      phone: '+8801823445566',
      email: 'ariful.h@gmail.com',
      fulfillmentType: FulfillmentType.DELIVERY,
      address: 'Flat 4B, House 12, Road 7, Dhanmondi, Dhaka',
      notes: 'কলিংবেল কাজ করছে না, গেটে এসে ফোন দিবেন।',
      tableNumber: null,
      subtotal: 900,
      deliveryFee: 60,
      vat: 45,
      serviceCharge: 0,
      discount: 50, // WELCOME50 applied
      total: 955,
      paymentMethod: PaymentMethod.BKASH,
      paymentStatus: PaymentStatus.COMPLETED,
      status: OrderStatus.ACCEPTED,
      createdAt: new Date(now - 9 * 60 * 1000), // 9 mins ago
      items: [
        {
          menuItemId: roastId,
          nameSnapshot: 'Chicken Roast Polao Combo',
          quantity: 2,
          unitPrice: 380,
          lineTotal: 760,
        },
        {
          menuItemId: firniId,
          nameSnapshot: 'Shahi Firni Matka',
          quantity: 2,
          unitPrice: 85,
          lineTotal: 170,
        },
      ],
    },

    // ── Ticket 3: PREPARING (Dine-In Cooking) ──────────────────
    {
      customerName: 'ফারহানা ইয়াসমিন',
      phone: '+8801934556677',
      email: 'farhana.y@gmail.com',
      fulfillmentType: FulfillmentType.PICKUP,
      address: null,
      notes: 'কালা ভুনা একদম স্পাইসি এবং গ্রেভি রাখবেন।',
      tableNumber: 'T-05',
      subtotal: 960,
      deliveryFee: 0,
      vat: 48,
      serviceCharge: 0,
      discount: 0,
      total: 1008,
      paymentMethod: PaymentMethod.CARD,
      paymentStatus: PaymentStatus.COMPLETED,
      status: OrderStatus.PREPARING,
      createdAt: new Date(now - 17 * 60 * 1000), // 17 mins ago
      items: [
        {
          menuItemId: kalaBhunaId,
          nameSnapshot: 'Chittagong Beef Kala Bhuna',
          quantity: 2,
          unitPrice: 480,
          lineTotal: 960,
        },
      ],
    },

    // ── Ticket 4: PREPARING (Delivery Cooking) ─────────────────
    {
      customerName: 'মেহরাব হোসেন',
      phone: '+8801645667788',
      email: 'mehrab.h@gmail.com',
      fulfillmentType: FulfillmentType.DELIVERY,
      address: 'House 55, Lake Circus, Kalabagan, Dhaka',
      notes: 'কাঁচা মরিচ বেশি দিবেন।',
      tableNumber: null,
      subtotal: 1100,
      deliveryFee: 0, // Free delivery tier
      vat: 55,
      serviceCharge: 0,
      discount: 110, // AHAR10 applied
      total: 1045,
      paymentMethod: PaymentMethod.SSLCOMMERZ,
      paymentStatus: PaymentStatus.COMPLETED,
      status: OrderStatus.PREPARING,
      createdAt: new Date(now - 24 * 60 * 1000), // 24 mins ago
      items: [
        {
          menuItemId: ilishId,
          nameSnapshot: 'Padma Shorshe Ilish',
          quantity: 1,
          unitPrice: 580,
          lineTotal: 580,
        },
        {
          menuItemId: kacchiId,
          nameSnapshot: 'Royal Mutton Kacchi Biryani',
          quantity: 1,
          unitPrice: 450,
          lineTotal: 450,
        },
        {
          menuItemId: borhaniId,
          nameSnapshot: 'Royal Shahi Borhani',
          quantity: 1,
          unitPrice: 90,
          lineTotal: 90,
        },
      ],
    },

    // ── Ticket 5: READY (Waiting for takeaway pickup) ──────────
    {
      customerName: 'তানভীর হাসান',
      phone: '+8801615000003',
      email: 'tanvir.h@gmail.com',
      fulfillmentType: FulfillmentType.PICKUP,
      address: null,
      notes: 'রেশমি কাবাবের সাথে এক্সট্রা পুদিনা চাটনি দিবেন।',
      tableNumber: null,
      subtotal: 730,
      deliveryFee: 0,
      vat: 36,
      serviceCharge: 0,
      discount: 0,
      total: 766,
      paymentMethod: PaymentMethod.COD,
      paymentStatus: PaymentStatus.PENDING,
      status: OrderStatus.READY,
      createdAt: new Date(now - 28 * 60 * 1000), // 28 mins ago
      items: [
        {
          menuItemId: reshmiId,
          nameSnapshot: 'Chicken Reshmi Kebab',
          quantity: 2,
          unitPrice: 290,
          lineTotal: 580,
        },
        {
          menuItemId: fuchkaId,
          nameSnapshot: 'Special Doi Fuchka (8 Pcs)',
          quantity: 1,
          unitPrice: 150,
          lineTotal: 150,
        },
      ],
    },

    // ── Ticket 6: READY (Rider on the way) ─────────────────────
    {
      customerName: 'ফাতিমা বেগম',
      phone: '+8801912000002',
      email: 'fatima.b@gmail.com',
      fulfillmentType: FulfillmentType.DELIVERY,
      address: 'Tower 3, Apt 11B, Gulshan-2, Dhaka',
      notes: null,
      tableNumber: null,
      subtotal: 1620,
      deliveryFee: 0,
      vat: 81,
      serviceCharge: 0,
      discount: 150, // EATBIG applied
      total: 1551,
      paymentMethod: PaymentMethod.SSLCOMMERZ,
      paymentStatus: PaymentStatus.COMPLETED,
      status: OrderStatus.READY,
      createdAt: new Date(now - 35 * 60 * 1000), // 35 mins ago
      items: [
        {
          menuItemId: kacchiId,
          nameSnapshot: 'Royal Mutton Kacchi Biryani',
          quantity: 3,
          unitPrice: 450,
          lineTotal: 1350,
        },
        {
          menuItemId: borhaniId,
          nameSnapshot: 'Royal Shahi Borhani',
          quantity: 3,
          unitPrice: 90,
          lineTotal: 270,
        },
      ],
    },

    // ── Delivered Orders: Today & Recent 7 Days ────────────────
    {
      customerName: 'রহিম চৌধুরী',
      phone: '+8801819000001',
      email: 'rahim.chy@gmail.com',
      fulfillmentType: FulfillmentType.DELIVERY,
      address: 'House 14, Road 5, Uttara Sector 3, Dhaka',
      notes: null,
      tableNumber: null,
      subtotal: 1440,
      deliveryFee: 0,
      vat: 72,
      serviceCharge: 0,
      discount: 100,
      total: 1412,
      paymentMethod: PaymentMethod.SSLCOMMERZ,
      paymentStatus: PaymentStatus.COMPLETED,
      status: OrderStatus.DELIVERED,
      createdAt: new Date(now - 3 * 60 * 60 * 1000), // 3 hours ago
      items: [
        {
          menuItemId: kacchiId,
          nameSnapshot: 'Royal Mutton Kacchi Biryani',
          quantity: 2,
          unitPrice: 450,
          lineTotal: 900,
        },
        {
          menuItemId: kalaBhunaId,
          nameSnapshot: 'Chittagong Beef Kala Bhuna',
          quantity: 1,
          unitPrice: 480,
          lineTotal: 480,
        },
        {
          menuItemId: borhaniId,
          nameSnapshot: 'Royal Shahi Borhani',
          quantity: 2,
          unitPrice: 90,
          lineTotal: 180,
        },
      ],
    },
    {
      customerName: 'নাজমুল করিম',
      phone: '+8801755112233',
      email: 'nazmul.k@yahoo.com',
      fulfillmentType: FulfillmentType.DELIVERY,
      address: 'House 8, Block B, Mirpur-10, Dhaka',
      notes: null,
      tableNumber: null,
      subtotal: 960,
      deliveryFee: 60,
      vat: 48,
      serviceCharge: 0,
      discount: 50,
      total: 1018,
      paymentMethod: PaymentMethod.COD,
      paymentStatus: PaymentStatus.COMPLETED,
      status: OrderStatus.DELIVERED,
      createdAt: new Date(now - 26 * 60 * 60 * 1000), // Yesterday
      items: [
        {
          menuItemId: roastId,
          nameSnapshot: 'Chicken Roast Polao Combo',
          quantity: 2,
          unitPrice: 380,
          lineTotal: 760,
        },
        {
          menuItemId: fuchkaId,
          nameSnapshot: 'Special Doi Fuchka (8 Pcs)',
          quantity: 1,
          unitPrice: 150,
          lineTotal: 150,
        },
      ],
    },
    {
      customerName: 'সাদিয়া সুলতানা',
      phone: '+8801844223344',
      email: 'sadia.s@gmail.com',
      fulfillmentType: FulfillmentType.DELIVERY,
      address: 'House 22, Road 18, Banani, Dhaka',
      notes: null,
      tableNumber: null,
      subtotal: 1740,
      deliveryFee: 0,
      vat: 87,
      serviceCharge: 0,
      discount: 150,
      total: 1677,
      paymentMethod: PaymentMethod.SSLCOMMERZ,
      paymentStatus: PaymentStatus.COMPLETED,
      status: OrderStatus.DELIVERED,
      createdAt: new Date(now - 48 * 60 * 60 * 1000), // 2 days ago
      items: [
        {
          menuItemId: ilishId,
          nameSnapshot: 'Padma Shorshe Ilish',
          quantity: 2,
          unitPrice: 580,
          lineTotal: 1160,
        },
        {
          menuItemId: reshmiId,
          nameSnapshot: 'Chicken Reshmi Kebab',
          quantity: 2,
          unitPrice: 290,
          lineTotal: 580,
        },
      ],
    },
    {
      customerName: 'ইকবাল মাহমুদ',
      phone: '+8801955334455',
      email: 'iqbal.m@gmail.com',
      fulfillmentType: FulfillmentType.PICKUP,
      address: null,
      notes: null,
      tableNumber: 'T-01',
      subtotal: 1410,
      deliveryFee: 0,
      vat: 70,
      serviceCharge: 0,
      discount: 0,
      total: 1480,
      paymentMethod: PaymentMethod.CARD,
      paymentStatus: PaymentStatus.COMPLETED,
      status: OrderStatus.DELIVERED,
      createdAt: new Date(now - 72 * 60 * 60 * 1000), // 3 days ago
      items: [
        {
          menuItemId: kacchiId,
          nameSnapshot: 'Royal Mutton Kacchi Biryani',
          quantity: 3,
          unitPrice: 450,
          lineTotal: 1350,
        },
      ],
    },
    {
      customerName: 'মুনিরা আকতার',
      phone: '+8801688445566',
      email: 'munira.a@gmail.com',
      fulfillmentType: FulfillmentType.DELIVERY,
      address: 'House 77, Road 11, Bashundhara R/A, Dhaka',
      notes: null,
      tableNumber: null,
      subtotal: 2120,
      deliveryFee: 0,
      vat: 106,
      serviceCharge: 0,
      discount: 200,
      total: 2026,
      paymentMethod: PaymentMethod.SSLCOMMERZ,
      paymentStatus: PaymentStatus.COMPLETED,
      status: OrderStatus.DELIVERED,
      createdAt: new Date(now - 120 * 60 * 60 * 1000), // 5 days ago
      items: [
        {
          menuItemId: kalaBhunaId,
          nameSnapshot: 'Chittagong Beef Kala Bhuna',
          quantity: 3,
          unitPrice: 480,
          lineTotal: 1440,
        },
        {
          menuItemId: roastId,
          nameSnapshot: 'Chicken Roast Polao Combo',
          quantity: 1,
          unitPrice: 380,
          lineTotal: 380,
        },
        {
          menuItemId: borhaniId,
          nameSnapshot: 'Royal Shahi Borhani',
          quantity: 3,
          unitPrice: 90,
          lineTotal: 270,
        },
      ],
    },
  ];

  for (const o of ordersToCreate) {
    const itemSummary = o.items.map((i) => `${i.nameSnapshot} x${i.quantity}`).join(', ');

    const createdOrder = await prisma.order.create({
      data: {
        customerName: o.customerName,
        phone: o.phone,
        email: o.email,
        fulfillmentType: o.fulfillmentType,
        itemSummary,
        address: o.address,
        notes: o.notes,
        subtotal: o.subtotal,
        deliveryFee: o.deliveryFee,
        vat: o.vat,
        serviceCharge: o.serviceCharge,
        discount: o.discount,
        total: o.total,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        status: o.status,
        createdAt: o.createdAt,
        items: {
          create: o.items.map((i) => ({
            menuItemId: i.menuItemId,
            nameSnapshot: i.nameSnapshot,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            lineTotal: i.lineTotal,
          })),
        },
      },
    });

    // Create payment record for completed / online orders
    if (o.paymentStatus === PaymentStatus.COMPLETED) {
      await prisma.payment.create({
        data: {
          orderId: createdOrder.id,
          provider:
            o.paymentMethod === PaymentMethod.BKASH
              ? PaymentProvider.BKASH
              : PaymentProvider.SSLCOMMERZ,
          method: o.paymentMethod,
          amount: o.total,
          currency: 'BDT',
          status: PaymentStatus.COMPLETED,
          providerTransactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          verifiedAt: o.createdAt,
          createdAt: o.createdAt,
        },
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 8. Customer Reviews & Ratings
  // ─────────────────────────────────────────────────────────────
  console.log('⭐ Seeding Customer Reviews & Ratings...');
  const reviewsData = [
    {
      menuItemId: kacchiId,
      rating: 5,
      comment:
        'মাংস এত নরম এবং তুলতুলে ছিল যে মুখে দিলেই মিলিয়ে যায়! বোরহানিটাও চমৎকার ছিল। ঢাকার অন্যতম সেরা কাচ্চি!',
      isApproved: true,
      userId: 'customer-rahim-01',
    },
    {
      menuItemId: kalaBhunaId,
      rating: 5,
      comment:
        'একদম খাঁটি চট্টগ্রামের কালা ভুনার স্বাদ। মশলার পারফেক্ট ব্লেন্ডিং এবং তেল একদম সঠিক পরিমাণে ছিল।',
      isApproved: true,
      userId: 'customer-fatima-01',
    },
    {
      menuItemId: ilishId,
      rating: 5,
      comment: 'ইলিশের খাঁটি তেল ও ঝাঁঝালো সরিষার দারুণ কম্বিনেশন। গরম ভাতের সাথে অমৃত লাগলো।',
      isApproved: true,
      userId: 'customer-tanvir-01',
    },
    {
      menuItemId: roastId,
      rating: 4,
      comment:
        'বিয়ে বাড়ির রোস্টের স্বাদ মনে করিয়ে দিল। গ্রেভিটা খুব রিচ ছিল। সাথে ফিরনিটা বেশ মিষ্টি।',
      isApproved: true,
      userId: 'customer-fatima-01',
    },
    {
      menuItemId: fuchkaId,
      rating: 5,
      comment:
        'অসাধারণ টক-মিষ্টি স্বাদ, প্রতি বাইটেই ক্রাঞ্চি ফিলিং! বিকেলে স্নাকস হিসেবে পারফেক্ট।',
      isApproved: true,
      userId: 'customer-rahim-01',
    },
    {
      menuItemId: kacchiId,
      rating: 4,
      comment: 'আলুটা আরও একটু নরম হলে আরও ভালো হতো, তবে মাংস ও চালের কোয়ালিটি দুর্দান্ত ছিল।',
      isApproved: false, // Moderation test
      userId: 'customer-tanvir-01',
    },
  ];

  for (const r of reviewsData) {
    if (!r.menuItemId) continue;
    await prisma.review.create({
      data: {
        menuItemId: r.menuItemId,
        rating: r.rating,
        comment: r.comment,
        isApproved: r.isApproved,
        userId: r.userId,
      },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 9. Table Reservations
  // ─────────────────────────────────────────────────────────────
  console.log('📅 Seeding Table Reservations...');
  const reservationsData = [
    {
      customerName: 'রহিম চৌধুরী (Rahim Chowdhury)',
      phone: '+8801819000001',
      email: 'rahim.chy@gmail.com',
      guests: 4,
      displayTime: 'আজ দুপুর ১:৩০ (Today 1:30 PM)',
      reservationTime: new Date(now + 2 * 60 * 60 * 1000), // today + 2h
      tableCode: 'T-02',
      status: ReservationStatus.APPROVED,
      occasion: 'Family Lunch',
      notes: 'বাচ্চাদের জন্য হাই-চেয়ারের ব্যবস্থা রাখবেন।',
      userId: 'customer-rahim-01',
    },
    {
      customerName: 'ডাঃ আমিনুল ইসলাম (Dr. Aminul Islam)',
      phone: '+8801722334455',
      email: 'aminul.dr@gmail.com',
      guests: 6,
      displayTime: 'আজ সন্ধ্যা ৭:৩০ (Today 7:30 PM)',
      reservationTime: new Date(now + 7 * 60 * 60 * 1000),
      tableCode: 'T-06',
      status: ReservationStatus.APPROVED,
      occasion: 'Birthday Dinner',
      notes: 'কেক কাটার ব্যবস্থা করবেন দয়া করে।',
      userId: null,
    },
    {
      customerName: 'নুসরাত জাহান (Nusrat Jahan)',
      phone: '+8801933445566',
      email: 'nusrat.j@gmail.com',
      guests: 2,
      displayTime: 'আজ রাত ৮:৪৫ (Today 8:45 PM)',
      reservationTime: new Date(now + 8 * 60 * 60 * 1000),
      tableCode: null,
      status: ReservationStatus.PENDING,
      occasion: 'Anniversary',
      notes: 'শান্ত কোনো কর্নার টেবিল প্রেফার করি।',
      userId: null,
    },
    {
      customerName: 'করপোরেট ডিনার টিম (Apex Group)',
      phone: '+8801644556677',
      email: 'corporate@apex.com',
      guests: 10,
      displayTime: 'আগামীকাল রাত ৮:০০ (Tomorrow 8:00 PM)',
      reservationTime: new Date(now + 32 * 60 * 60 * 1000),
      tableCode: 'T-08',
      status: ReservationStatus.APPROVED,
      occasion: 'Business Dinner',
      notes: 'প্রজেক্টর ও বড় টেবিল লাগবে।',
      userId: null,
    },
    {
      customerName: 'ফাতিমা বেগম (Fatima Begum)',
      phone: '+8801912000002',
      email: 'fatima.b@gmail.com',
      guests: 3,
      displayTime: 'গতকালের লাঞ্চ (Yesterday)',
      reservationTime: new Date(now - 24 * 60 * 60 * 1000),
      tableCode: 'T-04',
      status: ReservationStatus.APPROVED,
      occasion: 'Casual Meetup',
      notes: null,
      userId: 'customer-fatima-01',
    },
  ];

  for (const res of reservationsData) {
    await prisma.reservation.create({
      data: res,
    });
  }

  console.log('✅ All Demo Data has been successfully populated!');
}

if (require.main === module) {
  populateDemoData()
    .then(() => {
      console.log('🎉 Population complete!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Population error:', err);
      process.exit(1);
    });
}
