'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import CheckoutOptionSelector from '@/components/checkout/CheckoutOptionSelector';
import CustomerInfoForm from '@/components/checkout/CustomerInfoForm';
import DeliveryAddressForm from '@/components/checkout/DeliveryAddressForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import { CheckoutOption, CheckoutStep, CustomerInfo, DeliveryAddress, CustomerType, OrderSummary as OrderSummaryType } from '@/types/checkout';
import { CustomerInfoFormData, DeliveryAddressFormData } from '@/lib/validations/checkout';

// Mock cart data - replace with actual cart hook
const mockCartItems = [
  {
    id: '1',
    name: 'Schnitzel mit Pommes',
    description: 'Klassisches Wiener Schnitzel mit knusprigen Pommes',
    price: 12.50,
    quantity: 2,
  },
  {
    id: '2',
    name: 'Käsespätzle',
    description: 'Schwäbische Spezialität mit Käse und Zwiebeln',
    price: 9.90,
    quantity: 1,
  },
];

const mockOrderSummary: OrderSummaryType = {
  items: mockCartItems,
  subtotal: 34.90,
  deliveryFee: 2.90,
  total: 37.80,
};

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('options');
  const [selectedOption, setSelectedOption] = useState<CheckoutOption | null>(null);
  const [customerType, setCustomerType] = useState<CustomerType>('guest');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);
  const [orderNotes, setOrderNotes] = useState<string>('');

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
    setCurrentStep('delivery-address');
  };

  const handleDeliveryAddressSubmit = (data: DeliveryAddressFormData) => {
    setDeliveryAddress(data);
    setCurrentStep('payment');
  };

  const handleBack = () => {
    if (currentStep === 'delivery-address') {
      setCurrentStep('customer-info');
    } else if (currentStep === 'payment') {
      setCurrentStep('delivery-address');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar lang="de" onLanguageChange={() => {}} />
      
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
                4
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
                <CustomerInfoForm
                  onSubmit={handleCustomerInfoSubmit}
                  defaultValues={customerInfo || undefined}
                />
              </div>
            )}

            {currentStep === 'delivery-address' && (
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
                <div className="p-6 bg-gray-50 rounded-lg text-center">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400 mb-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <p className="text-gray-600 mb-4">Zahlungsoptionen werden in Kürze verfügbar sein</p>
                  <button
                    className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    onClick={() => {
                      console.log('Order submitted:', {
                        customerType,
                        customerInfo,
                        deliveryAddress,
                        orderNotes,
                        orderSummary: mockOrderSummary,
                      });
                      alert('Bestellung erfolgreich! (Demo)');
                    }}
                  >
                    Bestellung abschließen (Demo)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary orderSummary={mockOrderSummary} />
          </div>
        </div>
      </main>
    </div>
  );
}
