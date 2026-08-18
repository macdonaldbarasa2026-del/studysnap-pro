import React, { useEffect } from 'react';
import { Wifi, WifiOff, Battery, BatteryLow } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Connectivity status monitor.
 * Provides high-level status monitoring 
 */

export const NativeBridge: React.FC = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [showStatus, setShowStatus] = React.useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-none flex items-center gap-3 font-black text-xs uppercase tracking-widest shadow-2xl border ${
            isOnline ? 'bg-black text-app-accent border-app-accent' : 'bg-red-900 text-white border-white'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi size={14} className="animate-pulse" />
              <span>ONLINE</span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="animate-bounce" />
              <span>OFFLINE</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
