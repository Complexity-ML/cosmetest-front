import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { toast as shadcnToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

interface ToastContextValue {
  push: (toast: { type?: string; message: string; ttl?: number }) => string;
  info: (message: string, ttl?: number) => string;
  success: (message: string, ttl?: number) => string;
  error: (message: string, ttl?: number) => string;
  warning: (message: string, ttl?: number) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const push = useCallback((toastData: { type?: string; message: string; ttl?: number }) => {
    const id = `${Date.now()}_${Math.random()}`;
    const ttl = toastData.ttl ?? 3500;

    // Map toast types to shadcn variants
    const variant = toastData.type === 'error' ? 'destructive' : 'default';

    shadcnToast({
      title: toastData.type === 'success' ? 'Success' :
             toastData.type === 'error' ? 'Error' :
             toastData.type === 'warning' ? 'Warning' : 'Info',
      description: toastData.message,
      variant,
      duration: ttl,
    });

    return id;
  }, []);

  const api = useMemo(() => ({
    push,
    info: (message: string, ttl?: number) => push({ type: 'info', message, ttl }),
    success: (message: string, ttl?: number) => push({ type: 'success', message, ttl }),
    error: (message: string, ttl?: number) => push({ type: 'error', message, ttl }),
    warning: (message: string, ttl?: number) => push({ type: 'warning', message, ttl }),
  }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

export default ToastProvider;
