"use server";

import { prisma } from "@/lib/prisma";

// ============================================================================
// GET REPORT DATA
// ============================================================================

export async function getReportData({
  dateFrom,
  dateTo,
}: {
  dateFrom?: Date;
  dateTo?: Date;
} = {}) {
  try {
    const where: any = {};

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = dateFrom;
      }
      if (dateTo) {
        where.createdAt.lte = dateTo;
      }
    }

    // Fetch all orders with payments
    const orders = await prisma.order.findMany({
      where,
      include: {
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate summary metrics
    const allOrders = orders;
    const nonCancelledOrders = orders.filter(o => o.status !== 'CANCELLED');
    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');
    const cancelledOrders = orders.filter(o => o.status === 'CANCELLED');
    const deliveryOrders = orders.filter(o => o.orderType === 'DELIVERY');
    const pickupOrders = orders.filter(o => o.orderType === 'PICKUP');

    const totalRevenue = nonCancelledOrders.reduce((sum, order) => sum + Number(order.total), 0);
    const totalOrders = allOrders.length;
    const deliveredOrdersCount = deliveredOrders.length;
    const cancelledOrdersCount = cancelledOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / nonCancelledOrders.length : 0;
    const deliveryOrdersCount = deliveryOrders.length;
    const pickupOrdersCount = pickupOrders.length;
    const deliveryFeeTotal = nonCancelledOrders.reduce((sum, order) => sum + Number(order.deliveryFee), 0);

    // Payment summary
    const paymentSummary: Record<string, number> = {};
    orders.forEach(order => {
      order.payments.forEach(payment => {
        const method = payment.method;
        paymentSummary[method] = (paymentSummary[method] || 0) + Number(payment.amount);
      });
    });

    // Tax advisor data
    const cashTotal = paymentSummary['CASH'] || 0;
    const onlinePaymentTotal = Object.entries(paymentSummary)
      .filter(([method]) => method !== 'CASH')
      .reduce((sum, [, amount]) => sum + amount, 0);

    // Convert Decimal to Number for serialization
    const serializedOrders = orders.map(order => ({
      ...order,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      discountAmount: Number(order.discountAmount),
      total: Number(order.total),
      payments: order.payments.map(payment => ({
        ...payment,
        amount: Number(payment.amount),
      })),
    }));

    return {
      success: true,
      summary: {
        totalRevenue,
        totalOrders,
        deliveredOrdersCount,
        cancelledOrdersCount,
        averageOrderValue,
        deliveryOrdersCount,
        pickupOrdersCount,
        deliveryFeeTotal,
      },
      paymentSummary,
      taxAdvisor: {
        dateRange: {
          from: dateFrom,
          to: dateTo,
        },
        totalRevenue,
        totalOrders,
        cancelledOrdersCount,
        cashTotal,
        onlinePaymentTotal,
        deliveryFeeTotal,
      },
      orders: serializedOrders,
    };
  } catch (error) {
    console.error('Error fetching report data:', error);
    return {
      success: false,
      error: 'Fehler beim Laden der Berichtsdaten',
    };
  }
}
