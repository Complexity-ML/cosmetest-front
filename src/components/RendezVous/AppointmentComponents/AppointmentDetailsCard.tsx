import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Alert, AlertDescription } from '../../ui/alert';
import { XCircle, Calendar as CalendarIcon } from 'lucide-react';
import annulationService from '../../../services/annulationService';

interface Appointment {
  idRdv?: number;
  id?: number;
  date?: string;
  heure?: string;
  etat?: string;
  commentaires?: string;
  idGroupe?: number;
  etudeRef?: string;
  etude?: {
    titre?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface Group {
  id?: number;
  nom?: string;
  intitule?: string;
  nomGroupe?: string;
  [key: string]: any;
}

interface AppointmentDetailsCardProps {
  appointment: Appointment;
  group?: Group;
}

interface AnnulationData {
  idEtude: number;
  idRdv: number;
  idVol?: number;
  dateAnnulation: string;
  motif?: string;
  commentaire?: string;
  [key: string]: any;
}

const formatDate = (value?: string): string => {
  if (!value) {
    return 'Non renseignée';
  }
  try {
    return new Date(value).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (err) {
    return value;
  }
};

const formatTime = (value?: string): string => value ?? 'Non précisée';

const AppointmentDetailsCard = ({ appointment, group }: AppointmentDetailsCardProps) => {
  const [annulation, setAnnulation] = useState<AnnulationData | null>(null);
  const [loadingAnnulation, setLoadingAnnulation] = useState(false);

  // Charger les informations d'annulation si elles existent
  useEffect(() => {
    const fetchAnnulation = async () => {
      console.log('🔍 Vérification annulation pour RDV:', {
        idRdv: appointment?.idRdv || appointment?.id,
        idEtude: appointment?.idEtude,
        idVolontaire: appointment?.idVolontaire
      });

      if (!appointment?.idEtude || !appointment?.idVolontaire) {
        console.log('⚠️ Données manquantes pour vérifier l\'annulation');
        return;
      }

      const rdvId = appointment?.idRdv || appointment?.id;
      if (!rdvId) {
        console.log('⚠️ idRdv manquant');
        return;
      }

      try {
        setLoadingAnnulation(true);
        console.log('📡 Appel API getByVolontaireAndEtude:', appointment.idVolontaire, appointment.idEtude);
        const annulations = await annulationService.getByVolontaireAndEtude(
          appointment.idVolontaire,
          appointment.idEtude
        );

        console.log('📦 Annulations reçues:', annulations);

        if (Array.isArray(annulations) && annulations.length > 0) {
          // Trouver l'annulation correspondant à ce RDV spécifique
          const rdvAnnulation = annulations.find(
            (a: any) => a.idRdv === rdvId
          );
          console.log('🎯 Annulation trouvée pour ce RDV:', rdvAnnulation);
          if (rdvAnnulation) {
            setAnnulation(rdvAnnulation as AnnulationData);
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement de l\'annulation:', error);
      } finally {
        setLoadingAnnulation(false);
      }
    };

    fetchAnnulation();
  }, [appointment?.idEtude, appointment?.idRdv, appointment?.idVolontaire]);

  if (!appointment) {
    return null;
  }

  const groupLabel = group?.nom ?? group?.intitule ?? group?.nomGroupe;
  const isAnnule = !!annulation;

  return (
    <div className="space-y-4">
      {/* Alerte d'annulation si le RDV est annulé */}
      {isAnnule && annulation && (
        <Alert variant="destructive" className="border-red-300 bg-red-50">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-bold text-red-800 text-base">
                    ⚠️ Ce rendez-vous a été annulé
                  </p>
                  <div className="flex items-center gap-2 text-sm text-red-700">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Annulé le {formatDate(annulation.dateAnnulation)}</span>
                  </div>
                  {(annulation.motif || annulation.commentaire) && (
                    <div className="mt-2 p-2 bg-red-100 border-l-4 border-red-400 rounded">
                      <p className="text-xs font-medium text-red-600 mb-1">Motif :</p>
                      <p className="text-sm text-red-800">
                        {annulation.motif || annulation.commentaire}
                      </p>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      <Card className={isAnnule ? 'border-red-300' : ''}>
        <CardHeader className={isAnnule ? 'bg-red-50/50' : ''}>
          <div className="flex items-center justify-between">
            <CardTitle className={isAnnule ? 'text-red-800' : ''}>
              Détails du rendez-vous
            </CardTitle>
            <div className="flex items-center gap-2">
              {isAnnule && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  ANNULÉ
                </Badge>
              )}
              {appointment.etat && !isAnnule && (
                <Badge variant="outline" className="uppercase">
                  {appointment.etat}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className={isAnnule ? 'bg-red-50/30' : ''}>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <dt className="font-medium text-gray-500">Étude</dt>
              <dd>{appointment.etude?.titre ?? appointment.etudeRef ?? 'Non renseignée'}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Date</dt>
              <dd>{formatDate(appointment.date)}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Heure</dt>
              <dd>{formatTime(appointment.heure)}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Groupe</dt>
              <dd>{groupLabel ?? (appointment.idGroupe ? `Groupe ${appointment.idGroupe}` : 'Non renseigné')}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-medium text-gray-500">Commentaires</dt>
              <dd>{appointment.commentaires ?? 'Aucun commentaire'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentDetailsCard;
