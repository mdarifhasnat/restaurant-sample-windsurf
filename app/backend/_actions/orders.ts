'use server';

import { prisma } from '@/lib/prisma';
import { UpdateOrderStatusSchema, UpdateOrderStatusInput } from '@/lib/validations/admin';
import { OrderStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// ============================================================================
// GET ORDERS
// ============================================================================

export async function getOrders({
  status,
  search,
  limit = 50,
  offset = 0,
}: {
  status?: OrderStatus;
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.order.count({ where });

    // Convert Decimal to Number for serialization
    const serializedOrders = orders.map(order => ({
      ...order,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      discountAmount: Number(order.discountAmount),
      total: Number(order.total),
      items: order.items.map(item => ({
        ...item,
        productPrice: Number(item.productPrice),
      })),
      payments: order.payments.map(payment => ({
        ...payment,
        amount: Number(payment.amount),
      })),
    }));

    return {
      success: true,
      orders: serializedOrders,
      total,
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return {
      success: false,
      error: 'Fehler beim Laden der Bestellungen',
    };
  }
}

// ============================================================================
// GET ORDER BY ID
// ============================================================================

export async function getOrderById(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });

    if (!order) {
      return {
        success: false,
        error: 'Bestellung nicht gefunden',
      };
    }

    // Convert Decimal to Number for serialization
    const serializedOrder = {
      ...order,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      discountAmount: Number(order.discountAmount),
      total: Number(order.total),
      items: order.items.map(item => ({
        ...item,
        productPrice: Number(item.productPrice),
      })),
      payments: order.payments.map(payment => ({
        ...payment,
        amount: Number(payment.amount),
      })),
    };

    return {
      success: true,
      order: serializedOrder,
    };
  } catch (error) {
    console.error('Error fetching order:', error);
    return {
      success: false,
      error: 'Fehler beim Laden der Bestellung',
    };
  }
}

// ============================================================================
// UPDATE ORDER STATUS
// ============================================================================

export async function updateOrderStatus(input: UpdateOrderStatusInput) {
  try {
    const validated = UpdateOrderStatusSchema.parse(input);

    const updateData: any = { status: validated.status };
    
    // Set deliveredAt when status is DELIVERED
    if (validated.status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    const order = await prisma.order.update({
      where: { id: validated.orderId },
      data: updateData,
      include: {
        items: true,
        payments: true,
      },
    });

    revalidatePath('/backend/orders');
    revalidatePath('/backend');

    // Convert Decimal to Number for serialization
    const serializedOrder = {
      ...order,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      discountAmount: Number(order.discountAmount),
      total: Number(order.total),
      items: order.items.map(item => ({
        ...item,
        productPrice: Number(item.productPrice),
      })),
      payments: order.payments.map(payment => ({
        ...payment,
        amount: Number(payment.amount),
      })),
    };

    return {
      success: true,
      order: serializedOrder,
    };
  } catch (error) {
    console.error('Error updating order status:', error);
    return {
      success: false,
      error: 'Fehler beim Aktualisieren des Bestellstatus',
    };
  }
}

// ============================================================================
// GET DASHBOARD STATS
// ============================================================================

export async function getDashboardStats() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('Fetching dashboard stats for date:', today);

    const [
      totalOrdersToday,
      revenueToday,
      pendingOrdersCount,
      totalProducts,
      totalCategories,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: { gte: today },
        },
      }).catch((error) => {
        console.error('Error fetching total orders today:', error);
        return 0;
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: today },
          status: { not: 'CANCELLED' },
        },
        _sum: { total: true },
      }).catch((error) => {
        console.error('Error fetching revenue today:', error);
        return { _sum: { total: null } };
      }),
      prisma.order.count({
        where: { status: 'PENDING' },
      }).catch((error) => {
        console.error('Error fetching pending orders count:', error);
        return 0;
      }),
      prisma.product.count({
        where: { isActive: true },
      }).catch((error) => {
        console.error('Error fetching total products:', error);
        return 0;
      }),
      prisma.category.count({
        where: { isActive: true },
      }).catch((error) => {
        console.error('Error fetching total categories:', error);
        return 0;
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
        },
      }).catch((error) => {
        console.error('Error fetching recent orders:', error);
        return [];
      }),
    ]);

    console.log('Dashboard stats fetched:', {
      totalOrdersToday,
      revenueToday: revenueToday._sum.total,
      pendingOrdersCount,
      totalProducts,
      totalCategories,
      recentOrdersCount: recentOrders.length,
    });

    // Convert Decimal to Number for recentOrders
    const serializedRecentOrders = recentOrders.map(order => ({
      ...order,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      discountAmount: Number(order.discountAmount),
      total: Number(order.total),
      items: order.items.map(item => ({
        ...item,
        productPrice: Number(item.productPrice),
      })),
    }));

    return {
      success: true,
      stats: {
        totalOrdersToday,
        revenueToday: revenueToday._sum.total ? Number(revenueToday._sum.total) : 0,
        pendingOrdersCount,
        totalProducts,
        totalCategories,
        recentOrders: serializedRecentOrders,
      },
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return {
      success: false,
      error: 'Fehler beim Laden der Statistiken',
    };
  }
}
