'use client';

import { CheckoutOption } from '@/types/checkout';

interface CheckoutOptionSelectorProps {
  selectedOption: CheckoutOption | null;
  onSelectOption: (option: CheckoutOption) => void;
}

export default function CheckoutOptionSelector({
  selectedOption,
  onSelectOption,
}: CheckoutOptionSelectorProps) {
  const options = [
    {
      id: 'guest' as CheckoutOption,
      title: 'Als Gast fortfahren',
      description: 'Bestellen Sie ohne Kontoerstellung. Schnell und einfach.',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'login' as CheckoutOption,
      title: 'Anmelden',
      description: 'Melden Sie sich mit Ihrem vorhandenen Konto an.',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
      ),
    },
    {
      id: 'register' as CheckoutOption,
      title: 'Konto erstellen',
      description: 'Erstellen Sie ein Konto für zukünftige Bestellungen.',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Wie möchten Sie fortfahren?
      </h2>
      <div className="grid gap-4">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelectOption(option.id)}
            className={`relative flex items-start p-6 rounded-xl border-2 transition-all ${
              selectedOption === option.id
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            aria-pressed={selectedOption === option.id}
          >
            <div className="flex-shrink-0 mr-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedOption === option.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {option.icon}
              </div>
            </div>
            <div className="text-left flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {option.title}
              </h3>
              <p className="text-gray-600 text-sm">{option.description}</p>
            </div>
            {selectedOption === option.id && (
              <div className="absolute top-6 right-6">
                <svg
                  className="w-6 h-6 text-gray-900"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
