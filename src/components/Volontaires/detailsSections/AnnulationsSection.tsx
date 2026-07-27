import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Loader2, AlertTriangle, Calendar, User, BookOpen, MessageSquare, Pencil, Save, Undo2, X } from 'lucide-react';
import annulationService from '../../../services/annulationService';
import etudeService from '../../../services/etudeService';

interface Annulation {
  id?: number;
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
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [undoingId, setUndoingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [draftCommentaire, setDraftCommentaire] = useState('');
  const [draftAnnulePar, setDraftAnnulePar] = useState<'COSMETEST' | 'VOLONTAIRE'>('VOLONTAIRE');

  useEffect(() => {
    const fetchAnnulations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = (await annulationService.getRecentByVolontaire(Number(volontaireId))) as Annulation[];
        setAnnulations(data);

        // Récupérer la ref de chaque étude unique
        const uniqueEtudeIds = [...new Set(data.map(a => a.idEtude))];
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

  const getAnnulationId = (annulation: Annulation) => annulation.idAnnuler ?? annulation.id;

  const startEditing = (annulation: Annulation) => {
    const id = getAnnulationId(annulation);
    if (!id) return;
    setEditingId(id);
    setDraftCommentaire(annulation.commentaire || '');
    setDraftAnnulePar(
      annulation.annulePar?.toUpperCase() === 'COSMETEST' ? 'COSMETEST' : 'VOLONTAIRE'
    );
    setActionError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraftCommentaire('');
    setActionError(null);
  };

  const saveEditing = async (annulation: Annulation) => {
    const id = getAnnulationId(annulation);
    if (!id) return;

    setSavingId(id);
    setActionError(null);
    try {
      const updated = await annulationService.update(id, {
        commentaire: draftCommentaire.trim(),
        annulePar: draftAnnulePar,
      });
      setAnnulations((current) => current.map((item) =>
        getAnnulationId(item) === id ? { ...item, ...updated } : item
      ));
      setEditingId(null);
    } catch (caught) {
      console.error("Erreur lors de la modification de l'annulation:", caught);
      setActionError("Impossible de modifier l'annulation.");
    } finally {
      setSavingId(null);
    }
  };

  const undoAnnulation = async (annulation: Annulation) => {
    const id = getAnnulationId(annulation);
    if (!id) return;

    const confirmed = window.confirm(
      "Annuler cette annulation et restaurer tous les anciens rendez-vous ? L'opération sera refusée si un horaire n'est plus libre."
    );
    if (!confirmed) return;

    setUndoingId(id);
    setActionError(null);
    setSuccessMessage(null);
    try {
      const result = await annulationService.undo(id);
      setAnnulations((current) => current.filter((item) => getAnnulationId(item) !== id));
      setSuccessMessage(
        `${result.restoredRdvCount} rendez-vous restauré${result.restoredRdvCount > 1 ? 's' : ''}.`
      );
    } catch (caught: unknown) {
      const apiError = (caught as { response?: { data?: { details?: string; message?: string } } })
        .response?.data;
      setActionError(apiError?.details || apiError?.message || "Impossible d'annuler cette annulation.");
    } finally {
      setUndoingId(null);
    }
  };

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
          {successMessage && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              {successMessage}
            </div>
          )}
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

  // Grouper par année et trier par ordre croissant
  const getYear = (dateStr: string): number => {
    if (!dateStr) return 0;
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? 0 : date.getFullYear();
    } catch {
      return 0;
    }
  };

  const sortedAnnulations = [...annulations].sort((a, b) => {
    const dateA = new Date(a.dateAnnulation).getTime() || 0;
    const dateB = new Date(b.dateAnnulation).getTime() || 0;
    return dateA - dateB; // ordre croissant
  });

  const annulationsByYear: Record<number, Annulation[]> = {};
  sortedAnnulations.forEach(a => {
    const year = getYear(a.dateAnnulation);
    if (!annulationsByYear[year]) annulationsByYear[year] = [];
    annulationsByYear[year].push(a);
  });

  const sortedYears = Object.keys(annulationsByYear).map(Number).sort((a, b) => a - b);

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
        {successMessage && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            {successMessage}
          </div>
        )}
        {actionError && (
          <div role="alert" className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {actionError}
          </div>
        )}
        <div className="space-y-6">
          {sortedYears.map(year => (
            <div key={year}>
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-sm font-semibold text-gray-700">{year || 'Date inconnue'}</h4>
                <Badge variant="outline" className="text-xs">{annulationsByYear[year].length}</Badge>
              </div>
              <div className="space-y-3">
                {annulationsByYear[year].map((annulation, index) => (
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
                    {editingId === getAnnulationId(annulation) ? (
                      <div className="mt-4 space-y-4 rounded-lg border bg-white p-4">
                        <div className="space-y-1.5">
                          <label
                            htmlFor={`motif-annulation-${getAnnulationId(annulation)}`}
                            className="text-sm font-medium text-gray-700"
                          >
                            Motif de l'annulation
                          </label>
                          <textarea
                            id={`motif-annulation-${getAnnulationId(annulation)}`}
                            value={draftCommentaire}
                            onChange={(event) => setDraftCommentaire(event.target.value)}
                            rows={3}
                            maxLength={200}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>

                        <fieldset className="space-y-2">
                          <legend className="text-sm font-medium text-gray-700">Annulation faite par</legend>
                          <div className="flex flex-wrap gap-5">
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="radio"
                                name={`annule-par-${getAnnulationId(annulation)}`}
                                checked={draftAnnulePar === 'COSMETEST'}
                                onChange={() => setDraftAnnulePar('COSMETEST')}
                              />
                              Cosmetest
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="radio"
                                name={`annule-par-${getAnnulationId(annulation)}`}
                                checked={draftAnnulePar === 'VOLONTAIRE'}
                                onChange={() => setDraftAnnulePar('VOLONTAIRE')}
                              />
                              La volontaire
                            </label>
                          </div>
                        </fieldset>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            disabled={savingId === getAnnulationId(annulation)}
                            onClick={() => saveEditing(annulation)}
                          >
                            {savingId === getAnnulationId(annulation) ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="mr-2 h-4 w-4" />
                            )}
                            Enregistrer
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={cancelEditing}>
                            <X className="mr-2 h-4 w-4" />
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {annulation.commentaire && (
                          <div className="flex items-start gap-1.5 text-sm text-gray-700">
                            <MessageSquare className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" />
                            <span>{annulation.commentaire}</span>
                          </div>
                        )}
                        {getAnnulationId(annulation) && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => startEditing(annulation)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Modifier l'annulation
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={undoingId !== null}
                              onClick={() => undoAnnulation(annulation)}
                            >
                              {undoingId === getAnnulationId(annulation) ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Undo2 className="mr-2 h-4 w-4" />
                              )}
                              Annuler l'annulation
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnnulationsSection;
