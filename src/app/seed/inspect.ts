import { prisma } from '@/config/prisma.config';

async function main() {
  const users = await prisma.user.findMany({
    include: { accounts: true },
  });
  console.log('--- USERS ---');
  for (const u of users) {
    console.log(u.id, u.name, u.email, u.role, 'accounts:', u.accounts.length);
  }

  const categoryCount = await prisma.category.count();
  const menuCount = await prisma.menuItem.count();
  const orderCount = await prisma.order.count();
  const reservationCount = await prisma.reservation.count();
  const couponCount = await prisma.coupon.count();
  const inventoryCount = await prisma.inventoryItem.count();
  const reviewCount = await prisma.review.count();

  console.log({
    categoryCount,
    menuCount,
    orderCount,
    reservationCount,
    couponCount,
    inventoryCount,
    reviewCount,
  });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
