'use client';

import { useState } from 'react';
import DeliveryModal from './DeliveryModal';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  comments?: string;
}

interface BasketSidebarProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  deliveryFee: number;
  minimumOrder: number;
  onCheckout: (orderType: 'delivery' | 'pickup', address?: string) => void;
}

export default function BasketSidebar({
  items,
  onUpdateQuantity,
  onRemove,
  deliveryFee,
  minimumOrder,
  onCheckout,
}: BasketSidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + deliveryFee;
  const canCheckout = subtotal >= minimumOrder;

  const handleCheckoutClick = () => {
    setIsModalOpen(true);
  };

  const handleModalConfirm = (orderType: 'delivery' | 'pickup', address?: string) => {
    onCheckout(orderType, address);
  };

  return (
    <div className="sticky top-24 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden w-full">
      <div className="p-5 border-b border-gray-100 text-center">
        <h3 className="text-xl font-bold text-gray-900">Ihr Warenkorb</h3>
      </div>

      {items.length === 0 ? (
        <div className="p-8 text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="text-gray-500">Ihr Warenkorb ist leer</p>
        </div>
      ) : (
        <>
          <div className="p-5 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.price.toFixed(2)}€</p>
                    {item.comments && (
                      <p className="text-xs text-gray-500 mt-1 italic bg-gray-50 p-2 rounded">
                        📝 {item.comments}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors text-sm"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-2 text-gray-900 font-medium text-sm">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors text-sm"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => onRemove(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    aria-label="Remove item"
                  >
                    <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 border-t border-gray-100 bg-gray-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Zwischensumme</span>
                <span className="font-medium text-gray-900">{subtotal.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Liefergebühr</span>
                <span className="font-medium text-gray-900">{deliveryFee.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Gesamt</span>
                <span className="text-gray-900">{total.toFixed(2)}€</span>
              </div>
            </div>

            {!canCheckout && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  Mindestbestellwert: {minimumOrder.toFixed(2)}€
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Noch {(minimumOrder - subtotal).toFixed(2)}€ bis zum Mindestbestellwert
                </p>
              </div>
            )}

            <button
              disabled={!canCheckout}
              onClick={canCheckout ? handleCheckoutClick : undefined}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                canCheckout
                  ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {canCheckout ? 'Zur Kasse' : `Noch ${(minimumOrder - subtotal).toFixed(2)}€ fehlen`}
            </button>
          </div>
        </>
      )}

      <div className="p-5 border-t border-gray-100">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <svg className="w-5 h-5 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Lieferzeit: 30-45 Min</span>
        </div>
      </div>

      <DeliveryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
}
