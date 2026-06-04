'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/hooks/useCart';

export default function CartPage() {
  const { items, subtotal, total, clearCart, removeItem, increaseQuantity, decreaseQuantity } = useCart();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar lang="de" onLanguageChange={() => {}} />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Warenkorb</h1>
        
        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 mb-4">Ihr Warenkorb ist leer</p>
            <a href="/restaurant" className="text-gray-900 hover:underline">
              Zur Speisekarte
            </a>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      {item.specialInstructions && (
                        <p className="text-sm text-gray-500 mt-1">{item.specialInstructions}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{(item.price * item.quantity).toFixed(2)}€</p>
                      <p className="text-sm text-gray-500">{item.price.toFixed(2)}€ pro Stück</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-3 text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => increaseQuantity(item.id)}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Entfernen
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Warenkorb leeren
              </button>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Zusammenfassung</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Zwischensumme</span>
                    <span>{subtotal.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Liefergebühr</span>
                    <span>2.90€</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t">
                    <span>Gesamt</span>
                    <span>{(total + 2.90).toFixed(2)}€</span>
                  </div>
                </div>
                <a
                  href="/checkout"
                  className="block w-full bg-gray-900 text-white text-center py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Zur Kasse
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
