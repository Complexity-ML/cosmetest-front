import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, UserPlus, UserPen, AlertCircle, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

// Options pour les sélections
const sexeOptions = ['Homme', 'Femme'];
const typePeauOptions = ['Normale', 'Sèche', 'Grasse', 'Mixte', 'Sensible'];
const phototypeOptions = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const carnationOptions = ['Très claire', 'Claire', 'Moyenne', 'Mate', 'Foncée'];
const intensiteOptions = ['Faible', 'Modéré', 'Fort', 'Très fort', 'Aucun'];
const expositionSolaireOptions = ['Faible', 'Modérée', 'Forte', 'Très forte', 'Aucune'];
const coupsDeSoleilOptions = ['Rarement', 'Occasionnellement', 'Souvent', 'Très souvent', 'Jamais'];
const bronzageOptions = ['Difficilement', 'Progressivement', 'Facilement', 'Très facilement', 'Jamais'];
const sensibiliteCutaneeOptions = ['Faible', 'Modérée', 'Forte', 'Très forte', 'Aucune'];
const yeuxOptions = ['Bleus', 'Verts', 'Marrons', 'Noirs', 'Noisette', 'Gris'];
const levresOptions = ['Fines', 'Moyennes', 'Pulpeuses'];
const ouiNonOptions = ['Oui', 'Non'];
const couleurCheveuxOptions = ['Blonds', 'Châtains', 'Bruns', 'Roux', 'Noirs', 'Gris', 'Blancs'];
const natureCheveuxOptions = ['Lisses', 'Ondulés', 'Bouclés', 'Crépus'];
const longueurCheveuxOptions = ['Courts', 'Mi-longs', 'Longs', 'Très longs'];
const epaisseurCheveuxOptions = ['Fins', 'Moyens', 'Épais'];
const natureCuirCheveluOptions = ['Normal', 'Sec', 'Gras', 'Mixte', 'Sensible'];
const scoreOptions = ['0', '1', '2', '3', '4'];

interface FormFieldProps {
  label: string;
  id: string;
  type?: 'text' | 'select' | 'textarea' | 'number' | 'email';
  value: string;
  onChange: (e: any) => void;
  required?: boolean;
  error?: string | null;
  options?: string[];
  placeholder?: string;
  infoTooltip?: string;
  className?: string;
  rows?: number;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  required = false,
  error = null,
  options = [],
  placeholder = '',
  infoTooltip = null,
  className = '',
  rows = 3
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between items-start">
        <Label htmlFor={id} className="text-sm font-medium">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>

      {type === 'select' ? (
        <Select value={value || 'none'} onValueChange={(val) => onChange({ target: { name: id, value: val === 'none' ? '' : val } })}>
          <SelectTrigger id={id} className={error ? 'border-destructive' : ''}>
            <SelectValue placeholder="Sélectionner..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sélectionner...</SelectItem>
            {options.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : type === 'textarea' ? (
        <Textarea
          id={id}
          name={id}
          value={value || ''}
          onChange={onChange}
          rows={rows}
          placeholder={placeholder}
          required={required}
          className={error ? 'border-destructive' : ''}
        />
      ) : (
        <Input
          type={type}
          id={id}
          name={id}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={error ? 'border-destructive' : ''}
        />
      )}
    </div>
  );
};

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
  color?: 'blue' | 'green' | 'purple' | 'red' | 'amber' | 'teal' | 'indigo' | 'pink';
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  isOpen = false,
  color = 'blue'
}) => {
  const [open, setOpen] = useState(isOpen);

  const colorClasses = {
    blue: 'border-blue-500 text-blue-700',
    green: 'border-green-500 text-green-700',
    purple: 'border-purple-500 text-purple-700',
    red: 'border-red-500 text-red-700',
    amber: 'border-amber-500 text-amber-700',
    teal: 'border-teal-500 text-teal-700',
    indigo: 'border-indigo-500 text-indigo-700',
    pink: 'border-pink-500 text-pink-700'
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mb-6">
      <CollapsibleTrigger className="w-full">
        <div className={cn(
          'flex justify-between items-center text-left text-lg font-medium border-b-2 pb-2 mb-3 hover:bg-gray-50 rounded-t-md transition-colors px-2',
          colorClasses[color]
        )}>
          <span>{title}</span>
          <ChevronDown className={cn('h-5 w-5 transition-transform', open && 'rotate-180')} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

const PanelForm = () => {
  const { idPanel } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(idPanel);

  const [formData, setFormData] = useState<any>({
    sexe: '',
    typePeauVisage: '',
    typePeauCorps: '',
    phototype: '',
    carnation: '',
    groupe: '',
    commentaires: '',
    idEtude: '',
    idGroupe: '',
    bronzage: '',
    coupsDeSoleil: '',
    expositionSolaire: '',
    sensibiliteCutanee: '',
    secheresseLevres: '',
    secheresseCou: '',
    secheressePoitrineDecollete: '',
    secheresseVentreTaille: '',
    secheresseFessesHanches: '',
    secheresseBras: '',
    secheresseMains: '',
    secheresseJambes: '',
    secheressePieds: '',
    tachesPigmentairesVisage: '',
    tachesPigmentairesCou: '',
    tachesPigmentairesDecollete: '',
    tachesPigmentairesMains: '',
    perteDeFermeteVisage: '',
    perteDeFermeteCou: '',
    perteDeFermeteDecollete: '',
    pilosite: '',
    cicatrices: '',
    tatouages: '',
    piercings: '',
    vergeturesJambes: '',
    vergeturesFessesHanches: '',
    vergeturesVentreTaille: '',
    vergeturesPoitrineDecollete: '',
    celluliteJambes: '',
    celluliteFessesHanches: '',
    celluliteVentreTaille: '',
    celluliteBras: '',
    couleurCheveux: '',
    natureCheveux: '',
    longueurCheveux: '',
    epaisseurCheveux: '',
    natureCuirChevelu: '',
    cheveuxAbimes: '',
    cheveuxCassants: '',
    cheveuxPlats: '',
    cheveuxTernes: '',
    pointesFourchues: '',
    pellicules: '',
    demangeaisonsDuCuirChevelu: '',
    cuirCheveluSensible: '',
    chuteDeCheveux: '',
    calvitie: '',
    epaisseurCils: '',
    longueurCils: '',
    courbureCils: '',
    cilsAbimes: '',
    cilsBroussailleux: '',
    chuteDeCils: '',
    onglesMous: '',
    onglesCassants: '',
    onglesStries: '',
    onglesDedoubles: '',
    lesionsRetentionnelles: '',
    lesionsInflammatoires: '',
    cernesPigmentaires: '',
    cernesVasculaires: '',
    poches: '',
    poresVisibles: '',
    teintInhomogene: '',
    teintTerne: '',
    menopause: '',
    ths: '',
    contraception: '',
    acne: '',
    couperoseRosacee: '',
    psoriasis: '',
    dermiteSeborrheique: '',
    eczema: '',
    angiome: '',
    pityriasis: '',
    vitiligo: '',
    melanome: '',
    zona: '',
    herpes: '',
    pelade: '',
    reactionAllergique: '',
    desensibilisation: '',
    terrainAtopique: '',
    scorePodMin: '',
    scorePogMin: '',
    scoreFrontMin: '',
    scoreLionMin: '',
    scorePpdMin: '',
    scorePpgMin: '',
    scoreDodMin: '',
    scoreDogMin: '',
    scoreSngdMin: '',
    scoreSnggMin: '',
    scoreLevsupMin: '',
    scoreComlevdMin: '',
    scoreComlevgMin: '',
    scorePtoseMin: '',
    scorePodMax: '',
    scorePogMax: '',
    scoreFrontMax: '',
    scoreLionMax: '',
    scorePpdMax: '',
    scorePpgMax: '',
    scoreDodMax: '',
    scoreDogMax: '',
    scoreSngdMax: '',
    scoreSnggMax: '',
    scoreLevsupMax: '',
    scoreComlevdMax: '',
    scoreComlevgMax: '',
    scorePtoseMax: '',
    originePere: '',
    origineMere: '',
    sousEthnie: '',
    bouffeeChaleurMenaupose: '',
    yeux: '',
    levres: '',
    mapyeux: '',
    maplevres: '',
    mapsourcils: ''
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [etudes, setEtudes] = useState<any[]>([]);
  const [groupes, setGroupes] = useState<any[]>([]);

  useEffect(() => {
    const fetchOptionsData = async () => {
      try {
        const etudesResponse = await api.get('/etudes');
        setEtudes(etudesResponse.data);

        const groupesResponse = await api.get('/groupes');
        setGroupes(groupesResponse.data);
      } catch (error) {
        console.error('Erreur lors du chargement des options:', error);
      }
    };

    fetchOptionsData();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      const fetchPanelData = async () => {
        try {
          setIsLoading(true);
          const response = await api.get(`/panels/${idPanel}`);
          setFormData(response.data);
        } catch (error) {
          console.error('Erreur lors du chargement des données du panel:', error);
          setSubmitError('Impossible de charger les données du panel.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchPanelData();
    }
  }, [idPanel, isEditMode]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.phototype) newErrors.phototype = 'Le phototype est obligatoire';
    if (!formData.idEtude) newErrors.idEtude = 'L\'étude est obligatoire';
    if (!formData.idGroupe) newErrors.idGroupe = 'Le groupe est obligatoire';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      if (isEditMode) {
        await api.put(`/panels/${idPanel}`, formData);
        navigate(`/panels/${idPanel}`);
      } else {
        const response = await api.post('/panels', formData);
        navigate(`/panels/${response.data.id}`);
      }
    } catch (error: any) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      setSubmitError(error.response?.data?.message || 'Une erreur est survenue lors de la soumission du formulaire.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/panels">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            {isEditMode ? (
              <>
                <UserPen className="w-6 h-6 mr-2 text-blue-600" />
                Modifier un panel
              </>
            ) : (
              <>
                <UserPlus className="w-6 h-6 mr-2 text-blue-600" />
                Ajouter un panel
              </>
            )}
          </h1>
        </div>
      </div>

      {submitError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <CollapsibleSection title="Informations administratives" isOpen={true} color="blue">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Étude"
                  id="idEtude"
                  type="select"
                  value={formData.idEtude}
                  onChange={handleChange}
                  options={etudes.map(etude => etude.nom || etude.idEtude)}
                  required
                  error={errors.idEtude}
                />
                <FormField
                  label="Groupe"
                  id="idGroupe"
                  type="select"
                  value={formData.idGroupe}
                  onChange={handleChange}
                  options={groupes.map(groupe => groupe.nom || groupe.idGroupe)}
                  required
                  error={errors.idGroupe}
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Informations personnelles" isOpen={true} color="green">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Sexe"
                  id="sexe"
                  type="select"
                  value={formData.sexe}
                  onChange={handleChange}
                  options={sexeOptions}
                  required
                  error={errors.sexe}
                />
                <FormField
                  label="Origine du père"
                  id="originePere"
                  value={formData.originePere}
                  onChange={handleChange}
                />
                <FormField
                  label="Origine de la mère"
                  id="origineMere"
                  value={formData.origineMere}
                  onChange={handleChange}
                />
                <FormField
                  label="Sous-ethnie"
                  id="sousEthnie"
                  value={formData.sousEthnie}
                  onChange={handleChange}
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Caractéristiques physiques générales" isOpen={true} color="purple">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  label="Phototype"
                  id="phototype"
                  type="select"
                  value={formData.phototype}
                  onChange={handleChange}
                  options={phototypeOptions}
                  required
                  error={errors.phototype}
                />
                <FormField
                  label="Carnation"
                  id="carnation"
                  type="select"
                  value={formData.carnation}
                  onChange={handleChange}
                  options={carnationOptions}
                />
                <FormField
                  label="Bronzage"
                  id="bronzage"
                  type="select"
                  value={formData.bronzage}
                  onChange={handleChange}
                  options={bronzageOptions}
                />
                <FormField
                  label="Coups de soleil"
                  id="coupsDeSoleil"
                  type="select"
                  value={formData.coupsDeSoleil}
                  onChange={handleChange}
                  options={coupsDeSoleilOptions}
                />
                <FormField
                  label="Exposition solaire"
                  id="expositionSolaire"
                  type="select"
                  value={formData.expositionSolaire}
                  onChange={handleChange}
                  options={expositionSolaireOptions}
                />
                <FormField
                  label="Sensibilité cutanée"
                  id="sensibiliteCutanee"
                  type="select"
                  value={formData.sensibiliteCutanee}
                  onChange={handleChange}
                  options={sensibiliteCutaneeOptions}
                />
                <FormField
                  label="Couleur des yeux"
                  id="yeux"
                  type="select"
                  value={formData.yeux}
                  onChange={handleChange}
                  options={yeuxOptions}
                />
                <FormField
                  label="Lèvres"
                  id="levres"
                  type="select"
                  value={formData.levres}
                  onChange={handleChange}
                  options={levresOptions}
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Type de peau" color="amber">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Type de peau visage"
                  id="typePeauVisage"
                  type="select"
                  value={formData.typePeauVisage}
                  onChange={handleChange}
                  options={typePeauOptions}
                  required
                  error={errors.typePeauVisage}
                />
                <FormField
                  label="Type de peau corps"
                  id="typePeauCorps"
                  type="select"
                  value={formData.typePeauCorps}
                  onChange={handleChange}
                  options={typePeauOptions}
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Sécheresse par zone" color="teal">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['Levres', 'Cou', 'PoitrineDecollete', 'VentreTaille', 'FessesHanches', 'Bras', 'Mains', 'Jambes', 'Pieds'].map(zone => (
                  <FormField
                    key={zone}
                    label={`Sécheresse ${zone.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                    id={`secheresse${zone}`}
                    type="select"
                    value={formData[`secheresse${zone}`]}
                    onChange={handleChange}
                    options={intensiteOptions}
                  />
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Problèmes cutanés" color="red">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  label="Taches pigmentaires visage"
                  id="tachesPigmentairesVisage"
                  type="select"
                  value={formData.tachesPigmentairesVisage}
                  onChange={handleChange}
                  options={intensiteOptions}
                />
                <FormField
                  label="Taches pigmentaires cou"
                  id="tachesPigmentairesCou"
                  type="select"
                  value={formData.tachesPigmentairesCou}
                  onChange={handleChange}
                  options={intensiteOptions}
                />
                <FormField
                  label="Taches pigmentaires décolleté"
                  id="tachesPigmentairesDecollete"
                  type="select"
                  value={formData.tachesPigmentairesDecollete}
                  onChange={handleChange}
                  options={intensiteOptions}
                />
                <FormField
                  label="Taches pigmentaires mains"
                  id="tachesPigmentairesMains"
                  type="select"
                  value={formData.tachesPigmentairesMains}
                  onChange={handleChange}
                  options={intensiteOptions}
                />
                <FormField
                  label="Perte de fermeté visage"
                  id="perteDeFermeteVisage"
                  type="select"
                  value={formData.perteDeFermeteVisage}
                  onChange={handleChange}
                  options={intensiteOptions}
                />
                <FormField
                  label="Perte de fermeté cou"
                  id="perteDeFermeteCou"
                  type="select"
                  value={formData.perteDeFermeteCou}
                  onChange={handleChange}
                  options={intensiteOptions}
                />
                <FormField
                  label="Perte de fermeté décolleté"
                  id="perteDeFermeteDecollete"
                  type="select"
                  value={formData.perteDeFermeteDecollete}
                  onChange={handleChange}
                  options={intensiteOptions}
                />
                <FormField
                  label="Pilosité"
                  id="pilosite"
                  type="select"
                  value={formData.pilosite}
                  onChange={handleChange}
                  options={intensiteOptions}
                />
                <FormField
                  label="Cicatrices"
                  id="cicatrices"
                  type="select"
                  value={formData.cicatrices}
                  onChange={handleChange}
                  options={intensiteOptions}
                />
                <FormField
                  label="Tatouages"
                  id="tatouages"
                  type="select"
                  value={formData.tatouages}
                  onChange={handleChange}
                  options={ouiNonOptions}
                />
                <FormField
                  label="Piercings"
                  id="piercings"
                  type="select"
                  value={formData.piercings}
                  onChange={handleChange}
                  options={ouiNonOptions}
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Cheveux" color="pink">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  label="Couleur des cheveux"
                  id="couleurCheveux"
                  type="select"
                  value={formData.couleurCheveux}
                  onChange={handleChange}
                  options={couleurCheveuxOptions}
                />
                <FormField
                  label="Nature des cheveux"
                  id="natureCheveux"
                  type="select"
                  value={formData.natureCheveux}
                  onChange={handleChange}
                  options={natureCheveuxOptions}
                />
                <FormField
                  label="Longueur des cheveux"
                  id="longueurCheveux"
                  type="select"
                  value={formData.longueurCheveux}
                  onChange={handleChange}
                  options={longueurCheveuxOptions}
                />
                <FormField
                  label="Épaisseur des cheveux"
                  id="epaisseurCheveux"
                  type="select"
                  value={formData.epaisseurCheveux}
                  onChange={handleChange}
                  options={epaisseurCheveuxOptions}
                />
                <FormField
                  label="Nature du cuir chevelu"
                  id="natureCuirChevelu"
                  type="select"
                  value={formData.natureCuirChevelu}
                  onChange={handleChange}
                  options={natureCuirCheveluOptions}
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Mappings" color="indigo">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Map yeux"
                  id="mapyeux"
                  type="textarea"
                  value={formData.mapyeux}
                  onChange={handleChange}
                  placeholder="Description de la mapping des yeux..."
                />
                <FormField
                  label="Map lèvres"
                  id="maplevres"
                  type="textarea"
                  value={formData.maplevres}
                  onChange={handleChange}
                  placeholder="Description de la mapping des lèvres..."
                />
                <FormField
                  label="Map sourcils"
                  id="mapsourcils"
                  type="textarea"
                  value={formData.mapsourcils}
                  onChange={handleChange}
                  placeholder="Description de la mapping des sourcils..."
                />
                <FormField
                  label="Commentaires"
                  id="commentaires"
                  type="textarea"
                  value={formData.commentaires}
                  onChange={handleChange}
                  placeholder="Ajoutez des commentaires ou des notes spécifiques..."
                />
              </div>
            </CollapsibleSection>

            <div className="flex justify-end gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                asChild
              >
                <Link to={isEditMode ? `/panels/${idPanel}` : '/panels'}>
                  Annuler
                </Link>
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditMode ? 'Mettre à jour' : 'Enregistrer'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PanelForm;
