import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import etudeService from '../../services/etudeService';
import etudeVolontaireService from '../../services/etudeVolontaireService';
import { SearchIcon, UserIcon } from './icons';
import { EVALUATION_FIELDS } from './constants';
import {
  createInitialFilters,
  normaliserPhototype,
  normaliserSexe,
  normaliserEthnies,
  calculerScoreEthnie,
  parseEvaluation,
  calculerAge,
  calculerScoreMaquillage,
  computeStats,
  type Filters,
  type MakeupFilters,
  type EvaluationFilters
} from './utils';
import { CriteriaPanel, CustomCriterion } from './CriteriaComponents';
import { ResultsTable, StatsGrid } from './ResultsComponents';
import BulkEmailModal from './BulkEmailModal';

interface VolontaireResult {
  id: any;
  nom: string;
  prenom: string;
  email: string;
  sexe: string;
  age: number | null;
  phototype: string;
  scoreMaquillage: number;
  scoreDemographique: number;
  scoreTotal: number;
  makeupCriteriaSelected: boolean;
  evaluations: {
    globale: number | null;
    yeux: number | null;
    levres: number | null;
    teint: number | null;
    cynetique: number | null;
  };
  details: any;
}

const MatchingSystem = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<Filters>(createInitialFilters());
  const [results, setResults] = useState<VolontaireResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'criteres' | 'resultats'>('criteres');
  const [error, setError] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedVolontaires, setSelectedVolontaires] = useState<any[]>([]);
  const [customCriteria, setCustomCriteria] = useState<CustomCriterion[]>([]);

  const makeupSelectionCount =
    filters.makeup.visage.length +
    filters.makeup.yeux.length +
    filters.makeup.levres.length;

  const stats = computeStats(results);

  const formatNote = (note: any, fallback = t('reports.matching.notProvided')): string => (
    Number.isFinite(note) ? `${Number(note).toFixed(1)}/5` : fallback
  );

  const handleAgeChange = (field: string, value: string) => {
    const parsed = Number.parseInt(value, 10);
    setFilters((prev) => ({
      ...prev,
      demographics: {
        ...prev.demographics,
        [field]: Number.isNaN(parsed) ? prev.demographics[field as keyof typeof prev.demographics] : parsed
      }
    }));
  };

  const handleSexChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      demographics: {
        ...prev.demographics,
        sexe: value
      }
    }));
  };

  const handleExcludeEtudeRefChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      demographics: {
        ...prev.demographics,
        excludeEtudeRef: value
      }
    }));
  };

  const togglePhototype = (phototype: string) => {
    setFilters((prev) => {
      const exists = prev.demographics.phototypes.includes(phototype);
      return {
        ...prev,
        demographics: {
          ...prev.demographics,
          phototypes: exists
            ? prev.demographics.phototypes.filter((type: string) => type !== phototype)
            : [...prev.demographics.phototypes, phototype]
        }
      };
    });
  };

  const toggleEthnie = (ethnie: string) => {
    setFilters((prev) => {
      const exists = prev.demographics.ethnies.includes(ethnie);
      return {
        ...prev,
        demographics: {
          ...prev.demographics,
          ethnies: exists
            ? prev.demographics.ethnies.filter((e: string) => e !== ethnie)
            : [...prev.demographics.ethnies, ethnie]
        }
      };
    });
  };

  const toggleMakeupOption = (category: string, value: string) => {
    setFilters((prev) => {
      const current = prev.makeup[category as keyof MakeupFilters];
      const exists = current.includes(value);
      return {
        ...prev,
        makeup: {
          ...prev.makeup,
          [category]: exists
            ? current.filter((item: string) => item !== value)
            : [...current, value]
        }
      };
    });
  };

  const handleEvaluationThresholdChange = (key: string, type: 'min' | 'max', value: string) => {
    if (value === '') {
      setFilters((prev) => ({
        ...prev,
        evaluations: {
          ...prev.evaluations,
          [key]: {
            ...prev.evaluations[key as keyof EvaluationFilters],
            [type]: null
          }
        }
      }));
      return;
    }

    const parsed = Number.parseFloat(value);
    if (Number.isNaN(parsed)) {
      return;
    }

    const clamped = Math.min(5, Math.max(0, Math.round(parsed)));

    setFilters((prev) => ({
      ...prev,
      evaluations: {
        ...prev.evaluations,
        [key]: {
          ...prev.evaluations[key as keyof EvaluationFilters],
          [type]: clamped
        }
      }
    }));
  };

  const resetFilters = () => {
    setFilters(createInitialFilters());
    setCustomCriteria([]);
    setResults([]);
  };

  // Gestion des critères personnalisés
  const handleAddCustomCriterion = () => {
    const newCriterion: CustomCriterion = {
      id: `custom-${Date.now()}`,
      label: '',
      filter: ''
    };
    setCustomCriteria((prev) => [...prev, newCriterion]);
  };

  const handleRemoveCustomCriterion = (id: string) => {
    setCustomCriteria((prev) => prev.filter((c) => c.id !== id));
  };

  const handleChangeCustomCriterion = (id: string, field: 'label' | 'filter', value: string) => {
    setCustomCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleContactAll = (volontaires: any[]) => {
    setSelectedVolontaires(volontaires);
    setShowEmailModal(true);
  };

  const handleEmailSent = (info: { count: number; method: string }) => {
    console.log(`Emails envoyés à ${info.count} volontaires via ${info.method}`);
    // Optionnel: afficher une notification de succès
  };

  const executerMatching = async () => {
    setError('');

    if (filters.demographics.ageMin > filters.demographics.ageMax) {
      setError(t('reports.matching.ageError'));
      setActiveTab('criteres');
      return;
    }

    setLoading(true);

    try {
      // Get all volunteers IDs first (excluding archived ones)
      let allVolontairesIds = [];
      let page = 0;
      let hasMore = true;

      while (hasMore) {
        const responseIds = await api.get(`/volontaires?page=${page}&size=1000&includeArchived=false`);
        const idsData = responseIds.data?.content || [];
        allVolontairesIds.push(...idsData);
        hasMore = !responseIds.data?.last;
        page++;
      }

      // Get detailed data for each volunteer using the correct route with limited concurrency
      const volontairesDetails = [];
      const batchSize = 10; // Limit concurrent requests

      for (let i = 0; i < allVolontairesIds.length; i += batchSize) {
        const batch = allVolontairesIds.slice(i, i + batchSize);
        const batchPromises = batch
          .filter((vol) => vol && vol.idVol)
          .map(async (vol) => {
            try {
              const response = await api.get(`/volontaires/details/${vol.idVol}`);
              return response.data;
            } catch (error) {
              console.error(`Erreur lors de la récupération du volontaire ${vol.idVol}:`, error);
              return null;
            }
          });

        const batchResults = await Promise.all(batchPromises);
        volontairesDetails.push(...batchResults);
      }
      let volontaires = volontairesDetails.filter((vol) => vol !== null);

      // Exclude volunteers already enrolled in the specified study
      const excludeRef = filters.demographics.excludeEtudeRef.trim();
      console.log('[Exclude Study] Valeur du champ excludeEtudeRef:', JSON.stringify(excludeRef));
      if (excludeRef) {
        try {
          console.log('[Exclude Study] Appel getByRef avec:', excludeRef);
          const etude = await etudeService.getByRef(excludeRef);
          console.log('[Exclude Study] Étude trouvée:', JSON.stringify(etude));
          const etudeId = etude.idEtude ?? etude.id;
          console.log('[Exclude Study] etudeId résolu:', etudeId);
          if (etudeId) {
            const associations = await etudeVolontaireService.getVolontairesByEtude(etudeId);
            console.log('[Exclude Study] Associations brutes:', JSON.stringify(associations));
            const associationsList = Array.isArray(associations) ? associations : (associations?.data || associations?.content || []);
            const enrolledIds = new Set(
              associationsList
                .filter((a: any) => a.statut !== 'ANNULE')
                .map((a: any) => Number(a.idVolontaire))
            );
            console.log('[Exclude Study] IDs à exclure:', [...enrolledIds]);
            const before = volontaires.length;
            volontaires = volontaires.filter((vol) => !enrolledIds.has(Number(vol.idVol)));
            console.log(`[Exclude Study] ${before - volontaires.length} volontaires exclus (${before} → ${volontaires.length})`);
          }
        } catch (err) {
          console.error(`[Exclude Study] ERREUR pour ref "${excludeRef}":`, err);
        }
      } else {
        console.log('[Exclude Study] Champ vide, pas d\'exclusion');
      }

      // Get habits cosmétiques
      const responseHC = await api.get('/volontaires-hc');
      const hcRaw = Array.isArray(responseHC.data)
        ? responseHC.data
        : responseHC.data?.content || [];

      const habitudes = hcRaw.filter((item: any) => item && item.idVol);

      const habitudesMap = new Map();
      habitudes.forEach((entry: any) => {
        if (!habitudesMap.has(entry.idVol)) {
          habitudesMap.set(entry.idVol, entry);
        }
      });

      const phototypeSet = new Set(
        filters.demographics.phototypes.map((item: string) => normaliserPhototype(item))
      );
      const ethnieSet = new Set(
        filters.demographics.ethnies.map((item: string) => normaliserEthnies(item)[0] || item.toUpperCase())
      );
      const sexeCritere = normaliserSexe(filters.demographics.sexe);
      const hasMakeupCriteria = makeupSelectionCount > 0;
      const hasEthnieCriteria = ethnieSet.size > 0;

      const matches = volontaires
        .filter((volontaire) => {
          // Exclude archived volunteers - handle multiple formats
          const archiveValue = volontaire.archive;
          if (archiveValue === true ||
              archiveValue === 1 ||
              archiveValue === '1' ||
              archiveValue === 'true' ||
              archiveValue === 'TRUE') {
            return false;
          }

          const age = calculerAge(volontaire.dateNaissance);
          const phototypeVolontaire = normaliserPhototype(volontaire.phototype);
          const ethniesVolontaire = normaliserEthnies(volontaire.ethnie);
          const sexeVolontaire = normaliserSexe(volontaire.sexe);

          // Age filter - HARD FILTER
          if (!Number.isFinite(age) || age < filters.demographics.ageMin || age > filters.demographics.ageMax) {
            return false;
          }

          // Phototype filter - HARD FILTER
          if (phototypeSet.size > 0 && !phototypeSet.has(phototypeVolontaire)) {
            return false;
          }

          // Ethnie filter - SOFT FILTER (au moins une ethnie doit matcher pour apparaître)
          if (hasEthnieCriteria) {
            const scoreEthnie = calculerScoreEthnie(ethniesVolontaire, ethnieSet);
            if (scoreEthnie === 0) {
              return false; // Aucune ethnie ne match, on exclut
            }
          }

          // Sex filter - HARD FILTER
          if (sexeCritere && sexeCritere !== sexeVolontaire) {
            return false;
          }

          // Custom criteria filter - SOFT FILTER (recherche texte dans les données du volontaire)
          if (customCriteria.length > 0) {
            const volontaireString = JSON.stringify(volontaire).toLowerCase();
            for (const criterion of customCriteria) {
              if (criterion.filter && criterion.filter.trim() !== '') {
                const filterValue = criterion.filter.toLowerCase().trim();
                if (!volontaireString.includes(filterValue)) {
                  return false;
                }
              }
            }
          }

          return true;
        })
        .map((volontaire) => {
          const age = calculerAge(volontaire.dateNaissance);
          const habitudesVolontaire = habitudesMap.get(volontaire.idVol);
          const ethniesVolontaire = normaliserEthnies(volontaire.ethnie);

          // Calculer le score d'ethnie (100% si pas de critère, sinon ratio de match)
          const scoreEthnie = hasEthnieCriteria
            ? calculerScoreEthnie(ethniesVolontaire, ethnieSet) * 100
            : 100;

          // Le score démographique prend en compte le score d'ethnie
          const scoreDemo = scoreEthnie;

          const scoreMaquillage = calculerScoreMaquillage(habitudesVolontaire, filters.makeup) * 100;
          const scoreTotal = hasMakeupCriteria
            ? scoreMaquillage * 0.8 + scoreDemo * 0.2
            : scoreDemo;

          const evaluationValues = {
            globale: parseEvaluation(volontaire.notes),
            yeux: parseEvaluation(volontaire.notesYeux),
            levres: parseEvaluation(volontaire.notesLevres),
            teint: parseEvaluation(volontaire.notesTeint),
            cynetique: parseEvaluation(volontaire.notesCynetique)
          };

          const passesEvaluations = EVALUATION_FIELDS.every(({ key }: { key: string }) => {
            const thresholds = filters.evaluations[key as keyof EvaluationFilters];
            if (!thresholds || (thresholds.min === null && thresholds.max === null)) {
              return true;
            }
            const note = evaluationValues[key as keyof typeof evaluationValues];

            // Debug logging
            if (volontaire.idVol <= 3) {
              console.log(`Volontaire ${volontaire.idVol} - All fields:`, {
                notes: volontaire.notes,
                notesYeux: volontaire.notesYeux,
                notesLevres: volontaire.notesLevres,
                notesTeint: volontaire.notesTeint,
                notesCynetique: volontaire.notesCynetique,
                allVolontaireFields: Object.keys(volontaire)
              });
            }

            if (typeof note !== 'number') {
              return false;
            }

            // Check min threshold
            if (thresholds.min !== null && note < thresholds.min) {
              return false;
            }

            // Check max threshold
            if (thresholds.max !== null && note > thresholds.max) {
              return false;
            }

            return true;
          });

          if (!passesEvaluations) {
            return null;
          }

          if (!Number.isFinite(scoreTotal) || scoreTotal <= 0) {
            return null;
          }

          return {
            id: volontaire.idVol,
            nom: volontaire.nomVol || t('reports.matching.notDefined'),
            prenom: volontaire.prenomVol || t('reports.matching.notDefined'),
            email: volontaire.emailVol || t('reports.matching.notDefined'),
            sexe: volontaire.sexe || t('reports.matching.notDefined'),
            age: Number.isFinite(age) ? age : null,
            phototype: volontaire.phototype || t('reports.matching.notDefined'),
            scoreMaquillage: Math.min(100, Math.round(scoreMaquillage)),
            scoreDemographique: Math.min(100, Math.round(scoreDemo)),
            scoreTotal: Math.min(100, Math.round(scoreTotal)),
            makeupCriteriaSelected: hasMakeupCriteria,
            evaluations: evaluationValues,
            details: volontaire
          };
        })
        .filter((item) => item !== null)
        .sort((a, b) => b.scoreTotal - a.scoreTotal);

      setResults(matches);

      if (!matches.length) {
        setActiveTab('criteres');
        setError(t('reports.matching.noVolunteerMatch'));
      } else {
        setActiveTab('resultats');
      }
    } catch (err) {
      console.error('Erreur lors du matching:', err);
      setError(t('reports.matching.matchingError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-3 px-6 font-medium text-sm ${
                activeTab === 'criteres'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('criteres')}
            >
              <div className="flex items-center">
                <SearchIcon />
                <span className="ml-2">{t('reports.matching.matchingCriteria')}</span>
              </div>
            </button>
            <button
              className={`py-3 px-6 font-medium text-sm ${
                activeTab === 'resultats'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('resultats')}
            >
              <div className="flex items-center">
                <UserIcon />
                <span className="ml-2">{t('reports.matching.resultsTab')} ({results.length})</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            activeTab === 'criteres' ? (
              <CriteriaPanel
                filters={{
                  demographics: {
                    ageMin: String(filters.demographics.ageMin),
                    ageMax: String(filters.demographics.ageMax),
                    sexe: filters.demographics.sexe,
                    phototypes: filters.demographics.phototypes,
                    ethnies: filters.demographics.ethnies,
                    excludeEtudeRef: filters.demographics.excludeEtudeRef
                  },
                  makeup: filters.makeup,
                  evaluations: Object.entries(filters.evaluations).reduce((acc, [key, val]) => ({
                    ...acc,
                    [key]: {
                      min: val.min !== null ? String(val.min) : undefined,
                      max: val.max !== null ? String(val.max) : undefined
                    }
                  }), {}),
                  customCriteria: customCriteria
                }}
                onAgeChange={handleAgeChange}
                onSexChange={handleSexChange}
                onPhototypeToggle={togglePhototype}
                onEthnieToggle={toggleEthnie}
                onExcludeEtudeRefChange={handleExcludeEtudeRefChange}
                onMakeupToggle={toggleMakeupOption}
                onEvaluationChange={handleEvaluationThresholdChange}
                onAddCustomCriterion={handleAddCustomCriterion}
                onRemoveCustomCriterion={handleRemoveCustomCriterion}
                onChangeCustomCriterion={handleChangeCustomCriterion}
                onExecute={executerMatching}
                onReset={resetFilters}
                makeupCount={makeupSelectionCount}
                loading={loading}
              />
            ) : (
              <div className="space-y-6">
                <StatsGrid 
                  stats={{
                    high: stats.high,
                    mid: stats.mid,
                    low: stats.low,
                    avgScore: parseFloat(stats.avgScore),
                    avgNotes: Object.entries(stats.avgNotes).reduce((acc, [key, val]) => ({
                      ...acc,
                      [key]: val !== null ? parseFloat(val) : 0
                    }), {})
                  }} 
                  formatNote={formatNote} 
                />
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setActiveTab('criteres')}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {t('reports.matching.backToFilters')}
                  </button>
                  <button
                    onClick={() => handleContactAll(results)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {t('reports.matching.contactAll')} ({results.length})
                  </button>
                </div>
                <ResultsTable 
                  results={results.map(r => ({
                    id: r.id,
                    nom: r.nom,
                    prenom: r.prenom,
                    email: r.email,
                    age: r.age ?? undefined,
                    phototype: r.phototype,
                    scoreTotal: r.scoreTotal,
                    evaluations: Object.entries(r.evaluations).reduce((acc, [key, val]) => ({
                      ...acc,
                      [key]: val ?? 0
                    }), {})
                  }))} 
                  formatNote={formatNote} 
                />
              </div>
            )
          )}
        </div>
      </div>

      {/* Modal d'envoi d'emails */}
      <BulkEmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        selectedVolontaires={selectedVolontaires}
        onEmailSent={handleEmailSent}
      />
    </div>
  );
};


export default MatchingSystem;

