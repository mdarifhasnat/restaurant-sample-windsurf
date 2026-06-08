import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, preparationMinutes } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Bestell-ID ist erforderlich' },
        { status: 400 }
      );
    }

    const preparationTime = preparationMinutes ? parseInt(preparationMinutes) : 30;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        estimatedPreparationMinutes: preparationTime,
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error accepting order:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Annehmen der Bestellung' },
      { status: 500 }
    );
  }
}
