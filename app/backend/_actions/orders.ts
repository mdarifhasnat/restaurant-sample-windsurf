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

    return {
      success: true,
      orders,
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
        items: true,
        payments: true,
      },
    });

    if (!order) {
      return {
        success: false,
        error: 'Bestellung nicht gefunden',
      };
    }

    return {
      success: true,
      order,
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

    const order = await prisma.order.update({
      where: { id: validated.orderId },
      data: { status: validated.status },
      include: {
        items: true,
        payments: true,
      },
    });

    revalidatePath('/backend/orders');
    revalidatePath('/backend');

    return {
      success: true,
      order,
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
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: today },
          status: { not: 'CANCELLED' },
        },
        _sum: { total: true },
      }),
      prisma.order.count({
        where: { status: 'PENDING' },
      }),
      prisma.product.count({
        where: { isActive: true },
      }),
      prisma.category.count({
        where: { isActive: true },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
        },
      }),
    ]);

    return {
      success: true,
      stats: {
        totalOrdersToday,
        revenueToday: revenueToday._sum.total || 0,
        pendingOrdersCount,
        totalProducts,
        totalCategories,
        recentOrders,
      },
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      success: false,
      error: 'Fehler beim Laden der Statistiken',
    };
  }
}
