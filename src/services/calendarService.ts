// calendarService.ts
import api from './api';
import { AxiosRequestConfig } from 'axios';

const CALENDAR_ENDPOINT = '/calendrier';

interface RequestOptions {
  signal?: AbortSignal;
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

/**
 * Wrap axios call with consistent error shape and optional AbortSignal
 */
async function request<T>(
  getter: (config: { signal?: AbortSignal }) => Promise<{ data: T }>,
  { signal }: RequestOptions = {}
): Promise<T | null> {
  try {
    // axios prend { signal } depuis v1.4+
    const res = await getter({ signal });
    return res?.data ?? null;
  } catch (error: any) {
    // Interrompt proprement si annulé
    if (error?.name === 'CanceledError' || error?.message === 'canceled') {
      throw error; // laissez le caller décider
    }
    const status = error?.response?.status;
    const detail = error?.response?.data || error?.message;
    console.error('[calendarService] API error:', status, detail);
    throw new Error(
      status ? `Erreur API (${status}) côté calendrier: ${JSON.stringify(detail)}` : `Erreur réseau côté calendrier: ${detail}`
    );
  }
}

const calendarService = {
  /** Récupère la période calendrier (structure dépend du backend) */
  async getPeriode<T = any>(opts: RequestOptions = {}): Promise<T | null> {
    return request<T>(({ signal }) => api.get(`${CALENDAR_ENDPOINT}/periode`, { signal }), opts);
  },

  /** Récupère les événements d'une semaine donnée */
  async getByWeek<T = any>(weekNumber: number, year: number, opts: RequestOptions = {}): Promise<T | null> {
    assert(Number.isInteger(weekNumber) && weekNumber >= 1 && weekNumber <= 53, 'weekNumber doit être un entier entre 1 et 53');
    assert(Number.isInteger(year) && year >= 1970, 'year doit être une année valide');

    return request<T>(({ signal }) =>
      api.get(`${CALENDAR_ENDPOINT}/semaine`, {
        params: { weekNumber, year },
        signal,
      }),
      opts);
  },

  /** Récupère les RDV liés à une étude */
  async getRdvByStudy<T = any>(studyId: string | number, opts: RequestOptions = {}): Promise<T | null> {
    assert(studyId != null && String(studyId).trim().length > 0, 'studyId est requis');
    const sid = encodeURIComponent(String(studyId).trim());

    return request<T>(({ signal }) => api.get(`${CALENDAR_ENDPOINT}/etude/${sid}/rdvs`, { signal }), opts);
  },
};

export default calendarService;
