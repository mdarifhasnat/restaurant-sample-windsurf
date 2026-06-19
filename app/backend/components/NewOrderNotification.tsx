'use client';

import { useRouter } from 'next/navigation';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import OrderNotificationCard from '@/components/backend/OrderNotificationCard';

interface NewOrderNotificationProps {
  // Optional: custom polling interval in milliseconds (default: 5000)
  pollingInterval?: number;
}

export default function NewOrderNotification({ pollingInterval = 5000 }: NewOrderNotificationProps) {
  const router = useRouter();
  const {
    newOrders,
    pendingCount,
    soundEnabled,
    isMuted,
    toggleSoundEnabled,
    toggleMute,
    dismissNotification,
    dismissAllNotifications,
  } = useOrderNotifications(true);

  const handleViewOrder = (orderId: string) => {
    dismissNotification(orderId);
    router.push(`/backend/orders/${orderId}`);
  };

  return (
    <>
      {/* Notification Cards */}
      {newOrders.map((order) => (
        <OrderNotificationCard
          key={order.id}
          order={order}
          onDismiss={() => dismissNotification(order.id)}
          onMute={toggleMute}
          isMuted={isMuted}
        />
      ))}

      {/* Sound Activation Button (fixed at bottom right) */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={toggleSoundEnabled}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-colors ${
            soundEnabled
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
          title={soundEnabled ? 'Sound-Benachrichtigungen deaktivieren' : 'Sound-Benachrichtigungen aktivieren'}
        >
          {soundEnabled ? (
            <>
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              <span className="hidden sm:inline">Sound aktiviert</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              <span className="hidden sm:inline">Sound aktivieren</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
