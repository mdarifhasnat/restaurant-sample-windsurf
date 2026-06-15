'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, X, Volume2, VolumeX } from 'lucide-react';

interface NewOrderNotificationProps {
  // Optional: custom polling interval in milliseconds (default: 5000)
  pollingInterval?: number;
}

export default function NewOrderNotification({ pollingInterval = 5000 }: NewOrderNotificationProps) {
  const router = useRouter();
  const [newOrders, setNewOrders] = useState<any[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Load sound preference from localStorage
  useEffect(() => {
    const savedSoundPreference = localStorage.getItem('soundEnabled');
    if (savedSoundPreference === 'true') {
      setSoundEnabled(true);
    }
  }, []);

  // Toggle sound preference
  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('soundEnabled', newValue.toString());
    
    // Play test sound when enabling
    if (newValue) {
      playNotificationSound();
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    if (!soundEnabled) return;
    
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  // Poll for new orders
  useEffect(() => {
    const checkForNewOrders = async () => {
      try {
        const response = await fetch('/api/backend/orders/latest-pending');
        const data = await response.json();
        
        if (data.success && data.orders.length > 0) {
          // Get last seen order ID from localStorage
          const lastSeenOrderId = localStorage.getItem('lastSeenOrderId');
          const latestOrderId = data.orders[0].id;
          
          // Check if there's a new order
          if (!lastSeenOrderId || latestOrderId !== lastSeenOrderId) {
            // Update last seen order ID
            localStorage.setItem('lastSeenOrderId', latestOrderId);
            
            // If this is a genuinely new order (not just first load)
            if (lastSeenOrderId) {
              setNewOrders(data.orders);
              setShowNotification(true);
              playNotificationSound();
            }
          }
        }
      } catch (error) {
        console.error('Error checking for new orders:', error);
      }
    };

    // Initial check
    checkForNewOrders();

    // Set up polling
    const interval = setInterval(checkForNewOrders, pollingInterval);

    return () => clearInterval(interval);
  }, [pollingInterval, soundEnabled]);

  const handleViewOrder = (orderId: string) => {
    setShowNotification(false);
    router.push(`/backend/orders/${orderId}`);
  };

  const handleDismiss = () => {
    setShowNotification(false);
    setNewOrders([]);
  };

  if (!showNotification || newOrders.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-orange-500 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">Neue Bestellung eingegangen</span>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white hover:text-orange-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Details */}
        <div className="p-4 space-y-3">
          {newOrders.map((order) => (
            <div key={order.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">{order.orderNumber}</span>
                <span className="font-bold text-gray-900">
                  {new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(order.total)}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-3">
                {order.email} • {order.phone}
              </div>
              <button
                onClick={() => handleViewOrder(order.id)}
                className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                Bestellung ansehen
              </button>
            </div>
          ))}
        </div>

        {/* Sound Toggle */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <button
            onClick={toggleSound}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4" />
                Sound-Benachrichtigungen aktiviert
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                Sound-Benachrichtigungen aktivieren
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
