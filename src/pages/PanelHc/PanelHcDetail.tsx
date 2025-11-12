import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

// Types
interface Panel {
  idPanel: number;
  panelId?: number;
  nom: string;
  prenom: string;
  sexe: string;
  age: number;
  phototype: string;
  typePeauVisage: string;
  carnation?: string;
  [key: string]: any;
}

interface PanelHc {
  idPanel: number;
  panelId?: number;
  achatPharmacieParapharmacie?: string;
  achatGrandesSurfaces?: string;
  achatInstitutParfumerie?: string;
  achatInternet?: string;
  produitsBio?: string;
  rasoir?: string;
  epilateurElectrique?: string;
  cire?: string;
  cremeDepilatoire?: string;
  institut?: string;
  epilationDefinitive?: string;
  soinHydratantVisage?: string;
  soinNourissantVisage?: string;
  soinMatifiantVisage?: string;
  soinAntiAgeVisage?: string;
  soinAntiRidesVisage?: string;
  soinAntiTachesVisage?: string;
  soinAntiRougeursVisage?: string;
  soinEclatDuTeint?: string;
  soinRaffermissantVisage?: string;
  soinContourDesYeux?: string;
  soinContourDesLevres?: string;
  demaquillantVisage?: string;
  demaquillantYeux?: string;
  demaquillantWaterproof?: string;
  gelNettoyant?: string;
  lotionMicellaire?: string;
  tonique?: string;
  soinHydratantCorps?: string;
  soinNourrissantCorps?: string;
  soinRaffermissantCorps?: string;
  soinAmincissant?: string;
  soinAntiCellulite?: string;
  soinAntiVergetures?: string;
  soinAntiAgeCorps?: string;
  gommageCorps?: string;
  masqueCorps?: string;
  soinHydratantMains?: string;
  soinNourrissantMains?: string;
  soinAntiAgeMains?: string;
  soinAntiTachesMains?: string;
  soinPieds?: string;
  soinOngles?: string;
  gelDouche?: string;
  laitDouche?: string;
  savon?: string;
  produitsBain?: string;
  nettoyantIntime?: string;
  deodorant?: string;
  antiTranspirant?: string;
  shampoing?: string;
  apresShampoing?: string;
  masqueCapillaire?: string;
  produitCoiffantFixant?: string;
  colorationMeches?: string;
  permanente?: string;
  lissageDefrisage?: string;
  extensionsCapillaires?: string;
  fondDeTeint?: string;
  poudreLibre?: string;
  blushFardAJoues?: string;
  correcteurTeint?: string;
  anticerne?: string;
  baseMaquillage?: string;
  cremeTeintee?: string;
  mascara?: string;
  mascaraWaterproof?: string;
  crayonsYeux?: string;
  eyeliner?: string;
  fardAPaupieres?: string;
  maquillageDesSourcils?: string;
  fauxCils?: string;
  rougeALevres?: string;
  gloss?: string;
  crayonLevres?: string;
  vernisAOngles?: string;
  dissolvantOngles?: string;
  fauxOngles?: string;
  manucures?: string;
  maquillagePermanentYeux?: string;
  maquillagePermanentLevres?: string;
  maquillagePermanentSourcils?: string;
  protecteurSolaireVisage?: string;
  protecteurSolaireCorps?: string;
  protecteurSolaireLevres?: string;
  soinApresSoleil?: string;
  autobronzant?: string;
  parfum?: string;
  eauDeToilette?: string;
  commentaires?: string;
  [key: string]: any;
}

interface IconProps {
  className?: string;
  width?: number;
  height?: number;
  [key: string]: any;
}

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: any;
  className?: string;
}

interface CheckboxValueProps {
  value: string;
}

interface CategoryItem {
  label: string;
  value?: string;
  isCheckbox?: boolean;
}

interface CategorySectionProps {
  title: string;
  icon?: React.ReactNode;
  items: CategoryItem[];
}

// Import des icônes
import editSvg from '../../assets/icons/edit.svg';
import trashSvg from '../../assets/icons/trash.svg';
import arrowLeftSvg from '../../assets/icons/arrow-left.svg';
import shoppingBagSvg from '../../assets/icons/shopping-bag.svg';
import brushSvg from '../../assets/icons/brush.svg';
import dropletSvg from '../../assets/icons/droplet.svg';
import scissorsSvg from '../../assets/icons/scissors.svg';

// Composants d'icônes
const IconEdit: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={editSvg} width={width} height={height} className={className} alt="Edit" {...props} />
);

const IconTrash: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={trashSvg} width={width} height={height} className={className} alt="Trash" {...props} />
);

const IconArrowLeft: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={arrowLeftSvg} width={width} height={height} className={className} alt="Arrow Left" {...props} />
);

const IconShoppingBag: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={shoppingBagSvg} width={width} height={height} className={className} alt="Shopping Bag" {...props} />
);

const IconBrush: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={brushSvg} width={width} height={height} className={className} alt="Brush" {...props} />
);

const IconDroplet: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={dropletSvg} width={width} height={height} className={className} alt="Droplet" {...props} />
);

const IconScissors: React.FC<IconProps> = ({ className = "", width = 24, height = 24, ...props }) => (
  <img src={scissorsSvg} width={width} height={height} className={className} alt="Scissors" {...props} />
);

// Composant DetailItem qui affiche une paire clé-valeur avec une icône
const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value, className = "" }) => {
  return (
    <div className={`flex items-start mb-4 ${className}`}>
      <div className="w-10 h-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-500">{label}</h4>
        <div className="text-gray-800 mt-1">{value || "-"}</div>
      </div>
    </div>
  );
};

// Composant pour afficher les valeurs checkbox (Oui/Non)
const CheckboxValue: React.FC<CheckboxValueProps> = ({ value }) => {
  const isChecked = value === 'Oui';
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${isChecked ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
      {isChecked ? 'Oui' : 'Non'}
    </span>
  );
};

// Composant pour afficher une section de catégorie pour les habitudes cosmétiques
const CategorySection: React.FC<CategorySectionProps> = ({ title, icon, items }) => {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item: CategoryItem, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-700">{item.label}</span>
              {item.isCheckbox ? (
                <CheckboxValue value={item.value || ''} />
              ) : (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                  {item.value || "-"}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

// Composant principal d'affichage des détails d'un panel HC
const PanelHcDetail = () => {
  const { idPanel } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [panelHc, setPanelHc] = useState<PanelHc | null>(null);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPanelHcDetails = async () => {
      try {
        setLoading(true);
        // D'abord, récupérer les données du panelHc
        const responseHc = await api.get(`/panels-hc/${idPanel}`);
        setPanelHc(responseHc.data);
        
        // Ensuite, récupérer les données du panel standard associé
        if (responseHc.data.panelId) {
          const responsePanel = await api.get(`/panels/${responseHc.data.panelId}`);
          setPanel(responsePanel.data);
        }
        
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des détails du panel HC:', err);
        setError('Impossible de charger les détails du panel HC. Veuillez réessayer plus tard.');
        setPanelHc(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPanelHcDetails();
  }, [idPanel]);
  
  const handleDeletePanelHc = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ces habitudes cosmétiques ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      await api.delete(`/panels-hc/${idPanel}`);
      // Rediriger vers la liste des panels HC après suppression
      navigate('/panels-hc');
      // Afficher une notification de succès
      alert('Habitudes cosmétiques supprimées avec succès');
    } catch (err) {
      console.error('Erreur lors de la suppression du panel HC:', err);
      alert('Erreur lors de la suppression du panel HC');
    }
  };
  
  // Fonction pour renvoyer la classe CSS correspondant au phototype
  const getPhototypeColorClass = (phototype: string) => {
    switch (phototype) {
      case 'I': return 'bg-rose-50 text-rose-700';
      case 'II': return 'bg-orange-50 text-orange-700';
      case 'III': return 'bg-amber-50 text-amber-700';
      case 'IV': return 'bg-yellow-50 text-yellow-700';
      case 'V': return 'bg-lime-50 text-lime-700';
      case 'VI': return 'bg-emerald-50 text-emerald-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };
  
  // Génération des initiales pour l'avatar
  const getInitials = (nom: string, prenom: string) => {
    if (!nom || !prenom) return '';
    return `${nom[0]}${prenom[0]}`.toUpperCase();
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error || !panelHc) {
    return (
      <div className="bg-red-100 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-red-800 mb-2">Erreur</h2>
        <p className="text-red-700">{error || "Habitudes cosmétiques non trouvées"}</p>
        <button
          onClick={() => navigate('/panels-hc')}
          className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <IconArrowLeft width={16} height={16} className="mr-1" />
          Retour à la liste
        </button>
      </div>
    );
  }
  
  // Organiser les données par catégories
  const habitudesAchat = [
    { label: "Pharmacie/Parapharmacie", value: panelHc.achatPharmacieParapharmacie, isCheckbox: true },
    { label: "Grandes surfaces", value: panelHc.achatGrandesSurfaces, isCheckbox: true },
    { label: "Institut/Parfumerie", value: panelHc.achatInstitutParfumerie, isCheckbox: true },
    { label: "Internet", value: panelHc.achatInternet, isCheckbox: true },
    { label: "Produits bio", value: panelHc.produitsBio, isCheckbox: false }
  ];
  
  const methodesEpilation = [
    { label: "Rasoir", value: panelHc.rasoir },
    { label: "Épilateur électrique", value: panelHc.epilateurElectrique },
    { label: "Cire", value: panelHc.cire },
    { label: "Crème dépilatoire", value: panelHc.cremeDepilatoire },
    { label: "Institut", value: panelHc.institut },
    { label: "Épilation définitive", value: panelHc.epilationDefinitive }
  ];
  
  const soinsVisage = [
    { label: "Soin hydratant", value: panelHc.soinHydratantVisage },
    { label: "Soin nourrissant", value: panelHc.soinNourissantVisage },
    { label: "Soin matifiant", value: panelHc.soinMatifiantVisage },
    { label: "Soin anti-âge", value: panelHc.soinAntiAgeVisage },
    { label: "Soin anti-rides", value: panelHc.soinAntiRidesVisage },
    { label: "Soin anti-taches", value: panelHc.soinAntiTachesVisage },
    { label: "Soin anti-rougeurs", value: panelHc.soinAntiRougeursVisage },
    { label: "Soin éclat du teint", value: panelHc.soinEclatDuTeint },
    { label: "Soin raffermissant", value: panelHc.soinRaffermissantVisage },
    { label: "Contour des yeux", value: panelHc.soinContourDesYeux },
    { label: "Contour des lèvres", value: panelHc.soinContourDesLevres }
  ];
  
  const demaquillage = [
    { label: "Démaquillant visage", value: panelHc.demaquillantVisage },
    { label: "Démaquillant yeux", value: panelHc.demaquillantYeux },
    { label: "Démaquillant waterproof", value: panelHc.demaquillantWaterproof },
    { label: "Gel nettoyant", value: panelHc.gelNettoyant },
    { label: "Lotion micellaire", value: panelHc.lotionMicellaire },
    { label: "Tonique", value: panelHc.tonique }
  ];
  
  const soinsCorps = [
    { label: "Soin hydratant", value: panelHc.soinHydratantCorps },
    { label: "Soin nourrissant", value: panelHc.soinNourrissantCorps },
    { label: "Soin raffermissant", value: panelHc.soinRaffermissantCorps },
    { label: "Soin amincissant", value: panelHc.soinAmincissant },
    { label: "Anti-cellulite", value: panelHc.soinAntiCellulite },
    { label: "Anti-vergetures", value: panelHc.soinAntiVergetures },
    { label: "Soin anti-âge corps", value: panelHc.soinAntiAgeCorps },
    { label: "Gommage", value: panelHc.gommageCorps },
    { label: "Masque", value: panelHc.masqueCorps }
  ];
  
  const soinsSpecifiques = [
    { label: "Soin des mains hydratant", value: panelHc.soinHydratantMains },
    { label: "Soin des mains nourrissant", value: panelHc.soinNourrissantMains },
    { label: "Soin des mains anti-âge", value: panelHc.soinAntiAgeMains },
    { label: "Soin des mains anti-taches", value: panelHc.soinAntiTachesMains },
    { label: "Soin des pieds", value: panelHc.soinPieds },
    { label: "Soin des ongles", value: panelHc.soinOngles }
  ];
  
  const produitsHygiene = [
    { label: "Gel douche", value: panelHc.gelDouche },
    { label: "Lait douche", value: panelHc.laitDouche },
    { label: "Savon", value: panelHc.savon },
    { label: "Produits pour le bain", value: panelHc.produitsBain },
    { label: "Nettoyant intime", value: panelHc.nettoyantIntime },
    { label: "Déodorant", value: panelHc.deodorant },
    { label: "Anti-transpirant", value: panelHc.antiTranspirant }
  ];
  
  const soinsCapillaires = [
    { label: "Shampooing", value: panelHc.shampoing },
    { label: "Après-shampooing", value: panelHc.apresShampoing },
    { label: "Masque capillaire", value: panelHc.masqueCapillaire },
    { label: "Produit coiffant/fixant", value: panelHc.produitCoiffantFixant },
    { label: "Coloration/Mèches", value: panelHc.colorationMeches },
    { label: "Permanente", value: panelHc.permanente },
    { label: "Lissage/Défrisage", value: panelHc.lissageDefrisage },
    { label: "Extensions capillaires", value: panelHc.extensionsCapillaires }
  ];
  
  const maquillageVisage = [
    { label: "Fond de teint", value: panelHc.fondDeTeint },
    { label: "Poudre libre", value: panelHc.poudreLibre },
    { label: "Blush/Fard à joues", value: panelHc.blushFardAJoues },
    { label: "Correcteur de teint", value: panelHc.correcteurTeint },
    { label: "Anti-cerne", value: panelHc.anticerne },
    { label: "Base de maquillage", value: panelHc.baseMaquillage },
    { label: "Crème teintée", value: panelHc.cremeTeintee }
  ];
  
  const maquillageYeux = [
    { label: "Mascara", value: panelHc.mascara },
    { label: "Mascara waterproof", value: panelHc.mascaraWaterproof },
    { label: "Crayons à yeux", value: panelHc.crayonsYeux },
    { label: "Eyeliner", value: panelHc.eyeliner },
    { label: "Fard à paupières", value: panelHc.fardAPaupieres },
    { label: "Maquillage des sourcils", value: panelHc.maquillageDesSourcils },
    { label: "Faux cils", value: panelHc.fauxCils }
  ];
  
  const maquillageLevresOngles = [
    { label: "Rouge à lèvres", value: panelHc.rougeALevres },
    { label: "Gloss", value: panelHc.gloss },
    { label: "Crayon à lèvres", value: panelHc.crayonLevres },
    { label: "Vernis à ongles", value: panelHc.vernisAOngles },
    { label: "Dissolvant", value: panelHc.dissolvantOngles },
    { label: "Faux ongles", value: panelHc.fauxOngles },
    { label: "Manucures", value: panelHc.manucures }
  ];
  
  const maquillagePermanent = [
    { label: "Maquillage permanent des yeux", value: panelHc.maquillagePermanentYeux },
    { label: "Maquillage permanent des lèvres", value: panelHc.maquillagePermanentLevres },
    { label: "Maquillage permanent des sourcils", value: panelHc.maquillagePermanentSourcils }
  ];
  
  const produitsSolaires = [
    { label: "Protecteur solaire visage", value: panelHc.protecteurSolaireVisage },
    { label: "Protecteur solaire corps", value: panelHc.protecteurSolaireCorps },
    { label: "Protecteur solaire lèvres", value: panelHc.protecteurSolaireLevres },
    { label: "Soin après-soleil", value: panelHc.soinApresSoleil },
    { label: "Autobronzant", value: panelHc.autobronzant }
  ];
  
  const parfums = [
    { label: "Parfum", value: panelHc.parfum },
    { label: "Eau de toilette", value: panelHc.eauDeToilette }
  ];
  
  return (
    <div className="space-y-6">
      {/* Switch pour basculer entre Panels et Panels HC */}
      <div className="mb-6">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <Link
            to="/panels"
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              location.pathname.includes('/panels') && !location.pathname.includes('/panels-hc')
                ? 'bg-white shadow-sm text-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Panels
          </Link>
          <Link
            to="/panels-hc"
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              location.pathname.includes('/panels-hc')
                ? 'bg-white shadow-sm text-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Habitudes Cosmétiques
          </Link>
        </div>
      </div>
      
      {/* En-tête avec informations principales et actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/panels-hc')}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <IconArrowLeft width={16} height={16} className="mr-1" />
          Retour à la liste
        </button>
        
        <div className="flex space-x-3">
          <Link
            to={`/panels-hc/${idPanel}/edit`}
            className="flex items-center px-4 py-2 border border-gray-300 bg-white rounded-md hover:bg-gray-50 text-gray-700"
          >
            <IconEdit width={16} height={16} className="mr-2" />
            Modifier
          </Link>
          <button
            onClick={handleDeletePanelHc}
            className="flex items-center px-4 py-2 border border-red-300 bg-white rounded-md hover:bg-red-50 text-red-700"
          >
            <IconTrash width={16} height={16} className="mr-2" />
            Supprimer
          </button>
        </div>
      </div>
      
      {/* Section profil du panel associé */}
      {panel && (
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-bold mr-4">
                {getInitials(panel.nom, panel.prenom)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {panel.nom} {panel.prenom}
                </h1>
                <p className="mt-1 text-gray-600">
                  ID: {panel.idPanel} • {panel.sexe}, {panel.age} ans
                </p>
                <div className="mt-2 flex space-x-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPhototypeColorClass(panel.phototype)}`}>
                    Phototype {panel.phototype}
                  </span>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    {panel.typePeauVisage}
                  </span>
                  {panel.carnation && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {panel.carnation}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Sections d'habitudes cosmétiques */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
          Habitudes Cosmétiques
        </h2>
        
        <CategorySection 
          title="Habitudes d'achat" 
          icon={<IconShoppingBag className="text-blue-600" width={20} height={20} />}
          items={habitudesAchat}
        />
        
        <CategorySection 
          title="Méthodes d'épilation" 
          icon={<IconScissors className="text-purple-600" width={20} height={20} />}
          items={methodesEpilation}
        />
        
        <CategorySection 
          title="Soins du visage" 
          icon={<IconDroplet className="text-blue-600" width={20} height={20} />}
          items={soinsVisage}
        />
        
        <CategorySection 
          title="Démaquillage et nettoyage" 
          icon={<IconDroplet className="text-blue-600" width={20} height={20} />}
          items={demaquillage}
        />
        
        <CategorySection 
          title="Soins du corps" 
          icon={<IconDroplet className="text-green-600" width={20} height={20} />}
          items={soinsCorps}
        />
        
        <CategorySection 
          title="Soins spécifiques (mains, pieds, ongles)" 
          icon={<IconDroplet className="text-teal-600" width={20} height={20} />}
          items={soinsSpecifiques}
        />
        
        <CategorySection 
          title="Produits d'hygiène" 
          icon={<IconDroplet className="text-indigo-600" width={20} height={20} />}
          items={produitsHygiene}
        />
        
        <CategorySection 
          title="Soins capillaires" 
          icon={<IconDroplet className="text-amber-600" width={20} height={20} />}
          items={soinsCapillaires}
        />
        
        <CategorySection 
          title="Maquillage du visage" 
          icon={<IconBrush className="text-rose-600" width={20} height={20} />}
          items={maquillageVisage}
        />
        
        <CategorySection 
          title="Maquillage des yeux" 
          icon={<IconBrush className="text-violet-600" width={20} height={20} />}
          items={maquillageYeux}
        />
        
        <CategorySection 
          title="Maquillage des lèvres et ongles" 
          icon={<IconBrush className="text-pink-600" width={20} height={20} />}
          items={maquillageLevresOngles}
        />
        
        <CategorySection 
          title="Maquillage permanent" 
          icon={<IconBrush className="text-red-600" width={20} height={20} />}
          items={maquillagePermanent}
        />
        
        <CategorySection 
          title="Produits solaires" 
          icon={<IconDroplet className="text-yellow-600" width={20} height={20} />}
          items={produitsSolaires}
        />
        
        <CategorySection 
          title="Parfums" 
          icon={<IconDroplet className="text-purple-600" width={20} height={20} />}
          items={parfums}
        />
        
        {/* Commentaires */}
        {panelHc.commentaires && (
          <div className="bg-white p-4 rounded-lg mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Commentaires</h3>
            <div className="p-4 bg-gray-50 rounded-md text-gray-700 whitespace-pre-line">
              {panelHc.commentaires}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PanelHcDetail;