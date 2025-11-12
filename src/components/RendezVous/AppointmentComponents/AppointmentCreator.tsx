import { useState, useEffect } from 'react';
import api from '../../../services/api';
import rdvService from '../../../services/rdvService';
import etudeVolontaireService from '../../../services/etudeVolontaireService';
import groupeService from '../../../services/groupeService';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { AlertCircle, ChevronLeft } from 'lucide-react';

interface Volunteer {
  id?: number;
  volontaireId?: number;
  nom?: string;
  prenom?: string;
  [key: string]: any;
}

interface Study {
  id?: number;
  idEtude?: number;
  ref?: string;
  titre?: string;
  [key: string]: any;
}

interface Group {
  id?: number;
  idGroupe?: number;
  intitule?: string;
  nom?: string;
  [key: string]: any;
}

interface AppointmentCreatorProps {
  volunteers: Volunteer[];
  studies: Study[];
  selectedVolunteer: Volunteer | null;
  selectedStudy: Study | null;
  onVolunteerSelect: (volunteer: Volunteer | null) => void;
  onStudySelect: (study: Study) => void;
  onBack: () => void;
  onSuccess: () => void;
}

const AppointmentCreator = ({
  volunteers,
  studies,
  selectedVolunteer,
  selectedStudy,
  onVolunteerSelect,
  onStudySelect,
  onBack,
  onSuccess
}: AppointmentCreatorProps) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(30);
  const [status, setStatus] = useState<string>('PLANIFIE');
  const [comments, setComments] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentStudyId, setCurrentStudyId] = useState<string | number>(selectedStudy?.id || '');
  const [loadingGroups, setLoadingGroups] = useState<boolean>(false);

  // Effet pour maintenir la synchronisation entre props et état local
  useEffect(() => {
    if (selectedStudy?.id && selectedStudy.id !== currentStudyId) {
      setCurrentStudyId(selectedStudy.id);
      loadGroupsForStudy(selectedStudy.id);
    }
  }, [selectedStudy, currentStudyId]);

  // Fonction pour charger les groupes d'une étude via l'API
  const loadGroupsForStudy = async (studyId: string | number) => {
    if (!studyId) return;

    try {
      setLoadingGroups(true);
      setError(null);

      const response = await api.get(`/groupes/etude/${studyId}`);

      let groupsData = response.data;
      if (response.data && response.data.content && Array.isArray(response.data.content)) {
        groupsData = response.data.content;
      } else if (!Array.isArray(response.data)) {
        console.warn("Format de réponse inattendu:", response.data);
        groupsData = [];
      }

      const formattedGroups = groupsData.map((group: any) => {
        return {
          ...group,
          id: group.idGroupe,
          intitule: group.intitule || group.nom || `Groupe ${group.id}`
        };
      });

      setGroups(formattedGroups);
      setSelectedGroup('');
    } catch (err: any) {
      console.error('Erreur lors du chargement des groupes:', err);
      setError(`Erreur lors du chargement des groupes: ${err?.message || 'Erreur inconnue'}`);
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleStudyChange = (studyId: string) => {
    setCurrentStudyId(studyId);
    const study = studies.find(s => s.id?.toString() === studyId);
    if (study) {
      onStudySelect(study);
    }
    loadGroupsForStudy(studyId);
  };

  const handleSubmit = async () => {
    if (!currentStudyId) {
      setError('Veuillez sélectionner une étude');
      return;
    }

    if (!date || !time) {
      setError('La date et l\'heure sont obligatoires');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const currentStudy = studies.find(s => s.id === currentStudyId);

      let studyId: number, groupId: number | null = null;

      try {
        studyId = parseInt(String(currentStudyId), 10);
        if (isNaN(studyId)) {
          throw new Error(`ID d'étude non numérique: ${currentStudyId}`);
        }

        if (selectedGroup) {
          groupId = parseInt(selectedGroup, 10);
          if (isNaN(groupId)) {
            throw new Error(`ID de groupe non numérique: ${selectedGroup}`);
          }
        }
      } catch (convErr: any) {
        console.error("Erreur de conversion:", convErr);
        throw new Error(`Erreur de conversion: ${convErr?.message || 'Erreur inconnue'}`);
      }

      const appointmentData = {
        idEtude: studyId,
        idGroupe: groupId,
        idVolontaire: selectedVolunteer?.id || null,
        date: date,
        heure: time,
        duree: duration,
        etat: status,
        commentaires: comments
      };

      const response = await rdvService.create(appointmentData);

      if (!response || (response.error && response.error.message)) {
        throw new Error(response.error?.message || 'Erreur lors de la création du rendez-vous');
      }

      if (appointmentData.idVolontaire) {
        try {
          let ivGroupe = 0;
          if (groupId) {
            try {
              const groupeDetails = await groupeService.getById(groupId);
              if (groupeDetails && groupeDetails.iv !== undefined) {
                ivGroupe = parseInt(groupeDetails.iv, 10) || 0;
              }
            } catch (e: any) {
              console.warn("Impossible de récupérer l'IV du groupe, utilisation de 0:", e?.message || e);
            }
          }

          await etudeVolontaireService.assignerVolontaireAEtude(
            studyId,
            appointmentData.idVolontaire,
            ivGroupe,
            groupId || 0,
            'INSCRIT'
          );
        } catch (assocErr: any) {
          console.warn("Association étude-volontaire non créée (peut déjà exister):", assocErr?.message || assocErr);
        }
      }

      setDate('');
      setTime('');
      setDuration(30);
      setComments('');

      if (onSuccess) {
        if (currentStudy) {
          onStudySelect(currentStudy);
        }
        onSuccess();
      }

    } catch (err: any) {
      setError('Erreur lors de la création du rendez-vous: ' + (err?.message || 'Erreur inconnue'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 7; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        options.push(`${formattedHour}h${formattedMinute}`);
      }
    }
    return options;
  };

  const generateDurationOptions = () => {
    const options = [];
    for (let i = 5; i <= 360; i += 5) {
      options.push(i);
    }
    return options;
  };

  const timeOptions = generateTimeOptions();
  const durationOptions = generateDurationOptions();

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Créer un rendez-vous</h2>
          <Button variant="ghost" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Étude</Label>
              <Select value={currentStudyId.toString()} onValueChange={handleStudyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une étude" />
                </SelectTrigger>
                <SelectContent>
                  {[...studies].reverse().map(study => (
                    <SelectItem key={study.id} value={study.id!.toString()}>
                      {study.ref} - {study.titre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Groupe (facultatif)</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup} disabled={!currentStudyId || loadingGroups}>
                <SelectTrigger>
                  <SelectValue placeholder={
                    loadingGroups
                      ? "Chargement des groupes..."
                      : groups.length === 0
                        ? "Aucun groupe disponible"
                        : "Sélectionner un groupe (optionnel)"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {groups.map(group => (
                    <SelectItem key={group.id} value={group.id!.toString()}>
                      {group.intitule}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Volontaire (facultatif)</Label>
              <Select
                value={selectedVolunteer?.id?.toString() || 'none'}
                onValueChange={(value) => {
                  if (value === 'none') {
                    onVolunteerSelect(null);
                  } else {
                    const volunteer = volunteers.find(v => v.id?.toString() === value);
                    onVolunteerSelect(volunteer || null);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aucun (créer RDV sans volontaire)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun (créer RDV sans volontaire)</SelectItem>
                  {volunteers.filter(v => v.id != null).map(volunteer => (
                    <SelectItem key={volunteer.id} value={volunteer.id!.toString()}>
                      {volunteer.nom} {volunteer.prenom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date</Label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <Label>Heure</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une heure" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((timeOption, index) => (
                    <SelectItem key={index} value={timeOption}>{timeOption}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Durée (minutes)</Label>
              <Select value={duration.toString()} onValueChange={(val) => setDuration(parseInt(val))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((durationOption, index) => (
                    <SelectItem key={index} value={durationOption.toString()}>{durationOption}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>État</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANIFIE">Planifié</SelectItem>
                  <SelectItem value="CONFIRME">Confirmé</SelectItem>
                  <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                  <SelectItem value="ANNULE">Annulé</SelectItem>
                  <SelectItem value="COMPLETE">Complété</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Commentaires</Label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end mt-6">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !currentStudyId}
            >
              {isSubmitting ? 'Création en cours...' : 'Créer le rendez-vous'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentCreator;
