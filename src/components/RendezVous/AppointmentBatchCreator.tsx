import { useState, useEffect } from 'react';
import api from '../../services/api';
import AppointmentConfirmationModal from './AppointmentComponents/AppointmentConfirmationModal';
import { Etude, Groupe } from '../../types/types';
import { GroupeData } from '../../types/etude.types';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { ArrowLeft, Calendar, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

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
  const [groups, setGroups] = useState<GroupeData[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [timeBetween, setTimeBetween] = useState<number>(30);
  const [dates, setDates] = useState<DateSlot[]>([{ day: '', month: '', year: '', slots: [] }]);
  const [startTime, setStartTime] = useState<string>('08h00');
  const [endTime, setEndTime] = useState<string>('18h00');
  const [comments, setComments] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [dateCount, setDateCount] = useState<number>(1);
  const [currentStudyId, setCurrentStudyId] = useState<string | number>(selectedStudy?.id || '');
  const [loadingGroups, setLoadingGroups] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [appointmentsSummary, setAppointmentsSummary] = useState<AppointmentsSummary | null>(null);

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

  // Effet pour maintenir la synchronisation entre props et état local
  useEffect(() => {
    if (selectedStudy?.id && selectedStudy.id !== currentStudyId) {
      setCurrentStudyId(selectedStudy.id);
      loadGroupsForStudy(selectedStudy.id);
      
      //  Pré-remplir la première date si l'étude est passée en props
      prefillFirstDateFromStudy(selectedStudy);
    }
  }, [selectedStudy, currentStudyId]);

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
        console.warn("Format de réponse inattendu:", response.data);
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
      console.error('Erreur lors du chargement des groupes:', err);
      const error = err as Error;
      setError(`Erreur lors du chargement des groupes: ${error.message}`);
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
      return { status: 'no-group', color: 'gray', message: 'Sélectionnez un groupe' };
    }

    if (totalSlots === 0) {
      return { status: 'empty', color: 'gray', message: 'Aucun créneau ouvert' };
    }

    if (subjectCount === 0) {
      return { status: 'no-subjects', color: 'yellow', message: 'Aucun sujet inscrit au groupe' };
    }

    if (totalSlots === subjectCount) {
      return { status: 'perfect', color: 'green', message: ` Parfait : ${subjectCount} sujets pour ${totalSlots} créneaux` };
    }

    if (totalSlots > subjectCount) {
      const diff = totalSlots - subjectCount;
      return {
        status: 'shortage',
        color: 'red',
        message: `⚠️ DÉPASSEMENT : ${diff} créneau(x) en trop (${totalSlots} créneaux pour ${subjectCount} sujets)`
      };
    }

    const diff = subjectCount - totalSlots;
    return {
      status: 'excess',
      color: 'blue',
      message: `ℹ️ Capacité restante : ${diff} sujet(s) disponible(s) (${subjectCount} sujets pour ${totalSlots} créneaux)`
    };
  };

  //  Composant pour afficher la pastille d'état
  const SlotStatusBadge = () => {
    const { status, color, message } = getSlotStatus();

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
    const [startHour, startMinute] = startTime.split('h').map(p => parseInt(p, 10));
    const [endHour, endMinute] = endTime.split('h').map(p => parseInt(p, 10));

    // Convertir en minutes pour faciliter les calculs
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    // Vérifier que l'heure de fin est postérieure à l'heure de début
    if (endMinutes <= startMinutes) {
      return [];
    }

    // Générer les créneaux
    let currentMinutes = startMinutes;
    while (currentMinutes < endMinutes) {
      const hour = Math.floor(currentMinutes / 60);
      const minute = currentMinutes % 60;
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      slots.push(`${formattedHour}h${formattedMinute}`);

      currentMinutes += timeBetween;
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  //  Fonction pour pré-remplir automatiquement les dates consécutives
  const fillConsecutiveDates = () => {
    if (!dates[0].day || !dates[0].month || !dates[0].year) {
      alert("Veuillez d'abord remplir la Date 1");
      return;
    }

    try {
      const baseDate = new Date(
        parseInt(dates[0].year),
        parseInt(dates[0].month) - 1,
        parseInt(dates[0].day)
      );

      if (isNaN(baseDate.getTime())) {
        alert("Date 1 invalide");
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
      console.error("Erreur lors de la génération des dates consécutives:", err);
      alert("Erreur lors de la génération des dates consécutives");
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
      setError('Veuillez sélectionner une étude');
      return;
    }

    if (!selectedGroup) {
      setError('Veuillez sélectionner un groupe');
      return;
    }

    // Vérifier que toutes les dates sont complètes
    const incompleteDate = dates.find(d => !d.day || !d.month || !d.year);
    if (incompleteDate) {
      setError('Veuillez remplir toutes les dates');
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
            for (let i = 0; i < slot.volume; i++) {
              const rdvData = {
                idEtude: batchData.idEtude,
                idGroupe: batchData.idGroupe,
                date: dateInfo.date,
                heure: slot.time,
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
        throw new Error('Réponse vide du serveur');
      }

      const { created, total, errors } = response.data;

      console.log(`✅ Batch terminé : ${created} RDV créés sur ${total} demandés`);

      if (errors && errors.length > 0) {
        console.warn(`⚠️ Erreurs batch :`, errors);

        if (created === 0) {
          throw new Error(`Aucun RDV créé : ${errors.join(', ')}`);
        } else {
          // Partiellement réussi
          alert(`⚠️ ${created} rendez-vous créés sur ${total}.\n\nErreurs :\n${errors.join('\n')}`);
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
      setError('Erreur lors de la création des rendez-vous: ' + error.message);
      console.error(err);
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // debug inspectGroups supprimé

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">Créer plusieurs rendez-vous</CardTitle>
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>
      </CardHeader>

      <CardContent>
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
            <Label htmlFor="study-select">Étude</Label>
            <Select value={currentStudyId.toString()} onValueChange={handleStudyChange}>
              <SelectTrigger id="study-select">
                <SelectValue placeholder="Sélectionner une étude" />
              </SelectTrigger>
              <SelectContent>
                {[...studies].reverse().map(study => (
                  <SelectItem key={study.id} value={study.id?.toString() || ''}>
                    {study.ref} - {study.titre}
                    {study.dateDebut && ` (début: ${study.dateDebut})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/*  Information sur la date de début */}
            {selectedStudy && selectedStudy.dateDebut && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Date de début d'étude : {selectedStudy.dateDebut} (utilisée pour la Date 1)
              </p>
            )}
          </div>

          {/* Sélection de groupe */}
          <div className="space-y-2">
            <Label htmlFor="group-select">Groupe</Label>
            <Select
              value={selectedGroup}
              onValueChange={setSelectedGroup}
              disabled={!currentStudyId || loadingGroups || groups.length === 0}
            >
              <SelectTrigger id="group-select">
                <SelectValue placeholder={
                  loadingGroups
                    ? "Chargement des groupes..."
                    : groups.length === 0
                      ? "Aucun groupe disponible"
                      : "Sélectionner un groupe"
                } />
              </SelectTrigger>
              <SelectContent>
                {groups.map(group => (
                  <SelectItem key={group.idGroupe} value={group.idGroupe?.toString() || ''}>
                    {group.intitule} ({group.nbSujet || 0} sujets)
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
                  <span>Sujets inscrits au groupe :</span>
                  <span className="font-medium">{getSelectedGroupSubjectCount()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Créneaux demandés :</span>
                  <span className="font-medium">{calculateTotalSlots()}</span>
                </div>
                {calculateTotalSlots() > 0 && getSelectedGroupSubjectCount() > 0 && (
                  <div className="flex justify-between border-t pt-1">
                    <span>Différence :</span>
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
                Chargement des groupes en cours...
              </p>
            )}
            
            {groups.length === 0 && currentStudyId && !loadingGroups && (
              <div className="mt-2">
                <p className="text-sm text-yellow-600 mb-2">
                  Aucun groupe trouvé pour cette étude.
                </p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => loadGroupsForStudy(currentStudyId)}
                  className="h-auto p-0 text-xs"
                >
                  Essayer de recharger les groupes
                </Button>
              </div>
            )}
            </div>

          {/* Temps entre chaque RDV */}
          <div className="space-y-2">
            <Label htmlFor="time-between">Temps entre chaque RDV (minutes)</Label>
            <Select value={timeBetween.toString()} onValueChange={(val) => setTimeBetween(parseInt(val, 10))}>
              <SelectTrigger id="time-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 20, 30, 45, 60, 90, 120].map(time => (
                  <SelectItem key={time} value={time.toString()}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nombre de dates */}
          <div className="space-y-2">
            <Label htmlFor="date-count">Nombre de dates</Label>
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
            <Label htmlFor="start-time">Heure Min</Label>
            <Select value={startTime} onValueChange={setStartTime}>
              <SelectTrigger id="start-time">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                  ['00', '15', '30', '45'].map(minute => {
                    const timeValue = `${hour.toString().padStart(2, '0')}h${minute}`;
                    return (
                      <SelectItem key={`${hour}-${minute}`} value={timeValue}>
                        {timeValue}
                      </SelectItem>
                    );
                  })
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Heure de fin */}
          <div className="space-y-2">
            <Label htmlFor="end-time">Heure Max</Label>
            <Select value={endTime} onValueChange={setEndTime}>
              <SelectTrigger id="end-time">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                  ['00', '15', '30', '45'].map(minute => {
                    const timeValue = `${hour.toString().padStart(2, '0')}h${minute}`;
                    return (
                      <SelectItem key={`${hour}-${minute}`} value={timeValue}>
                        {timeValue}
                      </SelectItem>
                    );
                  })
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Commentaires */}
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="comments">Commentaires (s'applique à tous les RDV)</Label>
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
                  <h4 className="font-medium text-blue-800 mb-1">Génération automatique de dates</h4>
                  <p className="text-sm text-blue-600">Remplissez automatiquement les dates suivantes en jours consécutifs</p>
                </div>
                <Button
                  type="button"
                  onClick={fillConsecutiveDates}
                  disabled={!dates[0].day || !dates[0].month || !dates[0].year}
                  size="sm"
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Générer {dateCount - 1} dates consécutives
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Configuration des dates */}
        {dates.map((date, dateIndex) => (
          <Card key={`date-${dateIndex}`}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Date {dateIndex + 1}</CardTitle>
                <div className="flex items-center gap-2">
                  {dateIndex === 0 && selectedStudy?.dateDebut && date.day && date.month && date.year && (
                    <Badge variant="secondary" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      Pré-remplie avec la date de début d'étude
                    </Badge>
                  )}
                  {dateIndex === 0 && selectedStudy?.dateDebut && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => prefillFirstDateFromStudy(selectedStudy)}
                      className="gap-1"
                      title="Restaurer la date de début d'étude"
                    >
                      <Calendar className="h-3 w-3" />
                      Restaurer date début
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`day-${dateIndex}`}>Jour (JJ)</Label>
                  <Input
                    id={`day-${dateIndex}`}
                    type="text"
                    maxLength={2}
                    value={date.day}
                    onChange={(e) => handleDateChange(dateIndex, 'day', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`month-${dateIndex}`}>Mois (MM)</Label>
                  <Input
                    id={`month-${dateIndex}`}
                    type="text"
                    maxLength={2}
                    value={date.month}
                    onChange={(e) => handleDateChange(dateIndex, 'month', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`year-${dateIndex}`}>Année (AAAA)</Label>
                  <Input
                    id={`year-${dateIndex}`}
                    type="text"
                    maxLength={4}
                    value={date.year}
                    onChange={(e) => handleDateChange(dateIndex, 'year', e.target.value)}
                  />
                </div>
              </div>

            {/* Créneaux horaires */}
              <div>
                <Label className="text-base mb-3 block">Nombre de volontaires par créneau:</Label>

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
                          {Array.from({ length: 11 }, (_, i) => i).map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-end mt-6">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedGroup}
            size="lg"
          >
            {isSubmitting ? 'Création en cours...' : 'Prévisualiser les rendez-vous'}
          </Button>
        </div>
        </div>
      </CardContent>

      {/* Modal de confirmation */}
      <AppointmentConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleFinalSubmit}
        appointmentData={appointmentsSummary}
        isSubmitting={isSubmitting}
      />
    </Card>
  );
};

export default AppointmentBatchCreator;
