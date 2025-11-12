import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import volontaireService from '../../services/volontaireService';
import etudeService from '../../services/etudeService';
import { Button } from '@/components/ui/button';
import { Loader2, Download } from 'lucide-react';

interface VolunteerExcelExportProps {
  volunteerIds?: any[];
  studyId?: number | null;
  studyRef?: string | null;
}

const VolunteerExcelExport: React.FC<VolunteerExcelExportProps> = ({ 
  volunteerIds = [], 
  studyId = null, 
  studyRef = null 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Fonction pour formater la date en anglais
  const formatDateEnglish = (dateString: any) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${month}-${day}-${year}`;
    } catch (error) {
      console.error('Erreur formatage date:', error);
      return '';
    }
  };

  const formatEthnieEnglish = (ethnie: any) => {
    if (!ethnie) return '';
    try {
      return ethnie.replace('Caucasienne', 'Caucasian').replace('Africain', 'African').replace('Asiatique', 'Asian').replace('Indienne', 'Indian').replace('Antillaise', 'West-Indian');
    } catch (error) {
      console.error('Erreur formatage ethnie:', error);
      return '';
    }
  };

  // Fonction pour normaliser les types de peau (regrouper les variations)
  const normalizeTypePeau = (typePeau: any) => {
    if (!typePeau) return 'Non spécifié';
    
    const normalized = typePeau.trim();
    
    // Normaliser les variations de casse et d'orthographe
    const normalizations: Record<string, string> = {
      'sensible': 'Sensible',
      'Sensible': 'Sensible',
      'SENSIBLE': 'Sensible',
      'grasse': 'Grasse',
      'Grasse': 'Grasse',
      'GRASSE': 'Grasse',
      'sèche': 'Sèche', 
      'Sèche': 'Sèche',
      'seche': 'Sèche',
      'Seche': 'Sèche',
      'SÈCHE': 'Sèche',
      'normale': 'Normale',
      'Normale': 'Normale',
      'NORMALE': 'Normale',
      'mixte': 'Mixte',
      'Mixte': 'Mixte',
      'MIXTE': 'Mixte',
      'mixte à tendance grasse': 'Mixte à tendance grasse',
      'Mixte à tendance grasse': 'Mixte à tendance grasse',
      'mixte à tendance sèche': 'Mixte à tendance sèche',
      'Mixte à tendance sèche': 'Mixte à tendance sèche',
      'mixte à tendance seche': 'Mixte à tendance sèche',
      'Mixte à tendance seche': 'Mixte à tendance sèche'
    };

    return normalizations[normalized] || normalized;
  };

  // Fonction pour normaliser la sensibilité cutanée
  const normalizeSensibiliteCutanee = (sensibilite: any) => {
    if (!sensibilite) return 'Non spécifié';
    
    const normalized = sensibilite.trim();
    
    // Normaliser les variations de casse pour la sensibilité cutanée
    const normalizations: Record<string, string> = {
      'peau sensible': 'Peau sensible',
      'Peau sensible': 'Peau sensible',
      'Peau Sensible': 'Peau sensible',
      'PEAU SENSIBLE': 'Peau sensible',
      'peau non sensible': 'Peau non sensible',
      'Peau non sensible': 'Peau non sensible',
      'Peau Non Sensible': 'Peau non sensible',
      'PEAU NON SENSIBLE': 'Peau non sensible',
      'sensible': 'Peau sensible',
      'Sensible': 'Peau sensible',
      'non sensible': 'Peau non sensible',
      'Non sensible': 'Peau non sensible',
      'Non Sensible': 'Peau non sensible'
    };

    return normalizations[normalized] || normalized;
  };

  const exportVolunteersToExcel = async () => {
    try {
      setIsExporting(true);
      setExportProgress(0);
      // 0. Récupérer les informations de l'étude si studyId est fourni
      let studyInfo = null;
      if (studyId) {
        try {
          studyInfo = await etudeService.getById(studyId);
        } catch (error) {
          console.warn('Impossible de récupérer les informations de l\'étude:', error);
        }
      }

      setExportProgress(5);

      // 1. Récupérer les détails complets de tous les volontaires
      const volunteersData: any[] = [];
      let processedCount = 0;

      if (volunteerIds.length === 0) {
        throw new Error('Aucun volontaire sélectionné pour l\'export');
      }

      // Récupération parallèle des données de volontaires avec gestion d'erreur
      const volunteerPromises = volunteerIds.map(async (id, index) => {
        try {
          const response = await volontaireService.getDetails(id);
          processedCount++;
          setExportProgress(5 + (processedCount / volunteerIds.length) * 65); // 65% pour la récupération
          return { id, data: response.data || response, index: index + 1 };
        } catch (error) {
          console.error(`Erreur pour volontaire ${id}:`, error);
          processedCount++;
          setExportProgress(5 + (processedCount / volunteerIds.length) * 65);
          return { id, data: null, index: index + 1 };
        }
      });

      const volunteerResults = await Promise.all(volunteerPromises);

      // Filtrer les résultats valides et normaliser les types de peau
      volunteerResults.forEach(result => {
        if (result.data) {
          const normalizedData = {
            ...result.data,
            numeroSujet: result.index,
            idVolontaire: result.id,
            // Normaliser le type de peau
            typePeauVisage: normalizeTypePeau(result.data.typePeauVisage),
            // Normaliser la sensibilité cutanée
            sensibiliteCutanee: normalizeSensibiliteCutanee(result.data.sensibiliteCutanee)
          };
          volunteersData.push(normalizedData);
        }
      });

      setExportProgress(75);

      if (volunteersData.length === 0) {
        throw new Error('Aucune donnée de volontaire récupérée');
      }

      // 2. Créer les en-têtes selon le format amélioré
      const headers = [
        'N° Sujet',
        'Code',
        'AGE',
        'Sensibilité cutanée',
        'TYPE DE PEAU',
        'D0', // Date de début d'étude
        'ETHNIE', // Ajout de l'ethnie
        '', // Colonne vide
        'TYPE DE PEAU (EN)',
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // Colonnes vides
        'ID VOL',
        'Phototype'
      ];

      // 3. Créer les lignes de données
      const dataRows = [];

      // Ligne de titre avec date d'étude si disponible
      let titleText = 'Données démographiques';
      if (studyInfo && studyInfo.refEtude) {
        titleText += ` - ${studyInfo.refEtude}`;
      }
      if (studyInfo && studyInfo.dateDebut) {
        const englishDate = formatDateEnglish(studyInfo.dateDebut);
        titleText += ` - Study start: ${englishDate}`;
      }

      const titleRow = [titleText];
      dataRows.push(titleRow);

      // Ligne d'en-têtes
      dataRows.push(headers);

      // Ligne vide pour séparer
      dataRows.push(new Array(headers.length).fill(''));

      // 4. Ajouter les données des volontaires
      const studyStartDate = studyInfo?.dateDebut ? formatDateEnglish(studyInfo.dateDebut) : '';

      volunteersData.forEach((volunteer) => {
        const row = [];

        // N° Sujet
        row.push(volunteer.numeroSujet || '');

        // Code (initiales générées à partir du nom/prénom)
        const code = volunteer.nomVol && volunteer.prenomVol ?
          `${volunteer.nomVol.substring(0, 3).toUpperCase()}${volunteer.prenomVol.substring(0, 2).toUpperCase()}` :
          '';
        row.push(code);

        // Age (calculé à partir de dateNaissance)
        const age = volunteer.dateNaissance ?
          Math.floor((new Date().getTime() - new Date(volunteer.dateNaissance).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) :
          '';
        row.push(age);

        // Sensibilité cutanée (utilise l'attribut sensibiliteCutanee de l'entité)
        row.push(volunteer.sensibiliteCutanee || '');

        // Type de peau (utilise typePeauVisage normalisé)
        row.push(volunteer.typePeauVisage || '');

        // D0 (Date de début d'étude en anglais)
        row.push(studyStartDate);

        // Ethnie du volontaire
        row.push(formatEthnieEnglish(volunteer.ethnie) || '');
        // Colonne vide
        row.push('');

        // Type de peau en anglais
        const typesPeauEn: Record<string, string> = {
          'Sèche': 'Dry',
          'Normale': 'Normal',
          'Grasse': 'Oily',
          'Mixte': 'Combination',
          'Sensible': 'Sensitive',
          'Mixte à tendance grasse': 'Combination to oily',
          'Mixte à tendance sèche': 'Combination to dry',
        };
        row.push(typesPeauEn[volunteer.typePeauVisage as string] || volunteer.typePeauVisage || '');

        // Colonnes vides supplémentaires
        for (let i = 0; i < 20; i++) {
          row.push('');
        }

        // ID VOL (utilise idVol de l'entité)
        row.push(volunteer.idVol || '');

        // Phototype (utilise l'attribut phototype de l'entité)
        row.push(volunteer.phototype || '');

        dataRows.push(row);
      });

      setExportProgress(85);

      // 5. Ajouter des statistiques en bas (FORMAT PIVOT - Section séparée)

      // Plusieurs lignes vides pour séparer les données des statistiques
      dataRows.push(new Array(headers.length).fill(''));
      dataRows.push(new Array(headers.length).fill(''));
      dataRows.push(new Array(headers.length).fill(''));

      // TITRE DE LA SECTION STATISTIQUES
      const statsTitle = ['=== STATISTIQUES DÉMOGRAPHIQUES ==='];
      dataRows.push(statsTitle);
      dataRows.push(new Array(headers.length).fill(''));

      // === CALCULS PRÉALABLES ===
      const ages = volunteersData.map(v => {
        if (v.dateNaissance) {
          return Math.floor((new Date().getTime() - new Date(v.dateNaissance).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        }
        return null;
      }).filter((age): age is number => age !== null && age > 0);

      const moyenneAge = ages.length > 0 ? Math.round(ages.reduce((a: number, b: number) => a + b, 0) / ages.length * 10) / 10 : 0;
      const minAge = ages.length > 0 ? Math.min(...ages) : 0;
      const maxAge = ages.length > 0 ? Math.max(...ages) : 0;

      // Calcul de l'écart type
      let ecartTypeAge = 0;
      if (ages.length > 0) {
        const variance = ages.reduce((acc: number, age: number) => acc + Math.pow(age - moyenneAge, 2), 0) / ages.length;
        ecartTypeAge = Math.round(Math.sqrt(variance) * 10) / 10;
      }

      // Calcul de la médiane
      let medianeAge: number = 0;
      if (ages.length > 0) {
        const sortedAges = [...ages].sort((a: number, b: number) => a - b);
        if (sortedAges.length % 2 === 0) {
          const mid1 = sortedAges[sortedAges.length / 2 - 1];
          const mid2 = sortedAges[sortedAges.length / 2];
          medianeAge = Math.round(((mid1 || 0) + (mid2 || 0)) / 2 * 10) / 10;
        } else {
          medianeAge = sortedAges[Math.floor(sortedAges.length / 2)] || 0;
        }
      }

      // === 1. STATISTIQUES D'ÂGE (FORMAT PIVOT) ===
      const ageStatsPivot = [
        ['STATISTIQUES D\'ÂGE', 'Valeur', ''],
        ['N', ages.length, ''],
        ['Moyenne', moyenneAge, 'ans'],
        ['Médiane', medianeAge, 'ans'],
        ['Écart type', ecartTypeAge, 'ans'],
        ['Minimum', minAge, 'ans'],
        ['Maximum', maxAge, 'ans'],
        ['', '', ''] // Ligne vide
      ];

      ageStatsPivot.forEach(statRow => {
        const row = new Array(headers.length).fill('');
        row[0] = statRow[0];
        row[1] = statRow[1];
        row[2] = statRow[2];
        dataRows.push(row);
      });

      // === 2. STATISTIQUES DE SENSIBILITÉ CUTANÉE (FORMAT PIVOT) ===
      const sensibiliteStats: Record<string, number> = volunteersData.reduce((acc: Record<string, number>, v: any) => {
        const sens = v.sensibiliteCutanee || 'Non spécifié';
        acc[sens] = (acc[sens] || 0) + 1;
        return acc;
      }, {});

      const sensibilitePivot: Array<[string, number | string, string]> = [['SENSIBILITÉ CUTANÉE', 'N', '%']];
      Object.entries(sensibiliteStats).forEach(([type, count]) => {
        const percentage = Math.round(((count as number) / volunteersData.length) * 100 * 10) / 10;
        sensibilitePivot.push([type, count, `${percentage}%`]);
      });
      sensibilitePivot.push(['', '', '']); // Ligne vide

      sensibilitePivot.forEach(statRow => {
        const row = new Array(headers.length).fill('');
        row[0] = statRow[0];
        row[1] = statRow[1];
        row[2] = statRow[2];
        dataRows.push(row);
      });

      // === 3. STATISTIQUES DE TYPES DE PEAU (FORMAT PIVOT) ===
      // Utiliser les données déjà normalisées
      const typesPeauStats: Record<string, number> = volunteersData.reduce((acc: Record<string, number>, v: any) => {
        const type = v.typePeauVisage || 'Non spécifié';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      const typesPeauPivot: Array<Array<string | number>> = [
        ['TYPES DE PEAU', 'N', '%'],
        ['', '', ''] // Séparateur
      ];

      // Afficher toujours dans le même ordre:
      const orderedTypesPeau = [
        'Grasse',
        'Mixte',
        'Normale',
        'Sèche',
        'Sensible', // Une seule entrée pour "Sensible"
        'Mixte à tendance grasse',
        'Mixte à tendance sèche'
      ];

      orderedTypesPeau.forEach(type => {
        const count = typesPeauStats[type] || 0;
        if (count > 0) { // Afficher seulement si il y a des données
          const percentage = Math.round((count / volunteersData.length) * 100 * 10) / 10;
          typesPeauPivot.push([type, count, `${percentage}%`]);
        }
      });

      // Ajouter les types non prévus dans l'ordre (s'il y en a)
      Object.entries(typesPeauStats).forEach(([type, count]) => {
        if (!orderedTypesPeau.includes(type) && type !== 'Non spécifié') {
          const percentage = Math.round(((count as number) / volunteersData.length) * 100 * 10) / 10;
          typesPeauPivot.push([type, count, `${percentage}%`]);
        }
      });

      // Ajouter "Non spécifié" à la fin s'il existe
      if (typesPeauStats['Non spécifié']) {
        const count = typesPeauStats['Non spécifié'];
        const percentage = Math.round((count / volunteersData.length) * 100 * 10) / 10;
        typesPeauPivot.push(['Non spécifié', count, `${percentage}%`]);
      }

      typesPeauPivot.push(['', '', '']);

      // Ligne vide pour séparer les sections
      typesPeauPivot.forEach(statRow => {
        const row = new Array(headers.length).fill('');
        row[0] = statRow[0];
        row[1] = statRow[1];
        row[2] = statRow[2];
        dataRows.push(row);
      });

      // === 4. STATISTIQUES DE PHOTOTYPES (FORMAT PIVOT) ===
      const phototypesStats: Record<string, number> = volunteersData.reduce((acc: Record<string, number>, v: any) => {
        const phototype = v.phototype || 'Non spécifié';
        acc[phototype] = (acc[phototype] || 0) + 1;
        return acc;
      }, {});

      // Toujours afficher les phototypes dans l'ordre croissant
      const orderedPhototypes = [
        'Phototype 1',
        'Phototype 2',
        'Phototype 3',
        'Phototype 4',
        'Phototype 5',
        'Phototype 6',
      ];

      const phototypePivot: Array<Array<string | number>> = [['PHOTOTYPES', 'N', '%']];
      orderedPhototypes.forEach(type => {
        const count = phototypesStats[type] || 0;
        const percentage = Math.round((count / volunteersData.length) * 100 * 10) / 10;
        phototypePivot.push([type, count, `${percentage}%`]);
      });
      phototypePivot.push(['', '', '']); // Ligne vide

      phototypePivot.forEach(statRow => {
        const row = new Array(headers.length).fill('');
        row[0] = statRow[0];
        row[1] = statRow[1];
        row[2] = statRow[2];
        dataRows.push(row);
      });

      // === 5. STATISTIQUES D'ETHNIES (FORMAT PIVOT) ===
      const ethniesStats: Record<string, number> = volunteersData.reduce((acc: Record<string, number>, v: any) => {
        const ethnie = v.ethnie || 'Non spécifié';
        acc[ethnie] = (acc[ethnie] || 0) + 1;
        return acc;
      }, {});

      const ethniesPivot: Array<Array<string | number>> = [['ETHNIES', 'N', '%']];
      Object.entries(ethniesStats).forEach(([ethnie, count]) => {
        const percentage = Math.round(((count as number) / volunteersData.length) * 100 * 10) / 10;
        ethniesPivot.push([ethnie, count, `${percentage}%`]);
      });

      ethniesPivot.forEach(statRow => {
        const row = new Array(headers.length).fill('');
        row[0] = statRow[0];
        row[1] = statRow[1];
        row[2] = statRow[2];
        dataRows.push(row);
      });

      setExportProgress(90);

      // 6. Créer le fichier Excel
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(dataRows);

      // 7. Style pour les en-têtes
      const headerRowIndex = 1; // Deuxième ligne (index 1)

      for (let col = 0; col < headers.length; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });

        if (!ws[cellRef]) ws[cellRef] = { t: 's', v: headers[col] };

        ws[cellRef].s = {
          fill: {
            fgColor: { rgb: "4F81BD" } // Bleu foncé
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

      // 8. Style pour le titre
      const titleCellRef = XLSX.utils.encode_cell({ r: 0, c: 0 });
      if (!ws[titleCellRef]) ws[titleCellRef] = { t: 's', v: titleText };

      ws[titleCellRef].s = {
        font: {
          bold: true,
          size: 14
        },
        alignment: {
          horizontal: "center"
        }
      };

      // 9. Fusionner les cellules du titre (A1:E1) pour plus d'espace
      if (!ws['!merges']) ws['!merges'] = [];
      ws['!merges'].push({
        s: { c: 0, r: 0 },
        e: { c: 4, r: 0 }
      });

      // 10. Alternance de couleurs pour les lignes de données
      const dataStartRow = 3; // Commencer après le titre, en-têtes et ligne vide

      for (let i = 0; i < volunteersData.length; i++) {
        const rowIndex = dataStartRow + i;
        const isEvenRow = i % 2 === 0;

        if (!isEvenRow) {
          for (let col = 0; col < headers.length; col++) {
            const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: col });

            if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };

            ws[cellRef].s = {
              fill: {
                fgColor: { rgb: "F8F9FA" } // Gris très clair
              }
            };
          }
        }
      }

      // 11. Style pour les en-têtes de statistiques (FORMAT PIVOT)
      const statsStartRow = dataStartRow + volunteersData.length + 4; // +4 pour les lignes vides et le titre

      // Style pour le titre des statistiques
      const statsTitleRow = statsStartRow;
      const statsTitleCellRef = XLSX.utils.encode_cell({ r: statsTitleRow, c: 0 });
      if (ws[statsTitleCellRef]) {
        ws[statsTitleCellRef].s = {
          font: { bold: true, size: 16, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "2F5597" } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }

      // Fusionner les cellules du titre des statistiques
      if (!ws['!merges']) ws['!merges'] = [];
      ws['!merges'].push({
        s: { c: 0, r: statsTitleRow },
        e: { c: 2, r: statsTitleRow }
      });

      // Style pour les en-têtes de chaque section statistique
      for (let i = statsStartRow + 2; i < dataRows.length; i++) {
        const row = dataRows[i];
        if (row[0] && (
          row[0].includes('STATISTIQUES D\'ÂGE') ||
          row[0].includes('SENSIBILITÉ CUTANÉE') ||
          row[0].includes('TYPES DE PEAU') ||
          row[0].includes('PHOTOTYPES') ||
          row[0].includes('ETHNIES')
        )) {
          // Style pour les en-têtes de sections
          for (let col = 0; col <= 2; col++) {
            const cellRef = XLSX.utils.encode_cell({ r: i, c: col });
            if (ws[cellRef]) {
              ws[cellRef].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "4F81BD" } },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                  top: { style: "thin", color: { rgb: "000000" } },
                  bottom: { style: "thin", color: { rgb: "000000" } },
                  left: { style: "thin", color: { rgb: "000000" } },
                  right: { style: "thin", color: { rgb: "000000" } }
                }
              };
            }
          }
        }
      }

      // Style pour les données statistiques (alternance de couleurs)
      let currentSection = '';
      let rowInSection = 0;

      for (let i = statsStartRow + 2; i < dataRows.length; i++) {
        const row = dataRows[i];

        if (row[0] && (
          row[0].includes('STATISTIQUES') ||
          row[0].includes('SENSIBILITÉ') ||
          row[0].includes('TYPES DE PEAU') ||
          row[0].includes('PHOTOTYPES') ||
          row[0].includes('ETHNIES')
        )) {
          currentSection = row[0];
          rowInSection = 0;
        } else if (row[0] && row[0] !== '' && currentSection) {
          rowInSection++;

          // Alternance de couleurs pour les lignes de données
          if (rowInSection % 2 === 0) {
            for (let col = 0; col <= 2; col++) {
              const cellRef = XLSX.utils.encode_cell({ r: i, c: col });
              if (ws[cellRef]) {
                ws[cellRef].s = {
                  fill: { fgColor: { rgb: "F8F9FA" } },
                  border: {
                    top: { style: "thin", color: { rgb: "CCCCCC" } },
                    bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                    left: { style: "thin", color: { rgb: "CCCCCC" } },
                    right: { style: "thin", color: { rgb: "CCCCCC" } }
                  }
                };
              }
            }
          } else {
            // Style pour les lignes impaires
            for (let col = 0; col <= 2; col++) {
              const cellRef = XLSX.utils.encode_cell({ r: i, c: col });
              if (ws[cellRef]) {
                ws[cellRef].s = {
                  border: {
                    top: { style: "thin", color: { rgb: "CCCCCC" } },
                    bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                    left: { style: "thin", color: { rgb: "CCCCCC" } },
                    right: { style: "thin", color: { rgb: "CCCCCC" } }
                  }
                };
              }
            }
          }
        }
      }

      // 12. Définir la largeur des colonnes
      const colWidths = [
        { width: 25 },  // N° Sujet
        { width: 8 },   // Code
        { width: 6 },   // Age
        { width: 20 },  // Sensibilité cutanée
        { width: 25 },  // Type de peau
        { width: 12 },  // D0 (date début)
        { width: 15 },  // Ethnie
        { width: 3 },   // Vide
        { width: 20 },  // Type de peau EN
        // Colonnes vides (16 colonnes au lieu de 17)
        ...Array(16).fill({ width: 3 }),
        { width: 20 },  // Age (stats) - élargi
        { width: 12 },  // Moyenne
        { width: 8 },   // 0
        { width: 10 },  // ID VOL

        { width: 15 },  // Phototype
        { width: 15 },  // Phototype
        { width: 6 },   // N
        { width: 8 }    // %
      ];

      ws['!cols'] = colWidths;

      // 13. Ajouter la feuille au classeur
      XLSX.utils.book_append_sheet(wb, ws, 'Données Démographiques');

      setExportProgress(95);

      // 14. Générer et télécharger le fichier
      const fileName = studyRef ?
        `donnees-demographiques-${studyRef}-${new Date().toISOString().split('T')[0]}.xlsx` :
        `donnees-demographiques-${new Date().toISOString().split('T')[0]}.xlsx`;

      XLSX.writeFile(wb, fileName);

      setExportProgress(100);

    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      alert(`Une erreur est survenue lors de l'export Excel: ${(error as Error).message}`);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <div className="inline-block">
      <Button
        onClick={exportVolunteersToExcel}
        disabled={isExporting || volunteerIds.length === 0}
        variant="default"
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
            <Download className="h-4 w-4" />
            Export Données Démographiques
          </>
        )}
      </Button>
    </div>
  );
};

export default VolunteerExcelExport;