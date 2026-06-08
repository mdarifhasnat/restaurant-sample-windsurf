'use client';

import { useState } from 'react';

export default function AcceptOrderForm({ orderId }: { orderId: string }) {
  const [preparationMinutes, setPreparationMinutes] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/backend/orders/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, preparationMinutes }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Bestellung erfolgreich angenommen!' });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Fehler beim Annehmen der Bestellung' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Fehler beim Annehmen der Bestellung' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Zubereitungszeit
        </label>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[15, 30, 45, 60].map((minutes) => (
            <button
              key={minutes}
              type="button"
              onClick={() => setPreparationMinutes(minutes)}
              className={`px-3 py-2 text-sm border rounded-md hover:bg-gray-50 ${
                preparationMinutes === minutes ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300'
              }`}
            >
              {minutes} min
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setPreparationMinutes(Math.max(5, preparationMinutes - 5))}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            -
          </button>
          <input
            type="number"
            value={preparationMinutes}
            onChange={(e) => setPreparationMinutes(parseInt(e.target.value) || 5)}
            min="5"
            step="5"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-center"
          />
          <button
            type="button"
            onClick={() => setPreparationMinutes(preparationMinutes + 5)}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            +
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-md text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-medium disabled:opacity-50"
      >
        {isSubmitting ? 'Wird verarbeitet...' : 'Bestellung annehmen'}
      </button>
    </form>
  );
}
