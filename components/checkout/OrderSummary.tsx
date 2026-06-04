'use client';

import { OrderSummary as OrderSummaryType } from '@/types/checkout';

interface OrderSummaryProps {
  orderSummary: OrderSummaryType;
}

export default function OrderSummary({ orderSummary }: OrderSummaryProps) {
  const { items, subtotal, deliveryFee, total } = orderSummary;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Bestellübersicht</h2>

      {/* Items */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-start space-x-4">
            {item.image && (
              <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{item.name}</h3>
              {item.description && (
                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">Menge: {item.quantity}</span>
                <span className="font-medium text-gray-900">
                  {(item.price * item.quantity).toFixed(2)} €
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-6" />

      {/* Summary */}
      <div className="space-y-3">
        <div className="flex justify-between text-gray-600">
          <span>Zwischensumme</span>
          <span>{subtotal.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Liefergebühr</span>
          <span>{deliveryFee.toFixed(2)} €</span>
        </div>
        <div className="border-t border-gray-200 my-3" />
        <div className="flex justify-between text-lg font-bold text-gray-900">
          <span>Gesamt</span>
          <span>{total.toFixed(2)} €</span>
        </div>
      </div>

      {/* VAT Note */}
      <p className="text-xs text-gray-500 mt-4">
        Alle Preise inklusive MwSt.
      </p>
    </div>
  );
}
