import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import { formatDate, formatTime } from '../../utils/dateUtils';
import annulationService from '../../services/annulationService';
import { AlertTriangle, XCircle, Download } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';

interface Rdv {
  id?: number;
  idRdv?: number;
  idEtude?: number;
  idVol?: number;
  date: string;
  heure?: string;
  duree?: number;
  statut?: string;
  etat?: string;
  etudeRef?: string;
  commentaire?: string;
  [key: string]: any;
}

interface VolontaireDetailRdvProps {
  rdvs?: Rdv[];
  volontaireId?: string | number;
}

interface AnnulationRdv {
  idEtude: number;
  idRdv: number;
  dateAnnulation: string;
  motif?: string;
  [key: string]: any;
}

const VolontaireDetailRdv = ({ rdvs = [], volontaireId }: VolontaireDetailRdvProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error] = useState<string | null>(null);
  const [annulationsMap, setAnnulationsMap] = useState<Map<string, AnnulationRdv>>(new Map());

  // Charger les annulations pour ce volontaire
  useEffect(() => {
    const fetchAnnulations = async () => {
      if (!volontaireId) return;
      
      try {
        setIsLoading(true);
        const annulations = await annulationService.getByVolontaire(Number(volontaireId));
        
        // Créer un Map pour un accès rapide par idEtude-idRdv
        const map = new Map<string, AnnulationRdv>();
        if (Array.isArray(annulations)) {
          annulations.forEach((annulation: any) => {
            if (annulation.idRdv) {
              const key = `${annulation.idEtude}-${annulation.idRdv}`;
              map.set(key, annulation as AnnulationRdv);
            }
          });
        }
        setAnnulationsMap(map);
      } catch (error) {
        console.error('Erreur lors du chargement des annulations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnulations();
  }, [volontaireId]);

  // Fonction pour vérifier si un RDV est annulé
  const isRdvAnnule = (rdv: Rdv): AnnulationRdv | undefined => {
    if (!rdv.idEtude || !rdv.idRdv) return undefined;
    const key = `${rdv.idEtude}-${rdv.idRdv}`;
    return annulationsMap.get(key);
  };

  // Fonction pour formater le statut du RDV
  const formatStatut = (statut?: string) => {
    if (!statut) return { label: t('appointments.notDefined'), class: 'bg-gray-100 text-gray-800' };

    const statutMap: Record<string, { label: string; class: string }> = {
      'CONFIRME': { label: t('appointments.confirmed'), class: 'bg-green-100 text-green-800' },
      'EN_ATTENTE': { label: t('appointments.pending'), class: 'bg-yellow-100 text-yellow-800' },
      'ANNULE': { label: t('appointments.cancelled'), class: 'bg-red-100 text-red-800' },
      'COMPLETE': { label: t('studies.completed'), class: 'bg-blue-100 text-blue-800' },
      'PLANIFIE': { label: t('appointments.planned'), class: 'bg-indigo-100 text-indigo-800' }
    };

    return statutMap[statut] || { label: statut, class: 'bg-gray-100 text-gray-800' };
  };

  // Fonction pour déterminer si un RDV est à venir
  const isUpcoming = (dateRdv: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rdvDate = new Date(dateRdv);
    rdvDate.setHours(0, 0, 0, 0);
    return rdvDate >= today;
  };

  // Fonction pour déterminer si un RDV est aujourd'hui
  const isToday = (dateRdv: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rdvDate = new Date(dateRdv);
    rdvDate.setHours(0, 0, 0, 0);
    return rdvDate.getTime() === today.getTime();
  };

  // Fonction pour déterminer si un RDV est passé dans les 8 dernières semaines
  const isPastEightWeeks = (dateRdv: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eightWeeksAgo = new Date(today);
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
    const rdvDate = new Date(dateRdv);
    rdvDate.setHours(0, 0, 0, 0);
    return rdvDate < today && rdvDate >= eightWeeksAgo;
  };

  // Filtrer et trier les RDVs à venir (plus récents en premier)
  const upcomingRdvs = rdvs
    .filter(rdv => isUpcoming(rdv.date))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // RDVs du jour uniquement (pour affichage séparé)
  const todayRdvs = upcomingRdvs.filter(rdv => isToday(rdv.date));

  // RDVs futurs (sans aujourd'hui)
  const futureRdvs = upcomingRdvs.filter(rdv => !isToday(rdv.date));

  // RDVs passés des 8 dernières semaines (triés du plus récent au plus ancien)
  const pastRdvs = rdvs
    .filter(rdv => isPastEightWeeks(rdv.date))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Export Excel des RDVs du jour et à venir
  const exportToExcel = () => {
    if (upcomingRdvs.length === 0) return;

    const data = upcomingRdvs.map(rdv => {
      const annulation = isRdvAnnule(rdv);
      return {
        [t('appointments.date')]: formatDate(rdv.date),
        [t('appointments.time')]: formatTime(rdv.heure) || '-',
        [t('appointments.duration')]: rdv.duree || rdv.duration ? `${rdv.duree || rdv.duration} min` : '-',
        [t('payments.study')]: rdv.etudeRef || `Étude #${rdv.idEtude}`,
        [t('appointments.status')]: annulation ? t('appointments.cancelled') : formatStatut(rdv.etat).label,
        [t('appointments.comment')]: rdv.commentaire || '-',
        [t('appointments.today')]: isToday(rdv.date) ? t('common.yes') : t('common.no'),
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t('appointments.upcomingAppointments'));

    // Ajuster la largeur des colonnes
    const colWidths = Object.keys(data[0] || {}).map(key => ({ wch: Math.max(key.length, 15) }));
    ws['!cols'] = colWidths;

    const fileName = `rdv-volontaire-${volontaireId}-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Alerte si des RDVs annulés */}
      {Array.from(annulationsMap.values()).length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <span className="font-semibold">
              {Array.from(annulationsMap.values()).length} {Array.from(annulationsMap.values()).length > 1 ? t('appointments.appointmentsCancelledPlural') : t('appointments.appointmentsCancelled')}
            </span>
            {' '}{t('appointments.inVolunteerHistory')}
          </AlertDescription>
        </Alert>
      )}

      {/* Bouton d'export global */}
      <div className="flex justify-end mb-4">
        {upcomingRdvs.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={exportToExcel}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {t('common.export')}
          </Button>
        )}
      </div>

      {/* Rendez-vous en cours (aujourd'hui) */}
      {todayRdvs.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-blue-800 mb-4">
            {t('appointments.currentAppointments')} ({todayRdvs.length})
          </h3>
          <div className="space-y-3">
            {todayRdvs.map((rdv) => {
              const annulation = isRdvAnnule(rdv);
              const isAnnule = !!annulation;

              return (
                <div
                  key={`today-${rdv.idEtude}-${rdv.idRdv}`}
                  className={`border rounded-lg p-4 hover:shadow-sm transition-shadow ${
                    isAnnule ? 'border-red-300 bg-red-50' : 'border-blue-300 bg-blue-50'
                  }`}
                >
                  {isAnnule && (
                    <div className="mb-3 flex items-center gap-2 bg-red-100 border border-red-300 rounded-md px-3 py-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-red-800">{t('appointments.appointmentCancelled')}</p>
                        <p className="text-xs text-red-700">{t('appointments.cancelledOn')} {formatDate(annulation.dateAnnulation)}</p>
                        {annulation.motif && <p className="text-xs text-red-600 mt-1">{t('appointments.reason')} : {annulation.motif}</p>}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Link to={`/etudes/${rdv.idEtude}`} className="font-medium text-primary-600 hover:text-primary-700">
                          {rdv.etudeRef || `Étude #${rdv.idEtude}`}
                        </Link>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {t('appointments.today')}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-500">{t('appointments.date')}:</span>
                          <p className="text-gray-900">{formatDate(rdv.date)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">{t('appointments.time')}:</span>
                          <p className="text-gray-900">{formatTime(rdv.heure)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">{t('appointments.duration')}:</span>
                          <p className="text-gray-900">{(rdv.duree || rdv.duration) ? `${rdv.duree || rdv.duration} min` : '-'}</p>
                        </div>
                      </div>
                      {rdv.commentaire && (
                        <div className="mt-2">
                          <span className="font-medium text-gray-500 text-sm">{t('appointments.comment')}:</span>
                          <p className="text-gray-700 text-sm mt-1">{rdv.commentaire}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {isAnnule ? (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          {t('appointments.cancelled')}
                        </Badge>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${formatStatut(rdv.etat).class}`}>
                          {formatStatut(rdv.etat).label}
                        </span>
                      )}
                      <Link to={`/rdvs/${rdv.idEtude}/${rdv.idRdv}`} className="text-xs text-primary-600 hover:text-primary-700">
                        {t('appointments.viewDetails')}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rendez-vous à venir */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('appointments.upcomingAppointments')} ({futureRdvs.length})
        </h3>

        {futureRdvs.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-500">{t('appointments.noUpcomingAppointments')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {futureRdvs.map((rdv) => {
              const annulation = isRdvAnnule(rdv);
              const isAnnule = !!annulation;
              
              return (
                <div 
                  key={`${rdv.idEtude}-${rdv.idRdv}`}
                  className={`border rounded-lg p-4 hover:shadow-sm transition-shadow ${
                    isAnnule 
                      ? 'border-red-300 bg-red-50' 
                      : isToday(rdv.date) 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 bg-white'
                  }`}
                >
                  {/* Badge d'annulation visible */}
                  {isAnnule && (
                    <div className="mb-3 flex items-center gap-2 bg-red-100 border border-red-300 rounded-md px-3 py-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-red-800">
                          {t('appointments.appointmentCancelled')}
                        </p>
                        <p className="text-xs text-red-700">
                          {t('appointments.cancelledOn')} {formatDate(annulation.dateAnnulation)}
                        </p>
                        {annulation.motif && (
                          <p className="text-xs text-red-600 mt-1">
                            {t('appointments.reason')} : {annulation.motif}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Link 
                        to={`/etudes/${rdv.idEtude}`}
                        className="font-medium text-primary-600 hover:text-primary-700"
                      >
                        {rdv.etudeRef || `Étude #${rdv.idEtude}`}
                      </Link>
                      {isToday(rdv.date) && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {t('appointments.today')}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-500">{t('appointments.date')}:</span>
                        <p className="text-gray-900">{formatDate(rdv.date)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">{t('appointments.time')}:</span>
                        <p className="text-gray-900">{formatTime(rdv.heure)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">{t('appointments.duration')}:</span>
                        <p className="text-gray-900">{(rdv.duree || rdv.duration) ? `${rdv.duree || rdv.duration} min` : '-'}</p>
                      </div>
                    </div>

                    {rdv.commentaire && (
                      <div className="mt-2">
                        <span className="font-medium text-gray-500 text-sm">{t('appointments.comment')}:</span>
                        <p className="text-gray-700 text-sm mt-1">{rdv.commentaire}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    {isAnnule ? (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        {t('appointments.cancelled')}
                      </Badge>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        formatStatut(rdv.etat).class
                      }`}>
                        {formatStatut(rdv.etat).label}
                      </span>
                    )}

                    <Link
                      to={`/rdvs/${rdv.idEtude}/${rdv.idRdv}`}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      {t('appointments.viewDetails')}
                    </Link>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>

      {/* Rendez-vous passés (8 dernières semaines) */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-500 mb-4">
          {t('appointments.pastAppointments')} - {t('appointments.lastEightWeeks')} ({pastRdvs.length})
        </h3>

        {pastRdvs.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-500">{t('appointments.noPastAppointments')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pastRdvs.map((rdv) => {
              const annulation = isRdvAnnule(rdv);
              const isAnnule = !!annulation;

              return (
                <div
                  key={`past-${rdv.idEtude}-${rdv.idRdv}`}
                  className={`border rounded-lg p-4 hover:shadow-sm transition-shadow ${
                    isAnnule
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  {/* Badge d'annulation visible */}
                  {isAnnule && (
                    <div className="mb-3 flex items-center gap-2 bg-red-100 border border-red-300 rounded-md px-3 py-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-red-800">
                          {t('appointments.appointmentCancelled')}
                        </p>
                        <p className="text-xs text-red-700">
                          {t('appointments.cancelledOn')} {formatDate(annulation.dateAnnulation)}
                        </p>
                        {annulation.motif && (
                          <p className="text-xs text-red-600 mt-1">
                            {t('appointments.reason')} : {annulation.motif}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Link
                          to={`/etudes/${rdv.idEtude}`}
                          className="font-medium text-gray-600 hover:text-gray-800"
                        >
                          {rdv.etudeRef || `Étude #${rdv.idEtude}`}
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-500">{t('appointments.date')}:</span>
                          <p className="text-gray-700">{formatDate(rdv.date)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">{t('appointments.time')}:</span>
                          <p className="text-gray-700">{formatTime(rdv.heure)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">{t('appointments.duration')}:</span>
                          <p className="text-gray-700">{(rdv.duree || rdv.duration) ? `${rdv.duree || rdv.duration} min` : '-'}</p>
                        </div>
                      </div>

                      {rdv.commentaire && (
                        <div className="mt-2">
                          <span className="font-medium text-gray-500 text-sm">{t('appointments.comment')}:</span>
                          <p className="text-gray-600 text-sm mt-1">{rdv.commentaire}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      {isAnnule ? (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          {t('appointments.cancelled')}
                        </Badge>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          formatStatut(rdv.etat).class
                        }`}>
                          {formatStatut(rdv.etat).label}
                        </span>
                      )}

                      <Link
                        to={`/rdvs/${rdv.idEtude}/${rdv.idRdv}`}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        {t('appointments.viewDetails')}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default VolontaireDetailRdv;