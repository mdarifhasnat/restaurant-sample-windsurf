import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOrderNumber } from '@/lib/order-number';
import { CreateOrderSchema, CreateOrderInput } from '@/lib/validations/order';
import { CustomerType, OrderType, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// ============================================================================
// POST /api/orders
// Create a new order
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = CreateOrderSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validierungsfehler',
          errors: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const data: CreateOrderInput = validationResult.data;

    // Extract payment method from request body (optional for now)
    const paymentMethod = (body.paymentMethod as PaymentMethod) || PaymentMethod.CASH;

    // Fetch products from database
    const productIds = data.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
        isAvailable: true,
      },
    });

    // Check if all products exist and are available
    if (products.length !== productIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: 'Einige Produkte sind nicht verfügbar oder existieren nicht',
        },
        { status: 400 }
      );
    }

    // Create product map for easy lookup
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Calculate subtotal (never trust frontend price)
    let subtotal = 0;
    const orderItemsData = data.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error(`Produkt nicht gefunden: ${item.productId}`);
      }

      const itemPrice = Number(product.price);
      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;

      return {
        productId: item.productId,
        productName: product.nameDe,
        productNameDe: product.nameDe,
        productDescription: product.descriptionDe,
        productDescriptionDe: product.descriptionDe,
        productPrice: new Decimal(product.price),
        quantity: item.quantity,
        specialInstructions: item.specialInstructions,
      };
    });

    // Calculate delivery fee
    const deliveryFee = data.orderType === 'DELIVERY' ? 2.90 : 0;

    // Calculate total
    const total = subtotal + deliveryFee;

    // Generate unique order number
    const orderNumber = generateOrderNumber();

    // Create order with order items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerType: data.customerType as CustomerType,
          customerId: data.customerId,
          email: data.email,
          phone: data.phone,
          orderType: data.orderType as OrderType,
          status: OrderStatus.PENDING,
          deliveryStreet: data.deliveryAddress?.street || 'N/A',
          deliveryHouseNumber: data.deliveryAddress?.houseNumber || 'N/A',
          deliveryPostalCode: data.deliveryAddress?.postalCode || 'N/A',
          deliveryCity: data.deliveryAddress?.city || 'N/A',
          deliveryInstructions: data.deliveryAddress?.deliveryInstructions,
          subtotal: new Decimal(subtotal),
          deliveryFee: new Decimal(deliveryFee),
          discountAmount: new Decimal(0),
          total: new Decimal(total),
          orderNotes: data.orderNotes,
        },
      });

      // Create order items
      const orderItems = await Promise.all(
        orderItemsData.map((itemData) =>
          tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: itemData.productId,
              productName: itemData.productName,
              productNameDe: itemData.productNameDe,
              productDescription: itemData.productDescription,
              productDescriptionDe: itemData.productDescriptionDe,
              productPrice: itemData.productPrice,
              quantity: itemData.quantity,
              specialInstructions: itemData.specialInstructions,
            },
          })
        )
      );

      return { order: newOrder, orderItems };
    });

    // Create payment record (outside transaction to avoid blocking order creation)
    try {
      await prisma.payment.create({
        data: {
          orderId: order.order.id,
          userId: data.customerId || undefined,
          method: paymentMethod,
          status: PaymentStatus.PENDING,
          amount: order.order.total,
          currency: 'EUR',
        },
      });
    } catch (paymentError) {
      // Log payment error but don't fail the order
      console.error('Error creating payment record:', paymentError);
    }

    // Return success response
    return NextResponse.json({
      success: true,
      orderId: order.order.id,
      orderNumber: orderNumber,
      total: Number(order.order.total),
    });
  } catch (error) {
    console.error('Error creating order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Fehler beim Erstellen der Bestellung';
    return NextResponse.json(
      {
        success: false,
        message: process.env.NODE_ENV === 'development' ? errorMessage : 'Fehler beim Erstellen der Bestellung',
      },
      { status: 500 }
    );
  }
}
