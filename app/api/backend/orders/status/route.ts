import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: 'Bestell-ID und Status sind erforderlich' },
        { status: 400 }
      );
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Ungültiger Status' },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Aktualisieren des Status' },
      { status: 500 }
    );
  }
}
