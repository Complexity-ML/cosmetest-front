import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import etudeService from "../../services/etudeService";
import IndemniteManager from "../../components/Etudes/IndemniteManager";
import GroupesSection from "../../components/Etudes/detailsSections/GroupesSection";
import groupeService from "../../services/groupeService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const ETHNIES_DISPONIBLES = [
  'CAUCASIENNE',
  'AFRICAINE',
  'ASIATIQUE',
  'INDIENNE',
  'ANTILLAISE',
];

const PRODUITS_DISPONIBLES = [
  'GLOSS',
  'ROUGES A LEVRES',
  'BEAUME A LEVRES',
  'SERUM A LEVRES',
  'HUILE A LEVRES',
  'CONTOUR LEVRES',
  'ENCRE LEVRES',
  'FOND DE TEINT LIQUIDE',
  'FOND DE TEINT POUDRE',
  'POUDRE COMPACTE',
  'POUDRE LIBRE',
  'BRONZER',
  'BLUSH',
  'FOND DE TEINT',
  'POUDRE',
  'PRIMER',
  'SPRAY FIXATEUR',
  'MASCARA',
  'BASE MASCARA',
  'LINER',
  'KHOL',
  'CRAYON YEUX',
  'CRAYON LEVRES',
  'BROWGLAZE',
  'CRAYON SOURCILS',
  'FIXATEUR SOURCILS',
  'MASCARA SOURCILS',
  'PRODUITS DE SOIN',
  'VERNIS A ONGLES',
  'DEMAQUILLANT',
  'BASE DE FARD A PAUPIERES',
  'BASE LEVRES',
  'FIXATEUR LEVRES',
  'FARD A PAUPIERES',
  'CONCEALER',
  'HIGHLIGHTER',
];

interface NewGroupe {
  intitule?: string;
  description?: string;
  idEtude?: number;
  ageMinimum?: number;
  ageMaximum?: number;
  ethnie?: string | string[];
  criteresSupplementaires?: string;
  nbSujet?: number;
  iv?: number;
}

const normalizeEthnies = (ethniesArray: string | string[] | undefined): string => {
  if (!ethniesArray) return '';
  return Array.isArray(ethniesArray) ? ethniesArray.join(',') : ethniesArray;
};

const EtudeFormEnhanced = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // États principaux
  const [formData, setFormData] = useState({
    idEtude: undefined as number | undefined,
    ref: "",
    titre: "",
    description: "",
    produits: "",
    examens: "",
    type: "",
    dateDebut: "",
    dateFin: "",
    paye: false,
    montant: 0,
    capaciteVolontaires: 0,
    indemniteParDefaut: 0,
    groupesIndemnites: [] as any[],
  });

  const [selectedProduits, setSelectedProduits] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [refExists, setRefExists] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  // Etats Groupes (pour avoir l'onglet Groupes aussi en mode édition)
  const [showGroupeForm, setShowGroupeForm] = useState(false);
  const [isLoadingGroupes, setIsLoadingGroupes] = useState(false);
  const [groupes, setGroupes] = useState<any[]>([]);
  const [newGroupe, setNewGroupe] = useState<NewGroupe>({
    intitule: '',
    description: '',
    idEtude: id ? Number(id) : undefined,
    ageMinimum: undefined,
    ageMaximum: undefined,
    ethnie: [],
    criteresSupplementaires: '',
    nbSujet: undefined,
    iv: undefined,
  });

  // Synchroniser selectedProduits avec formData.produits
  useEffect(() => {
    if (formData.produits) {
      const produits = formData.produits.split(',').map(p => p.trim()).filter(p => p);
      setSelectedProduits(produits);
    }
  }, [formData.produits]);

  // Chargement initial des données
  useEffect(() => {
    const fetchEtude = async () => {
      if (!isEditMode) return;

      try {
        setIsLoading(true);
        const data = await etudeService.getById(Number(id));

        setFormData({
          idEtude: data.idEtude,
          ref: data.ref || "",
          titre: data.titre || "",
          produits: data.produits || "",
          description: data.commentaires || "",
          type: data.type || "",
          dateDebut: data.dateDebut ? data.dateDebut.substring(0, 10) : "",
          dateFin: data.dateFin ? data.dateFin.substring(0, 10) : "",
          paye: data.paye === 2 || data.paye === 1,
          montant: data.iv || 0,
          capaciteVolontaires: data.capaciteVolontaires || 0,
          examens: data.examens || "",
          indemniteParDefaut: data.iv || 0,
          groupesIndemnites: [],
        });
      } catch (error) {
        console.error("Erreur lors du chargement de l'étude:", error);
        setError("Erreur lors du chargement des données de l'étude");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEtude();
  }, [id, isEditMode]);

  // (déplacé plus bas, après déclaration de fetchGroupes)

  // Gestionnaires d'événements
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));

      if (name === "ref" && value && !isEditMode) {
        etudeService
          .checkRefExists(value)
          .then(setRefExists)
          .catch(console.error);
      }
    },
    [isEditMode]
  );

  const handleProduitToggle = useCallback((produit: string) => {
    setSelectedProduits((prev) => {
      const newSelection = prev.includes(produit)
        ? prev.filter(p => p !== produit)
        : [...prev, produit];

      // Synchroniser avec formData.produits
      setFormData(formPrev => ({
        ...formPrev,
        produits: newSelection.join(', ')
      }));

      return newSelection;
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!isEditMode && refExists) {
        setError("Cette référence d'étude existe déjà");
        return;
      }

      const etudeDTO = {
        ...formData,
        paye: formData.paye ? 1 : 0,
      };

      try {
        setIsSaving(true);
        setError("");

        if (isEditMode) {
          await etudeService.update(Number(id), etudeDTO);
        } else {
          const nouvelleEtude = await etudeService.create(etudeDTO);
          navigate(`/etudes/${nouvelleEtude.idEtude}/edit`);
        }
      } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'étude:", error);
        setError("Erreur lors de l'enregistrement de l'étude");
      } finally {
        setIsSaving(false);
      }
    },
    [formData, isEditMode, refExists, id, navigate]
  );

  // Handlers Groupes (reprise du détail)
  const handleGroupeChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    if (["ageMinimum", "ageMaximum", "nbSujet", "iv"].includes(name)) {
      setNewGroupe((prev) => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
    } else {
      setNewGroupe((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleEthnieChange = useCallback((ethnieValue: string) => {
    setNewGroupe((prevGroupe) => {
      const current = Array.isArray(prevGroupe.ethnie) ? prevGroupe.ethnie : [];
      return current.includes(ethnieValue)
        ? { ...prevGroupe, ethnie: current.filter((e) => e !== ethnieValue) }
        : { ...prevGroupe, ethnie: [...current, ethnieValue] };
    });
  }, []);

  const fetchGroupes = useCallback(async () => {
    if (!isEditMode || !id) return;
    try {
      setIsLoadingGroupes(true);
      const data = await groupeService.getGroupesByIdEtude(id);
      setGroupes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Erreur chargement groupes:', e);
      setGroupes([]);
    } finally {
      setIsLoadingGroupes(false);
    }
  }, [id, isEditMode]);

  const handleCreateGroupe = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newGroupe.intitule) {
      setError("L'intitulé du groupe est requis");
      return;
    }
    try {
      const payload = { ...newGroupe, idEtude: Number(id), ethnie: normalizeEthnies(newGroupe.ethnie) };
      await groupeService.create(payload);
      await fetchGroupes();
      setNewGroupe({
        intitule: '', description: '', idEtude: id ? Number(id) : undefined, ageMinimum: undefined, ageMaximum: undefined, ethnie: [],
        criteresSupplementaires: '', nbSujet: undefined, iv: undefined,
      });
      setShowGroupeForm(false);
    } catch (e) {
      console.error('Erreur lors de la création du groupe:', e);
      setError('Erreur lors de la création du groupe');
    }
  }, [fetchGroupes, id, newGroupe]);

  // Charger les groupes quand l'onglet groupes est ouvert (après déclaration de fetchGroupes)
  useEffect(() => {
    if (isEditMode && activeTab === 'groupes') {
      fetchGroupes();
    }
  }, [activeTab, fetchGroupes, isEditMode]);

  // Gestionnaire d'erreur pour le composant IndemniteManager
  const handleIndemniteError = useCallback((errorMessage?: string) => {
    if (errorMessage) {
      setError(errorMessage);
    }
  }, []);

  // Affichage du loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditMode ? "Modifier l'étude" : "Créer une nouvelle étude"}
          </h1>
          {isEditMode && (
            <span
              className={`ml-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                formData.paye
                  ? "bg-green-100 text-green-800 border border-green-500"
                  : "bg-red-100 text-red-800 border border-red-500"
              }`}
            >
              {formData.paye ? "Rémunérée" : "Non rémunérée"}
            </span>
          )}
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
          <button
            onClick={() => setError("")}
            className="absolute top-0 right-0 mt-2 mr-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Onglets pour le mode édition */}
      {isEditMode && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === "details"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("details")}
              >
                Détails de l'étude
              </button>
              <button
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === "indemnites"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("indemnites")}
              >
                Gestion des indemnités
              </button>
              <button
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === "groupes"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("groupes")}
              >
                Groupes
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Contenu des onglets */}
      {(!isEditMode || activeTab === "details") && (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Référence */}
            <div>
              <Label htmlFor="ref">
                Référence *
              </Label>
              <Input
                type="text"
                id="ref"
                name="ref"
                value={formData.ref}
                onChange={handleChange}
                className={refExists ? "border-red-500" : ""}
                required
                disabled={isEditMode}
              />
              {refExists && (
                <p className="mt-1 text-sm text-red-600">
                  Cette référence existe déjà
                </p>
              )}
            </div>

            {/* Titre */}
            <div>
              <Label htmlFor="titre">
                Titre *
              </Label>
              <Input
                type="text"
                id="titre"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <Label htmlFor="description">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="min-h-[100px]"
                rows={4}
              />
            </div>

            {/* Produits  */}
            <div className="md:col-span-2">
              <Label>
                Produits
              </Label>
              <div className="mt-2 p-4 border border-gray-300 rounded-md bg-gray-50 max-h-64 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {PRODUITS_DISPONIBLES.map((produit) => (
                    <div key={produit} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`produit-${produit}`}
                        checked={selectedProduits.includes(produit)}
                        onChange={() => handleProduitToggle(produit)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`produit-${produit}`}
                        className="text-sm text-gray-700 cursor-pointer select-none"
                      >
                        {produit}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              {selectedProduits.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {selectedProduits.length} produit{selectedProduits.length > 1 ? 's' : ''} sélectionné{selectedProduits.length > 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Examens */}
            <div className="md:col-span-2">
              <Label htmlFor="examens">
                Examens
              </Label>
              <Textarea
                id="examens"
                name="examens"
                value={formData.examens}
                onChange={handleChange}
                className="min-h-[100px]"
                rows={4}
              />
            </div>

            {/* Type d'étude */}
            <div>
              <Label htmlFor="type">
                Type d'étude *
              </Label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Sélectionner</option>
                <option value="USAGE">Usage</option>
                <option value="EFFICACITE MAQUILLAGE">Efficacité Maquillage</option>
                <option value="EFFICACITE SOIN">Efficacité Soin</option>
                <option value="DTM">DTM</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>

            {/* Capacité */}
            <div>
              <Label htmlFor="capaciteVolontaires">
                Capacité (nombre de volontaires) *
              </Label>
              <Input
                type="number"
                id="capaciteVolontaires"
                name="capaciteVolontaires"
                value={formData.capaciteVolontaires}
                onChange={handleChange}
                min={0}
                required
              />
            </div>

            {/* Date de début */}
            <div>
              <Label htmlFor="dateDebut">
                Date de début *
              </Label>
              <Input
                type="date"
                id="dateDebut"
                name="dateDebut"
                value={formData.dateDebut}
                onChange={handleChange}
                required
              />
            </div>

            {/* Date de fin */}
            <div>
              <Label htmlFor="dateFin">
                Date de fin *
              </Label>
              <Input
                type="date"
                id="dateFin"
                name="dateFin"
                value={formData.dateFin}
                onChange={handleChange}
                required
              />
            </div>

            {/* Étude rémunérée */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="paye"
                name="paye"
                checked={formData.paye}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <Label
                htmlFor="paye"
                className="font-normal cursor-pointer"
              >
                Étude rémunérée
              </Label>
            </div>

            {/* Montant */}
            {formData.paye && (
              <div>
                <Label htmlFor="montant">
                  Montant (€)
                </Label>
                <Input
                  type="number"
                  id="montant"
                  name="montant"
                  value={formData.montant}
                  onChange={handleChange}
                  min={0}
                  step={0.01}
                />
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="mt-8 flex justify-end space-x-4">
            <Button
              type="button"
              onClick={() => navigate("/etudes")}
              variant="secondary"
              disabled={isSaving}
            >
              {isEditMode ? "Retour aux études" : "Annuler"}
            </Button>
            <Button
              type="submit"
              disabled={isSaving || (refExists && !isEditMode)}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                isEditMode ? "Enregistrer l'étude" : "Créer l'étude"
              )}
            </Button>
          </div>
          </CardContent>
          </Card>
        </form>
      )}

      {/* Onglet indemnités - Utilise le nouveau composant */}
      {isEditMode && activeTab === "indemnites" && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <IndemniteManager
            etudeId={id}
            etudeTitre={formData.titre}
            etudeRef={formData.ref}
            onError={handleIndemniteError}
            showDebugInfo={true}
          />

          {/* Bouton pour retourner aux études */}
          <div className="mt-8 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">💡 Info :</span> Les modifications des volontaires sont sauvegardées automatiquement.
            </div>
            <Button
              type="button"
              onClick={() => navigate("/etudes")}
              variant="secondary"
            >
              Retour aux études
            </Button>
          </div>
        </div>
      )}

      {/* Onglet Groupes (édition) */}
      {isEditMode && activeTab === "groupes" && (
        <Card>
          <CardContent className="pt-6">
          <GroupesSection
            etude={{ idEtude: id ? Number(id) : 0, ref: formData.ref, titre: formData.titre }}
            showGroupeForm={showGroupeForm}
            setShowGroupeForm={setShowGroupeForm}
            newGroupe={newGroupe}
            handleGroupeChange={handleGroupeChange}
            ethniesDisponibles={ETHNIES_DISPONIBLES}
            handleEthnieChange={handleEthnieChange}
            handleCreateGroupe={handleCreateGroupe}
            isLoadingGroupes={isLoadingGroupes}
            groupes={groupes}
            fetchGroupes={fetchGroupes}
          />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EtudeFormEnhanced;
