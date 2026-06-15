import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import { formatSelectedOptions } from '@/lib/utils/options';

interface PageProps {
  params: Promise<{
    orderNumber: string;
  }>;
}

async function getOrder(orderNumber: string) {
  try {
    const order = await prisma.order.findUnique({
      where: {
        orderNumber,
      },
      include: {
        items: true,
      },
    });
    return order;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { orderNumber } = await params;

  if (!orderNumber) {
    notFound();
  }

  const order = await getOrder(orderNumber);
  

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar lang="de" />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Bestellung nicht gefunden</h1>
            <p className="text-gray-600 mb-6">
              Die Bestellung mit der Nummer {orderNumber} konnte nicht gefunden werden.
            </p>
            <a
              href="/restaurant"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Zurück zum Menü
            </a>
          </div>
        </main>
      </div>
    );
  }

  // Extract customer name from email (since we don't store firstName/lastName in Order)
  const customerName = order.email.split('@')[0];
  const capitalizedCustomerName = customerName.charAt(0).toUpperCase() + customerName.slice(1);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar lang="de" />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bestellung erfolgreich!</h1>
            <p className="text-gray-600">Vielen Dank für Ihre Bestellung</p>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            {/* Pre-order Info */}
            {order.isPreOrder && order.preOrderDateTime && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-amber-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-semibold text-amber-900">Vorbestellung</p>
                </div>
                <p className="text-sm text-amber-700">
                  Gewünschtes Liefer-/Abholzeit: {new Intl.DateTimeFormat('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(new Date(order.preOrderDateTime))}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Bestellnummer</p>
                <p className="text-lg font-semibold text-gray-900">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{order.isPreOrder ? 'Gewünschte Zeit' : 'Geschätzte Lieferzeit'}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {order.isPreOrder && order.preOrderDateTime
                    ? new Intl.DateTimeFormat('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(order.preOrderDateTime))
                    : '30-45 Minuten'}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-1">Kunde</p>
              <p className="text-lg font-semibold text-gray-900">{capitalizedCustomerName}</p>
              <p className="text-sm text-gray-600">{order.email}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bestellte Artikel</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.productNameDe || item.productName}</p>
                    <p className="text-sm text-gray-600">Menge: {item.quantity}</p>
                    {item.specialInstructions && formatSelectedOptions(item.specialInstructions) && (
                      <p className="text-xs text-gray-500 italic mt-1">📝 {formatSelectedOptions(item.specialInstructions)}</p>
                    )}
                    {item.specialInstructions && !formatSelectedOptions(item.specialInstructions) && (
                      <p className="text-xs text-gray-500 italic mt-1">📝 {item.specialInstructions}</p>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900">
                    {Number(item.productPrice).toFixed(2)}€
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-600">Zwischensumme</span>
              <span className="text-gray-900">{Number(order.subtotal).toFixed(2)}€</span>
            </div>
            {order.orderType === 'DELIVERY' && (
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-gray-600">Liefergebühr</span>
                <span className="text-gray-900">{Number(order.deliveryFee).toFixed(2)}€</span>
              </div>
            )}
            <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-gray-200">
              <span className="text-gray-900">Gesamt</span>
              <span className="text-gray-900">{Number(order.total).toFixed(2)}€</span>
            </div>
          </div>

          {/* Back to Menu Button */}
          <a
            href="/restaurant"
            className="block w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors text-center"
          >
            Zurück zum Menü
          </a>
        </div>
      </main>
    </div>
  );
}
