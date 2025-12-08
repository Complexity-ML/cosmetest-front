import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './Calendar.css';
import api from '../../services/api';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { ChevronLeft, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';

interface Appointment {
  idRdv?: number;
  id?: number;
  date?: string;
  heure?: string;
  etat?: string;
  volontaire?: {
    nom?: string;
    prenom?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface Study {
  id?: number;
  idEtude?: number;
  ref?: string;
  titre?: string;
  [key: string]: any;
}

interface CalendarData {
  [date: string]: Study[];
}

interface StudyRdvs {
  selectedDate: Appointment[];
  past: Appointment[];
  today: Appointment[];
  upcoming: Appointment[];
}

const Calendar = () => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);
  const [showStudyModal, setShowStudyModal] = useState<boolean>(false);
  const [studyRdvs, setStudyRdvs] = useState<StudyRdvs>({ selectedDate: [], past: [], today: [], upcoming: [] });
  const [loadingRdvs, setLoadingRdvs] = useState<boolean>(false);

  // --- Helpers ---
  const formatLocalDate = useCallback((date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const parseLocalDateStr = useCallback((dateStr: string): Date => new Date(`${dateStr}T00:00:00`), []);

  // Month boundaries
  const monthStart = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), [currentDate]);
  const monthEnd = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), [currentDate]);

  // --- API services ---
  const getPeriodeData = useCallback(async (dateDebut: string, dateFin: string) => {
    const { data } = await api.get('/calendrier/periode', {
      params: { dateDebut, dateFin, inclureEtudesSansRdv: false },
    });
    return data;
  }, []);

  //  CHARGEMENT RDV POUR UNE DATE SPÉCIFIQUE AVEC FALLBACK
  const loadStudyRdvs = useCallback(async (study: Study, dateToUse: Date) => {
    setLoadingRdvs(true);
    try {
      const studyId = study.id ?? study.idEtude;
      if (!studyId) throw new Error("Identifiant d'étude manquant");

      const dateStr = formatLocalDate(dateToUse);
      let rdvsDuJour = [];

      try {
        //  ESSAYER D'ABORD L'ENDPOINT SPÉCIALISÉ
        const { data } = await api.get(`/calendrier/etude/${studyId}/rdvs/date/${dateStr}`);
        rdvsDuJour = (data.rdvs || []).sort((a: Appointment, b: Appointment) => (a.heure || '').localeCompare(b.heure || ''));

      } catch (specificEndpointError) {

        //  FALLBACK : ENDPOINT GÉNÉRAL AVEC FILTRAGE FRONTEND
        const { data } = await api.get(`/calendrier/etude/${studyId}/rdvs`, {
          params: { page: 0, taille: 1000 }
        });

        // Extraire tous les RDV selon la structure de réponse
        let allRdvs = [];
        if (data.rdvs && typeof data.rdvs === 'object' && !Array.isArray(data.rdvs)) {
          // Structure organisée par catégories
          allRdvs = [
            ...(data.rdvs.past || []),
            ...(data.rdvs.today || []),
            ...(data.rdvs.upcoming || []),
            ...(data.rdvs.selectedDate || [])
          ];
        } else if (Array.isArray(data.rdvs)) {
          allRdvs = data.rdvs;
        } else if (Array.isArray(data)) {
          allRdvs = data;
        }

        // Filtrer pour la date spécifique et trier par heure
        rdvsDuJour = allRdvs
          .filter((rdv: Appointment) => rdv.date === dateStr)
          .sort((a: Appointment, b: Appointment) => (a.heure || '').localeCompare(b.heure || ''));

      }


      // Structure simplifiée : seulement les RDV du jour sélectionné
      setStudyRdvs({
        selectedDate: rdvsDuJour,
        past: [],
        today: [],
        upcoming: []
      });

    } catch (err) {
      console.error('❌ Erreur lors du chargement des RDV:', err);
      setStudyRdvs({ selectedDate: [], past: [], today: [], upcoming: [] });
    } finally {
      setLoadingRdvs(false);
    }
  }, [formatLocalDate]);

  // --- Load calendar data ---
  useEffect(() => {
    const loadCalendarData = async () => {
      setLoading(true);
      setError(null);
      try {
        const dateDebut = formatLocalDate(monthStart);
        const dateFin = formatLocalDate(monthEnd);
        const data = await getPeriodeData(dateDebut, dateFin);

        const etudesAvecDatesEffectives = data.etudes?.map((etude: Study) => {
          const rdvsEtude = data.rdvs?.filter((rdv: Appointment) => {
            const rdvEtudeId = rdv.idEtude || rdv.etude?.id;
            const etudeId = etude.id || etude.idEtude;
            return rdvEtudeId == etudeId;
          }) || [];

          const datesEffectives = [...new Set(rdvsEtude.map((rdv: Appointment) => rdv.date))]
            .filter((date): date is string => typeof date === 'string' && date >= dateDebut && date <= dateFin)
            .sort();

          return {
            ...etude,
            datesEffectivesAvecRdv: datesEffectives,
            nombreRdvPeriode: rdvsEtude.length,
          };
        }) || [];

        const etudesAvecRdv = etudesAvecDatesEffectives.filter((etude: Study) => etude.datesEffectivesAvecRdv.length > 0);
        setCalendarData({ ...data, etudes: etudesAvecRdv });
      } catch (err) {
        console.error('Erreur lors du chargement du calendrier:', err);
        setError((err as Error)?.message || 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    loadCalendarData();
  }, [monthStart, monthEnd, getPeriodeData, formatLocalDate]);

  // --- UI logic ---
  const navigateMonth = (direction: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getStudiesForDate = useCallback(
    (date: Date) => {
      if (!calendarData?.etudes) return [];
      const dateStr = formatLocalDate(date);
      return calendarData.etudes.filter((etude: any) => etude.datesEffectivesAvecRdv?.includes(dateStr));
    },
    [calendarData, formatLocalDate]
  );

  const generateCalendarDays = useCallback(() => {
    const days = [];
    const start = new Date(monthStart);

    const dayOfWeek = start.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    start.setDate(start.getDate() + mondayOffset);

    for (let i = 0; i < 42; i++) {
      const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);

      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const studiesWithRdv = getStudiesForDate(date);

      days.push({
        date,
        isCurrentMonth,
        isToday,
        isSelected,
        studiesWithRdv,
        hasStudies: studiesWithRdv.length > 0,
      });
    }

    return days;
  }, [monthStart, currentDate, selectedDate, getStudiesForDate]);

  const calendarDays = generateCalendarDays();

  const handleDateClick = (day: any) => {
    setSelectedDate(day.date);

    // Rechargement automatique si modale ouverte
    if (showStudyModal && selectedStudy) {
      setTimeout(() => loadStudyRdvs(selectedStudy, day.date), 100);
    }
  };

  //  FIX: Passer la date explicitement à handleStudyClick
  const handleStudyClick = async (study: Study, dayDate: Date, event?: React.MouseEvent) => {
    event?.stopPropagation();

    //  FIX: Mettre à jour la date sélectionnée AVANT de charger les RDV
    setSelectedDate(dayDate);
    setSelectedStudy(study);
    setShowStudyModal(true);

    //  FIX: Charger les RDV avec la date spécifique
    await loadStudyRdvs(study, dayDate);
  };

  // Palette de 20 couleurs pastel
  const pastelColors = [
    '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
    '#FFB3E6', '#E6B3FF', '#FFD9B3', '#B3FFD9', '#B3D9FF',
    '#FFB3D9', '#D9B3FF', '#FFCCB3', '#B3FFCC', '#B3CCFF',
    '#FFCCE6', '#E6CCFF', '#FFE6B3', '#B3FFE6', '#B3E6FF'
  ];

  const getStudyTypeColor = (study: Study) => {
    const ref = study?.ref || study?.id || study?.idEtude || '';
    // Générer un index basé sur la référence de l'étude
    const hash = ref.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return pastelColors[hash % pastelColors.length];
  };

  const formatDateFr = (dateStr: string) => {
    const date = parseLocalDateStr(dateStr);
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getRdvStatusColor = (etat?: string) => {
    const colors: Record<string, string> = {
      CONFIRME: 'bg-green-100 text-green-800 border-green-300',
      EN_ATTENTE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      ANNULE: 'bg-red-100 text-red-800 border-red-300',
      COMPLETE: 'bg-blue-100 text-blue-800 border-blue-300',
      PLANIFIE: 'bg-purple-100 text-purple-800 border-purple-300',
    };
    return colors[etat || ''] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // --- Render ---
  if (loading) {
    return (
      <div className="calendar-container">
        <div className="border rounded-lg">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mr-3" />
            <p>{t('calendar.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calendar-container">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p>{t('calendar.error')}: {error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-2">
              {t('calendar.retry')}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      {/* Header */}
      <div className="calendar-header">
        <div className="calendar-navigation">
          <Button variant="outline" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t('calendar.previous')}
          </Button>
          <h2 className="calendar-title">{currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h2>
          <Button variant="outline" onClick={() => navigateMonth(1)}>
            {t('calendar.next')}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {calendarData?.etudes && (
          <div className="calendar-stats">
            <div className="stat-item">
              <span className="stat-number">{calendarData.etudes.length}</span>
              <span className="stat-label">{t('calendar.activeStudies')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{calendarDays.filter((day) => day.hasStudies).length}</span>
              <span className="stat-label">{t('calendar.daysWithAppointments')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{calendarData.etudes.reduce((sum, e) => sum + (e.nombreRdvPeriode || 0), 0)}</span>
              <span className="stat-label">{t('calendar.totalAppointments')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {[t('calendar.mon'), t('calendar.tue'), t('calendar.wed'), t('calendar.thu'), t('calendar.fri'), t('calendar.sat'), t('calendar.sun')].map((day) => (
            <div key={day} className="weekday-header">{day}</div>
          ))}
        </div>

        <div className="calendar-days">
          {calendarDays.map((day, index) => (
            <div
              key={`${formatLocalDate(day.date)}-${index}`}
              className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''} ${day.isSelected ? 'selected' : ''} ${day.hasStudies ? 'has-studies' : ''}`}
              onClick={() => handleDateClick(day)}
            >
              <div className="day-number">{day.date.getDate()}</div>

              {day.hasStudies && (
                <div className="day-studies">
                  {/* SUPPRIMER .slice(0, 3) pour afficher TOUTES les études */}
                  {day.studiesWithRdv.map((study, studyIndex) => (
                    <div
                      key={study.id || study.idEtude || studyIndex}
                      className="study-marker"
                      style={{ backgroundColor: getStudyTypeColor(study), borderColor: getStudyTypeColor(study) }}
                      title={`${study.ref} - ${study.titre || ''}\nType: ${study.type || 'Non défini'}\nRDV dans la période: ${study.nombreRdvPeriode || 0}`}
                      onClick={(e) => handleStudyClick(study, day.date, e)}
                    >
                      <span className="study-ref">{study.ref || study.id || study.idEtude}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal avec gestion intelligente */}
      {showStudyModal && selectedStudy && (
        <div className="modal-overlay" onClick={() => setShowStudyModal(false)}>
          <div className="modal-content enhanced-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header enhanced-header">
              <div className="study-info">
                <h3>{selectedStudy.ref}</h3>
                <p className="study-title">{selectedStudy.titre || t('calendar.notDefined')}</p>
                <div className="study-meta">
                  <span className="study-type">{selectedStudy.type || t('calendar.notDefined')}</span>
                  <span className="rdv-count">{studyRdvs.selectedDate.length} {t('calendar.rdvThisDay')}</span>
                  {selectedDate && (
                    <span className="selected-date-info">
                      📅 {formatDateFr(formatLocalDate(selectedDate))}
                    </span>
                  )}
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowStudyModal(false)}>×</button>
            </div>

            <div className="modal-body enhanced-body">
              {loadingRdvs ? (
                <div className="loading-section">
                  <div className="spinner"></div>
                  <p>{t('calendar.loadingAppointments')}</p>
                </div>
              ) : (
                <div className="rdv-sections">
                  {/* RDV du jour sélectionné */}
                  {studyRdvs.selectedDate && studyRdvs.selectedDate.length > 0 ? (
                    <div className="rdv-section selected-date-section">
                      <div className="section-header">
                        <div className="time-badge selected-date-badge">
                          <span className="badge-icon">📅</span>
                          <span className="badge-text">
                            RDV du {selectedDate ? formatDateFr(formatLocalDate(selectedDate)) : 'jour sélectionné'}
                          </span>
                          <span className="badge-count">({studyRdvs.selectedDate.length})</span>
                        </div>
                      </div>
                      <div className="rdv-list">
                        {studyRdvs.selectedDate.map((rdv, index) => (
                          <div key={`rdv-${index}`} className="rdv-card selected-date-card">
                            <div className="rdv-time-slot">
                              <span className="time-display">{rdv.heure || '--:--'}</span>
                              <span className="date-display">{formatDateFr(rdv.date || '')}</span>
                            </div>
                            <div className="rdv-details">
                              <div className="volunteer-info">
                                <span className="volunteer-icon">👤</span>
                                <span className="volunteer-name">
                                  {rdv.volontaire
                                    ? `${rdv.volontaire.prenomVol || rdv.volontaire.prenom || ''} ${rdv.volontaire.nomVol || rdv.volontaire.nom || ''}`.trim()
                                    : t('calendar.volunteerNotAssigned')
                                  }
                                </span>
                              </div>
                              <div className="rdv-status">
                                <span className={`status-badge ${getRdvStatusColor(rdv.etat)}`}>
                                  {rdv.etat || t('calendar.notDefined')}
                                </span>
                              </div>
                            </div>
                            {rdv.commentaires && (
                              <div className="rdv-comments">
                                <span className="comment-icon">💬</span>
                                <span className="comment-text">{rdv.commentaires}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="no-rdv-message">
                      <div className="no-rdv-icon">📅</div>
                      <p>
                        {t('calendar.noAppointmentFound')} {' '}
                        {selectedDate ? formatDateFr(formatLocalDate(selectedDate)) : t('calendar.selectedDay')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;