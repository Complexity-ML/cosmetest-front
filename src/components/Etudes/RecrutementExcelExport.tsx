import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import api from '../../services/api';
import { formatDate } from '../../utils/dateUtils';
import { Button } from '@/components/ui/button';
import { Loader2, FileSpreadsheet } from 'lucide-react';

interface RecrutementExcelExportProps {
  volunteerIds?: any[];
  rdvs?: any[];  // Ajout: RDV passés en prop (comme RdvExcelExport)
  studyRef?: string;
  studyId?: number | null;
  studyTitle?: string;
  className?: string;
}

const RecrutementExcelExport: React.FC<RecrutementExcelExportProps> = ({
  volunteerIds = [],
  rdvs: rdvsProp,  // RDV passés en prop
  studyRef = '',
  studyId = null,
  studyTitle = '',
  className = ''
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportRecrutementToExcel = async () => {
    try {
      setIsExporting(true);
      setExportProgress(0);

      if (volunteerIds.length === 0) {
        throw new Error('Aucun volontaire à exporter');
      }

      // 1. Utiliser les RDV passés en prop (comme RdvExcelExport) ou les récupérer via API
      let rdvs: any[] = [];
      if (rdvsProp && rdvsProp.length > 0) {
        // Utiliser les RDV passés en prop (même source que RdvExcelExport)
        rdvs = rdvsProp;
        console.log(`RecrutementExcelExport: ${rdvs.length} RDV reçus en prop`);
      } else if (studyId) {
        // Fallback: récupérer via API
        try {
          const rdvsResponse = await api.get(`/rdvs/search?idEtude=${studyId}&size=10000`);
          rdvs = rdvsResponse.data?.content || rdvsResponse.data?.data || rdvsResponse.data || [];
          console.log(`RecrutementExcelExport: ${rdvs.length} RDV récupérés via API`);
        } catch (error) {
          console.error('Erreur lors de la récupération des RDV:', error);
        }
      }

      setExportProgress(10);

      // 2. Récupérer les infos complètes des volontaires
      const volunteersData: Record<number, any> = {};

      if (volunteerIds.length > 0) {
        const volunteerPromises = volunteerIds.map(async (id) => {
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
      }

      setExportProgress(20);

      // 3. Récupérer les associations étude-volontaire pour obtenir numsujet et statut
      const associationsData: Record<number, any> = {};

      if (volunteerIds.length > 0 && studyId) {
        try {
          // Récupérer toutes les associations pour cette étude
          const associationsResponse = await api.get(`/etude-volontaires/etude/${studyId}`);

          // Gérer les différents formats de réponse possibles
          let associations: any[] = [];
          if (Array.isArray(associationsResponse.data)) {
            associations = associationsResponse.data;
          } else if (associationsResponse.data?.success && Array.isArray(associationsResponse.data.data)) {
            associations = associationsResponse.data.data;
          } else if (associationsResponse.data && Array.isArray(associationsResponse.data.data)) {
            associations = associationsResponse.data.data;
          }

          // Indexer par idVolontaire pour un accès rapide
          associations.forEach((assoc: any) => {
            if (assoc.idVolontaire) {
              associationsData[assoc.idVolontaire] = assoc;
            }
          });
        } catch (error) {
          console.error('Erreur lors de la récupération des associations:', error);
          // Continuer sans les associations en cas d'erreur
        }
      }

      setExportProgress(30);

      // 4. Grouper les RDV par volontaire et calculer le nombre max de passages
      // Copie de la logique de RdvExcelExport qui fonctionne
      const rdvsByVolunteer: Record<string, any[]> = {};
      let maxPassages = 0;

      // Grouper TOUS les RDV par volontaire (sans filtrer d'abord)
      rdvs.forEach((rdv: any) => {
        if (rdv.idVolontaire) {
          const volKey = String(rdv.idVolontaire);
          if (!rdvsByVolunteer[volKey]) {
            rdvsByVolunteer[volKey] = [];
          }
          rdvsByVolunteer[volKey].push(rdv);
        }
      });

      // Trier les RDV de chaque volontaire par date/heure et calculer maxPassages
      Object.keys(rdvsByVolunteer).forEach(volunteerId => {
        rdvsByVolunteer[volunteerId].sort((a: any, b: any) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);

          if (dateA.getTime() !== dateB.getTime()) {
            return dateA.getTime() - dateB.getTime();
          }

          const heureA = a.heure || '00h00';
          const heureB = b.heure || '00h00';
          return heureA.localeCompare(heureB);
        });

        // Calculer le nombre max de passages sur TOUS les volontaires
        maxPassages = Math.max(maxPassages, rdvsByVolunteer[volunteerId].length);
      });

      setExportProgress(50);

      // 5. Fonction helper pour récupérer les infos du volontaire
      const getVolunteerInfo = (volunteerId: number, field: string) => {
        if (volunteersData[volunteerId]) {
          return volunteersData[volunteerId][field] || '';
        }
        return '';
      };

      // 6. Fonction helper pour récupérer les infos de l'association
      const getAssociationInfo = (volunteerId: number, field: string) => {
        if (associationsData[volunteerId]) {
          return associationsData[volunteerId][field] || '';
        }
        return '';
      };

      // 7. Créer les en-têtes dynamiques
      const headers = [
        'NB',
        'N°sujet',
        'ID Vol',
        'nom',
        'prenom',
        'Téléphone'
      ];

      // Ajouter T0, T1, T2... en fonction du nombre max de passages
      for (let i = 0; i < maxPassages; i++) {
        headers.push(`T${i} Date`);
        headers.push(`T${i} Heure`);
      }

      // Ajouter les colonnes finales
      headers.push('Phototype', 'PS/PNS', 'Type de peau', 'Date de naissance', 'age', 'Statut', 'IV', 'Email');

      // 8. Créer les lignes de données
      const dataRows: any[][] = [];
      let volunteerCounter = 1;

      // Traiter tous les volontaires dans l'ordre
      volunteerIds.forEach((volId: any) => {
        // Normaliser l'ID (peut être un objet avec id/idVol ou un simple ID)
        const volunteerId = typeof volId === 'object' && volId !== null
          ? (volId.id || volId.idVol || volId)
          : volId;
        const volunteerIdNum = Number(volunteerId);

        // Accéder aux RDV - essayer plusieurs formats de clé
        const volunteerRdvs = rdvsByVolunteer[String(volunteerId)]
          || rdvsByVolunteer[volunteerId]
          || [];
        const row: any[] = [];

        // Informations de base
        row.push(volunteerCounter++); // NB
        row.push(getAssociationInfo(volunteerIdNum, 'numsujet')); // N°sujet
        row.push(volunteerId); // ID Vol
        row.push((getVolunteerInfo(volunteerIdNum, 'nom') || '').toUpperCase()); // nom
        row.push(getVolunteerInfo(volunteerIdNum, 'prenom')); // prenom
        
        // Téléphone formaté
        const telPortable = getVolunteerInfo(volunteerIdNum, 'telPortable');
        const telDomicile = getVolunteerInfo(volunteerIdNum, 'telDomicile');
        const phone = telPortable || telDomicile;
        let formattedPhone = '';
        if (phone) {
          const phoneStr = String(phone);
          const cleaned = phoneStr.replace(/\D/g, '');
          if (cleaned.length === 10) {
            formattedPhone = cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
          } else {
            formattedPhone = phoneStr;
          }
        }
        row.push(formattedPhone);

        // Ajouter les données de chaque passage T0, T1, T2...
        for (let i = 0; i < maxPassages; i++) {
          if (i < volunteerRdvs.length) {
            const rdv = volunteerRdvs[i];
            row.push(formatDate(rdv.date));
            row.push(rdv.heure || '');
          } else {
            // Pas de RDV pour ce passage
            row.push('');
            row.push('');
          }
        }

        // Colonnes finales
        row.push(getVolunteerInfo(volunteerIdNum, 'phototype')); // Phototype

        // PS/PNS
        const peauSensible = getVolunteerInfo(volunteerIdNum, 'peauSensible');
        row.push(peauSensible === 'Oui' ? 'PS' : 'PNS');

        row.push(getVolunteerInfo(volunteerIdNum, 'typePeauVisage')); // Type de peau
        row.push(formatDate(getVolunteerInfo(volunteerIdNum, 'dateNaissance'))); // Date de naissance

        // Age calculé
        const dateNaissance = getVolunteerInfo(volunteerIdNum, 'dateNaissance');
        let age: string | number = '';
        if (dateNaissance) {
          const today = new Date();
          const birthDate = new Date(dateNaissance);
          let ageValue = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            ageValue--;
          }
          age = ageValue;
        }
        row.push(age);

        // Statut - afficher le texte de pénalité si c'est une pénalité
        const statut = getAssociationInfo(volunteerIdNum, 'statut');
        let statutDisplay = '';
        // Vérifier si c'est une pénalité (avec ou sans accent)
        if (statut && (statut.toLowerCase().includes('penalite') || statut.toLowerCase().includes('pénalité'))) {
          statutDisplay = statut;
        }
        row.push(statutDisplay); // Statut

        row.push(getAssociationInfo(volunteerIdNum, 'iv') || getVolunteerInfo(volunteerIdNum, 'iv')); // IV
        row.push(getVolunteerInfo(volunteerIdNum, 'email')); // Email

        dataRows.push(row);
      });

      setExportProgress(70);

      // 9. Créer le livre Excel
      const wb = XLSX.utils.book_new();

      // 10. Créer la ligne d'en-tête avec les infos de l'étude
      const studyInfoRow = [];
      let studyInfo = 'Feuille de recrutement';
      
      if (studyRef && studyTitle) {
        studyInfo = `Étude: ${studyRef} - ${studyTitle}`;
      } else if (studyRef) {
        studyInfo = `Étude: ${studyRef}`;
      }      
      studyInfoRow.push(studyInfo);
      // Remplir le reste de la ligne avec des cellules vides
      for (let i = 1; i < headers.length; i++) {
        studyInfoRow.push('');
      }

      // 11. Créer les données pour Excel : ligne étude + en-têtes + données
      const wsData = [
        studyInfoRow,                                    // Ligne 1: Info étude
        headers,                                         // Ligne 2: En-têtes
        ...dataRows                                      // Lignes 3+: Données
      ];

      // 12. Créer une feuille de calcul
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // 12.1. Fusionner les cellules de la première ligne pour le titre de l'étude
      const mergeRange = {
        s: { r: 0, c: 0 }, // Start: ligne 0, colonne 0
        e: { r: 0, c: Math.min(6, headers.length - 1) } // End: ligne 0, jusqu'à la colonne 6 ou la dernière colonne des headers
      };
      
      if (!ws['!merges']) ws['!merges'] = [];
      ws['!merges'].push(mergeRange);

      // 13. Style pour la ligne d'information de l'étude (première ligne)
      const studyInfoRowNum = 0; // Première ligne (info étude)
      const headerRowNum = 1;     // Deuxième ligne (en-têtes)

      for (let col = 0; col < headers.length; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: studyInfoRowNum, c: col });

        if (col === 0) {
          // Cellule avec le texte de l'étude
          if (!ws[cellRef]) ws[cellRef] = { t: 's', v: studyInfo };
          
          ws[cellRef].s = {
            fill: {
              fgColor: { rgb: "2F75B5" } // Bleu plus foncé
            },
            font: {
              color: { rgb: "FFFFFF" }, // Texte blanc
              bold: true,
              size: 14
            },
            alignment: {
              horizontal: "left",
              vertical: "center"
            },
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } }
            }
          };
        } else {
          // Cellules vides avec le même style de fond
          if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
          
          ws[cellRef].s = {
            fill: {
              fgColor: { rgb: "2F75B5" }
            },
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } }
            }
          };
        }
      }

      // 14. Style pour les en-têtes de colonnes (deuxième ligne)
      for (let col = 0; col < headers.length; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: headerRowNum, c: col });

        if (!ws[cellRef]) ws[cellRef] = { t: 's', v: headers[col] };

        ws[cellRef].s = {
          fill: {
            fgColor: { rgb: "4F81BD" } // Bleu standard
          },
          font: {
            color: { rgb: "FFFFFF" }, // Texte blanc
            bold: true
          },
          alignment: {
            horizontal: "center",
            vertical: "center"
          },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }

      // 15. Définir la largeur des colonnes
      const colWidths = [
        { wch: 5 },  // NB
        { wch: 12 }, // N°sujet
        { wch: 10 }, // ID Vol
        { wch: 20 }, // nom
        { wch: 15 }, // prenom
        { wch: 15 }  // Téléphone
      ];

      // Ajouter les largeurs pour T0, T1, T2...
      for (let i = 0; i < maxPassages; i++) {
        colWidths.push({ wch: 12 }); // Date
        colWidths.push({ wch: 8 });  // Heure
      }

      // Ajouter les largeurs pour les colonnes finales
      colWidths.push(
        { wch: 12 }, // Phototype
        { wch: 8 },  // PS/PNS
        { wch: 15 }, // Type de peau
        { wch: 15 }, // Date de naissance
        { wch: 5 },  // age
        { wch: 20 }, // Statut
        { wch: 8 },  // IV
        { wch: 25 }  // Email
      );

      ws['!cols'] = colWidths;

      setExportProgress(90);

      // 16. Ajouter la feuille au livre
      XLSX.utils.book_append_sheet(wb, ws, 'Feuille de recrutement');

      // 17. Générer le fichier Excel et le télécharger
      const fileName = studyRef ? 
        `feuille-recrutement-${studyRef}.xlsx` :
        `feuille-recrutement-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      XLSX.writeFile(wb, fileName);

      setExportProgress(100);

    } catch (error) {
      console.error('Erreur lors de l\'export Excel recrutement:', error);
      alert(`Une erreur est survenue lors de l'export Excel: ${(error as Error).message}`);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <div className={`inline-block ${className}`}>
      <Button
        onClick={exportRecrutementToExcel}
        disabled={isExporting || volunteerIds.length === 0}
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
            <FileSpreadsheet className="h-4 w-4" />
            Feuille Recrutement
          </>
        )}
      </Button>
      
      {volunteerIds.length === 0 && (
        <p className="text-sm text-muted-foreground mt-1">
          Aucun volontaire à exporter
        </p>
      )}
    </div>
  );
};

export default RecrutementExcelExport;