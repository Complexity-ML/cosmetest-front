import { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import infoBancaireService from '../../services/infoBancaireService';
import annulationService from '../../services/annulationService'; // NOUVEAU
import { Paiement } from '../../hooks/usePaiements';
import type { EtudeData } from '../../types/etude.types';
import type { VolontaireData } from '../../types/volontaire.types';
import type { InfoBancaire } from '../../types/types';

/**
 * Composant pour exporter les fiches de paiement en Excel
 * MODIFIÉ pour exclure automatiquement les volontaires annulés
 */
interface ExcelExportProps {
  etude: EtudeData | null;
  paiements: Paiement[];
  volontairesInfo: Record<number, VolontaireData>;
}

interface AnnulationsInfo {
  [key: string]: boolean;
}

interface BankingData {
  [key: number]: InfoBancaire | null;
}

const ExcelExport = ({
  etude,
  paiements,
  volontairesInfo
}: ExcelExportProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [annulationsInfo, setAnnulationsInfo] = useState<AnnulationsInfo>({}); // NOUVEAU : Cache des annulations
  const [isLoadingAnnulations, setIsLoadingAnnulations] = useState(false); // NOUVEAU

  // NOUVEAU : Fonction pour vérifier si un volontaire est annulé
  const isVolontaireAnnule = (idVolontaire: number): boolean => {
    const key = `${etude?.idEtude}_${idVolontaire}`;
    return annulationsInfo[key] === true;
  };

  // NOUVEAU : Charger les annulations pour l'étude
  const loadAnnulations = async () => {
    if (!etude?.idEtude) return;

    setIsLoadingAnnulations(true);
    try {
      const annulations = await annulationService.getByEtude(etude.idEtude);

      const annulationsData: AnnulationsInfo = {};
      annulations.forEach((annulation: any) => {
        const key = `${annulation.idEtude}_${annulation.idVol}`;
        annulationsData[key] = true;
      });

      setAnnulationsInfo(annulationsData);
    } catch (error) {
      console.error('Erreur lors du chargement des annulations:', error);
      // En cas d'erreur, on continue sans les annulations
      setAnnulationsInfo({});
    } finally {
      setIsLoadingAnnulations(false);
    }
  };

  // NOUVEAU : Charger les annulations quand l'étude change
  useEffect(() => {
    loadAnnulations();
  }, [etude?.idEtude]);

  // MODIFIÉ : Filtrer les paiements pour exclure les annulés
  const paiementsActifs = useMemo(() => {
    if (!paiements || !etude?.idEtude) return [];

    return paiements.filter((paiement: Paiement) => !isVolontaireAnnule(paiement.idVolontaire));
  }, [paiements, annulationsInfo, etude?.idEtude]);

  // NOUVEAU : Statistiques incluant les annulés
  const statistiques = useMemo(() => {
    const total = paiements?.length || 0;
    const actifs = paiementsActifs.length;
    const annules = total - actifs;

    return {
      total,
      actifs,
      annules,
      payes: paiementsActifs.filter((p: Paiement) => p.paye === 1).length,
      nonPayes: paiementsActifs.filter((p: Paiement) => p.paye === 0).length,
      enAttente: paiementsActifs.filter((p: Paiement) => p.paye === 2).length,
      montantTotal: paiementsActifs.reduce((sum: number, p: Paiement) => sum + (p.iv || 0), 0),
      montantPaye: paiementsActifs.filter((p: Paiement) => p.paye === 1).reduce((sum: number, p: Paiement) => sum + (p.iv || 0), 0),
      montantAnnules: paiements ? paiements.filter((p: Paiement) => isVolontaireAnnule(p.idVolontaire)).reduce((sum: number, p: Paiement) => sum + (p.iv || 0), 0) : 0
    };
  }, [paiements, paiementsActifs, isVolontaireAnnule]);

  /**
   * Récupère les informations bancaires pour tous les volontaires actifs
   */
  const loadBankingInfo = async (volontaireIds: number[]): Promise<BankingData> => {
    try {
      const bankingData: BankingData = {};
      const results = await Promise.allSettled(
        volontaireIds.map(async (volontaireId: number) => {
          try {
            const response = await infoBancaireService.getByVolontaireId(volontaireId);
            const bankInfo = response.data && response.data.length > 0 ? response.data[0] : null;
            return { id: volontaireId, bankInfo };
          } catch (error) {
            console.warn(`Info bancaire non trouvée pour volontaire ${volontaireId}:`, error);
            return { id: volontaireId, bankInfo: null };
          }
        })
      );

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          bankingData[result.value.id] = result.value.bankInfo;
        }
      });
      return bankingData;
    } catch (error) {
      console.error('Erreur lors du chargement des informations bancaires:', error);
      throw error;
    }
  };

  /**
   * MODIFIÉ : Formate les données pour l'export Excel (seulement les actifs)
   */
  const formatDataForExcel = (paiementsActifs: Paiement[], bankingData: BankingData) => {
    return paiementsActifs.map((paiement: Paiement, index: number) => {
      const volontaire = volontairesInfo[paiement.idVolontaire];
      const bankInfo = bankingData[paiement.idVolontaire];

      // Extraction des noms/prénoms avec plusieurs possibilités
      const prenom = volontaire?.prenom || volontaire?.prenomVol || '';
      const nom = volontaire?.nom || volontaire?.nomVol || '';

      return {
        'N°': index + 1,
        'Nom': nom || 'Non renseigné',
        'Prénom': prenom || 'Non renseigné',
        'IBAN': bankInfo?.iban ? infoBancaireService.validation.formatIban(bankInfo.iban) : 'Non renseigné',
        'BIC': bankInfo?.bic || 'Non renseigné',
        'Montant (€)': paiement.iv || 0,
        'Remarques': bankInfo ? '' : '⚠️ Info bancaire manquante'
      };
    });
  };

  /**
   * MODIFIÉ : Génère et télécharge le fichier Excel avec exclusion des annulés
   */
  const handleExport = async () => {
    if (!etude || !paiementsActifs || paiementsActifs.length === 0) {
      setExportError('Aucune donnée active à exporter');
      return;
    }

    setIsExporting(true);
    setExportError('');

    try {
      // 1. Récupérer les IDs uniques des volontaires actifs seulement
      const volontaireIds = [...new Set(paiementsActifs.map((p: Paiement) => p.idVolontaire).filter((id: number) => id))];

      if (volontaireIds.length === 0) {
        throw new Error('Aucun volontaire actif trouvé dans les paiements');
      }

      // 2. Charger les informations bancaires
      const bankingData = await loadBankingInfo(volontaireIds);

      // 3. Formater les données (seulement les actifs)
      const excelData = formatDataForExcel(paiementsActifs, bankingData);

      // 4. Créer le workbook Excel
      const wb = XLSX.utils.book_new();

      // Feuille principale avec les données
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Définir la largeur des colonnes
      const columnWidths = [
        { wch: 5 },   // N°
        { wch: 20 },  // Nom
        { wch: 20 },  // Prénom
        { wch: 35 },  // IBAN
        { wch: 15 },  // BIC
        { wch: 12 },  // Montant
        { wch: 25 }   // Remarques
      ];
      ws['!cols'] = columnWidths;

      // Ajouter la feuille au workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Fiches de Paiement');

      // 5. MODIFIÉ : Créer une feuille de résumé avec info sur les annulés
      const summaryData = [
        ['FICHE DE PAIEMENT - ÉTUDE'],
        [''],
        ['Référence Étude:', etude.ref || 'Non définie'],
        ['Titre:', etude.titre || 'Non défini'],
        ['Date d\'export:', new Date().toLocaleDateString('fr-FR')],
        ['Heure d\'export:', new Date().toLocaleTimeString('fr-FR')],
        [''],
        ['STATISTIQUES - VOLONTAIRES ACTIFS UNIQUEMENT'],
        [''],
        ['Nombre total de volontaires dans l\'étude:', statistiques.total],
        ['Nombre de volontaires actifs (exportés):', statistiques.actifs],
        ['Nombre de volontaires annulés (exclus):', statistiques.annules],
        [''],
        ['PAIEMENTS ACTIFS'],
        [''],
        ['Nombre de paiements payés:', statistiques.payes],
        ['Nombre de paiements non payés:', statistiques.nonPayes],
        ['Nombre de paiements en attente:', statistiques.enAttente],
        [''],
        ['MONTANTS ACTIFS'],
        [''],
        ['Montant total actif:', `${statistiques.montantTotal.toFixed(2)} €`],
        ['Montant payé:', `${statistiques.montantPaye.toFixed(2)} €`],
        ['Montant restant à payer:', `${(statistiques.montantTotal - statistiques.montantPaye).toFixed(2)} €`],
        [''],
        ['MONTANTS EXCLUS'],
        [''],
        ['Montant des volontaires annulés (exclu):', `${statistiques.montantAnnules.toFixed(2)} €`],
        [''],
        ['INFORMATIONS BANCAIRES'],
        [''],
        ['Volontaires avec RIB complet:', Object.values(bankingData).filter(b => b && b.iban && b.bic).length],
        ['Volontaires sans RIB:', Object.values(bankingData).filter(b => !b).length],
        [''],
        ['IMPORTANT'],
        [''],
        ['⚠️ Les volontaires annulés sont automatiquement exclus de cet export'],
        ['⚠️ Seuls les volontaires actifs sont inclus dans les calculs'],
        ['⚠️ Les montants des volontaires annulés ne sont pas comptabilisés']
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      wsSummary['!cols'] = [{ wch: 30 }, { wch: 40 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Résumé');

      // 6. MODIFIÉ : Générer le nom de fichier avec indication des actifs
      const fileName = `Fiches_Paiement_Actifs_${etude.ref || 'Etude'}_${new Date().toISOString().split('T')[0]}.xlsx`;

      // 7. Télécharger le fichier
      XLSX.writeFile(wb, fileName);

      // NOUVEAU : Message de succès avec info sur les exclusions
      if (statistiques.annules > 0) {
        alert(`Export réussi !\n\n${statistiques.actifs} volontaires actifs exportés\n${statistiques.annules} volontaires annulés exclus\n\nMontant total actif : ${statistiques.montantTotal.toFixed(2)}€\nMontant exclu : ${statistiques.montantAnnules.toFixed(2)}€`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setExportError(`Erreur lors de l'export: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (!etude) {
    return null;
  }

  // Affichage pendant le chargement des annulations
  if (isLoadingAnnulations) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-3"></div>
          <span className="text-gray-600">Vérification des annulations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Export Excel - Fiches de Paiement (Actifs)
          </h3>
          <p className="text-sm text-gray-600">
            Étude: <span className="font-medium">{etude.ref}</span>
            {statistiques.actifs > 0 && (
              <span className="ml-2">• {statistiques.actifs} paiement{statistiques.actifs !== 1 ? 's' : ''} actif{statistiques.actifs !== 1 ? 's' : ''}</span>
            )}
            {statistiques.annules > 0 && (
              <span className="ml-2 text-red-600">• {statistiques.annules} annulé{statistiques.annules !== 1 ? 's' : ''} (exclu{statistiques.annules !== 1 ? 's' : ''})</span>
            )}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {exportError && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded">
              {exportError}
            </div>
          )}
          
          <button
            onClick={handleExport}
            disabled={isExporting || !paiementsActifs || paiementsActifs.length === 0}
            className={`
              inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md
              ${isExporting || !paiementsActifs || paiementsActifs.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
              }
              transition-colors duration-200
            `}
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Export en cours...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exporter Excel
                {statistiques.actifs > 0 && (
                  <span className="ml-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {statistiques.actifs}
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>

      {/* MODIFIÉ : Informations sur l'export avec alerte annulés */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        {/* NOUVEAU : Alerte si des volontaires sont annulés */}
        {statistiques.annules > 0 && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-red-700">
                <strong>Attention :</strong> {statistiques.annules} volontaire{statistiques.annules !== 1 ? 's' : ''} annulé{statistiques.annules !== 1 ? 's' : ''} 
                {statistiques.annules === 1 ? ' est automatiquement exclu' : ' sont automatiquement exclus'} de l'export.
                <br />
                Montant exclu : {statistiques.montantAnnules.toFixed(2)}€
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Le fichier contiendra :</strong> Nom, Prénom, IBAN, BIC, Montant</p>
          <p><strong>Exclusions automatiques :</strong> Volontaires annulés (non comptabilisés)</p>
          <p><strong>Note :</strong> Les volontaires sans RIB seront signalés dans la colonne "Remarques"</p>
        </div>
      </div>
    </div>
  );
};

export default ExcelExport;