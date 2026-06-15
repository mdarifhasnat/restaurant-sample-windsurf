import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get latest PENDING orders
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Convert Decimal to Number for serialization
    const serializedOrders = pendingOrders.map(order => ({
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

    return NextResponse.json({
      success: true,
      orders: serializedOrders,
    });
  } catch (error) {
    console.error('Error fetching latest pending orders:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Laden der Bestellungen',
      },
      { status: 500 }
    );
  }
}
