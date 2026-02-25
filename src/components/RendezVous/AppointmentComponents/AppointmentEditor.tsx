import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import rdvService from '../../../services/rdvService';
import volontaireService from '../../../services/volontaireService';
import groupeService from '../../../services/groupeService';

interface Appointment {
  idRdv?: number;
  id?: number;
  idEtude?: number;
  idVolontaire?: number | null;
  date?: string;
  heure?: string;
  etat?: string;
  commentaires?: string;
  idGroupe?: number;
  volontaire?: {
    id?: number;
    idVol?: number;
    nom?: string;
    prenom?: string;
    [key: string]: any;
  };
  groupe?: {
    id?: number;
    idGroupe?: number;
    nom?: string;
    [key: string]: any;
  };
  etude?: {
    ref?: string;
    titre?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface AppointmentEditorProps {
  appointment: Appointment;
  volunteers?: any[];
  onBack: () => void;
  onSuccess: () => void;
}

const AppointmentEditor = ({
  appointment,
  onBack,
  onSuccess
}: AppointmentEditorProps) => {
  const { t } = useTranslation();
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [duree, setDuree] = useState<string>('');
  const [status, setStatus] = useState<string>('PLANIFIE');
  const [comments, setComments] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [volontaireNom, setVolontaireNom] = useState<string>('');
  const [groupeNom, setGroupeNom] = useState<string>('');
  const [selectedGroupeId, setSelectedGroupeId] = useState<number | null>(null);

  // Initialiser les valeurs du formulaire avec celles du rendez-vous
  useEffect(() => {
    if (appointment) {
      // Formater la date pour l'input type="date"
      if (appointment.date) {
        const dateObj = new Date(appointment.date);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        setDate(`${year}-${month}-${day}`);
      }

      if (appointment.heure) {
        setTime(appointment.heure);
      }

      if (appointment.etat) {
        setStatus(appointment.etat);
      }

      if (appointment.commentaires) {
        setComments(appointment.commentaires);
      }

      if (appointment.duree) {
        setDuree(appointment.duree.toString());
      }
    }
  }, [appointment]);

  // Charger le nom du volontaire via son ID
  useEffect(() => {
    const volId = appointment?.idVolontaire;
    if (volId) {
      volontaireService.getById(volId)
        .then((res) => {
          // Le service retourne { data: transformedData } où nomVol->nom, prenomVol->prenom
          const v = res?.data;
          if (v) {
            const nom = v.nom || '';
            const prenom = v.prenom || '';
            if (nom || prenom) {
              setVolontaireNom(`${nom} ${prenom} (ID: ${volId})`.trim());
            } else {
              setVolontaireNom(`Volontaire ID: ${volId}`);
            }
          } else {
            setVolontaireNom(`Volontaire ID: ${volId}`);
          }
        })
        .catch((err) => {
          console.error('Erreur chargement volontaire:', err);
          setVolontaireNom(`Volontaire ID: ${volId}`);
        });
    }
  }, [appointment?.idVolontaire]);

  // Charger le nom du groupe via son ID ou via l'étude
  useEffect(() => {
    // D'abord, vérifier si le groupe est déjà dans l'appointment
    if (appointment?.groupe?.intitule || appointment?.groupe?.nom) {
      setGroupeNom(appointment.groupe.intitule || appointment.groupe.nom);
      setSelectedGroupeId(appointment.groupe.idGroupe || appointment.groupe.id || appointment.idGroupe || null);
      return;
    }

    const groupeId = appointment?.idGroupe;
    const etudeId = appointment?.idEtude;

    // Si on a un idGroupe, charger directement le groupe
    if (groupeId) {
      setSelectedGroupeId(groupeId);
      groupeService.getById(groupeId)
        .then((data) => {
          if (data) {
            const nom = data.nom || data.intitule || '';
            if (nom) {
              setGroupeNom(nom);
            } else {
              setGroupeNom(`Groupe ID: ${groupeId}`);
            }
          } else {
            setGroupeNom(`Groupe ID: ${groupeId}`);
          }
        })
        .catch((err) => {
          console.error('Erreur chargement groupe:', err);
          setGroupeNom(`Groupe ID: ${groupeId}`);
        });
    }
    // Sinon, charger les groupes de l'étude et prendre le premier
    else if (etudeId) {
      groupeService.getGroupesByIdEtude(etudeId)
        .then((groupes) => {
          if (groupes && groupes.length > 0) {
            // Prendre le premier groupe de l'étude
            const premier = groupes[0];
            const nom = premier.nom || premier.intitule || '';
            const id = premier.idGroupe || premier.id;
            if (nom) {
              setGroupeNom(nom);
            }
            if (id) {
              setSelectedGroupeId(id);
            }
          }
        })
        .catch((err) => {
          console.error('Erreur chargement groupes de l\'étude:', err);
        });
    }
  }, [appointment?.idGroupe, appointment?.groupe?.nom, appointment?.idEtude]);

  // Mettre à jour le rendez-vous
  const handleSubmit = async () => {
    if (!date) {
      setError(t('validation.dateRequired'));
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const updatedData = {
        idEtude: appointment.idEtude,
        idRdv: appointment.idRdv,
        date,
        heure: time,
        duree: duree ? parseInt(duree, 10) : null,
        etat: status,
        commentaires: comments,
        idVolontaire: appointment.idVolontaire || null,
        idGroupe: selectedGroupeId || appointment.idGroupe || null
      };

      // Utiliser le service RDV pour mettre à jour le rendez-vous
      if (!appointment.idEtude || !appointment.idRdv) {
        throw new Error(t('appointments.missingAppointmentIds'));
      }

      // rdvService.update lance une erreur en cas d'échec, pas besoin de vérifier la réponse
      await rdvService.update(appointment.idEtude, appointment.idRdv, updatedData);

      if (onSuccess) {
        onSuccess();
      } else {
        onBack();
      }

    } catch (err: any) {
      setError(t('appointments.updateErrorDetail') + ': ' + (err?.message || t('errors.unknown')));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Générer les options d'heures (de 7h à 23h par paliers de 5 minutes)
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

  const timeOptions = generateTimeOptions();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">{t('appointments.editAppointment')}</h2>
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800"
        >
          &lt; {t('common.back')}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Étude et groupe (en lecture seule) */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              {t('appointments.study')}
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
              value={appointment.etude ? `${appointment.etude.ref} - ${appointment.etude.titre}` : t('dates.notSpecified')}
              disabled
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              {t('groups.group')}
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
              value={groupeNom || t('dates.notSpecified')}
              disabled
            />
          </div>

          {/* Volontaire (en lecture seule) */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              {t('appointments.volunteer')}
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
              value={volontaireNom || t('appointments.noVolunteer')}
              disabled
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              {t('appointments.date')}
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Heure */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              {t('appointments.time')}
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            >
              <option value="">{t('appointments.selectTime')}</option>
              {timeOptions.map((timeOption, index) => (
                <option key={index} value={timeOption}>{timeOption}</option>
              ))}
            </select>
          </div>

          {/* Durée */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              {t('appointments.duration')} (min)
            </label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={duree}
              onChange={(e) => setDuree(e.target.value)}
              min="0"
              placeholder="Ex: 30"
            />
          </div>

          {/* Statut */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              {t('appointments.status')}
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="PLANIFIE">{t('appointments.scheduled')}</option>
              <option value="CONFIRME">{t('appointments.confirmed')}</option>
              <option value="EN_ATTENTE">{t('appointments.pending')}</option>
              <option value="ANNULE">{t('appointments.cancelled')}</option>
              <option value="COMPLETE">{t('appointments.completed')}</option>
            </select>
          </div>
        </div>

        {/* Commentaires */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            {t('appointments.comments')}
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-[100px]"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? t('appointments.savingInProgress') : t('appointments.saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentEditor;
