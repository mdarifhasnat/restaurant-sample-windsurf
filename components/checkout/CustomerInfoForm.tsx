'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerInfoSchema, CustomerInfoFormData } from '@/lib/validations/checkout';

interface CustomerInfoFormProps {
  onSubmit: (data: CustomerInfoFormData) => void;
  defaultValues?: Partial<CustomerInfoFormData>;
}

export default function CustomerInfoForm({
  onSubmit,
  defaultValues,
}: CustomerInfoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerInfoFormData>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: {
      firstName: defaultValues?.firstName || '',
      lastName: defaultValues?.lastName || '',
      email: defaultValues?.email || '',
      phone: defaultValues?.phone || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Kundeninformationen
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* First Name */}
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Vorname *
          </label>
          <input
            id="firstName"
            type="text"
            {...register('firstName')}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.firstName
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-gray-900'
            } focus:outline-none focus:ring-2 transition-colors`}
            placeholder="Max"
            aria-invalid={errors.firstName ? 'true' : 'false'}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
          />
          {errors.firstName && (
            <p
              id="firstName-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors.firstName.message}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nachname *
          </label>
          <input
            id="lastName"
            type="text"
            {...register('lastName')}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.lastName
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-gray-900'
            } focus:outline-none focus:ring-2 transition-colors`}
            placeholder="Mustermann"
            aria-invalid={errors.lastName ? 'true' : 'false'}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
          />
          {errors.lastName && (
            <p
              id="lastName-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          E-Mail *
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.email
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-gray-900'
          } focus:outline-none focus:ring-2 transition-colors`}
          placeholder="max.mustermann@example.com"
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Telefon *
        </label>
        <input
          id="phone"
          type="tel"
          {...register('phone')}
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.phone
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-gray-900'
          } focus:outline-none focus:ring-2 transition-colors`}
          placeholder="+49 123 4567890"
          aria-invalid={errors.phone ? 'true' : 'false'}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
        />
        {errors.phone && (
          <p id="phone-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.phone.message}
          </p>
        )}
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
