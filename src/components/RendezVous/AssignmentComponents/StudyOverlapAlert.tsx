import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, X, Calendar, Clock, Info } from 'lucide-react';
import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { Alert, AlertDescription } from '../../ui/alert';
import rdvService from '../../../services/rdvService';
import etudeService from '../../../services/etudeService';

interface Rdv {
  idRdv?: number;
  id?: number;
  idEtude?: number;
  date: string;
  heure?: string;
  duree?: number;
  etat?: string;
  etudeRef?: string;
  [key: string]: any;
}

interface Etude {
  idEtude?: number;
  id?: number;
  ref?: string;
  nom?: string;
  titre?: string;
  dateDebut?: string;
  dateFin?: string;
  [key: string]: any;
}

interface OverlappingStudy {
  etude: Etude;
  rdvs: Rdv[];
}

interface StudyOverlapAlertProps {
  volontaireId: number | string;
  targetEtudeId: number | string;
  onCheckComplete?: (hasOverlap: boolean, overlappingStudies: OverlappingStudy[]) => void;
  showInlineAlert?: boolean;
  autoCheck?: boolean;
}

/**
 * Composant pour détecter et afficher les chevauchements d'études pour un volontaire
 * Affiche une alerte si le volontaire a des RDV sur d'autres études qui se croisent
 */
const StudyOverlapAlert = ({
  volontaireId,
  targetEtudeId,
  onCheckComplete,
  showInlineAlert = true,
  autoCheck = true,
}: StudyOverlapAlertProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [overlappingStudies, setOverlappingStudies] = useState<OverlappingStudy[]>([]);
  const [targetEtude, setTargetEtude] = useState<Etude | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Fonction pour formater l'heure
  const formatTime = (timeString?: string) => {
    if (!timeString) return '-';
    return timeString;
  };

  // Fonction pour vérifier si deux périodes se chevauchent
  const periodsOverlap = (
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date
  ): boolean => {
    return start1 <= end2 && end1 >= start2;
  };

  // Fonction principale pour vérifier les chevauchements
  const checkOverlaps = useCallback(async () => {
    if (!volontaireId || !targetEtudeId) return;

    setIsLoading(true);
    try {
      // 1. Récupérer les détails de l'étude cible
      const targetEtudeData = await etudeService.getById(Number(targetEtudeId));
      setTargetEtude(targetEtudeData);

      // 2. Récupérer les RDV de l'étude cible pour obtenir la période
      const targetRdvs = await rdvService.getByEtudeId(Number(targetEtudeId));
      const targetRdvList = Array.isArray(targetRdvs) ? targetRdvs : [];

      if (targetRdvList.length === 0) {
        setOverlappingStudies([]);
        setHasChecked(true);
        onCheckComplete?.(false, []);
        return;
      }

      // Calculer la période de l'étude cible (min et max des dates de RDV)
      const targetDates = targetRdvList.map((rdv) => new Date(rdv.date));
      const targetStartDate = new Date(Math.min(...targetDates.map((d) => d.getTime())));
      const targetEndDate = new Date(Math.max(...targetDates.map((d) => d.getTime())));

      // Ajouter une marge de sécurité (7 jours avant et après)
      targetStartDate.setDate(targetStartDate.getDate() - 7);
      targetEndDate.setDate(targetEndDate.getDate() + 7);

      // 3. Récupérer tous les RDV du volontaire (utiliser getByVolontaire qui est plus fiable)
      const volunteerRdvsData = await rdvService.getByVolontaire(Number(volontaireId));
      const volunteerRdvs = Array.isArray(volunteerRdvsData) ? volunteerRdvsData : [];

      // 4. Filtrer les RDV qui ne sont pas de l'étude cible et qui sont dans la période
      const otherStudyRdvs = volunteerRdvs.filter((rdv: Rdv) => {
        if (Number(rdv.idEtude) === Number(targetEtudeId)) return false;

        const rdvDate = new Date(rdv.date);
        return periodsOverlap(targetStartDate, targetEndDate, rdvDate, rdvDate);
      });

      // 5. Grouper par étude
      const studyMap = new Map<number, Rdv[]>();
      for (const rdv of otherStudyRdvs) {
        const etudeId = rdv.idEtude;
        if (!etudeId) continue;

        if (!studyMap.has(etudeId)) {
          studyMap.set(etudeId, []);
        }
        studyMap.get(etudeId)!.push(rdv);
      }

      // 6. Récupérer les détails des études qui chevauchent
      const overlaps: OverlappingStudy[] = [];
      for (const [etudeId, rdvs] of studyMap) {
        try {
          const etudeData = await etudeService.getById(etudeId);
          overlaps.push({
            etude: etudeData,
            rdvs: rdvs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
          });
        } catch (error) {
          console.warn(`Erreur lors de la récupération de l'étude ${etudeId}:`, error);
          overlaps.push({
            etude: { idEtude: etudeId, ref: `Étude #${etudeId}` },
            rdvs: rdvs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
          });
        }
      }

      setOverlappingStudies(overlaps);
      setHasChecked(true);
      onCheckComplete?.(overlaps.length > 0, overlaps);
    } catch (error) {
      console.error('Erreur lors de la vérification des chevauchements:', error);
      setOverlappingStudies([]);
      setHasChecked(true);
      onCheckComplete?.(false, []);
    } finally {
      setIsLoading(false);
    }
  }, [volontaireId, targetEtudeId, onCheckComplete]);

  // Auto-check au montage si autoCheck est activé
  useEffect(() => {
    if (autoCheck && volontaireId && targetEtudeId) {
      checkOverlaps();
    }
  }, [autoCheck, volontaireId, targetEtudeId, checkOverlaps]);

  // Fonction pour obtenir le nom de l'étude
  const getEtudeName = (etude: Etude) => {
    return etude.ref || etude.nom || etude.titre || `Étude #${etude.idEtude || etude.id}`;
  };

  // Rendu du badge de statut
  const getStatusBadge = (status?: string) => {
    const statusColors: Record<string, string> = {
      CONFIRME: 'bg-green-100 text-green-800',
      EN_ATTENTE: 'bg-yellow-100 text-yellow-800',
      ANNULE: 'bg-red-100 text-red-800',
      COMPLETE: 'bg-blue-100 text-blue-800',
      PLANIFIE: 'bg-purple-100 text-purple-800',
    };

    const colorClass = statusColors[status?.toUpperCase() || ''] || 'bg-gray-100 text-gray-800';
    return (
      <Badge variant="outline" className={colorClass}>
        {status || t('appointments.notDefined')}
      </Badge>
    );
  };

  // Si pas de chevauchement ou pas encore vérifié, ne rien afficher en mode inline
  if (!showInlineAlert || !hasChecked || overlappingStudies.length === 0) {
    return null;
  }

  const totalOverlappingRdvs = overlappingStudies.reduce((sum, s) => sum + s.rdvs.length, 0);

  return (
    <>
      {/* Alerte inline */}
      <Alert variant="destructive" className="border-orange-300 bg-orange-50">
        <AlertTriangle className="h-5 w-5 text-orange-600" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex-1">
            <span className="font-semibold text-orange-800">
              {t('studyOverlap.warningTitle', 'Attention : Chevauchement d\'études détecté')}
            </span>
            <p className="text-sm text-orange-700 mt-1">
              {t('studyOverlap.warningMessage', {
                count: overlappingStudies.length,
                rdvCount: totalOverlappingRdvs,
                defaultValue: `Ce volontaire a ${totalOverlappingRdvs} RDV sur ${overlappingStudies.length} autre(s) étude(s) qui se croisent avec cette période.`,
              })}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="ml-4 border-orange-400 text-orange-700 hover:bg-orange-100"
          >
            <Info className="h-4 w-4 mr-1" />
            {t('studyOverlap.viewDetails', 'Voir les détails')}
          </Button>
        </AlertDescription>
      </Alert>

      {/* Modal avec les détails */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              {t('studyOverlap.modalTitle', 'Chevauchement d\'études')}
            </DialogTitle>
            <DialogDescription>
              {t('studyOverlap.modalDescription', {
                targetStudy: getEtudeName(targetEtude || {}),
                defaultValue: `Le volontaire a des rendez-vous sur d'autres études qui se croisent avec "${getEtudeName(targetEtude || {})}"`,
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {overlappingStudies.map((overlap, index) => (
              <div
                key={overlap.etude.idEtude || overlap.etude.id || index}
                className="border border-orange-200 rounded-lg p-4 bg-orange-50/50"
              >
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  {getEtudeName(overlap.etude)}
                  <Badge variant="secondary" className="ml-auto">
                    {overlap.rdvs.length} RDV
                  </Badge>
                </h4>

                <div className="space-y-2">
                  {overlap.rdvs.map((rdv, rdvIndex) => (
                    <div
                      key={rdv.idRdv || rdv.id || rdvIndex}
                      className="flex items-center justify-between bg-white rounded-md px-3 py-2 border border-gray-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{formatDate(rdv.date)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{formatTime(rdv.heure)}</span>
                        </div>
                        {rdv.duree && (
                          <span className="text-sm text-gray-500">
                            ({rdv.duree} min)
                          </span>
                        )}
                      </div>
                      {getStatusBadge(rdv.etat)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              <X className="h-4 w-4 mr-1" />
              {t('common.close', 'Fermer')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StudyOverlapAlert;
