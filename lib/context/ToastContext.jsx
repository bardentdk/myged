'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from '@/components/ui/Icon';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ message, icon, duration = 3600 }) => {
    const id = Date.now() + Math.random();
    setToasts((ts) => [...ts, { id, message, icon }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((ts) => ts.filter((x) => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-wrap">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              className="toast"
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {toast.icon && (
                <Icon name={toast.icon} size={14} style={{ color: '#a3e5b8' }} />
              )}
              <span>{toast.message}</span>
              <span className="toast-x" onClick={() => dismiss(toast.id)}>×</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
