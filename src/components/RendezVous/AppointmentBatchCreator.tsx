import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import AppointmentConfirmationModal from './AppointmentComponents/AppointmentConfirmationModal';
import { Etude } from '../../types/types';
import { GroupeData } from '../../types/etude.types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { ArrowLeft, Calendar, AlertCircle, CheckCircle2, Info, AlertTriangle, ChevronDown, Check, Search } from 'lucide-react';

interface DateSlot {
  day: string;
  month: string;
  year: string;
  slots: number[];
}

interface SlotStatus {
  status: string;
  color: string;
  message: string;
}

interface AppointmentsSummary {
  totalAppointments: number;
  datesSummary: {
    date: string;
    slots: { time: string; volume: number }[];
    totalForDate: number;
  }[];
  studyInfo: Etude | undefined;
  groupInfo: GroupeData | undefined;
  comments: string;
}

interface AppointmentBatchCreatorProps {
  studies: Etude[];
  selectedStudy: Etude | null;
  onStudySelect: (study: Etude | null) => void;
  onBack: () => void;
  onSuccess: () => void;
}

const AppointmentBatchCreator = ({
  studies,
  selectedStudy,
  onStudySelect,
  onBack,
  onSuccess
}: AppointmentBatchCreatorProps) => {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<GroupeData[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [timeBetweenHours, setTimeBetweenHours] = useState<string>('0');
  const [timeBetweenMinutes, setTimeBetweenMinutes] = useState<string>('30');
  const [dates, setDates] = useState<DateSlot[]>([{ day: '', month: '', year: '', slots: [] }]);
  const [startHour, setStartHour] = useState<string>('08');
  const [startMinute, setStartMinute] = useState<string>('00');
  const [endHour, setEndHour] = useState<string>('18');
  const [endMinute, setEndMinute] = useState<string>('00');
  const [comments, setComments] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [dateCount, setDateCount] = useState<number>(1);
  const [currentStudyId, setCurrentStudyId] = useState<string | number>(selectedStudy?.id || '');
  const [loadingGroups, setLoadingGroups] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [appointmentsSummary, setAppointmentsSummary] = useState<AppointmentsSummary | null>(null);
  const [searchEtudeTerm, setSearchEtudeTerm] = useState<string>('');
  const [showEtudeSelector, setShowEtudeSelector] = useState<boolean>(false);

  const etudeSelectorRef = useRef<HTMLDivElement>(null);

  //  Fonction pour pré-remplir la première date avec la date de début de l'étude
  const prefillFirstDateFromStudy = (study: Etude) => {
    if (!study || !study.dateDebut) return;

    try {
      // Parser la date de début (format attendu: YYYY-MM-DD ou DD/MM/YYYY)
      let parsedDate;
      const dateStr = study.dateDebut;
      
      if (dateStr.includes('-')) {
        // Format YYYY-MM-DD
        parsedDate = new Date(dateStr);
      } else if (dateStr.includes('/')) {
        // Format DD/MM/YYYY
        const [day, month, year] = dateStr.split('/');
        parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      } else {
        console.warn("Format de date non reconnu:", dateStr);
        return;
      }

      if (isNaN(parsedDate.getTime())) {
        console.warn("Date invalide:", dateStr);
        return;
      }

      // Pré-remplir la première date
      setDates(prevDates => {
        const newDates = [...prevDates];
        newDates[0] = {
          ...newDates[0],
          day: parsedDate.getDate().toString().padStart(2, '0'),
          month: (parsedDate.getMonth() + 1).toString().padStart(2, '0'),
          year: parsedDate.getFullYear().toString(),
          slots: newDates[0].slots || []
        };
        return newDates;
      });
            
    } catch (err) {
      console.error("Erreur lors du pré-remplissage de la date:", err);
    }
  };

  // ✅ Effet pour maintenir la synchronisation entre props et état local
  useEffect(() => {
    if (selectedStudy?.id && selectedStudy.id !== currentStudyId) {
      setCurrentStudyId(selectedStudy.id);
      loadGroupsForStudy(selectedStudy.id);

      //  Pré-remplir la première date si l'étude est passée en props
      prefillFirstDateFromStudy(selectedStudy);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudy?.id]); // ⚠️ Ne dépendre QUE de selectedStudy.id, pas de currentStudyId qui change

  // ✅ Effet pour charger les groupes à l'initialisation si une étude est déjà sélectionnée
  // Cela résout le problème quand le composant est remonté avec la même étude
  useEffect(() => {
    if (selectedStudy?.id && groups.length === 0 && !loadingGroups) {
      loadGroupsForStudy(selectedStudy.id);
      prefillFirstDateFromStudy(selectedStudy);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Exécuté uniquement au montage du composant

  // Fonction pour charger les groupes d'une étude via l'API
  const loadGroupsForStudy = async (studyId: string | number) => {
    if (!studyId) return;
    
    try {
      setLoadingGroups(true);
      setError(null);      
      // Appel à l'API REST pour récupérer les groupes de l'étude
      const response = await api.get(`/groupes/etude/${studyId}`);
      
      // Déterminer si la réponse est un tableau ou contient un sous-objet 'content'
      let groupsData = response.data;
      if (response.data && response.data.content && Array.isArray(response.data.content)) {
        groupsData = response.data.content;
      } else if (!Array.isArray(response.data)) {
        console.warn(t('appointments.unexpectedResponseFormat'), response.data);
        groupsData = [];
      }
            
      // Simplement configurer les données brutes - ne pas trop les traiter
      const formattedGroups = groupsData.map((group: any) => {
        return {
          ...group,
          // S'assurer que les propriétés essentielles existent
          id: group.idGroupe,
          intitule: group.intitule || group.nom || `Groupe ${group.id}`,
          nbSujet: group.nbSujet || 0 //  Récupérer le nombre de sujets
        };
      });
      
      setGroups(formattedGroups);
      
      // Auto-sélectionner s'il n'y a qu'un seul groupe
      if (formattedGroups.length === 1) {
        setSelectedGroup(String(formattedGroups[0].id));
      } else {
        // Ne pas forcer la réinitialisation si déjà sélectionné
        setSelectedGroup(prev => prev || '');
      }
    } catch (err) {
      console.error(t('groups.loadError'), err);
      const error = err as Error;
      setError(`${t('groups.loadError')}: ${error.message}`);
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  //  Fonction pour calculer le nombre total de créneaux ouverts
  const calculateTotalSlots = () => {
    return dates.reduce((total, date) => {
      return total + (date.slots || []).reduce((dateTotal, slotVolume) => {
        return dateTotal + (typeof slotVolume === 'number' ? slotVolume : parseInt(String(slotVolume), 10) || 0);
      }, 0);
    }, 0);
  };

  //  Fonction pour obtenir le nombre de sujets du groupe sélectionné
  const getSelectedGroupSubjectCount = (): number => {
    if (!selectedGroup) return 0;
    const group = groups.find(g => g.idGroupe?.toString() === selectedGroup.toString());
    return group ? (group.nbSujet || 0) : 0;
  };

  //  Fonction pour déterminer le statut et la couleur de la pastille
  const getSlotStatus = (): SlotStatus => {
    const totalSlots = calculateTotalSlots();
    const subjectCount = getSelectedGroupSubjectCount();

    if (!selectedGroup) {
      return { status: 'no-group', color: 'gray', message: t('appointments.selectGroup') };
    }

    if (totalSlots === 0) {
      return { status: 'empty', color: 'gray', message: t('appointments.noOpenSlots') };
    }

    if (subjectCount === 0) {
      return { status: 'no-subjects', color: 'yellow', message: t('appointments.noSubjectEnrolledInGroup') };
    }

    if (totalSlots === subjectCount) {
      return { status: 'perfect', color: 'green', message: `${t('appointments.perfect')} : ${subjectCount} ${t('appointments.subjectsFor')} ${totalSlots} ${t('appointments.slots')}` };
    }

    if (totalSlots > subjectCount) {
      const diff = totalSlots - subjectCount;
      return {
        status: 'shortage',
        color: 'red',
        message: `⚠️ ${t('appointments.overflow')} : ${diff} ${t('appointments.slotsInExcess')} (${totalSlots} ${t('appointments.slots')} ${t('appointments.subjectsFor')} ${subjectCount} ${t('appointments.subjects')})`
      };
    }

    const diff = subjectCount - totalSlots;
    return {
      status: 'excess',
      color: 'blue',
      message: `ℹ️ ${t('appointments.remainingCapacity')} : ${diff} ${t('appointments.subjectsAvailable')} (${subjectCount} ${t('appointments.subjects')} ${t('appointments.subjectsFor')} ${totalSlots} ${t('appointments.slots')})`
    };
  };

  //  Composant pour afficher la pastille d'état
  const SlotStatusBadge = () => {
    const { color, message } = getSlotStatus();

    const getIcon = () => {
      switch (color) {
        case 'green':
          return <CheckCircle2 className="h-3 w-3" />;
        case 'red':
          return <AlertCircle className="h-3 w-3" />;
        case 'yellow':
          return <AlertTriangle className="h-3 w-3" />;
        case 'blue':
          return <Info className="h-3 w-3" />;
        default:
          return <Info className="h-3 w-3" />;
      }
    };

    const getVariant = () => {
      switch (color) {
        case 'green':
          return 'default';
        case 'red':
          return 'destructive';
        case 'yellow':
          return 'outline';
        case 'blue':
          return 'secondary';
        default:
          return 'outline';
      }
    };

    return (
      <Badge variant={getVariant() as any} className="gap-1 py-1">
        {getIcon()}
        {message}
      </Badge>
    );
  };

  // Charger les groupes lorsqu'une étude est sélectionnée
  const handleStudyChange = (studyId: string) => {
    setCurrentStudyId(studyId);
    const study = studies.find(s => s.id?.toString() === studyId);
    onStudySelect(study || null);

    //  Pré-remplir la première date avec la date de début de l'étude
    if (study) {
      prefillFirstDateFromStudy(study);
    }

    // Charger les groupes via l'API REST
    loadGroupsForStudy(studyId);
  };

  // (grille de groupes supprimée pour éviter la redondance avec le sélecteur)

  // Mettre à jour le nombre de dates à générer
  const handleDateCountChange = (count: string) => {
    const countInt = parseInt(count, 10);
    setDateCount(countInt);

    // Ajuster le tableau des dates si nécessaire
    if (countInt > dates.length) {
      // Ajouter des dates
      const newDates = [...dates];
      for (let i = dates.length; i < countInt; i++) {
        newDates.push({ day: '', month: '', year: '', slots: [] });
      }
      setDates(newDates);
    } else if (countInt < dates.length) {
      // Supprimer des dates
      setDates(dates.slice(0, countInt));
    }
  };

  // Mettre à jour les infos d'une date
  const handleDateChange = (index: number, field: keyof DateSlot, value: string) => {
    const newDates = [...dates];
    newDates[index] = { ...newDates[index], [field]: value };
    setDates(newDates);
  };

  // Mettre à jour le nombre de volontaires pour un créneau d'une date
  const handleSlotVolumeChange = (dateIndex: number, slotIndex: number, volume: string) => {
    const newDates = [...dates];
    if (!newDates[dateIndex].slots) {
      newDates[dateIndex].slots = [];
    }

    // Assurez-vous que le tableau des slots a assez d'éléments
    while (newDates[dateIndex].slots.length <= slotIndex) {
      newDates[dateIndex].slots.push(0);
    }

    newDates[dateIndex].slots[slotIndex] = parseInt(volume, 10);
    setDates(newDates);
  };

  // Générer les créneaux horaires en fonction des horaires de début et de fin
  const generateTimeSlots = () => {
    const slots = [];
    const startHourInt = parseInt(startHour, 10) || 0;
    const startMinuteInt = parseInt(startMinute, 10) || 0;
    const endHourInt = parseInt(endHour, 10) || 0;
    const endMinuteInt = parseInt(endMinute, 10) || 0;
    const timeBetweenHoursInt = parseInt(timeBetweenHours, 10) || 0;
    const timeBetweenMinutesInt = parseInt(timeBetweenMinutes, 10) || 0;

    // Convertir en minutes pour faciliter les calculs
    const startMinutes = startHourInt * 60 + startMinuteInt;
    const endMinutes = endHourInt * 60 + endMinuteInt;
    const timeBetweenTotal = timeBetweenHoursInt * 60 + timeBetweenMinutesInt;

    // Vérifier que l'heure de fin est postérieure à l'heure de début
    if (endMinutes <= startMinutes) {
      return [];
    }

    // Si le temps entre les RDV est 0, retourner un seul créneau
    if (timeBetweenTotal === 0) {
      const hour = Math.floor(startMinutes / 60);
      const minute = startMinutes % 60;
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      return [`${formattedHour}h${formattedMinute}`];
    }

    // Générer les créneaux
    let currentMinutes = startMinutes;
    while (currentMinutes < endMinutes) {
      const hour = Math.floor(currentMinutes / 60);
      const minute = currentMinutes % 60;
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      slots.push(`${formattedHour}h${formattedMinute}`);

      currentMinutes += timeBetweenTotal;
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  //  Fonction pour pré-remplir automatiquement les dates consécutives
  const fillConsecutiveDates = () => {
    if (!dates[0].day || !dates[0].month || !dates[0].year) {
      alert(t('appointments.pleaseFillDate1First'));
      return;
    }

    try {
      const baseDate = new Date(
        parseInt(dates[0].year),
        parseInt(dates[0].month) - 1,
        parseInt(dates[0].day)
      );

      if (isNaN(baseDate.getTime())) {
        alert(t('appointments.invalidDate1'));
        return;
      }

      const newDates = [...dates];
      for (let i = 1; i < dates.length; i++) {
        const nextDate = new Date(baseDate);
        nextDate.setDate(baseDate.getDate() + i);

        newDates[i] = {
          ...newDates[i],
          day: nextDate.getDate().toString().padStart(2, '0'),
          month: (nextDate.getMonth() + 1).toString().padStart(2, '0'),
          year: nextDate.getFullYear().toString()
        };
      }

      setDates(newDates);
    } catch (err) {
      console.error(t('appointments.errorGeneratingDates'), err);
      alert(t('appointments.errorGeneratingDates'));
    }
  };

  // Fonction pour calculer et préparer le résumé des rendez-vous à créer
  const calculateAppointmentsSummary = (): AppointmentsSummary => {
    const summary: AppointmentsSummary = {
      totalAppointments: 0,
      datesSummary: [],
      studyInfo: studies.find(s => s.id?.toString() === currentStudyId.toString()),
      groupInfo: groups.find(g => g.idGroupe?.toString() === selectedGroup.toString()),
      comments
    };

    dates.forEach((date) => {
      const dateStr = `${date.day.padStart(2, '0')}/${date.month.padStart(2, '0')}/${date.year}`;
      const dateSummary: {
        date: string;
        slots: { time: string; volume: number }[];
        totalForDate: number;
      } = {
        date: dateStr,
        slots: [],
        totalForDate: 0
      };

      timeSlots.forEach((slot, slotIndex) => {
        const volume = date.slots[slotIndex] || 0;
        if (volume > 0) {
          dateSummary.slots.push({ time: slot, volume });
          dateSummary.totalForDate += volume;
          summary.totalAppointments += volume;
        }
      });

      if (dateSummary.totalForDate > 0) {
        summary.datesSummary.push(dateSummary);
      }
    });

    return summary;
  };

  const handleSubmit = async () => {
    // Validation des entrées
    if (!currentStudyId) {
      setError(t('appointments.pleaseSelectStudy'));
      return;
    }

    if (!selectedGroup) {
      setError(t('appointments.pleaseSelectGroup'));
      return;
    }

    // Vérifier que toutes les dates sont complètes
    const incompleteDate = dates.find(d => !d.day || !d.month || !d.year);
    if (incompleteDate) {
      setError(t('appointments.pleaseFillAllDates'));
      return;
    }

    //  Vérification de l'équilibre sujets/créneaux
    const totalSlots = calculateTotalSlots();
    const subjectCount = getSelectedGroupSubjectCount();
    const slotStatus = getSlotStatus();
    const { status } = slotStatus;
    
    if (status === 'shortage') {
      const confirmed = window.confirm(
        `⚠️ ATTENTION : Vous demandez ${totalSlots} créneaux mais le groupe n'a que ${subjectCount} sujets inscrits.\n\n${totalSlots - subjectCount} créneaux resteront sans sujet.\n\nVoulez-vous continuer ?`
      );
      if (!confirmed) return;
    }
    
    if (status === 'no-subjects') {
      const confirmed = window.confirm(
        `⚠️ ATTENTION : Aucun sujet n'est inscrit à ce groupe.\n\nTous les créneaux seront créés sans sujet assigné.\n\nVoulez-vous continuer ?`
      );
      if (!confirmed) return;
    }

    // Préparer le résumé et afficher le modal de confirmation
    const summary = calculateAppointmentsSummary();
    setAppointmentsSummary(summary);
    setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Récupérer l'étude actuelle à partir de l'ID local
      const currentStudy = studies.find(s => s.id?.toString() === currentStudyId.toString());

      // Trouver le groupe sélectionné
      const selectedGroupObj = groups.find(g => g.idGroupe?.toString() === selectedGroup.toString());
      console.log("Objet groupe sélectionné:", selectedGroupObj);
      
      // Convertir les IDs en nombres pour le backend
      let studyId: number, groupId: number;

      try {
        studyId = typeof currentStudyId === 'number' ? currentStudyId : parseInt(currentStudyId.toString(), 10);
        if (isNaN(studyId)) {
          throw new Error(`ID d'étude non numérique: ${currentStudyId}`);
        }

        groupId = parseInt(selectedGroup, 10);
        if (isNaN(groupId)) {
          throw new Error(`ID de groupe non numérique: ${selectedGroup}`);
        }
      } catch (convErr) {
        const error = convErr as Error;
        console.error("Erreur de conversion:", error);
        throw new Error(`Erreur de conversion: ${error.message}.
          Types: étude=${typeof currentStudyId}, groupe=${typeof selectedGroup}.
          Valeurs: étude=${currentStudyId}, groupe=${selectedGroup}`);
      }

      // Préparer les données pour l'API
      const batchData = {
        idEtude: studyId,
        idGroupe: groupId,
        dates: dates.map(d => ({
          date: `${d.year}-${d.month.padStart(2, '0')}-${d.day.padStart(2, '0')}`,
          slots: timeSlots.map((time, index) => ({
            time,
            volume: d.slots[index] || 0
          }))
        })),
        commentaires: comments
      };

      // Préparer tous les RDV à créer en lot
      const rdvList = [];

      // Pour chaque date
      for (const dateInfo of batchData.dates) {
        // Pour chaque créneau horaire dans cette date
        for (const slot of dateInfo.slots) {
          // Si volume > 0, créer autant de rendez-vous que nécessaire
          if (slot.volume > 0) {
            // Calculer la durée en minutes à partir du temps entre chaque RDV
            const dureeMinutes = parseInt(timeBetweenHours, 10) * 60 + parseInt(timeBetweenMinutes, 10);

            for (let i = 0; i < slot.volume; i++) {
              const rdvData = {
                idEtude: batchData.idEtude,
                idGroupe: batchData.idGroupe,
                date: dateInfo.date,
                heure: slot.time,
                duree: dureeMinutes > 0 ? dureeMinutes : null,
                commentaires: batchData.commentaires,
                etat: 'PLANIFIE',
                // Le volontaire sera assigné plus tard
              };
              rdvList.push(rdvData);
            }
          }
        }
      }

      console.log(`🚀 Envoi de ${rdvList.length} RDV en batch à l'API`);

      // Appel à l'endpoint batch
      const response = await api.post('/rdvs/batch', rdvList);

      console.log(`📋 Réponse batch API:`, response.data);

      // Vérifier la réponse
      if (!response.data) {
        throw new Error(t('appointments.emptyServerResponse'));
      }

      const { created, total, errors } = response.data;

      console.log(`✅ Batch terminé : ${created} RDV créés sur ${total} demandés`);

      if (errors && errors.length > 0) {
        console.warn(`⚠️ Erreurs batch :`, errors);

        if (created === 0) {
          throw new Error(`${t('appointments.noAppointmentCreated')} : ${errors.join(', ')}`);
        } else {
          // Partiellement réussi
          alert(t('appointments.appointmentsCreatedPartial', { created, total }) + `\n\nErreurs :\n${errors.join('\n')}`);
        }
      }

      // Fermer le modal et afficher le succès
      setShowConfirmModal(false);

      if (onSuccess) {
        // S'assurer que l'étude reste sélectionnée avant d'appeler onSuccess
        onStudySelect(currentStudy || null);
        onSuccess();
      }

    } catch (err) {
      const error = err as Error;
      setError(t('appointments.errorCreatingAppointments') + ': ' + error.message);
      console.error(err);
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // debug inspectGroups supprimé

  // Filtrer les études selon la recherche
  const filteredStudies = searchEtudeTerm.trim()
    ? studies.filter(study => {
        const searchLower = searchEtudeTerm.toLowerCase();
        const refMatch = study.ref?.toLowerCase().includes(searchLower);
        const titleMatch = study.titre?.toLowerCase().includes(searchLower);
        return refMatch || titleMatch;
      }).slice(0, 50)
    : [...studies].reverse().slice(0, 50);

  // Gérer le clic en dehors du dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (etudeSelectorRef.current && !etudeSelectorRef.current.contains(event.target as Node)) {
        setShowEtudeSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{t('appointments.createMultipleAppointments')}</h2>
          {selectedStudy && (
            <p className="text-sm text-gray-600 mt-1">
              <Badge variant="outline" className="mr-2">{selectedStudy.ref}</Badge>
              {selectedStudy.titre}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sélection d'étude */}
          <div className="space-y-2">
            <Label htmlFor="study-select">{t('appointments.study')}</Label>
            <div ref={etudeSelectorRef} className="relative">
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={showEtudeSelector}
                className="w-full justify-between h-auto py-2"
                onClick={() => setShowEtudeSelector(!showEtudeSelector)}
              >
                <span className="truncate">
                  {selectedStudy ? `${selectedStudy.ref} - ${selectedStudy.titre}` : t('appointments.selectStudy')}
                </span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
              {showEtudeSelector && (
                <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-[300px] overflow-auto">
                  <div className="p-2 border-b sticky top-0 bg-white">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder={t('appointments.searchStudy')}
                        value={searchEtudeTerm}
                        onChange={(e) => setSearchEtudeTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="p-1">
                    {filteredStudies.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-center text-muted-foreground">
                        {t('appointments.noStudyFound')}
                      </div>
                    ) : (
                      filteredStudies.map((study) => (
                        <div
                          key={study.id}
                          className={`flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded ${
                            currentStudyId === study.id ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => {
                            handleStudyChange(study.id!.toString());
                            setShowEtudeSelector(false);
                            setSearchEtudeTerm('');
                          }}
                        >
                          {currentStudyId === study.id && <Check className="mr-2 h-4 w-4" />}
                          <span className={currentStudyId !== study.id ? 'ml-6' : ''}>
                            {study.ref} - {study.titre}
                          </span>
                        </div>
                      ))
                    )}
                    {filteredStudies.length >= 50 && (
                      <div className="px-3 py-2 text-xs text-center text-muted-foreground bg-muted border-t">
                        {t('appointments.displayLimitedTo50')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/*  Information sur la date de début */}
            {selectedStudy && selectedStudy.dateDebut && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {t('appointments.studyStartDate')} : {selectedStudy.dateDebut} ({t('appointments.usedForDate1')})
              </p>
            )}
          </div>

          {/* Sélection de groupe */}
          <div className="space-y-2">
            <Label htmlFor="group-select">{t('appointments.group')}</Label>
            <Select
              value={selectedGroup}
              onValueChange={setSelectedGroup}
              disabled={!currentStudyId || loadingGroups || groups.length === 0}
            >
              <SelectTrigger id="group-select">
                <SelectValue placeholder={
                  loadingGroups
                    ? t('appointments.loadingGroupsInProgress')
                    : groups.length === 0
                      ? t('groups.noGroupAvailable')
                      : t('appointments.selectGroup')
                } />
              </SelectTrigger>
              <SelectContent>
                {groups.map(group => (
                  <SelectItem key={group.idGroupe} value={group.idGroupe?.toString() || ''}>
                    {group.intitule} ({group.nbSujet || 0} {t('appointments.subjects')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Grille de groupes supprimée (éviter redondance avec le sélecteur) */}

            {/*  PASTILLE D'ÉTAT */}
            {selectedGroup && (
              <div className="mt-3">
                <SlotStatusBadge />
              </div>
            )}

            {/* Informations complémentaires */}
            {selectedGroup && (
              <div className="mt-2 text-xs text-gray-600 space-y-1 bg-gray-50 p-2 rounded">
                <div className="flex justify-between">
                  <span>{t('appointments.subjectsEnrolledInGroup')} :</span>
                  <span className="font-medium">{getSelectedGroupSubjectCount()}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('appointments.slotsRequested')} :</span>
                  <span className="font-medium">{calculateTotalSlots()}</span>
                </div>
                {calculateTotalSlots() > 0 && getSelectedGroupSubjectCount() > 0 && (
                  <div className="flex justify-between border-t pt-1">
                    <span>{t('appointments.difference')} :</span>
                    <span className={`font-medium ${
                      calculateTotalSlots() > getSelectedGroupSubjectCount() ? 'text-red-600' :
                      calculateTotalSlots() < getSelectedGroupSubjectCount() ? 'text-blue-600' :
                      'text-green-600'
                    }`}>
                      {calculateTotalSlots() - getSelectedGroupSubjectCount() > 0 ? '+' : ''}
                      {calculateTotalSlots() - getSelectedGroupSubjectCount()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {loadingGroups && (
              <p className="mt-1 text-sm text-blue-600">
                {t('appointments.loadingGroupsInProgress')}
              </p>
            )}

            {groups.length === 0 && currentStudyId && !loadingGroups && (
              <div className="mt-2">
                <p className="text-sm text-yellow-600 mb-2">
                  {t('appointments.noGroupForThisStudy')}
                </p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => loadGroupsForStudy(currentStudyId)}
                  className="h-auto p-0 text-xs"
                >
                  {t('appointments.tryReloadGroups')}
                </Button>
              </div>
            )}
            </div>

          {/* Temps entre chaque RDV */}
          <div className="space-y-2">
            <Label>{t('appointments.timeBetweenAppointments')}</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  min="0"
                  max="23"
                  placeholder="HH"
                  value={timeBetweenHours}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || (parseInt(val, 10) >= 0 && parseInt(val, 10) <= 23)) {
                      setTimeBetweenHours(val);
                    }
                  }}
                  className="text-center"
                />
              </div>
              <span className="text-lg font-bold">:</span>
              <div className="flex-1">
                <Input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="MM"
                  value={timeBetweenMinutes}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || (parseInt(val, 10) >= 0 && parseInt(val, 10) <= 59)) {
                      setTimeBetweenMinutes(val);
                    }
                  }}
                  className="text-center"
                />
              </div>
            </div>
          </div>

          {/* Nombre de dates */}
          <div className="space-y-2">
            <Label htmlFor="date-count">{t('appointments.numberOfDates')}</Label>
            <Select value={dateCount.toString()} onValueChange={handleDateCountChange}>
              <SelectTrigger id="date-count">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(count => (
                  <SelectItem key={count} value={count.toString()}>{count}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Heure de début */}
          <div className="space-y-2">
            <Label>{t('appointments.hourMin')}</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  min="0"
                  max="23"
                  placeholder="HH"
                  value={startHour}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || (parseInt(val, 10) >= 0 && parseInt(val, 10) <= 23)) {
                      setStartHour(val);
                    }
                  }}
                  className="text-center"
                />
              </div>
              <span className="text-lg font-bold">:</span>
              <div className="flex-1">
                <Input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="MM"
                  value={startMinute}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || (parseInt(val, 10) >= 0 && parseInt(val, 10) <= 59)) {
                      setStartMinute(val);
                    }
                  }}
                  className="text-center"
                />
              </div>
            </div>
          </div>

          {/* Heure de fin */}
          <div className="space-y-2">
            <Label>{t('appointments.hourMax')}</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  min="0"
                  max="23"
                  placeholder="HH"
                  value={endHour}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || (parseInt(val, 10) >= 0 && parseInt(val, 10) <= 23)) {
                      setEndHour(val);
                    }
                  }}
                  className="text-center"
                />
              </div>
              <span className="text-lg font-bold">:</span>
              <div className="flex-1">
                <Input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="MM"
                  value={endMinute}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || (parseInt(val, 10) >= 0 && parseInt(val, 10) <= 59)) {
                      setEndMinute(val);
                    }
                  }}
                  className="text-center"
                />
              </div>
            </div>
          </div>

          {/* Commentaires */}
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="comments">{t('appointments.commentsApplyToAll')}</Label>
            <Textarea
              id="comments"
              className="h-24"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
        </div>

        {/*  Outils de génération automatique de dates */}
        {dateCount > 1 && (
          <Alert className="bg-blue-50 border-blue-200">
            <Calendar className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">{t('appointments.automaticDateGeneration')}</h4>
                  <p className="text-sm text-blue-600">{t('appointments.automaticallyFillDates')}</p>
                </div>
                <Button
                  type="button"
                  onClick={fillConsecutiveDates}
                  disabled={!dates[0].day || !dates[0].month || !dates[0].year}
                  size="sm"
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  {t('appointments.generateConsecutiveDates', { count: dateCount - 1 })}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Configuration des dates */}
        {dates.map((date, dateIndex) => (
          <div key={`date-${dateIndex}`} className="border rounded-lg">
            <div className="p-6 pb-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{t('appointments.dateNumber', { number: dateIndex + 1 })}</h3>
                <div className="flex items-center gap-2">
                  {dateIndex === 0 && selectedStudy?.dateDebut && date.day && date.month && date.year && (
                    <Badge variant="secondary" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      {t('appointments.prefilledWithStudyStart')}
                    </Badge>
                  )}
                  {dateIndex === 0 && selectedStudy?.dateDebut && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => prefillFirstDateFromStudy(selectedStudy)}
                      className="gap-1"
                      title={t('appointments.restoreStartDate')}
                    >
                      <Calendar className="h-3 w-3" />
                      {t('appointments.restoreStartDate')}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`day-${dateIndex}`}>{t('appointments.dayDD')}</Label>
                  <Input
                    id={`day-${dateIndex}`}
                    type="text"
                    maxLength={2}
                    value={date.day}
                    onChange={(e) => handleDateChange(dateIndex, 'day', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`month-${dateIndex}`}>{t('appointments.monthMM')}</Label>
                  <Input
                    id={`month-${dateIndex}`}
                    type="text"
                    maxLength={2}
                    value={date.month}
                    onChange={(e) => handleDateChange(dateIndex, 'month', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`year-${dateIndex}`}>{t('appointments.yearYYYY')}</Label>
                  <Input
                    id={`year-${dateIndex}`}
                    type="text"
                    maxLength={4}
                    value={date.year}
                    onChange={(e) => handleDateChange(dateIndex, 'year', e.target.value)}
                  />
                </div>
              </div>

              {/* Remplissage rapide */}
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 flex-1">
                      <Label htmlFor={`default-value-${dateIndex}`} className="text-sm font-medium whitespace-nowrap">
                        {t('appointments.defaultValue')}:
                      </Label>
                      <Select
                        defaultValue="1"
                        onValueChange={(val) => {
                          const newDates = [...dates];
                          if (!newDates[dateIndex].slots) {
                            newDates[dateIndex].slots = [];
                          }
                          // Remplir tous les créneaux avec cette valeur
                          for (let i = 0; i < timeSlots.length; i++) {
                            newDates[dateIndex].slots[i] = parseInt(val, 10);
                          }
                          setDates(newDates);
                        }}
                      >
                        <SelectTrigger id={`default-value-${dateIndex}`} className="w-24 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 21 }, (_, i) => i).map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-blue-600">{t('appointments.volunteersPerSlot')}</span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

            {/* Créneaux horaires */}
              <div>
                <Label className="text-base mb-3 block">{t('appointments.customizeEachSlot')}:</Label>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {timeSlots.map((slot, slotIndex) => (
                    <div key={`${dateIndex}-slot-${slotIndex}`} className="flex items-center gap-2">
                      <Label htmlFor={`slot-${dateIndex}-${slotIndex}`} className="w-16 text-sm">{slot}:</Label>
                      <Select
                        value={(date.slots[slotIndex] || 0).toString()}
                        onValueChange={(val) => handleSlotVolumeChange(dateIndex, slotIndex, val)}
                      >
                        <SelectTrigger id={`slot-${dateIndex}-${slotIndex}`} className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 21 }, (_, i) => i).map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-end mt-6">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedGroup}
            size="lg"
          >
            {isSubmitting ? t('appointments.creatingInProgress') : t('appointments.previewAppointments')}
          </Button>
        </div>
      </div>

      {/* Modal de confirmation */}
      <AppointmentConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleFinalSubmit}
        appointmentData={appointmentsSummary}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default AppointmentBatchCreator;
