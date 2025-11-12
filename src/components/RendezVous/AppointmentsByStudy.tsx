import { useState, useEffect, useRef } from 'react';
import rdvService from '../../services/rdvService';
import etudeService from '../../services/etudeService';
import volontaireService from '../../services/volontaireService';
import etudeVolontaireService from '../../services/etudeVolontaireService';
import groupeService from '../../services/groupeService';
import AppointmentSwitcher from './AppointmentSwitcher';
import { Etude, RendezVous, Volontaire } from '../../types/types';
import { VolontaireTransformed } from '../../types/volontaire.types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Search, Folder, Calendar, User, Filter, RefreshCw, ChevronDown, Check, X, Loader2, ArrowLeftRight } from 'lucide-react';

interface AppointmentsByStudyProps {
  onAppointmentClick: (rdv: RendezVous) => void;
  onBack: () => void;
}

const AppointmentsByStudy = ({ onAppointmentClick, onBack }: AppointmentsByStudyProps) => {
  const [selectedStudyId, setSelectedStudyId] = useState<string>('');
  const [selectedStudy, setSelectedStudy] = useState<Etude | null>(null);
  const [appointments, setAppointments] = useState<RendezVous[]>([]);
  const [etudes, setEtudes] = useState<Etude[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // États pour la recherche d'études
  const [searchEtudeTerm, setSearchEtudeTerm] = useState<string>('');
  const [showEtudeSelector, setShowEtudeSelector] = useState<boolean>(false);

  // États pour l'assignation de volontaires
  const [volunteers, setVolunteers] = useState<(VolontaireTransformed | null)[]>([]);
  const [volunteersLoading, setVolunteersLoading] = useState<boolean>(false);
  const [searchVolunteerTerm, setSearchVolunteerTerm] = useState<string>('');
  const [assigningRdvId, setAssigningRdvId] = useState<number | null>(null);
  const [assignmentStatus, setAssignmentStatus] = useState<Record<string, string>>({});
  const [filterByStatus, setFilterByStatus] = useState<string>('');
  const [showOnlyUnassigned, setShowOnlyUnassigned] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<'dateAsc' | 'dateDesc' | 'hourAsc' | 'hourDesc'>('dateAsc');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');

  // États pour le switcher
  const [showSwitcher, setShowSwitcher] = useState<boolean>(false);
  const [switcherRdv, setSwitcherRdv] = useState<RendezVous | null>(null);

  // Ref pour les dropdowns
  const etudeSelectorRef = useRef<HTMLDivElement>(null);
  const volunteerSelectorRef = useRef<HTMLDivElement>(null);

  // Charger les études
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const etudesResponse = await etudeService.getAll();

        const etudesArray = Array.isArray(etudesResponse) 
          ? etudesResponse 
          : (etudesResponse && typeof etudesResponse === 'object' && 'data' in etudesResponse ? (etudesResponse as any).data : []);
        setEtudes(Array.isArray(etudesArray) ? etudesArray : []);

        setError(null);
      } catch (err) {
        const error = err as Error;
        console.error("Erreur lors du chargement des études:", error);
        setError(`Erreur lors du chargement des études: ${error.message}`);
        setEtudes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Charger les volontaires
  useEffect(() => {
    const loadVolunteers = async () => {
      try {
        setVolunteersLoading(true);
        const response = await volontaireService.getAllWithoutPagination();
        const data = response || [];
        setVolunteers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur lors du chargement des volontaires:", err);
      } finally {
        setVolunteersLoading(false);
      }
    };

    loadVolunteers();
  }, []);

  // Charger les rendez-vous lorsqu'une étude est sélectionnée
  useEffect(() => {
    const loadAppointmentsByStudy = async () => {
      if (!selectedStudyId) {
        setAppointments([]);
        return;
      }

      try {
        setIsLoading(true);

        // Utilisez getByEtudeId 
        const rdvs = await rdvService.getByEtudeId(parseInt(selectedStudyId));

        setAppointments(Array.isArray(rdvs) ? rdvs : []);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des rendez-vous:", err);
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(`Erreur lors du chargement des rendez-vous: ${errorMessage}`);
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointmentsByStudy();
  }, [selectedStudyId]);

  // Gérer le clic en dehors des dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (etudeSelectorRef.current && !etudeSelectorRef.current.contains(event.target as Node)) {
        setShowEtudeSelector(false);
      }
      if (volunteerSelectorRef.current && !volunteerSelectorRef.current.contains(event.target as Node) && !(event.target as Element).closest('.exclude-click-outside')) {
        setAssigningRdvId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 1. 🔥 FONCTION DE SUPPRESSION AGRESSIVE (remplacer handleEtudeVolontaireOnUnassign)
  const handleEtudeVolontaireOnUnassign = async (etudeId: number, volontaireId: number) => {
    try {
      // Récupérer l'association existante
      const existingAssociationsResponse = await etudeVolontaireService.getVolontairesByEtude(etudeId);

      let existingAssociations = [];
      if (Array.isArray(existingAssociationsResponse)) {
        existingAssociations = existingAssociationsResponse;
      } else if (existingAssociationsResponse?.data) {
        existingAssociations = Array.isArray(existingAssociationsResponse.data) ?
          existingAssociationsResponse.data : [existingAssociationsResponse.data];
      }

      const existingAssoc = existingAssociations.find((assoc: any) =>
        parseInt(assoc.idVolontaire) === parseInt(volontaireId.toString())
      );

      // Stratégies de suppression multiples
      const strategies = [];

      // Stratégie 1: updateVolontaire avec null
      strategies.push(async () => {
        const associationId = etudeVolontaireService.createAssociationId(
          existingAssoc.idEtude,
          existingAssoc.idGroupe,
          existingAssoc.idVolontaire,
          existingAssoc.iv,
          existingAssoc.numsujet,
          existingAssoc.paye,
          existingAssoc.statut
        );

        await etudeVolontaireService.updateVolontaire(associationId, null);
        return "updateVolontaire(null)";
      });

      // Stratégie 2: Reset numsujet puis suppression (si numsujet > 0)
      if (existingAssoc.numsujet && existingAssoc.numsujet > 0) {
        strategies.push(async () => {
          const associationId = etudeVolontaireService.createAssociationId(
            existingAssoc.idEtude,
            existingAssoc.idGroupe,
            existingAssoc.idVolontaire,
            existingAssoc.iv,
            existingAssoc.numsujet,
            existingAssoc.paye,
            existingAssoc.statut
          );

          // Reset numsujet à 0
          await etudeVolontaireService.updateNumSujet(associationId, 0);
          await new Promise(resolve => setTimeout(resolve, 300));

          // Supprimer avec numsujet = 0
          const newAssociationId = etudeVolontaireService.createAssociationId(
            existingAssoc.idEtude,
            existingAssoc.idGroupe,
            existingAssoc.idVolontaire,
            existingAssoc.iv,
            0, // numsujet = 0
            existingAssoc.paye,
            existingAssoc.statut
          );

          await etudeVolontaireService.delete(newAssociationId);
          return "reset numsujet + delete";
        });
      }

      // Stratégie 3: Statut ANNULE puis suppression
      strategies.push(async () => {
        const associationId = etudeVolontaireService.createAssociationId(
          existingAssoc.idEtude,
          existingAssoc.idGroupe,
          existingAssoc.idVolontaire,
          existingAssoc.iv,
          existingAssoc.numsujet,
          existingAssoc.paye,
          existingAssoc.statut
        );

        await etudeVolontaireService.updateStatut(associationId, 'ANNULE');

        const newAssociationId = etudeVolontaireService.createAssociationId(
          existingAssoc.idEtude,
          existingAssoc.idGroupe,
          existingAssoc.idVolontaire,
          existingAssoc.iv,
          existingAssoc.numsujet,
          existingAssoc.paye,
          'ANNULE'
        );

        await etudeVolontaireService.delete(newAssociationId);
        return "statut ANNULE + delete";
      });

      // Stratégie 4: Suppression directe
      strategies.push(async () => {
        await etudeVolontaireService.desassignerVolontaireDEtude(etudeId, volontaireId);
        return "desassignerVolontaireDEtude";
      });

      // Exécuter les stratégies
      for (const [index, strategy] of strategies.entries()) {
        try {
          await strategy();
          break;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
          console.warn(`⚠️ Stratégie ${index + 1} ÉCHOUÉE:`, errorMessage);
        }
      }

      // Vérification finale
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const verificationResponse = await etudeVolontaireService.getVolontairesByEtude(etudeId);
        let associations = [];

        if (Array.isArray(verificationResponse)) {
          associations = verificationResponse;
        } else if (verificationResponse?.data) {
          associations = Array.isArray(verificationResponse.data) ?
            verificationResponse.data : [verificationResponse.data];
        }

        const stillExists = associations.some((assoc: any) =>
          parseInt(assoc.idVolontaire) === parseInt(volontaireId.toString())
        );

        if (stillExists) {
          console.error("🚨 PROBLÈME: L'association EXISTE ENCORE !");
          throw new Error(`L'association persiste malgré toutes les tentatives`);
        }
      } catch (verificationError) {
        if (verificationError instanceof Error && verificationError.message && verificationError.message.includes('persiste')) {
          throw verificationError;
        }
        console.warn("⚠️ Impossible de vérifier la suppression:", verificationError);
      }
    } catch (error) {
      console.error('🔥 ERREUR lors de la suppression agressive:', error);
    }
  };

  // 2. 🔄 FONCTION DE CRÉATION/REMPLACEMENT (remplacer createOrUpdateEtudeVolontaireAssociation)
  const createOrUpdateEtudeVolontaireAssociation = async (etudeId: number, volontaireId: number, rdv: RendezVous) => {
    try {
      // Récupérer l'ID du groupe depuis le RDV
      const groupeId = rdv.idGroupe || rdv.groupe?.id || rdv.groupe?.idGroupe || 0;

      // Récupérer l'IV du groupe si disponible
      let ivGroupe = 0;
      try {
        if (groupeId && groupeId > 0) {
          const groupeDetails = await groupeService.getById(groupeId);
          if (groupeDetails && groupeDetails.iv !== undefined) {
            ivGroupe = parseInt(groupeDetails.iv) || 0;
          }
        }
      } catch (err) {
        console.warn("⚠️ Impossible de récupérer l'IV du groupe:", err);
      }

      // 1.  SUPPRESSION AGRESSIVE de toute association existante
      try {
        await handleEtudeVolontaireOnUnassign(etudeId, volontaireId);
      } catch (deleteError) {
        const errorMessage = deleteError instanceof Error ? deleteError.message : 'Erreur inconnue';
        console.warn("⚠️ Erreur lors de la suppression agressive (on continue):", errorMessage);
      }

      // 2.  Pause de sécurité
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3.  Création de la nouvelle association fraîche

      const associationData = {
        idEtude: etudeId,
        idVolontaire: volontaireId,
        idGroupe: parseInt(groupeId.toString()) || 0,
        iv: ivGroupe,
        numsujet: 0, // 🎯 Toujours 0 pour un nouveau départ
        paye: ivGroupe > 0 ? 1 : 0,
        statut: 'INSCRIT'
      };

      const result = await etudeVolontaireService.create(associationData);
      return result;

    } catch (error) {
      console.error('❌ Erreur lors de la création/remplacement agressif:', error);
      // Ne pas faire échouer l'assignation du RDV
    }
  };



  // Filtrage des études avec tri DESC par ID
  const filteredEtudes = Array.isArray(etudes)
    ? etudes.filter(e => {
      const ref = (e.ref || '').toLowerCase();
      const titre = (e.titre || '').toLowerCase();
      const term = searchEtudeTerm.toLowerCase();

      return ref.includes(term) || titre.includes(term);
    })
      .sort((a, b) => {
        // Tri par ID en ordre décroissant (les plus récentes en premier)
        const idA = a.idEtude || a.id || 0;
        const idB = b.idEtude || b.id || 0;
        return idB - idA;
      })
      .slice(0, 50)
    : [];

  // Filtrage des volontaires
  const filteredVolunteers = Array.isArray(volunteers)
    ? volunteers.filter(v => {
      if (!v) return false;
      const nom = (v.nom || '').toLowerCase();
      const prenom = (v.prenom || '').toLowerCase();
      const term = searchVolunteerTerm.toLowerCase();

      return nom.includes(term) || prenom.includes(term);
    }).slice(0, 50)
    : [];

  // Sélection d'une étude
  const selectEtude = (etude: Etude) => {
    setSelectedStudy(etude);
    setSelectedStudyId(etude.idEtude ? etude.idEtude.toString() : etude.id!.toString());
    setShowEtudeSelector(false);

    // Réinitialiser les filtres
    setFilterByStatus('');
    setShowOnlyUnassigned(false);
    setSortOrder('dateAsc');
  };

  // Assigner un volontaire à un rendez-vous
  const assignVolunteer = async (rdvId: number, volontaireId: number | null) => {
    try {
      setAssignmentStatus(prev => ({ ...prev, [rdvId]: 'loading' }));

      // Trouver le rendez-vous
      const rdv = appointments.find(a => (a.idRdv || a.id) === rdvId);
      if (!rdv) throw new Error("Rendez-vous non trouvé");

      const idEtude = rdv.idEtude || rdv.etude?.id;
      if (!idEtude) throw new Error("ID d'étude manquant");

      // Si volontaireId est null, c'est une désassignation
      if (volontaireId === null) {
        // 1.  Supprimer l'association EtudeVolontaire si elle existe
        const currentVolontaireId = rdv.volontaire?.id || rdv.idVolontaire;
        if (currentVolontaireId) {
          try {
            await handleEtudeVolontaireOnUnassign(idEtude, currentVolontaireId);
          } catch (assocError) {
            console.warn("⚠️ Erreur suppression association:", assocError);
          }
        }

        // 2. Créer les données pour la désassignation
        const updatedData = {
          idEtude: idEtude,
          idRdv: rdvId,
          idVolontaire: null, // ❌ Désassigner
          idGroupe: rdv.idGroupe || rdv.groupe?.id || rdv.groupe?.idGroupe, //  Garder le groupe
          date: rdv.date,
          heure: rdv.heure,
          etat: rdv.etat,
          commentaires: rdv.commentaires
        };

        await rdvService.update(idEtude, rdvId, updatedData);

        // Mettre à jour localement
        setAppointments(prevAppointments =>
          prevAppointments.map(a => {
            if ((a.idRdv || a.id) === rdvId) {
              return {
                ...a,
                volontaire: null,
                idVolontaire: null
              };
            }
            return a;
          })
        );

      } else {
        // C'est une assignation

        // 1.  Créer/Mettre à jour l'association EtudeVolontaire
        try {
          await createOrUpdateEtudeVolontaireAssociation(idEtude, volontaireId, rdv);
        } catch (assocError) {
          console.warn("⚠️ Erreur association EtudeVolontaire:", assocError);
          // On continue même si l'association échoue
        }

        // 2. Créer les données pour l'assignation
        const updatedData = {
          idEtude: idEtude,
          idRdv: rdvId,
          idVolontaire: volontaireId,
          idGroupe: rdv.idGroupe || rdv.groupe?.id || rdv.groupe?.idGroupe, // Garder le groupe
          date: rdv.date,
          heure: rdv.heure,
          etat: rdv.etat,
          commentaires: rdv.commentaires
        };

        await rdvService.update(idEtude, rdvId, updatedData);

        // Mettre à jour localement les données des rendez-vous
        setAppointments(prevAppointments =>
          prevAppointments.map(a => {
            if ((a.idRdv || a.id) === rdvId) {
              const volontaire = Array.isArray(volunteers)
                ? volunteers.find(v => v?.id?.toString() === volontaireId.toString())
                : null;
              return {
                ...a,
                volontaire: volontaire as Volontaire | null,
                idVolontaire: volontaireId
              };
            }
            return a;
          })
        );
      }

      setAssignmentStatus(prev => ({ ...prev, [rdvId]: 'success' }));

      // Masquer après quelques secondes
      setTimeout(() => {
        setAssignmentStatus(prev => {
          const newState = { ...prev };
          delete newState[rdvId];
          return newState;
        });
      }, 2000);

      // Fermer le sélecteur
      setAssigningRdvId(null);

    } catch (err) {
      console.error("Erreur lors de l'assignation du volontaire:", err);
      setAssignmentStatus(prev => ({ ...prev, [rdvId]: 'error' }));

      // Masquer après quelques secondes
      setTimeout(() => {
        setAssignmentStatus(prev => {
          const newState = { ...prev };
          delete newState[rdvId];
          return newState;
        });
      }, 3000);
    }
  };

  // Changer l'état d'un rendez-vous
  const changeAppointmentStatus = async (rdvId: number, newStatus: string) => {
    try {
      setAssignmentStatus(prev => ({ ...prev, [rdvId]: 'loading' }));

      // Trouver le rendez-vous
      const rdv = appointments.find(a => (a.idRdv || a.id) === rdvId);
      if (!rdv) throw new Error("Rendez-vous non trouvé");

      const idEtude = rdv.idEtude || rdv.etude?.id;
      if (!idEtude) throw new Error("ID d'étude manquant");

      // Créer les données pour la mise à jour
      const updatedData = {
        idEtude: idEtude,
        idRdv: rdvId,
        idVolontaire: rdv.volontaire?.id || rdv.idVolontaire,
        date: rdv.date,
        heure: rdv.heure,
        etat: newStatus,
        commentaires: rdv.commentaires
      };

      // Appeler le service pour mettre à jour
      await rdvService.update(idEtude, rdvId, updatedData);

      // Mettre à jour localement les données des rendez-vous
      setAppointments(prevAppointments =>
        prevAppointments.map(a => {
          if ((a.idRdv || a.id) === rdvId) {
            return {
              ...a,
              etat: newStatus
            };
          }
          return a;
        })
      );

      setAssignmentStatus(prev => ({ ...prev, [rdvId]: 'success' }));

      // Masquer après quelques secondes
      setTimeout(() => {
        setAssignmentStatus(prev => {
          const newState = { ...prev };
          delete newState[rdvId];
          return newState;
        });
      }, 2000);

    } catch (err) {
      console.error("Erreur lors du changement d'état:", err);
      setAssignmentStatus(prev => ({ ...prev, [rdvId]: 'error' }));

      // Masquer après quelques secondes
      setTimeout(() => {
        setAssignmentStatus(prev => {
          const newState = { ...prev };
          delete newState[rdvId];
          return newState;
        });
      }, 3000);
    }
  };

  // Handlers pour le switcher
  const handleOpenSwitcher = (rdv: RendezVous) => {
    setSwitcherRdv(rdv);
    setShowSwitcher(true);
  };

  const handleCloseSwitcher = () => {
    setShowSwitcher(false);
    setSwitcherRdv(null);
  };

  const handleSwitchComplete = async () => {
    // Recharger les RDV après un switch réussi
    if (selectedStudyId) {
      await refreshAppointments();
    }
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Date non spécifiée';
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


  // Déterminer la classe CSS en fonction du statut
  const getStatusClass = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-l-4 border-gray-500';
    switch (status) {
      case 'CONFIRME':
        return 'bg-green-100 text-green-800 border-l-4 border-green-500';
      case 'EN_ATTENTE':
        return 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500';
      case 'ANNULE':
        return 'bg-red-100 text-red-800 border-l-4 border-red-500';
      case 'COMPLETE':
        return 'bg-blue-100 text-blue-800 border-l-4 border-blue-500';
      case 'PLANIFIE':
        return 'bg-purple-100 text-purple-800 border-l-4 border-purple-500';
      default:
        return 'bg-gray-100 text-gray-800 border-l-4 border-gray-500';
    }
  };

  // Trier et filtrer les rendez-vous
  const getSortedAndFilteredAppointments = () => {
    return appointments
      .filter(rdv => {
        // Filtrer par statut
        if (filterByStatus && rdv.etat !== filterByStatus) {
          return false;
        }

        // Filtrer uniquement les non assignés
        if (showOnlyUnassigned && (rdv.volontaire || rdv.idVolontaire)) {
          return false;
        }

        // Filtrer par date sélectionnée
        if (selectedDateFilter && rdv.date !== selectedDateFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Trier par date/heure
        switch (sortOrder) {
          case 'dateAsc':
            return new Date(a.date || '').getTime() - new Date(b.date || '').getTime();
          case 'dateDesc':
            return new Date(b.date || '').getTime() - new Date(a.date || '').getTime();
          case 'hourAsc':
            return (a.heure || '').localeCompare(b.heure || '');
          case 'hourDesc':
            return (b.heure || '').localeCompare(a.heure || '');
          default:
            return 0;
        }
      });
  };

  // Rafraîchir les rendez-vous
  const refreshAppointments = async () => {
    if (!selectedStudyId) return;

    try {
      setIsLoading(true);
      const rdvs = await rdvService.getByEtudeId(parseInt(selectedStudyId));
      setAppointments(Array.isArray(rdvs) ? rdvs : []);
      setError(null);
    } catch (err) {
      console.error("Erreur lors du rafraîchissement des rendez-vous:", err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(`Erreur lors du rafraîchissement des rendez-vous: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Rendez-vous par étude</CardTitle>
          <Button variant="ghost" onClick={onBack}>
            &lt; Retour
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Section Étude avec style amélioré */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-green-800">
              <Folder className="w-5 h-5 mr-2" />
              Rechercher une étude
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={etudeSelectorRef} className="relative">
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={showEtudeSelector}
                className="w-full justify-between bg-white h-auto py-3"
                onClick={() => setShowEtudeSelector(!showEtudeSelector)}
              >
                {selectedStudy ? (
                  <div className="text-left flex-1">
                    <div className="font-medium">{selectedStudy.ref}</div>
                    <div className="text-sm text-muted-foreground">{selectedStudy.titre}</div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Sélectionner une étude</span>
                )}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>

              {showEtudeSelector && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border">
                  <div className="border-b p-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher une étude par référence ou titre..."
                        value={searchEtudeTerm}
                        onChange={(e) => setSearchEtudeTerm(e.target.value)}
                        className="pl-9"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredEtudes.length > 0 ? (
                      filteredEtudes.map(etude => (
                        <div
                          key={etude.idEtude || etude.id}
                          className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                          onClick={() => selectEtude(etude)}
                        >
                          <div className="font-medium">{etude.ref}</div>
                          <div className="text-sm text-muted-foreground truncate">{etude.titre}</div>
                        </div>
                      ))
                    ) : searchEtudeTerm ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Aucune étude ne correspond à votre recherche
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        Commencez à taper pour rechercher une étude
                      </div>
                    )}
                    {searchEtudeTerm.length > 0 && filteredEtudes.length >= 50 && (
                      <div className="px-3 py-2 text-xs text-center text-muted-foreground bg-muted border-t">
                        Affichage limité à 50 résultats. Précisez votre recherche pour affiner les résultats.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* État de chargement */}
        {isLoading && (
          <div className="flex justify-center my-8">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <Alert variant="destructive">
            <X className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Liste des rendez-vous */}
        {!isLoading && !error && selectedStudyId && (
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-purple-800">
                  <Calendar className="w-5 h-5 mr-2" />
                  Rendez-vous {selectedStudy && `pour ${selectedStudy.ref}`}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={refreshAppointments}
                  title="Rafraîchir les rendez-vous"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Filtres et stats */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      {getSortedAndFilteredAppointments().length} rendez-vous trouvés
                    </h3>

                    <div className="flex flex-wrap gap-3">
                      {/* Filtre par statut */}
                      <Select value={filterByStatus} onValueChange={setFilterByStatus}>
                        <SelectTrigger className="w-[180px]">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Tous les statuts" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les statuts</SelectItem>
                          <SelectItem value="PLANIFIE">Planifié</SelectItem>
                          <SelectItem value="CONFIRME">Confirmé</SelectItem>
                          <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                          <SelectItem value="ANNULE">Annulé</SelectItem>
                          <SelectItem value="COMPLETE">Complété</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Tri */}
                      <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as any)}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dateAsc">Date ↑</SelectItem>
                          <SelectItem value="dateDesc">Date ↓</SelectItem>
                          <SelectItem value="hourAsc">Heure ↑</SelectItem>
                          <SelectItem value="hourDesc">Heure ↓</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Afficher uniquement non assignés */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="unassigned"
                          checked={showOnlyUnassigned}
                          onCheckedChange={(checked) => setShowOnlyUnassigned(checked as boolean)}
                        />
                        <Label htmlFor="unassigned" className="text-sm cursor-pointer">
                          Sans volontaire uniquement
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Filtres par date - Pills */}
                  {(() => {
                    const uniqueDates = [...new Set(appointments.map(rdv => rdv.date))].sort();
                    if (uniqueDates.length > 1) {
                      return (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">Filtrer par date:</span>
                            <Badge
                              variant={selectedDateFilter === '' ? 'default' : 'secondary'}
                              className="cursor-pointer"
                              onClick={() => setSelectedDateFilter('')}
                            >
                              Toutes ({appointments.length})
                            </Badge>
                            {uniqueDates.map((date) => {
                              const count = appointments.filter(rdv => rdv.date === date).length;
                              return (
                                <Badge
                                  key={date}
                                  variant={selectedDateFilter === date ? 'default' : 'secondary'}
                                  className="cursor-pointer"
                                  onClick={() => setSelectedDateFilter(date || '')}
                                >
                                  📅 {formatDate(date)} ({count})
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </CardContent>
              </Card>

          {getSortedAndFilteredAppointments().length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Aucun rendez-vous trouvé avec les filtres actuels.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Grouper par date si pas de filtre de date sélectionné et plusieurs dates */}
              {(() => {
                const sortedAppointments = getSortedAndFilteredAppointments();
                const uniqueDates = [...new Set(sortedAppointments.map(rdv => rdv.date))].sort();

                // Si pas de filtre de date et plusieurs dates, grouper
                if (!selectedDateFilter && uniqueDates.length > 1) {
                  return uniqueDates.map((date) => {
                    const appointmentsForDate = sortedAppointments.filter(rdv => rdv.date === date);
                    return (
                      <div key={date} className="space-y-3">
                        {/* Header de date */}
                        <div className="sticky top-0 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-3 rounded-lg border-l-4 border-purple-600 shadow-sm">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-purple-900 text-lg flex items-center gap-2">
                              <Calendar className="w-5 h-5" />
                              {formatDate(date)}
                            </h3>
                            <Badge className="bg-purple-600 text-white">
                              {appointmentsForDate.length} RDV
                            </Badge>
                          </div>
                        </div>
                        {/* RDV de cette date */}
                        {appointmentsForDate.map((appointment) => {
                const rdvId = appointment.idRdv || appointment.id;
                const isAssigning = assigningRdvId === rdvId;
                const statusIndicator = assignmentStatus[rdvId];
                const foundVolunteer = Array.isArray(volunteers)
                  ? volunteers.find(v =>
                    v && (v.id || v.volontaireId) === appointment.idVolontaire
                  )
                  : null;



                return (
                  <div
                    key={`${appointment.idEtude}-${rdvId}`}
                    className={`p-4 rounded-md transition-colors hover:bg-gray-50 ${getStatusClass(appointment.etat)} bg-white shadow-sm relative`}
                  >
                    {/* Indicateur de statut d'opération */}
                    {statusIndicator && (
                      <div className="absolute top-2 right-2">
                        {statusIndicator === 'loading' && (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        )}
                        {statusIndicator === 'success' && (
                          <Check className="h-5 w-5 text-green-500" />
                        )}
                        {statusIndicator === 'error' && (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-[3fr,2fr] gap-4">
                      {/* Détails du rendez-vous */}
                      <div>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold">
                              {formatDate(appointment.date)} à {appointment.heure || 'Heure non spécifiée'}
                            </div>
                            <div className="flex items-center text-sm mt-1">
                              <User className="w-4 h-4 mr-1" />
                              <span>
                                {appointment.volontaire ? (
                                  <span className="text-gray-700">
                                    {appointment.volontaire.nom} {appointment.volontaire.prenom}
                                  </span>
                                ) : appointment.idVolontaire ? (
                                  <span className="text-gray-700">
                                    Volontaire ID: {appointment.idVolontaire}
                                    {foundVolunteer ? ` (${foundVolunteer.nom || ''} ${foundVolunteer.prenom || ''})` : ''}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground italic">Aucun volontaire assigné</span>
                                )}
                              </span>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {appointment.etat || 'Non spécifié'}
                          </Badge>
                        </div>

                        {appointment.commentaires && (
                          <div className="text-sm italic mt-2 text-gray-600 bg-gray-50 p-2 rounded">
                            {appointment.commentaires.length > 100
                              ? `${appointment.commentaires.substring(0, 100)}...`
                              : appointment.commentaires
                            }
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col md:flex-row items-center gap-2 justify-end">
                        {/* Sélecteur de volontaire */}
                        <div className="relative w-full md:w-auto">
                          {isAssigning ? (
                            <div
                              ref={volunteerSelectorRef}
                              className="absolute z-10 right-0 mt-1 bg-white rounded-lg shadow-lg border border-blue-300 w-full md:w-72"
                            >
                              <div className="sticky top-0 p-2 border-b bg-muted">
                                <div className="relative">
                                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    type="text"
                                    placeholder="Rechercher un volontaire..."
                                    value={searchVolunteerTerm}
                                    onChange={(e) => setSearchVolunteerTerm(e.target.value)}
                                    className="pl-9"
                                    autoFocus
                                  />
                                </div>
                              </div>

                              <div className="max-h-60 overflow-y-auto">
                                {volunteersLoading ? (
                                  <div className="p-4 text-center">
                                    <Loader2 className="animate-spin inline-block w-5 h-5" />
                                  </div>
                                ) : filteredVolunteers.length > 0 ? (
                                  filteredVolunteers.filter(v => v !== null).map(volunteer => (
                                    <div
                                      key={volunteer!.id}
                                      className="p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                      onClick={() => volunteer!.id && assignVolunteer(rdvId, volunteer!.id)}
                                    >
                                      <div className="font-medium text-gray-800">{volunteer!.nom} {volunteer!.prenom}</div>
                                      {volunteer!.email && (
                                        <div className="text-xs text-gray-500">{volunteer!.email}</div>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-4 text-center text-gray-500">
                                    Aucun volontaire ne correspond à votre recherche
                                  </div>
                                )}
                              </div>

                              <div className="border-t p-2 bg-muted flex justify-between">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setAssigningRdvId(null)}
                                >
                                  Annuler
                                </Button>

                                {(appointment.volontaire || appointment.idVolontaire) && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleOpenSwitcher(appointment)}
                                      className="mr-2"
                                    >
                                      <ArrowLeftRight className="w-4 h-4 mr-1" />
                                      Échanger
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => assignVolunteer(rdvId, null)}
                                    >
                                      Désassigner
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                variant="default"
                                size="sm"
                                className="exclude-click-outside"
                                onClick={() => setAssigningRdvId(rdvId)}
                              >
                                {appointment.volontaire || appointment.idVolontaire ? "Changer" : "Assigner"} volontaire
                              </Button>

                              {/* Bouton Échanger - visible uniquement si RDV assigné */}
                              {(appointment.volontaire || appointment.idVolontaire) && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleOpenSwitcher(appointment)}
                                  title="Échanger ce rendez-vous avec un autre"
                                >
                                  <ArrowLeftRight className="w-4 h-4 mr-1" />
                                  Échanger
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Changer le statut */}
                        <Select
                          value={appointment.etat || ''}
                          onValueChange={(value) => changeAppointmentStatus(rdvId, value)}
                        >
                          <SelectTrigger className="w-full md:w-auto">
                            <SelectValue placeholder="Statut" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PLANIFIE">Planifié</SelectItem>
                            <SelectItem value="CONFIRME">Confirmé</SelectItem>
                            <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                            <SelectItem value="ANNULE">Annulé</SelectItem>
                            <SelectItem value="COMPLETE">Complété</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Voir détails */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAppointmentClick(appointment)}
                          className="w-full md:w-auto"
                        >
                          Détails
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
                      </div>
                    );
                  });
                } else {
                  // Sinon, affichage simple sans groupement
                  return sortedAppointments.map((appointment) => {
                    const rdvId = appointment.idRdv || appointment.id;
                    const isAssigning = assigningRdvId === rdvId;
                    const statusIndicator = assignmentStatus[rdvId];
                    const foundVolunteer = Array.isArray(volunteers)
                      ? volunteers.find(v =>
                        v && (v.id || v.volontaireId) === appointment.idVolontaire
                      )
                      : null;

                    return (
                      <Card key={rdvId} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex flex-col gap-4">
                            {/* Info du RDV */}
                            <div className="flex items-center gap-4 flex-wrap">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span className="font-medium">{formatDate(appointment.date)}</span>
                              </div>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="10"/>
                                  <polyline points="12 6 12 12 16 14"/>
                                </svg>
                                <span>{appointment.heure}</span>
                              </div>
                              <div className="flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                {appointment.volontaire || appointment.idVolontaire || foundVolunteer ? (
                                  <span className="text-green-600 font-medium">
                                    {foundVolunteer
                                      ? `${foundVolunteer.prenomVol || foundVolunteer.prenom || ''} ${foundVolunteer.nomVol || foundVolunteer.nom || ''}`.trim()
                                      : `Volontaire ID: ${appointment.idVolontaire} (${appointment.prenomVolontaire || appointment.prenomVol || ''} ${appointment.nomVolontaire || appointment.nomVol || ''})`
                                    }
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">Aucun volontaire assigné</span>
                                )}
                              </div>
                              <Badge variant="secondary">
                                {appointment.etat || 'Non spécifié'}
                              </Badge>
                            </div>

                          {/* Commentaires */}
                          {appointment.commentaires && (
                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                              <strong>Commentaires:</strong> {appointment.commentaires}
                            </div>
                          )}

                          {/* Success/Error indicators */}
                          {statusIndicator && (
                            <div className={`text-sm ${statusIndicator === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                              {statusIndicator === 'success' ? '✓ Assigné avec succès' : '✗ Erreur lors de l\'assignation'}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex flex-wrap gap-3 items-center">
                            {/* Assigner/Changer volontaire */}
                            <div className="flex-1 min-w-[200px]">
                              {isAssigning ? (
                                <div className="space-y-2">
                                  {/* Dropdown volontaires */}
                                  <div ref={volunteerSelectorRef} className="relative">
                                    <input
                                      type="text"
                                      placeholder="Rechercher un volontaire..."
                                      value={searchVolunteerTerm}
                                      onChange={(e) => setSearchVolunteerTerm(e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm exclude-click-outside"
                                    />
                                    {volunteersLoading ? (
                                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 p-3 text-center exclude-click-outside">
                                        <Loader2 className="animate-spin inline-block w-4 h-4" />
                                        <span className="ml-2 text-sm text-gray-500">Chargement...</span>
                                      </div>
                                    ) : (
                                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto exclude-click-outside">
                                        {volunteers
                                          .filter(vol => {
                                            if (!vol) return false;
                                            const searchLower = searchVolunteerTerm.toLowerCase();
                                            const firstName = (vol.prenomVol || vol.prenom || '').toLowerCase();
                                            const lastName = (vol.nomVol || vol.nom || '').toLowerCase();
                                            return firstName.includes(searchLower) || lastName.includes(searchLower);
                                          })
                                          .map((vol) => vol && (
                                            <div
                                              key={vol.id || vol.volontaireId}
                                              onClick={() => (vol.id || vol.volontaireId) && assignVolunteer(rdvId, vol.id || vol.volontaireId)}
                                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0"
                                            >
                                              {vol.prenomVol || vol.prenom} {vol.nomVol || vol.nom}
                                            </div>
                                          ))}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setAssigningRdvId(null)}
                                    >
                                      Annuler
                                    </Button>

                                    {(appointment.volontaire || appointment.idVolontaire) && (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleOpenSwitcher(appointment)}
                                          className="mr-2"
                                        >
                                          <ArrowLeftRight className="w-4 h-4 mr-1" />
                                          Échanger
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => assignVolunteer(rdvId, null)}
                                        >
                                          Désassigner
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex gap-2 flex-wrap">
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="exclude-click-outside"
                                    onClick={() => setAssigningRdvId(rdvId)}
                                  >
                                    {appointment.volontaire || appointment.idVolontaire ? "Changer" : "Assigner"} volontaire
                                  </Button>

                                  {/* Bouton Échanger - visible uniquement si RDV assigné */}
                                  {(appointment.volontaire || appointment.idVolontaire) && (
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => handleOpenSwitcher(appointment)}
                                      title="Échanger ce rendez-vous avec un autre"
                                    >
                                      <ArrowLeftRight className="w-4 h-4 mr-1" />
                                      Échanger
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Changer le statut */}
                            <Select
                              value={appointment.etat || ''}
                              onValueChange={(value) => changeAppointmentStatus(rdvId, value)}
                            >
                              <SelectTrigger className="w-full md:w-auto">
                                <SelectValue placeholder="Statut" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PLANIFIE">Planifié</SelectItem>
                                <SelectItem value="CONFIRME">Confirmé</SelectItem>
                                <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                                <SelectItem value="ANNULE">Annulé</SelectItem>
                                <SelectItem value="COMPLETE">Complété</SelectItem>
                              </SelectContent>
                            </Select>

                            {/* Voir détails */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onAppointmentClick(appointment)}
                              className="w-full md:w-auto"
                            >
                              Détails
                            </Button>
                          </div>
                        </div>
                        </CardContent>
                      </Card>
                    );
                  });
                }
              })()}
            </div>
          )}
        </CardContent>
      </Card>
      )}

        {/* Appointment Switcher Modal */}
        {showSwitcher && (
          <AppointmentSwitcher
            preSelectedRdv={switcherRdv as any}
            etudeId={selectedStudyId as any}
            onClose={handleCloseSwitcher}
            onSwitchComplete={handleSwitchComplete}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentsByStudy;