'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface DeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (type: 'delivery' | 'pickup', address?: string) => void;
}

export default function DeliveryModal({ isOpen, onClose, onConfirm }: DeliveryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [orderType, setOrderType] = useState<'delivery' | 'pickup' | null>(null);
  const [address, setAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const businessAddress = 'Dohrerstr. 4, 41238 Mönchengladbach';

  const handleAddressSubmit = async () => {
    if (!address.trim()) {
      setAddressError('Bitte geben Sie eine Adresse ein');
      return;
    }

    setIsValidating(true);
    setAddressError('');

    try {
      // Calculate distance from business address
      const isWithinRange = await validateDistance(address);
      
      if (isWithinRange) {
        onConfirm('delivery', address);
        handleClose();
      } else {
        setAddressError('Die Adresse liegt außerhalb unseres Lieferbereichs (max. 10km)');
      }
    } catch (error) {
      setAddressError('Fehler bei der Adressvalidierung. Bitte versuchen Sie es erneut.');
    } finally {
      setIsValidating(false);
    }
  };

  const validateDistance = async (userAddress: string): Promise<boolean> => {
    // Basic validation: Check if address is in the same postal code area (41238)
    // In production, use a geocoding API like Google Maps API or OpenStreetMap Nominatim
    // to get coordinates and calculate the actual distance using the Haversine formula
    
    const businessPostalCode = '41238';
    const addressLower = userAddress.toLowerCase();
    
    // Check if the address contains the business postal code
    if (addressLower.includes(businessPostalCode)) {
      return true;
    }
    
    // Check if it's in nearby postal codes (Mönchengladbach area)
    const nearbyPostalCodes = ['41236', '41237', '41238', '41239', '41061', '41062', '41063', '41065', '41066', '41067', '41068', '41069'];
    const hasNearbyPostalCode = nearbyPostalCodes.some(code => addressLower.includes(code));
    
    if (hasNearbyPostalCode) {
      return true;
    }
    
    // If no matching postal code found, assume it's outside the delivery range
    return false;
  };

  const handlePickupConfirm = () => {
    onConfirm('pickup');
    handleClose();
  };

  const handleClose = () => {
    setOrderType(null);
    setAddress('');
    setAddressError('');
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Bestellart wählen</h2>

        {!orderType ? (
          <div className="space-y-4">
            <button
              onClick={() => setOrderType('delivery')}
              className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Lieferung</h3>
                  <p className="text-sm text-gray-600">Wir liefern direkt zu Ihnen nach Hause</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setOrderType('pickup')}
              className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Abholung</h3>
                  <p className="text-sm text-gray-600">Holen Sie Ihre Bestellung bei uns ab</p>
                </div>
              </div>
            </button>

            <button
              onClick={handleClose}
              className="w-full py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Abbrechen
            </button>
          </div>
        ) : orderType === 'delivery' ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Lieferadresse
              </label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Straße, Hausnummer, PLZ, Stadt"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                disabled={isValidating}
              />
              {addressError && (
                <p className="text-sm text-red-600 mt-2">{addressError}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Lieferbereich: max. 10km von {businessAddress}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isValidating}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Zurück
              </button>
              <button
                onClick={handleAddressSubmit}
                disabled={isValidating || !address.trim()}
                className="flex-1 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidating ? 'Prüfe...' : 'Weiter'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Abholadresse:</strong><br />
                {businessAddress}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Bitte kommen Sie zur Abholung vorbei. Ihre Bestellung wird ca. 15-20 Minuten nach Bestelleingang fertig sein.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setOrderType(null)}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Zurück
              </button>
              <button
                onClick={handlePickupConfirm}
                className="flex-1 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Bestätigen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
