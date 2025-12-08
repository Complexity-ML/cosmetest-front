import { calculatePaiementStats, Paiement } from '../../hooks/usePaiements';
import annulationService from '../../services/annulationService';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface PaiementSummaryProps {
  paiements?: Paiement[];
  etudeId?: number | null;
  showDetails?: boolean;
  excludeAnnules?: boolean;
}

type AnnulationsData = Record<string, boolean>;

/**
 * Composant pour afficher un résumé rapide des paiements
 * MODIFIÉ pour exclure les volontaires annulés
 */
const PaiementSummary = ({
  paiements = [],
  etudeId = null,
  showDetails = false,
  excludeAnnules = true // NOUVEAU : option pour exclure les annulés
}: PaiementSummaryProps) => {
  const { t } = useTranslation();
  const [annulationsInfo, setAnnulationsInfo] = useState<AnnulationsData>({});
  const [isLoading, setIsLoading] = useState(false);

  // NOUVEAU : Charger les annulations si nécessaire
  useEffect(() => {
    const loadAnnulations = async () => {
      if (!excludeAnnules || !etudeId || paiements.length === 0) {
        return;
      }

      setIsLoading(true);
      try {
        const annulations = await annulationService.getByEtude(etudeId);

        const annulationsData: AnnulationsData = {};
        annulations.forEach(annulation => {
          const key = `${annulation.idEtude}_${annulation.idVol}`;
          annulationsData[key] = true;
        });

        setAnnulationsInfo(annulationsData);
      } catch (error) {
        console.error('Erreur lors du chargement des annulations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnnulations();
  }, [etudeId, paiements.length, excludeAnnules]);

  // MODIFIÉ : Filtrer les paiements en excluant les annulés si demandé
  const paiementsFiltres = excludeAnnules && etudeId 
    ? paiements.filter(p => {
        const key = `${etudeId}_${p.idVolontaire}`;
        return !annulationsInfo[key];
      })
    : paiements;

  const stats = calculatePaiementStats(paiementsFiltres);
  
  // NOUVEAU : Statistiques des annulés
  const paiementsAnnules = excludeAnnules && etudeId
    ? paiements.filter(p => {
        const key = `${etudeId}_${p.idVolontaire}`;
        return annulationsInfo[key];
      })
    : [];

  const statsAnnules = calculatePaiementStats(paiementsAnnules);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-400"></div>
        <span>{t('common.loading')}</span>
      </div>
    );
  }

  if (!showDetails) {
    return (
      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
            {t('payments.paid')}
          </span>
          <span className="text-green-600 font-medium">
            {stats.payes}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-1.5"></span>
            {t('payments.unpaid')}
          </span>
          <span className="text-red-600 font-medium">
            {stats.nonPayes}
          </span>
        </div>
        {stats.enAttente > 0 && (
          <span className="text-yellow-600 font-medium">
            {t('payments.pendingCount', { count: stats.enAttente })}
          </span>
        )}
        {/* NOUVEAU : Affichage des annulés */}
        {excludeAnnules && statsAnnules.total > 0 && (
          <span className="text-gray-600 font-medium">
            {t('payments.cancelledCount', { count: statsAnnules.total })}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* NOUVEAU : Info sur exclusion des annulés */}
      {excludeAnnules && statsAnnules.total > 0 && (
        <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          {t('payments.volunteersExcluded', { count: statsAnnules.total, amount: statsAnnules.montantTotal.toFixed(0) })}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="text-center p-2 bg-green-50 rounded">
          <div className="text-lg font-bold text-green-800">{stats.payes}</div>
          <div className="text-xs text-green-600">{t('payments.paid')}</div>
          <div className="text-xs text-green-700">{stats.montantPaye.toFixed(0)}€</div>
        </div>
        <div className="text-center p-2 bg-red-50 rounded">
          <div className="text-lg font-bold text-red-800">{stats.nonPayes}</div>
          <div className="text-xs text-red-600">{t('payments.unpaid')}</div>
          <div className="text-xs text-red-700">{stats.montantRestant.toFixed(0)}€</div>
        </div>
        <div className="text-center p-2 bg-yellow-50 rounded">
          <div className="text-lg font-bold text-yellow-800">{stats.enAttente}</div>
          <div className="text-xs text-yellow-600">{t('payments.pending')}</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="text-lg font-bold text-gray-800">{stats.total}</div>
          <div className="text-xs text-gray-600">{excludeAnnules ? t('payments.totalActive') : t('common.total')}</div>
          <div className="text-xs text-gray-700">{stats.montantTotal.toFixed(0)}€</div>
        </div>
      </div>

      {/* NOUVEAU : Section séparée pour les annulés */}
      {excludeAnnules && statsAnnules.total > 0 && (
        <div className="border-t pt-2">
          <div className="text-center p-2 bg-gray-100 rounded">
            <div className="text-lg font-bold text-gray-700">{statsAnnules.total}</div>
            <div className="text-xs text-gray-600">{t('payments.cancelledExcludedLabel')}</div>
            <div className="text-xs text-gray-700">{statsAnnules.montantTotal.toFixed(0)}€</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaiementSummary;
