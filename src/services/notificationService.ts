import api from './api';

export interface VolunteerNotification {
  id: number;
  nom: string;
  prenom: string;
  dateInclusion: string;
}

export interface TodayNotificationsResponse {
  data: VolunteerNotification[];
  total: number;
  date: string;
}

const getToday = async (limit = 50): Promise<TodayNotificationsResponse> => {
  const boundedLimit = Math.max(1, Math.min(limit, 100));
  const response = await api.get<TodayNotificationsResponse>('/volontaires/notifications/today', {
    params: { limit: boundedLimit },
  });
  return response.data;
};

export default { getToday };
