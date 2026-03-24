import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Loader2, AlertTriangle, Calendar, User, BookOpen, MessageSquare } from 'lucide-react';
import annulationService from '../../../services/annulationService';
import etudeService from '../../../services/etudeService';

interface Annulation {
  idAnnuler?: number;
  idVol: number;
  idEtude: number;
  dateAnnulation: string;
  commentaire: string;
  annulePar?: string;
}

interface AnnulationsSectionProps {
  volontaireId: string | number;
}

const AnnulationsSection = ({ volontaireId }: AnnulationsSectionProps) => {
  const { t } = useTranslation();
  const [annulations, setAnnulations] = useState<Annulation[]>([]);
  const [etudeRefs, setEtudeRefs] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnulations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await annulationService.getRecentByVolontaire(Number(volontaireId));
        setAnnulations(data as Annulation[]);

        // Récupérer la ref de chaque étude unique
        const uniqueEtudeIds = [...new Set((data as Annulation[]).map(a => a.idEtude))];
        const refs: Record<number, string> = {};
        await Promise.all(
          uniqueEtudeIds.map(async (idEtude) => {
            try {
              const etude = await etudeService.getById(idEtude);
              refs[idEtude] = etude.ref;
            } catch {
              refs[idEtude] = `#${idEtude}`;
            }
          })
        );
        setEtudeRefs(refs);
      } catch (err) {
        console.error('Erreur lors du chargement des annulations:', err);
        setError('Erreur lors du chargement des annulations');
      } finally {
        setIsLoading(false);
      }
    };

    if (volontaireId) {
      fetchAnnulations();
    }
  }, [volontaireId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (annulations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('volunteers.cancellations', 'Annulations')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            {t('volunteers.noCancellations', 'Aucune annulation enregistrée pour ce volontaire.')}
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getAnnuleParBadge = (annulePar?: string) => {
    if (!annulePar) return null;
    const isVolontaire = annulePar === 'VOLONTAIRE' || annulePar === 'Volontaire';
    return (
      <Badge variant={isVolontaire ? 'outline' : 'destructive'} className="text-xs">
        {isVolontaire ? 'Volontaire' : 'Cosmetest'}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {t('volunteers.cancellations', 'Annulations')}
            <Badge variant="secondary">{annulations.length}</Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {annulations.map((annulation, index) => (
            <div
              key={annulation.idAnnuler ?? index}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">{formatDate(annulation.dateAnnulation)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span>{t('studies.study', 'Étude')} {etudeRefs[annulation.idEtude] || `#${annulation.idEtude}`}</span>
                </div>
                {annulation.annulePar && (
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4 text-gray-400" />
                    {getAnnuleParBadge(annulation.annulePar)}
                  </div>
                )}
              </div>
              {annulation.commentaire && (
                <div className="flex items-start gap-1.5 text-sm text-gray-700">
                  <MessageSquare className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" />
                  <span>{annulation.commentaire}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnnulationsSection;
