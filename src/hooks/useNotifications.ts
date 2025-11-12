// hooks/useNotifications.ts
import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications doit être utilisé dans un NotificationProvider');
  }
  return context;
};

export default useNotifications;
