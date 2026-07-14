import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '../hooks/useAuth';
import notificationService, { type VolunteerNotification } from '../services/notificationService';

interface LocalNotification {
  id: string;
  isRead: boolean;
  timestamp: string;
  isLocal: true;
  [key: string]: unknown;
}

interface PersistedNotificationState {
  readIds: number[];
  dismissedIds: number[];
}

interface NotificationContextValue {
  totalVolunteersToday: number;
  unreadVolunteersCount: number;
  lastConsultedCount: number;
  notifications: LocalNotification[];
  volunteersToday: VolunteerNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  loadVolunteersToday: () => Promise<void>;
  markVolunteersAsConsulted: () => void;
  markNotificationAsRead: (id: number) => void;
  dismissNotification: (id: number) => void;
  addNotification: (notification: Partial<LocalNotification>) => void;
  markAsRead: () => void;
  markAllAsRead: () => void;
}

export const NotificationContext = createContext<NotificationContextValue | null>(null);

const emptyPersistedState = (): PersistedNotificationState => ({ readIds: [], dismissedIds: [] });

const storageKey = (login: string, date: string): string =>
  `cosmetest.notifications.v1.${encodeURIComponent(login)}.${date}`;

const readPersistedState = (login: string, date: string): PersistedNotificationState => {
  try {
    const raw = localStorage.getItem(storageKey(login, date));
    if (!raw) return emptyPersistedState();
    const parsed = JSON.parse(raw) as Partial<PersistedNotificationState>;
    return {
      readIds: Array.isArray(parsed.readIds) ? parsed.readIds.filter(Number.isInteger) : [],
      dismissedIds: Array.isArray(parsed.dismissedIds) ? parsed.dismissedIds.filter(Number.isInteger) : [],
    };
  } catch {
    return emptyPersistedState();
  }
};

const savePersistedState = (
  login: string,
  date: string,
  state: PersistedNotificationState,
): void => {
  localStorage.setItem(storageKey(login, date), JSON.stringify(state));
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const login = user?.login ?? null;
  const inFlightRef = useRef<Promise<void> | null>(null);
  const [volunteers, setVolunteers] = useState<VolunteerNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [serverDate, setServerDate] = useState('');
  const [readIds, setReadIds] = useState<number[]>([]);
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);
  const [localNotifications, setLocalNotifications] = useState<LocalNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVolunteersToday = useCallback(async (): Promise<void> => {
    if (!login) return;
    if (inFlightRef.current) return inFlightRef.current;

    const request = (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await notificationService.getToday(50);
        const persisted = readPersistedState(login, response.date);
        setVolunteers(Array.isArray(response.data) ? response.data : []);
        setTotal(Number.isFinite(response.total) ? response.total : 0);
        setServerDate(response.date);
        setReadIds(persisted.readIds);
        setDismissedIds(persisted.dismissedIds);
      } catch {
        setError('Impossible de charger les notifications.');
      } finally {
        setIsLoading(false);
        inFlightRef.current = null;
      }
    })();

    inFlightRef.current = request;
    return request;
  }, [login]);

  useEffect(() => {
    if (login) {
      void loadVolunteersToday();
      return;
    }

    setVolunteers([]);
    setTotal(0);
    setServerDate('');
    setReadIds([]);
    setDismissedIds([]);
    setError(null);
  }, [loadVolunteersToday, login]);

  const persist = useCallback((nextReadIds: number[], nextDismissedIds: number[]) => {
    if (login && serverDate) {
      savePersistedState(login, serverDate, {
        readIds: nextReadIds,
        dismissedIds: nextDismissedIds,
      });
    }
  }, [login, serverDate]);

  const markNotificationAsRead = useCallback((id: number) => {
    setReadIds((current) => {
      if (current.includes(id)) return current;
      const next = [...current, id];
      persist(next, dismissedIds);
      return next;
    });
  }, [dismissedIds, persist]);

  const dismissNotification = useCallback((id: number) => {
    setDismissedIds((currentDismissed) => {
      if (currentDismissed.includes(id)) return currentDismissed;
      const nextDismissed = [...currentDismissed, id];
      const nextRead = readIds.includes(id) ? readIds : [...readIds, id];
      setReadIds(nextRead);
      persist(nextRead, nextDismissed);
      return nextDismissed;
    });
  }, [persist, readIds]);

  const markVolunteersAsConsulted = useCallback(() => {
    const visibleIds = volunteers
      .map((volunteer) => volunteer.id)
      .filter((id) => !dismissedIds.includes(id));
    const nextRead = [...new Set([...readIds, ...visibleIds])];
    setReadIds(nextRead);
    persist(nextRead, dismissedIds);
  }, [dismissedIds, persist, readIds, volunteers]);

  const addNotification = useCallback((notification: Partial<LocalNotification>) => {
    const next: LocalNotification = {
      ...notification,
      id: notification.id ?? `local_${Date.now()}`,
      isRead: false,
      timestamp: new Date().toISOString(),
      isLocal: true,
    };
    setLocalNotifications((current) => [next, ...current]);
  }, []);

  const visibleVolunteers = useMemo(
    () => volunteers.filter((volunteer) => !dismissedIds.includes(volunteer.id)),
    [dismissedIds, volunteers],
  );

  const unreadVolunteersCount = useMemo(
    () => visibleVolunteers.filter((volunteer) => !readIds.includes(volunteer.id)).length,
    [readIds, visibleVolunteers],
  );

  const value = useMemo<NotificationContextValue>(() => ({
    totalVolunteersToday: total,
    unreadVolunteersCount,
    lastConsultedCount: Math.max(0, total - unreadVolunteersCount),
    notifications: localNotifications,
    volunteersToday: visibleVolunteers,
    unreadCount: unreadVolunteersCount,
    isLoading,
    error,
    loadVolunteersToday,
    markVolunteersAsConsulted,
    markNotificationAsRead,
    dismissNotification,
    addNotification,
    markAsRead: markVolunteersAsConsulted,
    markAllAsRead: markVolunteersAsConsulted,
  }), [
    addNotification,
    dismissNotification,
    error,
    isLoading,
    loadVolunteersToday,
    localNotifications,
    markNotificationAsRead,
    markVolunteersAsConsulted,
    total,
    unreadVolunteersCount,
    visibleVolunteers,
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications doit être utilisé dans un NotificationProvider');
  }
  return context;
};
