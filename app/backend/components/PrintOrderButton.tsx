'use client';

import { Printer } from 'lucide-react';

export default function PrintOrderButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
    >
      <Printer className="w-5 h-5" />
      Küchenbon drucken
    </button>
  );
}
