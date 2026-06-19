import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ============================================================================
// GET /api/backend/orders/pending
// Get latest pending orders for notification system
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lastSeenOrderId = searchParams.get('lastSeenOrderId');
    const lastSeenTimestamp = searchParams.get('lastSeenTimestamp');

    // Get all pending orders
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        items: true,
      },
      take: 10, // Limit to last 10 pending orders
    });

    // Filter for new orders based on last seen data
    let newOrders = pendingOrders;
    
    if (lastSeenOrderId) {
      newOrders = pendingOrders.filter(order => order.id > lastSeenOrderId);
    } else if (lastSeenTimestamp) {
      const timestamp = new Date(lastSeenTimestamp);
      newOrders = pendingOrders.filter(order => new Date(order.createdAt) > timestamp);
    }

    // Get total pending count
    const pendingCount = await prisma.order.count({
      where: {
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      pendingOrders: newOrders,
      pendingCount,
      latestOrderId: pendingOrders[0]?.id || null,
      latestTimestamp: pendingOrders[0]?.createdAt || null,
    });
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Abrufen der ausstehenden Bestellungen',
      },
      { status: 500 }
    );
  }
}
