'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CheckoutOptionSelector from '@/components/checkout/CheckoutOptionSelector';
import CustomerInfoForm from '@/components/checkout/CustomerInfoForm';
import DeliveryAddressForm from '@/components/checkout/DeliveryAddressForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import { CheckoutOption, CheckoutStep, CustomerInfo, DeliveryAddress, CustomerType, OrderSummary as OrderSummaryType } from '@/types/checkout';
import { CustomerInfoFormData, DeliveryAddressFormData } from '@/lib/validations/checkout';
import { useCart } from '@/contexts/CartContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { items: cartItems, clearCart, subtotal } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('options');
  const [selectedOption, setSelectedOption] = useState<CheckoutOption | null>(null);
  const [customerType, setCustomerType] = useState<CustomerType>('guest');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deliveryFee = orderType === 'delivery' ? 2.90 : 0;
  const total = subtotal + deliveryFee;

  const orderSummary: OrderSummaryType = {
    items: cartItems.map(item => ({
      id: item.menuItemId,
      dishId: item.menuItemId,
      name: item.name,
      description: item.comments || '',
      price: item.price,
      quantity: item.quantity,
    })),
    subtotal,
    deliveryFee,
    total,
  };

  const handleOptionSelect = (option: CheckoutOption) => {
    setSelectedOption(option);
    
    if (option === 'guest') {
      setCustomerType('guest');
      setCurrentStep('customer-info');
    } else if (option === 'login') {
      setCustomerType('registered');
      // TODO: Implement login flow
      setCurrentStep('customer-info');
    } else if (option === 'register') {
      setCustomerType('registered');
      // TODO: Implement registration flow
      setCurrentStep('customer-info');
    }
  };

  const handleCustomerInfoSubmit = (data: CustomerInfoFormData) => {
    setCustomerInfo(data);
    // Skip delivery address step if pickup is selected
    if (orderType === 'pickup') {
      setCurrentStep('payment');
    } else {
      setCurrentStep('delivery-address');
    }
  };

  const handleDeliveryAddressSubmit = (data: DeliveryAddressFormData) => {
    setDeliveryAddress(data);
    setCurrentStep('payment');
  };

  const handleBack = () => {
    if (currentStep === 'delivery-address') {
      setCurrentStep('customer-info');
    } else if (currentStep === 'payment') {
      // If pickup, go back to customer-info, otherwise go to delivery-address
      if (orderType === 'pickup') {
        setCurrentStep('customer-info');
      } else {
        setCurrentStep('delivery-address');
      }
    }
  };

  const handleSubmitOrder = async () => {
    if (!customerInfo) {
      setError('Kundeninformationen fehlen');
      return;
    }

    if (cartItems.length === 0) {
      setError('Warenkorb ist leer');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare request body matching Zod validation
      const requestBody = {
        customerType: customerType === 'guest' ? 'GUEST' : 'REGISTERED',
        customerId: null, // TODO: Add customerId for registered users when auth is implemented
        customerFirstName: customerInfo.firstName,
        customerLastName: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone,
        orderType: orderType === 'delivery' ? 'DELIVERY' : 'PICKUP',
        deliveryAddress: orderType === 'delivery' && deliveryAddress ? {
          street: deliveryAddress.street,
          houseNumber: deliveryAddress.houseNumber,
          postalCode: deliveryAddress.postalCode,
          city: deliveryAddress.city,
          deliveryInstructions: deliveryAddress.deliveryInstructions,
        } : undefined,
        orderNotes: orderNotes,
        items: cartItems.map(item => ({
          productId: item.menuItemId,
          quantity: item.quantity,
          selectedOptions: undefined, // TODO: Add selectedOptions when customization is implemented
          specialInstructions: item.comments,
        })),
        paymentMethod: paymentMethod,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Fehler beim Erstellen der Bestellung');
      }

      // Clear cart on success
      clearCart();

      // Redirect to order confirmation page
      router.push(`/order-confirmation/${data.orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen der Bestellung');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar lang="de" />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Kasse</h1>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'options' || currentStep === 'customer-info' || currentStep === 'delivery-address' || currentStep === 'payment'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Option wählen</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-200">
              <div className={`h-full transition-all ${
                currentStep === 'customer-info' || currentStep === 'delivery-address' || currentStep === 'payment'
                  ? 'bg-gray-900 w-1/3'
                  : 'w-0'
              }`} />
            </div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'customer-info' || currentStep === 'delivery-address' || currentStep === 'payment'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Kundeninfo</span>
            </div>
            {orderType === 'delivery' && (
              <>
                <div className="flex-1 h-1 mx-4 bg-gray-200">
                  <div className={`h-full transition-all ${
                    currentStep === 'delivery-address' || currentStep === 'payment'
                      ? 'bg-gray-900 w-2/3'
                      : 'w-0'
                  }`} />
                </div>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === 'delivery-address' || currentStep === 'payment'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    3
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-900">Lieferadresse</span>
                </div>
              </>
            )}
            <div className="flex-1 h-1 mx-4 bg-gray-200">
              <div className={`h-full transition-all ${
                currentStep === 'payment'
                  ? 'bg-gray-900 w-full'
                  : 'w-0'
              }`} />
            </div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'payment'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {orderType === 'delivery' ? 4 : 3}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Zahlung</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2">
            {currentStep === 'options' && (
              <CheckoutOptionSelector
                selectedOption={selectedOption}
                onSelectOption={handleOptionSelect}
              />
            )}

            {currentStep === 'customer-info' && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <button
                  onClick={() => setCurrentStep('options')}
                  className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M15 19l-7-7 7-7" />
                  </svg>
                  Zurück
                </button>
                
                {/* Order Type Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bestellart wählen</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setOrderType('delivery')}
                      className={`p-4 border-2 rounded-xl transition-all text-left ${
                        orderType === 'delivery'
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <span className="font-semibold">Lieferung</span>
                      </div>
                      <p className="text-sm opacity-90">Wir liefern direkt zu Ihnen nach Hause</p>
                    </button>
                    <button
                      onClick={() => setOrderType('pickup')}
                      className={`p-4 border-2 rounded-xl transition-all text-left ${
                        orderType === 'pickup'
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-semibold">Abholung</span>
                      </div>
                      <p className="text-sm opacity-90">Holen Sie Ihre Bestellung bei uns ab</p>
                    </button>
                  </div>
                </div>

                <CustomerInfoForm
                  onSubmit={handleCustomerInfoSubmit}
                  defaultValues={customerInfo || undefined}
                />
              </div>
            )}

            {currentStep === 'delivery-address' && orderType === 'delivery' && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <button
                  onClick={handleBack}
                  className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M15 19l-7-7 7-7" />
                  </svg>
                  Zurück
                </button>
                <DeliveryAddressForm
                  onSubmit={handleDeliveryAddressSubmit}
                  defaultValues={deliveryAddress || undefined}
                />
              </div>
            )}

            {currentStep === 'payment' && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <button
                  onClick={handleBack}
                  className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M15 19l-7-7 7-7" />
                  </svg>
                  Zurück
                </button>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Zahlung</h2>
                
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
                
                {/* Payment Method Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Zahlungsart wählen</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setPaymentMethod('CASH')}
                      className={`p-4 border-2 rounded-xl transition-all text-left ${
                        paymentMethod === 'CASH'
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="font-semibold">Barzahlung</span>
                      </div>
                      <p className="text-sm opacity-90">Bezahlen bei Lieferung oder Abholung</p>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('CARD')}
                      className={`p-4 border-2 rounded-xl transition-all text-left ${
                        paymentMethod === 'CARD'
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span className="font-semibold">Karte</span>
                      </div>
                      <p className="text-sm opacity-90">Kreditkarte (Demnächst verfügbar)</p>
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-lg text-center">
                  <button
                    className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Wird verarbeitet...' : 'Bestellung abschließen'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary orderSummary={orderSummary} />
          </div>
        </div>
      </main>
    </div>
  );
}
