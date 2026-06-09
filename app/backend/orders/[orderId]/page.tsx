import { getOrderById } from '../../_actions/orders';
import { ArrowLeft, Clock, MapPin, Phone, Mail, Package, Check, X } from 'lucide-react';
import Link from 'next/link';
import AcceptOrderForm from './AcceptOrderForm';
import StatusUpdateForm from './StatusUpdateForm';
import { notFound } from 'next/navigation';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  if (!orderId) {
    notFound();
  }

  const result = await getOrderById(orderId);

  if (!result.success || !result.order) {
    notFound();
  }

  const order = result.order;

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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PREPARING: 'bg-purple-100 text-purple-800',
      READY: 'bg-green-100 text-green-800',
      DELIVERED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Ausstehend',
      CONFIRMED: 'Bestätigt',
      PREPARING: 'In Zubereitung',
      READY: 'Bereit',
      DELIVERED: 'Geliefert',
      CANCELLED: 'Storniert',
    };
    return labels[status] || status;
  };

  const getOrderTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      DELIVERY: 'Lieferung',
      PICKUP: 'Abholung',
    };
    return labels[type] || type;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/backend/orders"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zu Bestellungen
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Bestellung #{order.orderNumber}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Bestellstatus</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Bestellnummer:</span>
                <p className="font-medium">{order.orderNumber}</p>
              </div>
              <div>
                <span className="text-gray-500">Bestelltyp:</span>
                <p className="font-medium">{getOrderTypeLabel(order.orderType)}</p>
              </div>
              <div>
                <span className="text-gray-500">Erstellt am:</span>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
              {order.confirmedAt && (
                <div>
                  <span className="text-gray-500">Bestätigt am:</span>
                  <p className="font-medium">{formatDate(order.confirmedAt)}</p>
                </div>
              )}
              {order.estimatedPreparationMinutes && (
                <div>
                  <span className="text-gray-500">Geschätzte Zubereitungszeit:</span>
                  <p className="font-medium">{order.estimatedPreparationMinutes} Minuten</p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Kundeninformationen</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-600">{order.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-600">{order.phone}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          {order.orderType === 'DELIVERY' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Lieferadresse</h2>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="text-gray-900 font-medium">
                    {order.deliveryStreet} {order.deliveryHouseNumber}
                  </p>
                  <p className="text-gray-600">
                    {order.deliveryPostalCode} {order.deliveryCity}
                  </p>
                  {order.deliveryInstructions && (
                    <p className="text-gray-500 text-sm mt-2">
                      Hinweis: {order.deliveryInstructions}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bestellte Artikel</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start justify-between pb-4 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-start">
                      <Package className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        {item.productDescription && (
                          <p className="text-sm text-gray-500 mt-1">{item.productDescription}</p>
                        )}
                        {item.specialInstructions && (
                          <p className="text-sm text-gray-500 mt-1">
                            Sonderwünsche: {item.specialInstructions}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(Number(item.productPrice))} × {item.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(Number(item.productPrice) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Notes */}
          {order.orderNotes && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Bestellnotizen</h2>
              <p className="text-gray-600">{order.orderNotes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Zusammenfassung</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Zwischensumme</span>
                <span className="font-medium">{formatCurrency(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Liefergebühr</span>
                <span className="font-medium">{formatCurrency(Number(order.deliveryFee))}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rabatt</span>
                  <span className="font-medium text-green-600">
                    -{formatCurrency(Number(order.discountAmount))}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Gesamt</span>
                <span className="font-bold text-gray-900 text-lg">
                  {formatCurrency(Number(order.total))}
                </span>
              </div>
            </div>
          </div>

          {/* Accept Order Section - Only show if PENDING */}
          {order.status === 'PENDING' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Bestellung annehmen</h2>
              <AcceptOrderForm orderId={order.id} />
            </div>
          )}

          {/* Status Update */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status ändern</h2>
            <StatusUpdateForm orderId={order.id} currentStatus={order.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
