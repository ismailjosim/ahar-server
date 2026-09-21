import { FulfillmentType, PaymentMethod, PaymentStatus } from '@generated/prisma/enums';
import type { OrderItemUncheckedCreateWithoutOrderInput } from '@generated/prisma/models/OrderItem';

import { prisma } from '@/config/prisma.config';
import AppError from '@/helpers/AppError';
import { InventoryService } from '@/modules/inventory/inventory.service';
import { calculatePagination } from '@/utils/paginationHelper';
import { EmailService } from '@/utils/sendEmail';
import StatusCode from '@/utils/statusCode';

import { CreateOrderPayload, OrderRecord } from './orders.interface';
import { fromDbOrderStatus, fromDbPaymentStatus, toDbOrderStatus } from './orders.utils';

const capitalize = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const toClient = (order: OrderRecord | null) => {
  if (!order) return null;
  return {
    id: order.id,
    customer: order.customerName,
    phone: order.phone,
    email: order.email,
    fulfillmentType: order.fulfillmentType,
    // `items` stays a summary string for backward-compatible list/table views.
    items: order.itemSummary,
    itemSummary: order.itemSummary,
    // `lineItems` carries the structured breakdown for the tracking page.
    lineItems: (order.items ?? []).map((item) => ({
      name: item.nameSnapshot,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      variant: item.selectedVariant ?? null,
      addOns: item.selectedAddOns ?? null,
    })),
    address: order.address,
    notes: order.notes,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    vat: order.vat,
    serviceCharge: order.serviceCharge,
    discount: order.discount,
    total: order.total,
    method: order.paymentMethod,
    paymentMethod: order.paymentMethod,
    paymentStatus: fromDbPaymentStatus(order.paymentStatus),
    status: fromDbOrderStatus(order.status),
    type: capitalize(order.fulfillmentType),
    createdAt: order.createdAt,
  };
};

const getOrders = async (query: Record<string, unknown>) => {
  const { page, limit, skip } = calculatePagination({
    page: Number(query.page || 1),
    limit: Number(query.limit || query.pageSize || 10),
  });
  const search = typeof query.search === 'string' ? query.search : undefined;
  const status =
    typeof query.status === 'string' && query.status ? toDbOrderStatus(query.status) : undefined;

  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { id: { contains: search, mode: 'insensitive' as const } },
        {
          customerName: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
        {
          itemSummary: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    }),
    prisma.order.count({ where }),
  ]);

  return { data: data.map(toClient), total, page, limit };
};

const getOrderById = async (id: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) throw new AppError(StatusCode.NOT_FOUND, 'Order not found');
  return toClient(order);
};

const createOrder = async (payload: CreateOrderPayload) => {
  const settings = await prisma.restaurantSettings.findFirst({
    where: { id: 'default' },
  });
  const vatRate = settings ? settings.vatRate / 100 : 0.05;
  const serviceChargeRate = settings ? settings.serviceChargeRate / 100 : 0.1;

  const jsonInput = (value: unknown) =>
    value as OrderItemUncheckedCreateWithoutOrderInput['selectedVariant'];

  // Validate and price each item from the DB — client prices are never trusted.
  const items: OrderItemUncheckedCreateWithoutOrderInput[] = await Promise.all(
    payload.items.map(async (item) => {
      if (!item.menuItemId) {
        // Custom items without a menuItemId fall back to the client price.
        return {
          menuItemId: null,
          nameSnapshot: item.nameSnapshot,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          selectedVariant: jsonInput(item.selectedVariant ?? undefined),
          selectedAddOns: jsonInput(item.selectedAddOns ?? undefined),
          lineTotal: item.unitPrice * item.quantity,
        };
      }

      const dbItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
      });
      if (!dbItem || !dbItem.isAvailable) {
        throw new AppError(StatusCode.BAD_REQUEST, `Item "${item.nameSnapshot}" is not available.`);
      }

      const unitPrice = dbItem.price;
      const lineTotal = unitPrice * item.quantity;
      return {
        menuItemId: item.menuItemId,
        nameSnapshot: dbItem.name,
        quantity: item.quantity,
        unitPrice,
        selectedVariant: jsonInput(item.selectedVariant ?? undefined),
        selectedAddOns: jsonInput(item.selectedAddOns ?? undefined),
        lineTotal,
      };
    }),
  );

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);

  // Validate and apply the coupon, if one was supplied.
  let discount = 0;
  if (payload.couponCode) {
    const coupon = await prisma.coupon.findFirst({
      where: { code: payload.couponCode, isActive: true },
    });
    if (coupon) {
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        throw new AppError(StatusCode.BAD_REQUEST, 'This coupon has expired.');
      }
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        throw new AppError(StatusCode.BAD_REQUEST, 'Coupon usage limit reached.');
      }
      if (subtotal < coupon.minOrderValue) {
        throw new AppError(
          StatusCode.BAD_REQUEST,
          `Minimum order for this coupon is ৳${coupon.minOrderValue}.`,
        );
      }
      discount =
        coupon.discountType === 'percent'
          ? subtotal * (coupon.discountValue / 100)
          : coupon.discountValue;
      discount = Math.min(discount, subtotal);
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }
  }

  let deliveryFee = 0;
  if (payload.fulfillmentType === 'delivery') {
    const fee = settings?.deliveryFee ?? 80;
    const freeMin = settings?.freeDeliveryMin ?? 0;
    const isFree = freeMin > 0 && subtotal >= freeMin;
    deliveryFee = isFree ? 0 : fee;
  }

  const taxable = subtotal - discount;
  const vat = taxable * vatRate;
  const serviceCharge = taxable * serviceChargeRate;
  const total = taxable + vat + serviceCharge + deliveryFee;

  const itemSummary = items.map((i) => `${i.nameSnapshot} x${i.quantity}`).join(', ');

  const order = await prisma.order.create({
    data: {
      customerName: payload.customerName,
      phone: payload.phone,
      email: payload.email,
      fulfillmentType: payload.fulfillmentType.toUpperCase() as FulfillmentType,
      itemSummary,
      address: payload.address,
      notes: payload.notes,
      subtotal,
      deliveryFee,
      vat,
      serviceCharge,
      discount,
      total,
      paymentMethod: payload.paymentMethod.toUpperCase() as PaymentMethod,
      userId: payload.userId ?? null,
      items: { create: items },
    },
    include: { items: true },
  });

  // For COD, payment is tracked directly on Order (paymentStatus: PENDING until Delivered)

  // Send order confirmation email
  if (order.email) {
    EmailService.sendOrderConfirmation({
      customerName: order.customerName,
      email: order.email,
      id: order.id,
      items: order.items.map((i) => ({
        name: i.nameSnapshot,
        quantity: i.quantity,
        lineTotal: i.lineTotal,
      })),
      total: order.total,
      fulfillmentType: order.fulfillmentType,
      paymentMethod: order.paymentMethod,
    }).catch((err) => console.error('[Email] Order confirmation failed:', err));
  }

  return toClient(order);
};

const VALID_TRANSITIONS: Record<string, string[]> = {
  Placed: ['Accepted', 'Cancelled'],
  Accepted: ['Preparing', 'Cancelled'],
  Preparing: ['Ready'],
  Ready: ['Out for Delivery', 'Delivered'],
  'Out for Delivery': ['Delivered'],
  Delivered: [],
  Cancelled: [],
};

const updateOrderStatus = async (id: string, status: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) throw new AppError(StatusCode.NOT_FOUND, 'Order not found');

  const current = fromDbOrderStatus(order.status);
  const allowed = VALID_TRANSITIONS[current] ?? [];
  if (!allowed.includes(status)) {
    throw new AppError(
      StatusCode.BAD_REQUEST,
      `Cannot transition from "${current}" to "${status}".`,
    );
  }

  const updateData: Record<string, unknown> = {
    status: toDbOrderStatus(status),
  };

  // When transitioning to "Delivered", deduct inventory and update payment
  if (status === 'Delivered') {
    // Deduct inventory from order items
    const orderItems = (order.items ?? []).map((item) => ({
      nameSnapshot: item.nameSnapshot,
      quantity: item.quantity,
    }));
    await InventoryService.adjustStockForOrder(orderItems);

    // Mark COD payment as completed
    await prisma.payment.updateMany({
      where: {
        orderId: id,
        method: PaymentMethod.COD,
        status: PaymentStatus.PENDING,
      },
      data: { status: PaymentStatus.COMPLETED },
    });

    // Update order's payment status to completed
    updateData.paymentStatus = PaymentStatus.COMPLETED;
  }

  const updated = await prisma.order.update({
    where: { id },
    data: updateData,
    include: { items: true },
  });

  // Send status update email for key statuses
  const NOTIFY_STATUSES = ['Accepted', 'Out for Delivery', 'Delivered', 'Cancelled'];
  if (NOTIFY_STATUSES.includes(status) && updated.email) {
    EmailService.sendOrderStatusUpdate({
      customerName: updated.customerName,
      email: updated.email,
      id: updated.id,
      status,
    }).catch((err) => console.error('[Email] Status update failed:', err));
  }

  return toClient(updated);
};

const getOrdersByUser = async (userId: string, query: Record<string, unknown>) => {
  const { page, limit, skip } = calculatePagination({
    page: Number(query.page || 1),
    limit: Number(query.limit || query.pageSize || 5),
  });

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { items: true },
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return { data: data.map(toClient), total, page, limit };
};

export const OrdersService = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getOrdersByUser,
};
