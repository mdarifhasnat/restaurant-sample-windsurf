'use client';

import { Bell, X, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';

interface PendingOrder {
  id: string;
  orderNumber: string;
  total: number;
  orderType: string;
  createdAt: string;
}

interface OrderNotificationCardProps {
  order: PendingOrder;
  onDismiss: () => void;
  onMute: () => void;
  isMuted: boolean;
}

export default function OrderNotificationCard({ order, onDismiss, onMute, isMuted }: OrderNotificationCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getOrderTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      DELIVERY: 'Lieferung',
      PICKUP: 'Abholung',
    };
    return labels[type] || type;
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-96 bg-white rounded-lg shadow-2xl border-2 border-blue-500 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="bg-blue-500 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 animate-pulse" />
          <span className="font-semibold">Neue Bestellung eingegangen</span>
        </div>
        <button
          onClick={onDismiss}
          className="text-white hover:bg-blue-600 rounded p-1 transition-colors"
          aria-label="Schließen"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Bestellnummer</p>
              <p className="text-lg font-bold text-gray-900">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Gesamt</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(Number(order.total))}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {getOrderTypeLabel(order.orderType)}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(order.createdAt).toLocaleTimeString('de-DE')}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Link
            href={`/backend/orders/${order.id}`}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors text-center"
            onClick={onDismiss}
          >
            Bestellung ansehen
          </Link>
          <button
            onClick={onMute}
            className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            title={isMuted ? 'Ton aktivieren' : 'Ton stummschalten'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-gray-600" /> : <Volume2 className="w-5 h-5 text-gray-600" />}
          </button>
        </div>
      </div>
    </div>
  );
}
