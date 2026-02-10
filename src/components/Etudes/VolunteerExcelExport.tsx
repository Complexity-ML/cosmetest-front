import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import volontaireService from '../../services/volontaireService';
import etudeService from '../../services/etudeService';
import api from '../../services/api';
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
      const key = ethnie.trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      if (key.includes('caucas')) return 'Caucasian';
      if (key.includes('africa')) return 'African';
      if (key.includes('asia') || key.includes('asiat')) return 'Asian';
      if (key.includes('indien') || key.includes('indian')) return 'Indian';
      if (key.includes('antill') || key.includes('west')) return 'West-Indian';

      return ethnie.trim();
    } catch (error) {
      console.error('Erreur formatage ethnie:', error);
      return '';
    }
  };

  // Fonction pour normaliser les types de peau (regrouper les variations)
  const normalizeTypePeau = (typePeau: any) => {
    if (!typePeau) return 'Non spécifié';

    // Lowercase + suppression accents + trim pour comparaison
    const key = typePeau.trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Vérifier les types composés en premier (mixte à tendance...)
    if (key.includes('mixte') && key.includes('tendance') && (key.includes('grasse') || key.includes('grass'))) {
      return 'Mixte à tendance grasse';
    }
    if (key.includes('mixte') && key.includes('tendance') && (key.includes('seche') || key.includes('sec'))) {
      return 'Mixte à tendance sèche';
    }

    // Types simples : on retire le 's' final éventuel pour gérer les pluriels
    const singular = key.replace(/s$/, '');

    if (singular === 'normal' || singular === 'normale') return 'Normale';
    if (singular === 'seche' || singular === 'sec') return 'Sèche';
    if (singular === 'grasse' || singular === 'gras' || singular === 'grass') return 'Grasse';
    if (singular === 'mixte' || singular === 'mixt') return 'Mixte';
    if (singular === 'sensible') return 'Sensible';

    return typePeau.trim();
  };

  // Fonction pour normaliser la sensibilité cutanée
  const normalizeSensibiliteCutanee = (sensibilite: any) => {
    if (!sensibilite) return 'Non spécifié';

    const key = sensibilite.trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (key.includes('non') && key.includes('sensible')) return 'Peau non sensible';
    if (key.includes('peu') && key.includes('sensible')) return 'Peau peu sensible';
    if (key.includes('sensible')) return 'Peau sensible';

    return sensibilite.trim();
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

      // 1. Récupérer les associations étude-volontaire pour obtenir numsujet
      const associationsData: Record<number, any> = {};

      if (volunteerIds.length > 0 && studyId) {
        try {
          const associationsResponse = await api.get(`/etude-volontaires/etude/${studyId}`);

          let associations: any[] = [];
          if (Array.isArray(associationsResponse.data)) {
            associations = associationsResponse.data;
          } else if (associationsResponse.data?.success && Array.isArray(associationsResponse.data.data)) {
            associations = associationsResponse.data.data;
          } else if (associationsResponse.data && Array.isArray(associationsResponse.data.data)) {
            associations = associationsResponse.data.data;
          }

          associations.forEach((assoc: any) => {
            if (assoc.idVolontaire) {
              associationsData[assoc.idVolontaire] = assoc;
            }
          });
        } catch (error) {
          console.error('Erreur lors de la récupération des associations:', error);
        }
      }

      setExportProgress(10);

      // 2. Récupérer les détails complets de tous les volontaires
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
          // Récupérer le numsujet depuis les associations (base de données)
          const association = associationsData[result.id];
          const numsujetFromDb = association?.numsujet;

          const normalizedData = {
            ...result.data,
            // Utiliser le numsujet de la BDD, laisser vide si 0 ou undefined
            numeroSujet: (numsujetFromDb && numsujetFromDb !== 0) ? numsujetFromDb : '',
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
        'ID Vol',
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

      // 4. Trier par numéro de sujet croissant (null/vide en premier)
      volunteersData.sort((a, b) => {
        const numA = a.numeroSujet;
        const numB = b.numeroSujet;
        if (!numA && !numB) return 0;
        if (!numA) return -1;
        if (!numB) return 1;
        return Number(numA) - Number(numB);
      });

      const studyStartDate = studyInfo?.dateDebut ? formatDateEnglish(studyInfo.dateDebut) : '';

      volunteersData.forEach((volunteer) => {
        const row = [];

        // ID Vol
        row.push(volunteer.idVol || '');

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

        // Phototype (utilise l'attribut phototype de l'entité)
        row.push(volunteer.phototype || '');

        dataRows.push(row);
      });

      setExportProgress(85);

      // 5. Définir les plages de données pour les formules Excel
      // Les données commencent à la ligne 4 (après titre, en-têtes, ligne vide)
      const dataStartRowExcel = 4; // Ligne Excel (1-indexed)
      const dataEndRowExcel = dataStartRowExcel + volunteersData.length - 1;

      // Colonnes: D=Age, E=Sensibilité, F=Type peau, H=Ethnie, AE=Phototype
      const ageRange = `D${dataStartRowExcel}:D${dataEndRowExcel}`;
      const sensibiliteRange = `E${dataStartRowExcel}:E${dataEndRowExcel}`;
      const typePeauRange = `F${dataStartRowExcel}:F${dataEndRowExcel}`;
      const ethnieRange = `H${dataStartRowExcel}:H${dataEndRowExcel}`;
      const phototypeRange = `AE${dataStartRowExcel}:AE${dataEndRowExcel}`;

      // === CALCULS PRÉALABLES (pour les valeurs initiales) ===
      const ages = volunteersData.map(v => {
        if (v.dateNaissance) {
          return Math.floor((new Date().getTime() - new Date(v.dateNaissance).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        }
        return null;
      }).filter((age): age is number => age !== null && age > 0);

      const moyenneAge = ages.length > 0 ? Math.round(ages.reduce((a: number, b: number) => a + b, 0) / ages.length * 10) / 10 : 0;
      const minAge = ages.length > 0 ? Math.min(...ages) : 0;
      const maxAge = ages.length > 0 ? Math.max(...ages) : 0;

      let ecartTypeAge = 0;
      if (ages.length > 0) {
        const variance = ages.reduce((acc: number, age: number) => acc + Math.pow(age - moyenneAge, 2), 0) / ages.length;
        ecartTypeAge = Math.round(Math.sqrt(variance) * 10) / 10;
      }

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

      // Comptages pour les statistiques
      const sensibiliteStats: Record<string, number> = volunteersData.reduce((acc: Record<string, number>, v: any) => {
        const sens = v.sensibiliteCutanee || 'Non spécifié';
        acc[sens] = (acc[sens] || 0) + 1;
        return acc;
      }, {});

      const typesPeauStats: Record<string, number> = volunteersData.reduce((acc: Record<string, number>, v: any) => {
        const type = v.typePeauVisage || 'Non spécifié';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      const phototypesStats: Record<string, number> = volunteersData.reduce((acc: Record<string, number>, v: any) => {
        const phototype = v.phototype || 'Non spécifié';
        acc[phototype] = (acc[phototype] || 0) + 1;
        return acc;
      }, {});

      const ethniesStats: Record<string, number> = volunteersData.reduce((acc: Record<string, number>, v: any) => {
        const ethnie = formatEthnieEnglish(v.ethnie) || 'Not specified';
        acc[ethnie] = (acc[ethnie] || 0) + 1;
        return acc;
      }, {});

      // Plusieurs lignes vides pour séparer les données des statistiques
      dataRows.push(new Array(headers.length).fill(''));
      dataRows.push(new Array(headers.length).fill(''));
      dataRows.push(new Array(headers.length).fill(''));

      // TITRE DE LA SECTION STATISTIQUES
      const statsTitle = ['=== STATISTIQUES DÉMOGRAPHIQUES (avec formules) ==='];
      dataRows.push(statsTitle);
      dataRows.push(new Array(headers.length).fill(''));

      // Structure pour stocker les formules à appliquer après création de la feuille
      // Maintenant avec valeur calculée + formule
      const formulesToApply: Array<{row: number, col: number, formula: string, value: number}> = [];
      let currentRowIndex = dataRows.length;

      // === 1. STATISTIQUES D'ÂGE ===
      const ageStatsLabels = [
        ['STATISTIQUES D\'ÂGE', 'Valeur', 'Unité'],
        ['N (effectif)', ages.length, ''],
        ['Moyenne', moyenneAge, 'ans'],
        ['Médiane', medianeAge, 'ans'],
        ['Écart type', ecartTypeAge, 'ans'],
        ['Minimum', minAge, 'ans'],
        ['Maximum', maxAge, 'ans'],
        ['', '', '']
      ];

      ageStatsLabels.forEach((statRow, idx) => {
        const row = new Array(headers.length).fill('');
        row[0] = statRow[0];
        row[1] = statRow[1];
        row[2] = statRow[2];
        dataRows.push(row);

        // Ajouter les formules avec valeurs pré-calculées
        if (idx === 1) {
          formulesToApply.push({row: currentRowIndex + idx, col: 1, formula: `COUNT(${ageRange})`, value: ages.length});
        } else if (idx === 2) {
          formulesToApply.push({row: currentRowIndex + idx, col: 1, formula: `ROUND(AVERAGE(${ageRange}),1)`, value: moyenneAge});
        } else if (idx === 3) {
          formulesToApply.push({row: currentRowIndex + idx, col: 1, formula: `MEDIAN(${ageRange})`, value: medianeAge});
        } else if (idx === 4) {
          formulesToApply.push({row: currentRowIndex + idx, col: 1, formula: `ROUND(STDEV(${ageRange}),1)`, value: ecartTypeAge});
        } else if (idx === 5) {
          formulesToApply.push({row: currentRowIndex + idx, col: 1, formula: `MIN(${ageRange})`, value: minAge});
        } else if (idx === 6) {
          formulesToApply.push({row: currentRowIndex + idx, col: 1, formula: `MAX(${ageRange})`, value: maxAge});
        }
      });
      currentRowIndex = dataRows.length;

      // === 2. STATISTIQUES DE SENSIBILITÉ CUTANÉE ===
      const sensibiliteValues = Object.keys(sensibiliteStats);
      const sensibiliteLabels: (string | number)[][] = [['SENSIBILITÉ CUTANÉE', 'N', '%']];
      sensibiliteValues.forEach(val => {
        const count = sensibiliteStats[val];
        const pct = Math.round((count / volunteersData.length) * 100 * 10) / 10;
        sensibiliteLabels.push([val, count, pct]);
      });
      sensibiliteLabels.push(['TOTAL', volunteersData.length, 100]);
      sensibiliteLabels.push(['', '', '']);

      sensibiliteLabels.forEach((statRow, idx) => {
        const row = new Array(headers.length).fill('');
        row[0] = statRow[0];
        row[1] = statRow[1];
        row[2] = statRow[2];
        dataRows.push(row);

        if (idx >= 1 && idx <= sensibiliteValues.length) {
          const value = sensibiliteValues[idx - 1];
          const count = sensibiliteStats[value];
          const pct = Math.round((count / volunteersData.length) * 100 * 10) / 10;
          formulesToApply.push({row: currentRowIndex + idx, col: 1, formula: `COUNTIF(${sensibiliteRange},"${value}")`, value: count});
          formulesToApply.push({row: currentRowIndex + idx, col: 2, formula: `ROUND(COUNTIF(${sensibiliteRange},"${value}")/COUNTA(${sensibiliteRange})*100,1)`, value: pct});
        } else if (idx === sensibiliteValues.length + 1) {
          formulesToApply.push({row: currentRowIndex + idx, col: 1, formula: `COUNTA(${sensibiliteRange})`, value: volunteersData.length});
        }
      });
      currentRowIndex = dataRows.length;

      // === 3. STATISTIQUES DE TYPES DE PEAU ===
      const orderedTypesPeau = ['Grasse', 'Mixte', 'Normale', 'Sèche', 'Sensible', 'Mixte à tendance grasse', 'Mixte à tendance sèche'];
      const typesPeauPresents = [...new Set(volunteersData.map(v => v.typePeauVisage || 'Non spécifié'))];
      const allTypesPeau = [...new Set([...orderedTypesPeau.filter(t => typesPeauPresents.includes(t)), ...typesPeauPresents])];

      const typesPeauLabels: (string | number)[][] = [['TYPES DE PEAU', 'N', '%']];
      allTypesPeau.forEach(type => {
        const count = typesPeauStats[type] || 0;
        const pct = Math.round((count / volunteersData.length) * 100 * 10) / 10;
        typesPeauLabels.push([type, count, pct]);
      });
      typesPeauLabels.push(['TOTAL', volunteersData.length, 100]);
      typesPeauLabels.push(['', '', '']);

      typesPeauLabels.forEach((statRow, idx) => {
        const row = new Array(headers.length).fill('');
        row[0] = statRow[0];
        row[1] = statRow[1];
        row[2] = statRow[2];
        dataRows.push(row);

        if (idx >= 1 && idx <= allTypesPeau.length) {
          const type = allTypesPeau[idx - 1];
          const count = typesPeauStats[type] || 0;
          const pct = Math.round((count / volunteersData.length) * 100 * 10) / 10;
          formulesToApply.push({row: currentRowIndex + idx, col: 1, formula: `COUNTIF(${typePeauRange},"${type}")`, value: count});
          formulesToApply.push({row: currentRowIndex + idx, col: 2, formula: `ROUND(COUNTIF(${typePeauRange},"${type}")/COUNTA(${typePeauRange})*100,1)`, value: pct});
        } else if (idx === allTypesPeau.length + 1) {
          formulesToApply.push({row: currentRowIndex + idx, col: 1, formula: `COUNTA(${typePeauRange})`, value: volunteersData.length});
        }
      });
      currentRowIndex = dataRows.length;

      // === 4. STATISTIQUES DE PHOTOTYPES ===
      const orderedPhototypes = ['Phototype 1', 'Phototype 2', 'Phototype 3', 'Phototype 4', 'Phototype 5', 'Phototype 6'];

      const phototypesLabels: (string | number)[][] = [['PHOTOTYPES', 'N', '%']];
      orderedPhototypes.forEach(type => {
        const count = phototypesStats[type] || 0;
        const pct = Math.round((count / volunteersData.length) * 100 * 10) / 10;
        phototypesLabels.push([type, count, pct]);
      });
      phototypesLabels.push(['TOTAL', volunteersData.length, 100]);
      phototypesLabels.push(['', '', '']);

      phototypesLabels.forEach((statRow, idx) => {
        const row = new Array(headers.length).fill('');
        row[0] = statRow[0];
        row[1] = statRow[1];
        row[2] = statRow[2];
        dataRows.push(row);

        if (idx >= 1 && idx <= orderedPhototypes.length) {
          const type = orderedPhototypes[idx - 1];
          const count = phototypesStats[type] || 0;
          const pct = Math.round((count / volunteersData.length) * 100 * 10) / 10;
          formulesToApply.push({row: currentRowIndex + idx, col: 1, formula: `COUNTIF(${phototypeRange},"${type}")`, value: count});
          formulesToApply.push({row: currentRowIndex + idx, col: 2, formula: `ROUND(COUNTIF(${phototypeRange},"${type}")/COUNTA(${phototypeRange})*100,1)`, value: pct});
        } else if (idx === orderedPhototypes.length + 1) {
          formulesToApply.push({row: currentRowIndex + idx, col: 1, formula: `COUNTA(${phototypeRange})`, value: volunteersData.length});
        }
      });
      currentRowIndex = dataRows.length;

      // === 5. STATISTIQUES D'ETHNIES ===
      const ethniesPresentes = Object.keys(ethniesStats);

      const ethniesLabels: (string | number)[][] = [['ETHNIES', 'N', '%']];
      ethniesPresentes.forEach(ethnie => {
        const count = ethniesStats[ethnie];
        const pct = Math.round((count / volunteersData.length) * 100 * 10) / 10;
        ethniesLabels.push([ethnie, count, pct]);
      });
      ethniesLabels.push(['TOTAL', volunteersData.length, 100]);

      ethniesLabels.forEach((statRow, idx) => {
        const row = new Array(headers.length).fill('');
        row[0] = statRow[0];
        row[1] = statRow[1];
        row[2] = statRow[2];
        dataRows.push(row);

        if (idx >= 1 && idx <= ethniesPresentes.length) {
          const ethnie = ethniesPresentes[idx - 1];
          const count = ethniesStats[ethnie];
          const pct = Math.round((count / volunteersData.length) * 100 * 10) / 10;
          formulesToApply.push({row: currentRowIndex + idx, col: 1, formula: `COUNTIF(${ethnieRange},"${ethnie}")`, value: count});
          formulesToApply.push({row: currentRowIndex + idx, col: 2, formula: `ROUND(COUNTIF(${ethnieRange},"${ethnie}")/COUNTA(${ethnieRange})*100,1)`, value: pct});
        } else if (idx === ethniesPresentes.length + 1) {
          formulesToApply.push({row: currentRowIndex + idx, col: 1, formula: `COUNTA(${ethnieRange})`, value: volunteersData.length});
        }
      });

      setExportProgress(90);

      // 6. Créer le fichier Excel
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(dataRows);

      // 6b. Appliquer les formules Excel aux cellules avec valeurs pré-calculées
      formulesToApply.forEach(({row, col, formula, value}) => {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        // Cellule avec valeur calculée ET formule
        // Excel affiche la valeur immédiatement et recalcule si les données changent
        ws[cellRef] = { f: formula, t: 'n', v: value };
      });

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
        { width: 10 },  // ID Vol
        { width: 10 },  // N° Sujet
        { width: 8 },   // Code
        { width: 6 },   // Age
        { width: 20 },  // Sensibilité cutanée
        { width: 25 },  // Type de peau
        { width: 12 },  // D0 (date début)
        { width: 15 },  // Ethnie
        { width: 3 },   // Vide
        { width: 20 },  // Type de peau EN
        // Colonnes vides (20 colonnes)
        ...Array(20).fill({ width: 3 }),
        { width: 15 },  // Phototype
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