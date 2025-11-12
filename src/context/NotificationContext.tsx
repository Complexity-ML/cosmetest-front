import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import volontaireService from '../services/volontaireService';

interface Notification {
  id: string;
  isRead: boolean;
  timestamp: string;
  isLocal?: boolean;
  [key: string]: any;
}

interface NotificationState {
  totalVolunteersToday: number;
  unreadVolunteersCount: number;
  lastConsultedCount: number;
  notifications: Notification[];
  volunteersToday: any[]; // Liste des volontaires ajoutés aujourd'hui
}

interface NotificationContextValue extends NotificationState {
  markVolunteersAsConsulted: () => void;
  addNotification: (notification: Partial<Notification>) => void;
  unreadCount: number;
  markAsRead: () => void;
  markAllAsRead: () => void;
  loadVolunteersToday: () => Promise<void>; // Charger la liste des volontaires
}

export const NotificationContext = createContext<NotificationContextValue | null>(null);

// Configuration de l'URL de base de l'API (comme dans Dashboard)
const API_URL = 
  import.meta.env?.VITE_API_URL || 
  import.meta.env?.VITE_REACT_APP_API_URL || 
  '';

type NotificationAction =
  | { type: 'LOAD_STATS_FROM_API'; payload: any }
  | { type: 'MARK_VOLUNTEERS_AS_CONSULTED' }
  | { type: 'ADD_LOCAL_NOTIFICATION'; payload: Partial<Notification> }
  | { type: 'LOAD_VOLUNTEERS_TODAY'; payload: { volunteers: any[], totalToday: number } };

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'LOAD_STATS_FROM_API': {
      const statsJour = action.payload;
      const volontairesAjoutes = statsJour.volontairesAjoutes || 0;
      
      // Vérifier si ces volontaires ont déjà été consultés
      const lastConsulted = localStorage.getItem('volunteers_last_consulted');
      const lastConsultedCount = lastConsulted ? parseInt(lastConsulted) : 0;
            
      // Calculer le nombre de nouveaux volontaires non consultés
      const unreadVolunteersCount = Math.max(0, volontairesAjoutes - lastConsultedCount);
            
      return {
        ...state,
        totalVolunteersToday: volontairesAjoutes,
        unreadVolunteersCount,
        lastConsultedCount
      };
    }

    case 'LOAD_VOLUNTEERS_TODAY': {
      const { volunteers, totalToday } = action.payload;
      
      // Vérifier si ces volontaires ont déjà été consultés
      const lastConsulted = localStorage.getItem('volunteers_last_consulted');
      const lastConsultedCount = lastConsulted ? parseInt(lastConsulted) : 0;
      
      // Calculer le nombre de nouveaux volontaires non consultés
      const unreadVolunteersCount = Math.max(0, totalToday - lastConsultedCount);
      
      return {
        ...state,
        volunteersToday: volunteers,
        totalVolunteersToday: totalToday,
        unreadVolunteersCount,
        lastConsultedCount
      };
    }

    case 'MARK_VOLUNTEERS_AS_CONSULTED': {
      const newConsultedCount = state.totalVolunteersToday;
      localStorage.setItem('volunteers_last_consulted', newConsultedCount.toString());
      
      return {
        ...state,
        unreadVolunteersCount: 0,
        lastConsultedCount: newConsultedCount
      };
    }

    case 'ADD_LOCAL_NOTIFICATION': {
      // Pour les notifications de test locales
      const newNotification = {
        id: 'local_' + Date.now() + Math.random(),
        ...action.payload,
        isRead: false,
        timestamp: new Date().toISOString(),
        isLocal: true
      };
      
      const localNotifications = JSON.parse(localStorage.getItem('local_notifications') || '[]');
      const updatedLocalNotifications = [newNotification, ...localNotifications];
      localStorage.setItem('local_notifications', JSON.stringify(updatedLocalNotifications));
      
      return {
        ...state,
        notifications: [newNotification, ...state.notifications]
      };
    }

    default:
      return state;
  }
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, {
    totalVolunteersToday: 0,
    unreadVolunteersCount: 0,
    lastConsultedCount: 0,
    notifications: [],
    volunteersToday: []
  });

  const [isLoading, setIsLoading] = React.useState(false);

  // Charger les volontaires du jour au démarrage (filtrage par dateI)
  useEffect(() => {
    const initializeStats = async () => {
      // Vérifier si l'utilisateur est authentifié avant de charger
      const hasAuthCookie = document.cookie.split(';').some(cookie => 
        cookie.trim().startsWith('token=') || cookie.trim().startsWith('auth_token=')
      );
      
      if (!hasAuthCookie) {
        console.log('⚠️ Pas de cookie d\'authentification, skip chargement des stats');
        return;
      }

      // Charger directement les volontaires avec filtrage par dateI
      await loadVolunteersToday();
    };
    
    initializeStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const markVolunteersAsConsulted = () => {
    dispatch({
      type: 'MARK_VOLUNTEERS_AS_CONSULTED'
    });
  };

  const addNotification = (notification: Partial<Notification>) => {
    dispatch({
      type: 'ADD_LOCAL_NOTIFICATION',
      payload: notification
    });
  };

  const loadVolunteersToday = async () => {
    // Éviter les appels multiples simultanés
    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Utiliser le service volontaire pour récupérer TOUS les volontaires
      const allVolunteers = await volontaireService.getAllWithoutPagination();
      
      // Date d'aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      
      // DEBUG: Vérifier si dateI existe dans les données
      const volunteersWithDateI = allVolunteers.filter((v: any) => v && v.dateI);
      console.log(`📊 ${volunteersWithDateI.length} volontaires ont un champ dateI`);
      
      if (volunteersWithDateI.length > 0) {
        const sample = volunteersWithDateI[0];
        if (sample) {
          console.log('📋 Exemple avec dateI:', {
            id: sample.id,
            nom: sample.nom,
            prenom: sample.prenom,
            dateI: sample.dateI,
            dateIType: typeof sample.dateI
          });
        }
        
        // Afficher les 5 dernières dates d'inclusion
        const recentDates = volunteersWithDateI
          .slice(-5)
          .map((v: any) => new Date(v.dateI).toISOString().split('T')[0]);
        console.log('📅 5 dernières dates d\'inclusion:', recentDates);
      } else {
        console.log('⚠️ Aucun volontaire n\'a de dateI !');
      }
      
      // Récupérer les IDs des notifications dismissées
      const dismissedIds = JSON.parse(localStorage.getItem('dismissed_volunteer_notifications') || '[]');
      
      // DEBUG: Chercher spécifiquement les volontaires avec dateI = aujourd'hui
      const todayVolunteers = allVolunteers.filter((v: any) => {
        if (!v || !v.dateI) return false;
        const volDate = new Date(v.dateI).toISOString().split('T')[0];
        return volDate === today;
      });
      
      console.log(`🔎 ${todayVolunteers.length} volontaires bruts avec dateI = ${today}`);
      if (todayVolunteers.length > 0) {
        console.log('🔎 IDs trouvés:', todayVolunteers.map((v: any) => v.id));
        console.log('🔎 IDs dismissed:', dismissedIds);
        
        const notDismissed = todayVolunteers.filter((v: any) => v.id && !dismissedIds.includes(v.id));
        if (notDismissed.length === 0 && todayVolunteers.length > 0) {
          console.log('⚠️ Tous les volontaires d\'aujourd\'hui ont été dismissés !');
          console.log('💡 Ouvrez la console et tapez: localStorage.removeItem("dismissed_volunteer_notifications")');
        }
      }
      
      // Filtrer les volontaires avec dateI = aujourd'hui (et non dismissés)
      const volunteersToday = todayVolunteers.filter((v: any) => 
        v.id && !dismissedIds.includes(v.id)
      );

      console.log(`✅ ${volunteersToday.length} volontaires avec dateI = ${today}`);
      
      if (volunteersToday.length > 0) {
        console.log('👥 Liste:', volunteersToday.map((v: any) => 
          `${v.nom || 'Sans nom'} ${v.prenom || 'Sans prénom'} (ID: ${v.id})`
        ).slice(0, 5).join(', '));
      }
      
      // Calculer le nombre total de volontaires du jour (avec dateI = aujourd'hui)
      const totalToday = todayVolunteers.length;
      
      // Dispatcher avec les volontaires et le total
      dispatch({
        type: 'LOAD_VOLUNTEERS_TODAY',
        payload: {
          volunteers: volunteersToday,
          totalToday: totalToday
        }
      });
    } catch (error) {
      console.error('❌ Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    totalVolunteersToday: state.totalVolunteersToday,
    unreadVolunteersCount: state.unreadVolunteersCount,
    lastConsultedCount: state.lastConsultedCount,
    notifications: state.notifications,
    volunteersToday: state.volunteersToday,
    markVolunteersAsConsulted,
    addNotification,
    loadVolunteersToday,
    // Compatibilité avec l'ancien système
    unreadCount: state.unreadVolunteersCount,
    markAsRead: () => {},
    markAllAsRead: markVolunteersAsConsulted
  };

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