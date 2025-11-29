import { useState, useEffect, useCallback } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  const updateNetworkStatus = useCallback(() => {
    const online = navigator.onLine;
    setIsOnline(online);
    if (!online) {
      setWasOffline(true);
    } else if (wasOffline) {
      // Reset wasOffline after a short delay to allow sync to complete
      const timer = setTimeout(() => {
        setWasOffline(false);
      }, 5000); // 5 seconds to complete sync
      return () => clearTimeout(timer);
    }
  }, [wasOffline]);

  useEffect(() => {
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, [updateNetworkStatus]);

  return { isOnline, wasOffline };
}
