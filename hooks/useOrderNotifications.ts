'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface PendingOrder {
  id: string;
  orderNumber: string;
  total: number;
  orderType: string;
  createdAt: string;
}

interface PendingOrdersResponse {
  success: boolean;
  pendingOrders: PendingOrder[];
  pendingCount: number;
  latestOrderId: string | null;
  latestTimestamp: string | null;
}

export function useOrderNotifications(enabled: boolean = true) {
  const [newOrders, setNewOrders] = useState<PendingOrder[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const soundIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load sound enabled state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('soundNotificationsEnabled');
    if (saved === 'true') {
      setSoundEnabled(true);
    }
  }, []);

  // Load muted state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('soundNotificationsMuted');
    if (saved === 'true') {
      setIsMuted(true);
    }
  }, []);

  // Save sound enabled state to localStorage
  const toggleSoundEnabled = useCallback(() => {
    setSoundEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('soundNotificationsEnabled', String(newValue));
      return newValue;
    });
  }, []);

  // Save muted state to localStorage
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newValue = !prev;
      localStorage.setItem('soundNotificationsMuted', String(newValue));
      return newValue;
    });
  }, []);

  // Play notification sound
  const playSound = useCallback(() => {
    if (!soundEnabled || isMuted) return;

    // Create a simple beep sound using Web Audio API
    try {
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
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, [soundEnabled, isMuted]);

  // Stop repeating sound
  const stopRepeatingSound = useCallback(() => {
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current);
      soundIntervalRef.current = null;
    }
  }, []);

  // Start repeating sound for new orders
  const startRepeatingSound = useCallback(() => {
    stopRepeatingSound();
    playSound();
    soundIntervalRef.current = setInterval(() => {
      playSound();
    }, 5000); // Repeat every 5 seconds
  }, [playSound, stopRepeatingSound]);

  // Check for new orders
  const checkForNewOrders = useCallback(async () => {
    try {
      const lastSeenOrderId = localStorage.getItem('lastSeenOrderId');
      const lastSeenTimestamp = localStorage.getItem('lastSeenTimestamp');
      
      const params = new URLSearchParams();
      if (lastSeenOrderId) params.append('lastSeenOrderId', lastSeenOrderId);
      if (lastSeenTimestamp) params.append('lastSeenTimestamp', lastSeenTimestamp);

      const response = await fetch(`/api/backend/orders/pending?${params.toString()}`);
      const data: PendingOrdersResponse = await response.json();

      if (data.success) {
        setPendingCount(data.pendingCount);

        // If there are new orders
        if (data.pendingOrders.length > 0) {
          setNewOrders(data.pendingOrders);
          
          // Update last seen order
          if (data.latestOrderId) {
            localStorage.setItem('lastSeenOrderId', data.latestOrderId);
          }
          if (data.latestTimestamp) {
            localStorage.setItem('lastSeenTimestamp', data.latestTimestamp);
          }

          // Start repeating sound
          startRepeatingSound();
        }
      }
    } catch (error) {
      console.error('Error checking for new orders:', error);
    }
  }, [startRepeatingSound]);

  // Dismiss notification (stops sound and removes from list)
  const dismissNotification = useCallback((orderId: string) => {
    setNewOrders(prev => prev.filter(order => order.id !== orderId));
    stopRepeatingSound();
  }, [stopRepeatingSound]);

  // Dismiss all notifications
  const dismissAllNotifications = useCallback(() => {
    setNewOrders([]);
    stopRepeatingSound();
  }, [stopRepeatingSound]);

  // Start polling
  useEffect(() => {
    if (!enabled) return;

    // Initial check
    checkForNewOrders();

    // Set up polling interval (every 5 seconds)
    pollingIntervalRef.current = setInterval(() => {
      checkForNewOrders();
    }, 5000);

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      stopRepeatingSound();
    };
  }, [enabled, checkForNewOrders, stopRepeatingSound]);

  return {
    newOrders,
    pendingCount,
    soundEnabled,
    isMuted,
    toggleSoundEnabled,
    toggleMute,
    dismissNotification,
    dismissAllNotifications,
  };
}
