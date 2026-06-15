import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const status = searchParams.get('status');
    const paymentMethod = searchParams.get('paymentMethod');
    const orderType = searchParams.get('orderType');

    // Build where clause
    const where: any = {};

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    if (status) {
      where.status = status;
    }

    if (orderType) {
      where.orderType = orderType;
    }

    // Fetch orders with payments
    const orders = await prisma.order.findMany({
      where,
      include: {
        payments: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter by payment method if specified
    let filteredOrders = orders;
    if (paymentMethod) {
      filteredOrders = orders.filter(order =>
        order.payments.some(payment => payment.method === paymentMethod)
      );
    }

    // Calculate summary metrics
    const nonCancelledOrders = filteredOrders.filter(o => o.status !== 'CANCELLED');
    const deliveryOrders = filteredOrders.filter(o => o.orderType === 'DELIVERY');
    const pickupOrders = filteredOrders.filter(o => o.orderType === 'PICKUP');
    const cancelledOrders = filteredOrders.filter(o => o.status === 'CANCELLED');

    const totalRevenue = nonCancelledOrders.reduce((sum, order) => sum + Number(order.total), 0);
    const totalOrders = filteredOrders.length;
    const deliveryFeeTotal = nonCancelledOrders.reduce((sum, order) => sum + Number(order.deliveryFee), 0);
    const discountTotal = nonCancelledOrders.reduce((sum, order) => sum + Number(order.discountAmount), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Payment summary
    const paymentSummary: Record<string, number> = {};
    filteredOrders.forEach(order => {
      order.payments.forEach(payment => {
        const method = payment.method;
        paymentSummary[method] = (paymentSummary[method] || 0) + Number(payment.amount);
      });
    });

    // Group orders by date for daily overview
    const dailyData: Record<string, {
      totalOrders: number;
      deliveryOrders: number;
      pickupOrders: number;
      cancelledOrders: number;
      totalRevenue: number;
      deliveryFees: number;
      discounts: number;
      averageOrderValue: number;
    }> = {};

    filteredOrders.forEach(order => {
      const dateKey = formatDateOnly(order.createdAt);
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          totalOrders: 0,
          deliveryOrders: 0,
          pickupOrders: 0,
          cancelledOrders: 0,
          totalRevenue: 0,
          deliveryFees: 0,
          discounts: 0,
          averageOrderValue: 0,
        };
      }

      dailyData[dateKey].totalOrders++;
      if (order.orderType === 'DELIVERY') dailyData[dateKey].deliveryOrders++;
      if (order.orderType === 'PICKUP') dailyData[dateKey].pickupOrders++;
      if (order.status === 'CANCELLED') dailyData[dateKey].cancelledOrders++;

      if (order.status !== 'CANCELLED') {
        dailyData[dateKey].totalRevenue += Number(order.total);
        dailyData[dateKey].deliveryFees += Number(order.deliveryFee);
        dailyData[dateKey].discounts += Number(order.discountAmount);
      }
    });

    // Calculate average order value per day
    Object.keys(dailyData).forEach(date => {
      const data = dailyData[date];
      const nonCancelledCount = data.totalOrders - data.cancelledOrders;
      data.averageOrderValue = nonCancelledCount > 0 ? data.totalRevenue / nonCancelledCount : 0;
    });

    // Web vs App orders (placeholder for app channel)
    const webOrders = filteredOrders.length; // All orders are web for now
    const appOrders = 0; // Placeholder

    // Generate PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    const pdfPromise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    // Helper function for formatting
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
      }).format(amount);
    };

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(date));
    };

    const formatDateOnly = (date: Date) => {
      return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(date));
    };

    // 1. Header
    doc.fontSize(24).font('Helvetica-Bold').text('Speisenreise', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text('Bericht', { align: 'center' });
    doc.moveDown();

    // Filter info
    doc.fontSize(10).font('Helvetica');
    if (dateFrom || dateTo) {
      const dateRange = `${dateFrom ? formatDateOnly(new Date(dateFrom)) : 'Alle'} - ${dateTo ? formatDateOnly(new Date(dateTo)) : 'Alle'}`;
      doc.text(`Zeitraum: ${dateRange}`);
    }
    if (status) {
      doc.text(`Status: ${status}`);
    }
    if (paymentMethod) {
      doc.text(`Zahlungsmethode: ${paymentMethod}`);
    }
    if (orderType) {
      doc.text(`Bestelltyp: ${orderType === 'DELIVERY' ? 'Lieferung' : 'Abholung'}`);
    }
    doc.moveDown();

    // Separator
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // 2. Einkommen summary
    doc.fontSize(14).font('Helvetica-Bold').text('Einkommen Zusammenfassung');
    doc.moveDown();
    doc.fontSize(10).font('Helvetica');
    doc.text(`Gesamtbestellungen: ${totalOrders}`);
    doc.text(`Gesamtumsatz: ${formatCurrency(totalRevenue)}`);
    doc.text(`Lieferbestellungen: ${deliveryOrders.length}`);
    doc.text(`Abholbestellungen: ${pickupOrders.length}`);
    doc.text(`Stornierte Bestellungen: ${cancelledOrders.length}`);
    doc.text(`Durchschnittlicher Bestellwert: ${formatCurrency(averageOrderValue)}`);
    doc.moveDown();

    // 3. Einkommen nach Zahlungsmethode
    doc.fontSize(14).font('Helvetica-Bold').text('Einkommen nach Zahlungsmethode');
    doc.moveDown();
    doc.fontSize(10).font('Helvetica');
    const paymentMethods = ['CASH', 'CARD', 'STRIPE', 'PAYPAL', 'SOFORT', 'GIROPAY', 'INVOICE'];
    paymentMethods.forEach(method => {
      const amount = paymentSummary[method] || 0;
      doc.text(`${method}: ${formatCurrency(amount)}`);
    });
    doc.moveDown();

    // 4. Einkommen nach Steuern
    doc.fontSize(14).font('Helvetica-Bold').text('Einkommen nach Steuern');
    doc.moveDown();
    doc.fontSize(10).font('Helvetica');
    doc.text(`Gesamtumsatz: ${formatCurrency(totalRevenue)}`);
    doc.text(`Liefergebühr gesamt: ${formatCurrency(deliveryFeeTotal)}`);
    doc.text('MwSt.: Berechnung erfordert MwSt.-Satz pro Produkt/Bestellposition');
    doc.moveDown();

    // 5. Lieferung Zusammenfassung
    doc.fontSize(14).font('Helvetica-Bold').text('Lieferung Zusammenfassung');
    doc.moveDown();
    doc.fontSize(10).font('Helvetica');
    doc.text(`Lieferbestellungen: ${deliveryOrders.length}`);
    doc.text(`Abholbestellungen: ${pickupOrders.length}`);
    doc.text(`Lieferung gesamt: ${formatCurrency(deliveryFeeTotal)}`);
    doc.moveDown();

    // 6. Tagesübersicht (Daily Overview)
    doc.fontSize(14).font('Helvetica-Bold').text('Tagesübersicht');
    doc.moveDown();

    // Daily overview table headers
    const dailyTableTop = doc.y;
    const dailyHeaders = [
      'Datum',
      'Bestellungen',
      'Lieferung',
      'Abholung',
      'Storniert',
      'Umsatz',
      'Liefergebühr',
      'Rabatt',
      'Ø Bestellwert',
    ];
    const dailyColWidths = [60, 50, 40, 40, 40, 55, 55, 45, 60];
    let dailyXPos = 50;

    doc.fontSize(8).font('Helvetica-Bold');
    dailyHeaders.forEach((header, i) => {
      doc.text(header, dailyXPos, dailyTableTop, { width: dailyColWidths[i] });
      dailyXPos += dailyColWidths[i];
    });

    doc.moveTo(50, dailyTableTop + 15).lineTo(545, dailyTableTop + 15).stroke();
    let dailyYPos = dailyTableTop + 20;

    // Daily overview table rows
    doc.fontSize(8).font('Helvetica');
    const sortedDates = Object.keys(dailyData).sort();
    sortedDates.forEach(date => {
      const data = dailyData[date];
      const dailyRow = [
        date,
        data.totalOrders.toString(),
        data.deliveryOrders.toString(),
        data.pickupOrders.toString(),
        data.cancelledOrders.toString(),
        formatCurrency(data.totalRevenue),
        formatCurrency(data.deliveryFees),
        formatCurrency(data.discounts),
        formatCurrency(data.averageOrderValue),
      ];

      dailyXPos = 50;
      dailyRow.forEach((cell, i) => {
        doc.text(cell, dailyXPos, dailyYPos, { width: dailyColWidths[i] });
        dailyXPos += dailyColWidths[i];
      });

      dailyYPos += 15;

      // Add new page if needed
      if (dailyYPos > 750) {
        doc.addPage();
        dailyYPos = 50;
      }
    });

    doc.moveDown();

    // 7. Bestellungen table
    doc.fontSize(14).font('Helvetica-Bold').text('Bestellungen');
    doc.moveDown();

    // Table headers
    const tableTop = doc.y;
    const headers = [
      'Bestellnr.',
      'Kunde',
      'Zahlung',
      'Datum',
      'Typ',
      'Rabatt',
      'Zwischensumme',
      'Liefergebühr',
      'Gesamt',
      'Status',
    ];
    const colWidths = [60, 80, 50, 70, 40, 40, 50, 50, 50, 50];
    let xPos = 50;

    doc.fontSize(8).font('Helvetica-Bold');
    headers.forEach((header, i) => {
      doc.text(header, xPos, tableTop, { width: colWidths[i] });
      xPos += colWidths[i];
    });

    doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();
    let yPos = tableTop + 20;

    // Table rows
    doc.fontSize(8).font('Helvetica');
    filteredOrders.forEach(order => {
      const customerName = order.user
        ? `${order.user.firstName} ${order.user.lastName}`
        : order.email;
      const paymentMethod = order.payments.length > 0 ? order.payments[0].method : '-';
      const orderTypeLabel = order.orderType === 'DELIVERY' ? 'Lieferung' : 'Abholung';

      const row = [
        order.orderNumber || '-',
        customerName,
        paymentMethod,
        formatDate(order.createdAt),
        orderTypeLabel,
        formatCurrency(Number(order.discountAmount)),
        formatCurrency(Number(order.subtotal)),
        formatCurrency(Number(order.deliveryFee)),
        formatCurrency(Number(order.total)),
        order.status,
      ];

      xPos = 50;
      row.forEach((cell, i) => {
        doc.text(cell, xPos, yPos, { width: colWidths[i] });
        xPos += colWidths[i];
      });

      yPos += 15;

      // Add new page if needed
      if (yPos > 750) {
        doc.addPage();
        yPos = 50;
      }
    });

    doc.end();

    const pdfBuffer = await pdfPromise;

    // Generate filename
    const dateFromStr = dateFrom ? dateFrom : 'alle';
    const dateToStr = dateTo ? dateTo : 'alle';
    const filename = `speisenreise-report-${dateFromStr}-to-${dateToStr}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Generieren des PDFs' },
      { status: 500 }
    );
  }
}
