'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { deliveryAddressSchema, DeliveryAddressFormData } from '@/lib/validations/checkout';

interface DeliveryAddressFormProps {
  onSubmit: (data: DeliveryAddressFormData) => void;
  defaultValues?: Partial<DeliveryAddressFormData>;
}

export default function DeliveryAddressForm({
  onSubmit,
  defaultValues,
}: DeliveryAddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DeliveryAddressFormData>({
    resolver: zodResolver(deliveryAddressSchema),
    defaultValues: {
      street: defaultValues?.street || '',
      houseNumber: defaultValues?.houseNumber || '',
      postalCode: defaultValues?.postalCode || '',
      city: defaultValues?.city || '',
      deliveryInstructions: defaultValues?.deliveryInstructions || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Lieferadresse
      </h2>

      {/* Street and House Number */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="sm:col-span-3">
          <label
            htmlFor="street"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Straße *
          </label>
          <input
            id="street"
            type="text"
            {...register('street')}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.street
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-gray-900'
            } focus:outline-none focus:ring-2 transition-colors`}
            placeholder="Hauptstraße"
            aria-invalid={errors.street ? 'true' : 'false'}
            aria-describedby={errors.street ? 'street-error' : undefined}
          />
          {errors.street && (
            <p
              id="street-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors.street.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="houseNumber"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nr. *
          </label>
          <input
            id="houseNumber"
            type="text"
            {...register('houseNumber')}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.houseNumber
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-gray-900'
            } focus:outline-none focus:ring-2 transition-colors`}
            placeholder="123"
            aria-invalid={errors.houseNumber ? 'true' : 'false'}
            aria-describedby={errors.houseNumber ? 'houseNumber-error' : undefined}
          />
          {errors.houseNumber && (
            <p
              id="houseNumber-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors.houseNumber.message}
            </p>
          )}
        </div>
      </div>

      {/* Postal Code and City */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <label
            htmlFor="postalCode"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            PLZ *
          </label>
          <input
            id="postalCode"
            type="text"
            {...register('postalCode')}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.postalCode
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-gray-900'
            } focus:outline-none focus:ring-2 transition-colors`}
            placeholder="12345"
            aria-invalid={errors.postalCode ? 'true' : 'false'}
            aria-describedby={errors.postalCode ? 'postalCode-error' : undefined}
          />
          {errors.postalCode && (
            <p
              id="postalCode-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors.postalCode.message}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Stadt *
          </label>
          <input
            id="city"
            type="text"
            {...register('city')}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.city
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-gray-900'
            } focus:outline-none focus:ring-2 transition-colors`}
            placeholder="Berlin"
            aria-invalid={errors.city ? 'true' : 'false'}
            aria-describedby={errors.city ? 'city-error' : undefined}
          />
          {errors.city && (
            <p id="city-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.city.message}
            </p>
          )}
        </div>
      </div>

      {/* Delivery Instructions */}
      <div>
        <label
          htmlFor="deliveryInstructions"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Lieferhinweise (optional)
        </label>
        <textarea
          id="deliveryInstructions"
          {...register('deliveryInstructions')}
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-colors resize-none"
          placeholder="z.B. Klingel ist defekt, bitte anrufen"
          aria-describedby="deliveryInstructions-hint"
        />
        <p
          id="deliveryInstructions-hint"
          className="mt-1 text-sm text-gray-500"
        >
          Maximal 200 Zeichen
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gray-900 text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Wird verarbeitet...' : 'Weiter'}
      </button>
    </form>
  );
}
