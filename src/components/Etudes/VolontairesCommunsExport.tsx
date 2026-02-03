import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import api from '../../services/api';
import { Button } from '@/components/ui/button';
import { Loader2, Users } from 'lucide-react';

interface VolontairesCommunsExportProps {
  studyRef?: string;
  className?: string;
}

const VolontairesCommunsExport: React.FC<VolontairesCommunsExportProps> = ({
  studyRef = '',
  className = ''
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Extraire le numéro de base de la référence (ex: "2814" de "2814 tenue - Tenue cushion 12-24H")
  const extractBaseRef = (ref: string): string | null => {
    if (!ref) return null;
    // Extraire les premiers chiffres de la référence
    const match = ref.match(/^(\d+)/);
    return match ? match[1] : null;
  };

  const exportVolontairesCommunsToExcel = async () => {
    try {
      setIsExporting(true);
      setExportProgress(0);

      const baseRef = extractBaseRef(studyRef);
      if (!baseRef) {
        throw new Error('Impossible d\'extraire la référence de base de l\'étude');
      }

      console.log(`Recherche des études avec la référence de base: ${baseRef}`);

      // 1. Récupérer toutes les études qui commencent par la même référence de base
      setExportProgress(10);
      const etudesResponse = await api.get('/etudes?size=1000');
      const allEtudes = etudesResponse.data?.content || etudesResponse.data?.data || etudesResponse.data || [];

      // Filtrer les études qui ont la même référence de base
      const relatedEtudes = allEtudes.filter((etude: any) => {
        const etudeBaseRef = extractBaseRef(etude.ref);
        return etudeBaseRef === baseRef;
      });

      console.log(`${relatedEtudes.length} études trouvées avec la référence de base ${baseRef}`);

      if (relatedEtudes.length < 2) {
        throw new Error(`Il n'y a qu'une seule étude avec la référence ${baseRef}. L'export des volontaires communs nécessite au moins 2 études.`);
      }

      setExportProgress(20);

      // 2. Pour chaque étude, récupérer les volontaires (via les associations étude-volontaire)
      const volunteersByStudy: Map<number, Set<number>> = new Map(); // studyId -> Set of volunteerIds
      const studyInfoMap: Map<number, any> = new Map(); // studyId -> study info
      const volunteerStudyInfo: Map<number, Map<number, any>> = new Map(); // volunteerId -> Map<studyId, association info>

      for (const etude of relatedEtudes) {
        studyInfoMap.set(etude.idEtude, etude);
        volunteersByStudy.set(etude.idEtude, new Set());

        try {
          const associationsResponse = await api.get(`/etude-volontaires/etude/${etude.idEtude}`);
          let associations: any[] = [];

          if (Array.isArray(associationsResponse.data)) {
            associations = associationsResponse.data;
          } else if (associationsResponse.data?.data) {
            associations = associationsResponse.data.data;
          }

          associations.forEach((assoc: any) => {
            if (assoc.idVolontaire) {
              volunteersByStudy.get(etude.idEtude)!.add(assoc.idVolontaire);

              // Stocker les infos d'association par volontaire et étude
              if (!volunteerStudyInfo.has(assoc.idVolontaire)) {
                volunteerStudyInfo.set(assoc.idVolontaire, new Map());
              }
              volunteerStudyInfo.get(assoc.idVolontaire)!.set(etude.idEtude, assoc);
            }
          });
        } catch (error) {
          console.error(`Erreur lors de la récupération des associations pour l'étude ${etude.idEtude}:`, error);
        }
      }

      setExportProgress(50);

      // 3. Trouver les volontaires qui sont dans AU MOINS 2 études
      const allVolunteerIds = new Set<number>();
      volunteersByStudy.forEach((volunteers) => {
        volunteers.forEach((volId) => allVolunteerIds.add(volId));
      });

      const commonVolunteers: number[] = [];
      allVolunteerIds.forEach((volId) => {
        let studyCount = 0;
        volunteersByStudy.forEach((volunteers) => {
          if (volunteers.has(volId)) studyCount++;
        });
        if (studyCount >= 2) {
          commonVolunteers.push(volId);
        }
      });

      console.log(`${commonVolunteers.length} volontaires communs trouvés`);

      if (commonVolunteers.length === 0) {
        throw new Error('Aucun volontaire commun trouvé entre les études.');
      }

      setExportProgress(60);

      // 4. Récupérer les infos des volontaires communs
      const volunteersData: Record<number, any> = {};
      const volunteerPromises = commonVolunteers.map(async (id) => {
        try {
          const response = await api.get(`/volontaires/${id}`);
          return { id, data: response.data };
        } catch (error) {
          console.error(`Erreur pour volontaire ${id}:`, error);
          return { id, data: null };
        }
      });

      const volunteerResults = await Promise.all(volunteerPromises);
      volunteerResults.forEach(result => {
        if (result.data) {
          volunteersData[result.id] = result.data;
        }
      });

      setExportProgress(70);

      // 5. Trier les études par référence
      const sortedEtudes = [...relatedEtudes].sort((a, b) =>
        (a.ref || '').localeCompare(b.ref || '')
      );

      // 6. Créer les en-têtes
      const headers = [
        'NB',
        'ID Volontaire',
        'Nom',
        'Prénom',
        'Téléphone',
        'Email'
      ];

      // Ajouter une colonne pour chaque étude (avec numsujet)
      sortedEtudes.forEach((etude) => {
        headers.push(`${etude.ref || etude.idEtude}`);
      });

      // 7. Créer les lignes de données
      const dataRows: any[][] = [];
      let counter = 1;

      // Trier les volontaires par nom
      commonVolunteers.sort((a, b) => {
        const nomA = (volunteersData[a]?.nom || '').toUpperCase();
        const nomB = (volunteersData[b]?.nom || '').toUpperCase();
        return nomA.localeCompare(nomB);
      });

      commonVolunteers.forEach((volId) => {
        const volunteer = volunteersData[volId];
        const row: any[] = [];

        // Informations de base
        row.push(counter++);
        row.push(volId);
        row.push((volunteer?.nom || '').toUpperCase());
        row.push(volunteer?.prenom || '');

        // Téléphone formaté
        const phone = volunteer?.telPortable || volunteer?.telDomicile || '';
        let formattedPhone = '';
        if (phone) {
          const cleaned = String(phone).replace(/\D/g, '');
          if (cleaned.length === 10) {
            formattedPhone = cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
          } else {
            formattedPhone = String(phone);
          }
        }
        row.push(formattedPhone);
        row.push(volunteer?.email || '');

        // Pour chaque étude, indiquer le numsujet ou "X" si présent, vide sinon
        sortedEtudes.forEach((etude) => {
          const isInStudy = volunteersByStudy.get(etude.idEtude)?.has(volId);
          if (isInStudy) {
            const assocInfo = volunteerStudyInfo.get(volId)?.get(etude.idEtude);
            const numsujet = assocInfo?.numsujet;
            row.push(numsujet || 'X');
          } else {
            row.push('');
          }
        });

        dataRows.push(row);
      });

      setExportProgress(80);

      // 8. Créer le livre Excel
      const wb = XLSX.utils.book_new();

      // 9. Ligne d'info
      const studyInfoRow = [`Volontaires communs - Études avec référence: ${baseRef} (${relatedEtudes.length} études)`];
      for (let i = 1; i < headers.length; i++) {
        studyInfoRow.push('');
      }

      // 10. Créer les données
      const wsData = [
        studyInfoRow,
        headers,
        ...dataRows
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // 11. Fusionner la première ligne
      const mergeRange = {
        s: { r: 0, c: 0 },
        e: { r: 0, c: Math.min(6, headers.length - 1) }
      };
      if (!ws['!merges']) ws['!merges'] = [];
      ws['!merges'].push(mergeRange);

      // 12. Styles
      const studyInfoRowNum = 0;
      const headerRowNum = 1;

      for (let col = 0; col < headers.length; col++) {
        // Style ligne info
        const cellRefInfo = XLSX.utils.encode_cell({ r: studyInfoRowNum, c: col });
        if (!ws[cellRefInfo]) ws[cellRefInfo] = { t: 's', v: '' };
        ws[cellRefInfo].s = {
          fill: { fgColor: { rgb: "2F75B5" } },
          font: { color: { rgb: "FFFFFF" }, bold: true, size: 14 },
          alignment: { horizontal: "left", vertical: "center" }
        };

        // Style en-têtes
        const cellRefHeader = XLSX.utils.encode_cell({ r: headerRowNum, c: col });
        if (!ws[cellRefHeader]) ws[cellRefHeader] = { t: 's', v: headers[col] };
        ws[cellRefHeader].s = {
          fill: { fgColor: { rgb: "4F81BD" } },
          font: { color: { rgb: "FFFFFF" }, bold: true },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }

      // 13. Largeur des colonnes
      const colWidths = [
        { wch: 5 },   // NB
        { wch: 12 },  // ID Volontaire
        { wch: 20 },  // Nom
        { wch: 15 },  // Prénom
        { wch: 15 },  // Téléphone
        { wch: 25 }   // Email
      ];

      // Colonnes pour chaque étude
      sortedEtudes.forEach(() => {
        colWidths.push({ wch: 15 });
      });

      ws['!cols'] = colWidths;

      setExportProgress(90);

      // 14. Ajouter la feuille
      XLSX.utils.book_append_sheet(wb, ws, 'Volontaires Communs');

      // 15. Télécharger
      const fileName = `volontaires-communs-${baseRef}.xlsx`;
      XLSX.writeFile(wb, fileName);

      setExportProgress(100);

    } catch (error) {
      console.error('Erreur lors de l\'export Excel volontaires communs:', error);
      alert(`Erreur: ${(error as Error).message}`);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <div className={`inline-block ${className}`}>
      <Button
        onClick={exportVolontairesCommunsToExcel}
        disabled={isExporting || !studyRef}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        {isExporting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Export... {Math.round(exportProgress)}%
          </>
        ) : (
          <>
            <Users className="h-4 w-4" />
            Volontaires Communs
          </>
        )}
      </Button>
    </div>
  );
};

export default VolontairesCommunsExport;
