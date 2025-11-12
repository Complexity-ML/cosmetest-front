// @ts-nocheck
import { useState, useEffect } from 'react';
import rdvService from '../../services/rdvService';
import etudeService from '../../services/etudeService';
import groupeService from '../../services/groupeService';
import etudeVolontaireService from '../../services/etudeVolontaireService';
import volontaireService from '../../services/volontaireService';
import StudyGroupSelector from './VolontaireAppointmentAssigner/StudyGroupSelector';
import AvailableAppointmentsList from './VolontaireAppointmentAssigner/AvailableAppointmentsList';
import AssignedAppointmentsList from './VolontaireAppointmentAssigner/AssignedAppointmentsList';
import AppointmentSwitcher from '../RendezVous/AppointmentSwitcher';

/**
 * Composant pour assigner un volontaire spécifique à des rendez-vous
 * Utilisé dans la page de détail du volontaire
 */
const VolontaireAppointmentAssigner = ({ volontaireId, volontaire, onAssignmentComplete }: any) => {
  // États de base
  const [etudes, setEtudes] = useState<any[]>([]);
  const [selectedEtudeId, setSelectedEtudeId] = useState<number | null>(null);
  const [etudeDetails, setEtudeDetails] = useState<any>({});

  // États pour les groupes
  const [groupes, setGroupes] = useState<any[]>([]);
  const [selectedGroupeId, setSelectedGroupeId] = useState<number | null>(null);
  const [selectedGroupeDetails, setSelectedGroupeDetails] = useState<any>(null);

  // États pour les rendez-vous
  const [appointments, setAppointments] = useState<any[]>([]);
  const [availableAppointments, setAvailableAppointments] = useState<any[]>([]);
  const [selectedAppointments, setSelectedAppointments] = useState<any[]>([]);
  const [volunteerCurrentAppointments, setVolunteerCurrentAppointments] = useState<any[]>([]);

  // États de filtrage et recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('time'); // 'time', 'status', 'comment'
  const [selectedDate, setSelectedDate] = useState(''); // Date sélectionnée pour filtrer

  // États utilitaires
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache des volontaires pour éviter les appels répétés
  const [volunteerCache, setVolunteerCache] = useState({});

  // État pour le switcher
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [switcherRdv, setSwitcherRdv] = useState(null);

  // Chargement initial des études
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const etudesData = await etudeService.getAll();
        setEtudes(Array.isArray(etudesData) ? etudesData : []);
      } catch (err) {
        console.error("Erreur lors du chargement des études:", err);
        setError("Impossible de charger les études");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Charger les détails du groupe sélectionné
  useEffect(() => {
    const loadGroupeDetails = async () => {
      if (!selectedGroupeId) {
        setSelectedGroupeDetails(null);
        return;
      }

      try {
        console.log("🔍 Chargement détails groupe:", selectedGroupeId);
        const groupeDetails = await groupeService.getById(selectedGroupeId);
        console.log("📋 Détails groupe récupérés:", groupeDetails);
        setSelectedGroupeDetails(groupeDetails);
      } catch (err) {
        console.error("❌ Erreur chargement détails groupe:", err);
        setSelectedGroupeDetails(null);
      }
    };

    loadGroupeDetails();
  }, [selectedGroupeId]);

  // Chargement des données d'étude
  const loadEtudeData = async (etudeId: any) => {
    if (!etudeId) return;

    try {
      setLoading(true);

      // Charger l'étude, ses rendez-vous et ses groupes
      const [etude, rdvs, groupesData] = await Promise.all([
        etudeService.getById(etudeId),
        rdvService.getByEtudeId(etudeId),
        groupeService.getGroupesByIdEtude(etudeId)
      ]);

      setAppointments(Array.isArray(rdvs) ? rdvs : []);
      setGroupes(Array.isArray(groupesData) ? groupesData : []);

      // Sélectionner automatiquement le premier groupe s'il y en a un
      if (Array.isArray(groupesData) && groupesData.length > 0) {
        const firstGroupeId = groupesData[0].id || groupesData[0].idGroupe;
        setSelectedGroupeId(firstGroupeId || null);
      }

      // Séparer les RDV disponibles des RDV déjà assignés au volontaire
      const rdvList = Array.isArray(rdvs) ? rdvs : [];
      const available = rdvList.filter(rdv => {
        const hasVolunteer = rdv.volontaire || rdv.idVolontaire;
        if (!hasVolunteer) return true; // RDV libre
        // RDV occupé par un autre volontaire
        const assignedVolId = rdv.volontaire?.id || rdv.idVolontaire;
        return parseInt(assignedVolId) !== parseInt(volontaireId);
      });

      const currentVolunteerRdvs = rdvList.filter(rdv => {
        const assignedVolId = rdv.volontaire?.id || rdv.idVolontaire;
        return parseInt(assignedVolId) === parseInt(volontaireId);
      });

      setAvailableAppointments(available);
      setVolunteerCurrentAppointments(currentVolunteerRdvs);

    } catch (err) {
      console.error("Erreur lors du chargement des données d'étude:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  // Recharger quand l'étude change
  useEffect(() => {
    if (selectedEtudeId) {
      loadEtudeData(selectedEtudeId);
    } else {
      // Réinitialiser
      setEtudeDetails({});
      setAppointments([]);
      setAvailableAppointments([]);
      setVolunteerCurrentAppointments([]);
      setSelectedAppointments([]);
      setGroupes([]);
      setSelectedGroupeId(null);
      setSelectedGroupeDetails(null);
    }
  }, [selectedEtudeId, volontaireId]);

  // Réinitialiser les sélections quand on change d'étude
  useEffect(() => {
    setSelectedAppointments([]);
  }, [selectedEtudeId]);

  // Helpers
  const getAppointmentId = (rdv) => rdv.idRdv || rdv.id;
  const getGroupeId = (groupe) => groupe.id || groupe.idGroupe;

  // Extraire les dates uniques disponibles
  const getAvailableDates = () => {
    const dates = [...new Set(availableAppointments.map(rdv => rdv.date))];
    return dates.sort((a, b) => new Date(a) - new Date(b));
  };

  // Fonction pour récupérer les infos d'un volontaire avec cache
  const getVolunteerInfo = async (volunteerIdToFetch) => {
    if (!volunteerIdToFetch) return null;

    // Vérifier le cache d'abord
    if (volunteerCache[volunteerIdToFetch]) {
      return volunteerCache[volunteerIdToFetch];
    }

    try {
      console.log("🔍 Récupération volontaire ID:", volunteerIdToFetch);
      const response = await volontaireService.getDetails(volunteerIdToFetch);

      // Extraire les données de la réponse
      const volunteerInfo = response.data || response;
      console.log("📋 Données extraites:", volunteerInfo);

      // Mettre en cache
      setVolunteerCache(prev => ({
        ...prev,
        [volunteerIdToFetch]: volunteerInfo
      }));

      return volunteerInfo;
    } catch (error) {
      console.error("❌ Erreur récupération volontaire:", error);
      return null;
    }
  };

  // Fonctions de formatage
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    return timeString || 'Non spécifiée';
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRME':
        return 'bg-green-100 text-green-800';
      case 'EN_ATTENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ANNULE':
        return 'bg-red-100 text-red-800';
      case 'COMPLETE':
        return 'bg-blue-100 text-blue-800';
      case 'PLANIFIE':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour mettre à jour un commentaire
  const handleUpdateComment = async (rdv, newComment) => {
    try {
      setLoading(true);

      const updatedData = {
        idEtude: selectedEtudeId,
        idRdv: getAppointmentId(rdv),
        idVolontaire: rdv.idVolontaire,
        idGroupe: rdv.idGroupe || rdv.groupe?.id || rdv.groupe?.idGroupe,
        date: rdv.date,
        heure: rdv.heure,
        etat: rdv.etat || 'PLANIFIE',
        commentaires: newComment.trim()
      };

      console.log("📝 Mise à jour commentaire:", updatedData);
      await rdvService.update(selectedEtudeId, getAppointmentId(rdv), updatedData);

      // Rafraîchir les données
      await loadEtudeData(selectedEtudeId);

      alert('Commentaire mis à jour avec succès.');

    } catch (err) {
      console.error('Erreur lors de la mise à jour du commentaire:', err);
      alert('Une erreur est survenue lors de la mise à jour du commentaire.');
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleEtudeChange = (e) => {
    const value = e.target.value;
    setSelectedEtudeId(value ? parseInt(value, 10) : null);
  };

  const handleGroupeChange = (e: any) => {
    const value = e.target.value;
    setSelectedGroupeId(value ? parseInt(value, 10) : null);
  };

  const handleSelectAppointment = (rdv: any) => {
    const id = getAppointmentId(rdv);
    const isSelected = selectedAppointments.some(selected => getAppointmentId(selected) === id);

    if (isSelected) {
      // Désélectionner ce rendez-vous
      setSelectedAppointments(prev => prev.filter(selected => getAppointmentId(selected) !== id));
    } else {
      // Sélection one-by-one : remplacer la sélection actuelle par ce seul rendez-vous
      setSelectedAppointments([rdv]);
    }
  };

  const handleSelectAllAppointments = () => {
    // En mode one-by-one, ce bouton sert uniquement à tout désélectionner
    setSelectedAppointments([]);
  };

  // Assignation intelligente avec gestion d'association unique
  const handleAssignAppointments = async () => {
    if (!selectedEtudeId || selectedAppointments.length === 0 || !selectedGroupeId) {
      alert("Veuillez sélectionner une étude, un groupe et au moins un rendez-vous.");
      return;
    }

    if (!window.confirm(`Voulez-vous vraiment assigner ${volontaire?.prenom} ${volontaire?.nom} à ${selectedAppointments.length} rendez-vous ?`)) {
      return;
    }

    try {
      setLoading(true);

      // 1) D'abord, garantir UNE SEULE association étude-volontaire
      let ivGroupe = 0;
      if (selectedGroupeId) {
        try {
          const groupeDetails = selectedGroupeDetails || (await groupeService.getById(selectedGroupeId));
          if (groupeDetails && groupeDetails.iv !== undefined) {
            ivGroupe = parseInt(groupeDetails.iv, 10) || 0;
          }
        } catch (e) {
          console.warn("IV groupe introuvable, on continue avec 0:", (e as any)?.message || e);
        }
      }

      // Vérifier si l'association existe déjà
      try {
        const associationExiste = await etudeVolontaireService.existsByEtudeAndVolontaire(selectedEtudeId, parseInt(volontaireId));

        if (!associationExiste) {
          // Créer l'association seulement si elle n'existe pas
          await etudeVolontaireService.assignerVolontaireAEtude(
            selectedEtudeId,
            parseInt(volontaireId),
            ivGroupe,
            selectedGroupeId || 0,
            'INSCRIT'
          );
          console.log('Association étude-volontaire créée avec IV:', ivGroupe);
        } else {
          console.log('Association étude-volontaire existe déjà, pas de duplication');
        }
      } catch (assocErr) {
        console.warn("Erreur lors de la gestion de l'association étude-volontaire:", (assocErr as any)?.message || assocErr);
      }

      // 2) Ensuite, assigner tous les RDV
      const rdvPromises = selectedAppointments.map(async (rdv) => {
        const updatedData = {
          idEtude: selectedEtudeId,
          idRdv: getAppointmentId(rdv),
          idVolontaire: parseInt(volontaireId),
          idGroupe: selectedGroupeId,
          date: rdv.date,
          heure: rdv.heure,
          etat: rdv.etat || 'PLANIFIE',
          commentaires: rdv.commentaires
        };

        return rdvService.update(selectedEtudeId, getAppointmentId(rdv), updatedData);
      });

      await Promise.all(rdvPromises);

      alert(`${selectedAppointments.length} assignation(s) effectuée(s) avec succès.`);

      // Rafraîchir les données
      await loadEtudeData(selectedEtudeId);
      setSelectedAppointments([]);

      if (onAssignmentComplete) {
        onAssignmentComplete();
      }

    } catch (err) {
      console.error("Erreur lors de l'assignation:", err);
      alert("Une erreur est survenue lors de l'assignation.");
    } finally {
      setLoading(false);
    }
  };

  // Handler pour ouvrir le switcher
  const handleOpenSwitcher = (rdv: any) => {
    setSwitcherRdv(rdv);
    setShowSwitcher(true);
  };

  // Handler pour fermer le switcher
  const handleCloseSwitcher = () => {
    setShowSwitcher(false);
    setSwitcherRdv(null);
  };

  // Handler pour quand un switch est complété
  const handleSwitchComplete = async () => {
    // Recharger les données après un switch
    await loadEtudeData(selectedEtudeId);
    if (onAssignmentComplete) {
      onAssignmentComplete();
    }
  };

  // Désassignation intelligente
  const handleUnassignAppointment = async (rdv: any) => {
    if (!window.confirm('Voulez-vous vraiment désassigner ce volontaire de ce rendez-vous ?')) {
      return;
    }

    try {
      setLoading(true);

      // 1. D'abord, désassigner le volontaire du RDV
      const updatedData = {
        idEtude: selectedEtudeId,
        idRdv: getAppointmentId(rdv),
        idVolontaire: null,
        idGroupe: rdv.idGroupe || rdv.groupe?.id || rdv.groupe?.idGroupe,
        date: rdv.date,
        heure: rdv.heure,
        etat: rdv.etat || 'PLANIFIE',
        commentaires: rdv.commentaires
      };

      await rdvService.update(selectedEtudeId, getAppointmentId(rdv), updatedData);

      // 2. Recharger les données pour avoir l'état actuel
      await loadEtudeData(selectedEtudeId);

      // 3. Vérifier s'il reste des RDV assignés au volontaire dans cette étude
      const remainingAppointments = appointments.filter(appointment => {
        const assignedVolId = appointment.volontaire?.id || appointment.idVolontaire;
        return parseInt(assignedVolId) === parseInt(volontaireId) &&
               getAppointmentId(appointment) !== getAppointmentId(rdv);
      });

      // 4. Si plus aucun RDV assigné, supprimer l'association étude-volontaire
      if (remainingAppointments.length === 0) {
        try {
          await etudeVolontaireService.desassignerVolontaireDEtude(selectedEtudeId, parseInt(volontaireId));
          console.log('Association étude-volontaire supprimée car plus aucun RDV assigné');
        } catch (e) {
          console.warn('Impossible de supprimer association étude-volontaire:', (e as any)?.message || e);
        }
      } else {
        console.log(`Association étude-volontaire conservée - ${remainingAppointments.length} RDV restant(s)`);
      }

      alert('Volontaire désassigné avec succès.');

      if (onAssignmentComplete) {
        onAssignmentComplete();
      }

    } catch (err) {
      console.error('Erreur lors de la désassignation:', err);
      alert('Une erreur est survenue lors de la désassignation.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !etudes.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Assigner à des rendez-vous</h2>
        <p className="text-gray-600">
          Assigner <span className="font-medium">{volontaire?.prenom} {volontaire?.nom}</span> à des rendez-vous d'études
        </p>
      </div>

      {/* Sélection d'étude et de groupe */}
      <StudyGroupSelector
        etudes={etudes}
        selectedEtudeId={selectedEtudeId}
        onEtudeChange={handleEtudeChange}
        groupes={groupes}
        selectedGroupeId={selectedGroupeId}
        onGroupeChange={handleGroupeChange}
        selectedGroupeDetails={selectedGroupeDetails}
        getGroupeId={getGroupeId}
        appointments={appointments}
        availableAppointments={availableAppointments}
        volunteerCurrentAppointments={volunteerCurrentAppointments}
        loading={loading}
      />

      {/* Interface d'assignation */}
      {selectedEtudeId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section Rendez-vous disponibles */}
          <AvailableAppointmentsList
            appointments={availableAppointments}
            selectedAppointments={selectedAppointments}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortOption={sortOption}
            setSortOption={setSortOption}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            availableDates={getAvailableDates()}
            onSelectAppointment={handleSelectAppointment}
            onSelectAllAppointments={handleSelectAllAppointments}
            onUpdateComment={handleUpdateComment}
            onSwitch={handleOpenSwitcher}
            getAppointmentId={getAppointmentId}
            getVolunteerInfo={getVolunteerInfo}
            formatDate={formatDate}
            formatTime={formatTime}
            getStatusColor={getStatusColor}
            loading={loading}
          />

          {/* Section Rendez-vous actuels du volontaire */}
          <AssignedAppointmentsList
            appointments={volunteerCurrentAppointments}
            onUnassignAppointment={handleUnassignAppointment}
            onUpdateComment={handleUpdateComment}
            onSwitch={handleOpenSwitcher}
            getAppointmentId={getAppointmentId}
            getVolunteerInfo={getVolunteerInfo}
            formatDate={formatDate}
            formatTime={formatTime}
            getStatusColor={getStatusColor}
            loading={loading}
          />
        </div>
      )}

      {/* Panneau d'action */}
      {selectedEtudeId && selectedAppointments.length > 0 && selectedGroupeId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-blue-800">
                Assignation en cours
              </h3>
              <p className="text-sm text-blue-600">
                {selectedAppointments.length} rendez-vous • Groupe: {groupes.find(g => getGroupeId(g) === selectedGroupeId)?.nom || selectedGroupeId}
                {selectedGroupeDetails && selectedGroupeDetails.iv > 0 && (
                  <span className="text-green-600 font-medium"> (IV: {selectedGroupeDetails.iv}€)</span>
                )}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedAppointments([])}
                className="px-4 py-2 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-100"
              >
                Réinitialiser
              </button>
              <button
                onClick={handleAssignAppointments}
                disabled={loading}
                className={`px-4 py-2 rounded-md text-white ${
                  loading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Assignation...' : 'Assigner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Switcher Modal */}
      {showSwitcher && (
        <AppointmentSwitcher
          preSelectedRdv={switcherRdv}
          etudeId={selectedEtudeId}
          onClose={handleCloseSwitcher}
          onSwitchComplete={handleSwitchComplete}
        />
      )}
    </div>
  );
};

export default VolontaireAppointmentAssigner;
