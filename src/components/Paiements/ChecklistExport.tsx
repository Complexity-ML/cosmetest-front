import { useState } from 'react';
import * as XLSX from 'xlsx';
import annulationService from '../../services/annulationService';
import etudeVolontaireService from '../../services/etudeVolontaireService';
import volontaireService from '../../services/volontaireService';
import type { Etude } from '../../types/types';

interface ChecklistExportProps {
  etudes: Etude[];
}

const ChecklistExport = ({ etudes }: ChecklistExportProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const STATUT_LABELS: Record<number, string> = {
    0: 'Non payé',
    1: 'Payé',
    2: 'En attente',
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportError('');

    try {
      // 1. Charger toutes les annulations
      const toutesLesAnnulations = await annulationService.getAll();

      // 2. Construire le set des volontaires annulés : "idEtude_idVol"
      const annulationsSet = new Set<string>();
      const annulationDetails: Record<string, { dateAnnulation: string; commentaire: string }> = {};
      const etudesAvecAnnulations = new Set<number>();
      toutesLesAnnulations.forEach((a: any) => {
        const key = `${a.idEtude}_${a.idVol}`;
        annulationsSet.add(key);
        annulationDetails[key] = {
          dateAnnulation: a.dateAnnulation || '',
          commentaire: a.commentaire || '',
        };
        if (a.idEtude) etudesAvecAnnulations.add(Number(a.idEtude));
      });

      if (etudesAvecAnnulations.size === 0) {
        setExportError('Aucune annulation trouvée');
        return;
      }

      // 3. Charger les paiements de chaque étude concernée (même endpoint que PaiementsPage)
      const resultats = await Promise.allSettled(
        [...etudesAvecAnnulations].map((idEtude) =>
          etudeVolontaireService.getVolontairesByEtude(idEtude)
        )
      );

      const tousLesPaiements: any[] = [];
      resultats.forEach((r) => {
        if (r.status === 'fulfilled') {
          const data = Array.isArray(r.value) ? r.value : r.value?.data || [];
          tousLesPaiements.push(...data);
        }
      });

      // 4. Filtrer : annulé ET numsujet > 0
      const cibles = tousLesPaiements.filter((p: any) => {
        const key = `${p.idEtude}_${p.idVolontaire}`;
        return annulationsSet.has(key) && Number(p.numsujet) > 0;
      });

      if (cibles.length === 0) {
        setExportError('Aucun volontaire annulé avec numéro sujet trouvé');
        return;
      }

      // 4. Charger les infos volontaires pour les IDs uniques
      const uniqueVolIds = [...new Set(cibles.map((p: any) => p.idVolontaire))];
      const volontairesInfo: Record<number, any> = {};
      await Promise.allSettled(
        uniqueVolIds.map(async (id: any) => {
          try {
            const res = await volontaireService.getDetails(id);
            volontairesInfo[id] = res.data;
          } catch {
            volontairesInfo[id] = null;
          }
        })
      );

      // 5. Construire le map des études pour les références
      const etudeMap: Record<number, string> = {};
      etudes.forEach((e) => {
        if (e.idEtude != null) etudeMap[e.idEtude] = e.ref || `#${e.idEtude}`;
      });

      // 6. Construire les lignes Excel
      const rows = cibles.map((p: any) => {
        const vol = volontairesInfo[p.idVolontaire];
        const prenom = vol?.prenom || vol?.prenomVol || '';
        const nom = vol?.nom || vol?.nomVol || '';
        const key = `${p.idEtude}_${p.idVolontaire}`;
        const annulation = annulationDetails[key];

        return {
          'Référence étude': etudeMap[p.idEtude] ?? `#${p.idEtude}`,
          'Num Sujet': Number(p.numsujet),
          'Nom': nom,
          'Prénom': prenom,
          'ID Volontaire': p.idVolontaire,
          'Montant IV (€)': p.iv ?? 0,
          'Statut paiement': STATUT_LABELS[Number(p.paye)] ?? 'Inconnu',
          "Date d'annulation": annulation?.dateAnnulation
            ? new Date(annulation.dateAnnulation).toLocaleDateString('fr-FR')
            : '',
          "Motif d'annulation": annulation?.commentaire ?? '',
        };
      });

      // Trier par référence étude puis numéro sujet
      rows.sort((a, b) => {
        const refCmp = a['Référence étude'].localeCompare(b['Référence étude']);
        return refCmp !== 0 ? refCmp : a['Num Sujet'] - b['Num Sujet'];
      });

      // 7. Générer le fichier Excel
      const ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = [
        { wch: 16 },
        { wch: 12 },
        { wch: 20 },
        { wch: 20 },
        { wch: 14 },
        { wch: 14 },
        { wch: 16 },
        { wch: 18 },
        { wch: 40 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'CHECK LIST');

      const fileName = `CHECK_LIST_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Erreur lors de l'export CHECK LIST:", error);
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      setExportError(`Erreur export : ${msg}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {exportError && (
        <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded">
          {exportError}
        </span>
      )}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md transition-colors duration-200
          ${isExporting
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-orange-600 text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
          }`}
        title="Exporter tous les volontaires annulés avec numéro sujet"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
            Chargement...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            CHECK LIST
          </>
        )}
      </button>
    </div>
  );
};

export default ChecklistExport;
