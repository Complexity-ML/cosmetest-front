import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../../services/api';
import rdvService from '../../../services/rdvService';
import etudeVolontaireService from '../../../services/etudeVolontaireService';
import groupeService from '../../../services/groupeService';
import { Button } from '../../ui/button';
import { Alert, AlertDescription } from '../../ui/alert';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { AlertCircle, ChevronLeft, ChevronDown, Check, Search } from 'lucide-react';
import { Input } from '../../ui/input';

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
  const { t } = useTranslation();
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
  const [searchEtudeTerm, setSearchEtudeTerm] = useState<string>('');
  const [showEtudeSelector, setShowEtudeSelector] = useState<boolean>(false);

  const etudeSelectorRef = useRef<HTMLDivElement>(null);

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
      setError(`${t('groups.loadError')}: ${err?.message || t('errors.unknown')}`);
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
      setError(t('validation.selectStudy'));
      return;
    }

    if (!date || !time) {
      setError(t('validation.dateTimeRequired'));
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
          throw new Error(`${t('errors.invalidStudyId')}: ${currentStudyId}`);
        }

        if (selectedGroup) {
          groupId = parseInt(selectedGroup, 10);
          if (isNaN(groupId)) {
            throw new Error(`${t('errors.invalidGroupId')}: ${selectedGroup}`);
          }
        }
      } catch (convErr: any) {
        console.error("Erreur de conversion:", convErr);
        throw new Error(`${t('errors.conversionError')}: ${convErr?.message || t('errors.unknown')}`);
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
        throw new Error(response.error?.message || t('appointments.createError'));
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
      setError(t('appointments.createErrorDetail') + ': ' + (err?.message || t('errors.unknown')));
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
        <h2 className="text-xl font-bold text-gray-800">{t('appointments.createAppointment')}</h2>
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t('common.back')}
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
              <Label>{t('appointments.study')}</Label>
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
                          placeholder={t('studies.searchPlaceholder')}
                          value={searchEtudeTerm}
                          onChange={(e) => setSearchEtudeTerm(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <div className="p-1">
                      {filteredStudies.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-center text-muted-foreground">
                          {t('studies.noStudyFound')}
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
                          {t('common.limitedTo50Results')}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>{t('groups.groupOptional')}</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup} disabled={!currentStudyId || loadingGroups}>
                <SelectTrigger>
                  <SelectValue placeholder={
                    loadingGroups
                      ? t('groups.loadingGroups')
                      : groups.length === 0
                        ? t('groups.noGroupAvailable')
                        : t('groups.selectGroupOptional')
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
              <Label>{t('volunteers.volunteerOptional')}</Label>
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
                  <SelectValue placeholder={t('appointments.noVolunteerCreateWithout')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('appointments.noVolunteerCreateWithout')}</SelectItem>
                  {volunteers.filter(v => v.id != null).map(volunteer => (
                    <SelectItem key={volunteer.id} value={volunteer.id!.toString()}>
                      {volunteer.nom} {volunteer.prenom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('appointments.date')}</Label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <Label>{t('appointments.time')}</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger>
                  <SelectValue placeholder={t('appointments.selectTime')} />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((timeOption, index) => (
                    <SelectItem key={index} value={timeOption}>{timeOption}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('appointments.duration')}</Label>
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
              <Label>{t('appointments.status')}</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANIFIE">{t('appointments.scheduled')}</SelectItem>
                  <SelectItem value="CONFIRME">{t('appointments.confirmed')}</SelectItem>
                  <SelectItem value="EN_ATTENTE">{t('appointments.pending')}</SelectItem>
                  <SelectItem value="ANNULE">{t('appointments.cancelled')}</SelectItem>
                  <SelectItem value="COMPLETE">{t('appointments.completed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>{t('appointments.comments')}</Label>
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
            {isSubmitting ? t('appointments.creatingInProgress') : t('appointments.createAppointmentButton')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCreator;
