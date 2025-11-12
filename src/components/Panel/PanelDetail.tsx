import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

// Import des icônes
import editSvg from '../../assets/icons/edit.svg';
import trashSvg from '../../assets/icons/trash.svg';
import arrowLeftSvg from '../../assets/icons/arrow-left.svg';
import calendarSvg from '../../assets/icons/calendar.svg';
import tagSvg from '../../assets/icons/tag.svg';

// Types
interface IconProps {
  className?: string;
  width?: number;
  height?: number;
  [key: string]: any;
}

interface Panel {
  idPanel: number;
  sexe: string;
  idEtude: number;
  idGroupe: number;
  phototype: string;
  typePeauVisage: string;
  typePeauCorps: string;
  carnation?: string;
  sensibiliteCutanee: string;
  bronzage: string;
  expositionSolaire: string;
  commentaires?: string;
}

interface PanelHc {
  achatPharmacieParapharmacie: string;
  achatGrandesSurfaces: string;
  achatInstitutParfumerie: string;
  achatInternet: string;
  produitsBio: string;
  rasoir: string;
  epilateurElectrique: string;
  cire: string;
  cremeDepilatoire: string;
  institut: string;
  epilationDefinitive: string;
  commentaires?: string;
}

interface Study {
  idPanel: number;
  ref: string;
  titre: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  prochainRdv?: string;
  idEtude: number;
  idGroupe: number;
}

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | undefined;
  className?: string;
}

const IconEdit = ({ className = "", width = 24, height = 24, ...props }: IconProps) => (
  <img src={editSvg} width={width} height={height} className={className} alt="Edit" {...props} />
);

const IconTrash = ({ className = "", width = 24, height = 24, ...props }: IconProps) => (
  <img src={trashSvg} width={width} height={height} className={className} alt="Trash" {...props} />
);

const IconArrowLeft = ({ className = "", width = 24, height = 24, ...props }: IconProps) => (
  <img src={arrowLeftSvg} width={width} height={height} className={className} alt="Arrow Left" {...props} />
);

const IconCalendar = ({ className = "", width = 24, height = 24, ...props }: IconProps) => (
  <img src={calendarSvg} width={width} height={height} className={className} alt="Calendar" {...props} />
);

const IconTag = ({ className = "", width = 24, height = 24, ...props }: IconProps) => (
  <img src={tagSvg} width={width} height={height} className={className} alt="Tag" {...props} />
);

// Composant DetailItem qui affiche une paire clé-valeur avec une icône
const DetailItem = ({ icon, label, value, className = "" }: DetailItemProps) => {
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

// Composant d'affichage des études associées au panel
const PanelStudies = ({ panelId }: { panelId: string | undefined }) => {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/etudes/${panelId}`);
        // Assurez-vous que response.data est un tableau
        if (Array.isArray(response.data)) {
          setStudies(response.data);
        } else if (response.data && typeof response.data === 'object') {
          // Si c'est un objet unique, le transformer en tableau
          setStudies([response.data]);
        } else {
          // Si ce n'est ni un tableau ni un objet, initialiser un tableau vide
          setStudies([]);
          setError('Format de données inattendu');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des études:', err);
        setError('Impossible de charger les études associées.');
        setStudies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudies();
  }, [panelId]);

  if (loading) {
    return <div className="p-4 text-center">Chargement des études...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">{error}</div>;
  }

  if (!studies || studies.length === 0) {
    return <div className="p-4 text-center text-gray-500">Aucune étude associée à ce panel.</div>;
  }

  return (
    <div className="space-y-4">
      {studies.map((study, index) => (
        <div key={study.idPanel || index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-gray-900">{study.ref || 'Référence non disponible'}: {study.titre || 'Titre non disponible'}</h4>
              <p className="text-sm text-gray-500">{study.dateDebut || 'Date non spécifiée'} - {study.dateFin || 'Date non spécifiée'}</p>
            </div>
            <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {study.statut || 'Statut inconnu'}
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <IconCalendar width={16} height={16} className="mr-1" />
            Prochaine session: {study.prochainRdv || "Aucune"}
          </div>
          <div className="mt-2">
            <Link 
              to={`/etudes/${study.idPanel || index}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Voir l'étude
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

// Composant principal d'affichage des détails d'un panel
const PanelDetail = () => {
  const { idPanel } = useParams<{ idPanel: string }>();
  const navigate = useNavigate();
  const [panel, setPanel] = useState<Panel | null>(null);
  const [panelHc, setPanelHc] = useState<PanelHc | null>(null); // Ajout de l'état pour les habitudes cosmétiques
  const [loading, setLoading] = useState(true);
  const [loadingHc, setLoadingHc] = useState(false); // État de chargement pour habitudes cosmétiques
  const [error, setError] = useState<string | null>(null);
  const [errorHc, setErrorHc] = useState<string | null>(null); // Erreur pour habitudes cosmétiques
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'cosmetics', 'studies', 'appointments'
  
  useEffect(() => {
    const fetchPanelDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/panels/${idPanel}`);
        setPanel(response.data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des détails du panel:', err);
        setError('Impossible de charger les détails du panel. Veuillez réessayer plus tard.');
        setPanel(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPanelDetails();
  }, [idPanel]);
  
  // Effet pour charger les habitudes cosmétiques quand on clique sur l'onglet
  useEffect(() => {
    if (activeTab === 'cosmetics' && !panelHc && !loadingHc) {
      const fetchPanelHcDetails = async () => {
        try {
          setLoadingHc(true);
          const response = await api.get(`/panels-hc/${idPanel}`);
          setPanelHc(response.data);
          setErrorHc(null);
        } catch (err) {
          console.error('Erreur lors du chargement des habitudes cosmétiques:', err);
          setErrorHc('Impossible de charger les habitudes cosmétiques. Veuillez réessayer plus tard.');
          setPanelHc(null);
        } finally {
          setLoadingHc(false);
        }
      };
      
      fetchPanelHcDetails();
    }
  }, [activeTab, idPanel, panelHc, loadingHc]);
  
  const handleDeletePanel = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce panel ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      await api.delete(`/panels/${idPanel}`);
      // Rediriger vers la liste des panels après suppression
      navigate('/panels');
      // Afficher une notification de succès (à implémenter)
      alert('Panel supprimé avec succès');
    } catch (err) {
      console.error('Erreur lors de la suppression du panel:', err);
      alert('Erreur lors de la suppression du panel');
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

  // Composant pour afficher les Habitudes Cosmétiques
  const PanelCosmeticsDetails = () => {
    if (loadingHc) {
      return <div className="p-4 text-center">Chargement des habitudes cosmétiques...</div>;
    }
    
    if (errorHc) {
      return (
        <div className="p-4 text-center text-red-600">
          {errorHc}
          <div className="mt-4">
            <button 
              onClick={() => setLoadingHc(false)} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }
    
    if (!panelHc) {
      return (
        <div className="p-4 text-center text-gray-500">
          Aucune information d'habitudes cosmétiques disponible pour ce panel.
          <div className="mt-4">
            <Link 
              to={`/panels-hc/nouveau?panelId=${idPanel}`} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Ajouter des habitudes cosmétiques
            </Link>
          </div>
        </div>
      );
    }
    
    // Organiser les données par catégories
    const categories = [
      {
        title: "Habitudes d'achat",
        items: [
          { label: "Pharmacie/Parapharmacie", value: panelHc.achatPharmacieParapharmacie === 'Oui' ? "Oui" : "Non" },
          { label: "Grandes surfaces", value: panelHc.achatGrandesSurfaces === 'Oui' ? "Oui" : "Non" },
          { label: "Institut/Parfumerie", value: panelHc.achatInstitutParfumerie === 'Oui' ? "Oui" : "Non" },
          { label: "Internet", value: panelHc.achatInternet === 'Oui' ? "Oui" : "Non" },
          { label: "Produits bio", value: panelHc.produitsBio }
        ]
      },
      {
        title: "Méthodes d'épilation",
        items: [
          { label: "Rasoir", value: panelHc.rasoir === 'Oui' ? "Oui" : "Non" },
          { label: "Épilateur électrique", value: panelHc.epilateurElectrique === 'Oui' ? "Oui" : "Non" },
          { label: "Cire", value: panelHc.cire === 'Oui' ? "Oui" : "Non" },
          { label: "Crème dépilatoire", value: panelHc.cremeDepilatoire === 'Oui' ? "Oui" : "Non" },
          { label: "Institut", value: panelHc.institut === 'Oui' ? "Oui" : "Non" },
          { label: "Épilation définitive", value: panelHc.epilationDefinitive === 'Oui' ? "Oui" : "Non" }
        ]
      },
      // Ajoutez d'autres catégories selon les données disponibles
    ];
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold border-b pb-2">Habitudes Cosmétiques</h3>
          <Link 
            to={`/panels-hc/${idPanel}/edit`} 
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <IconEdit width={16} height={16} className="mr-1" />
            Modifier
          </Link>
        </div>
        
        {categories.map((category, index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-medium text-gray-800 mb-3">{category.title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center">
                  <span className="font-medium text-gray-600 mr-2">{item.label}:</span>
                  <span className="text-gray-800">{item.value || "-"}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Afficher toutes les autres données importantes */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="font-medium text-gray-800 mb-3">Commentaires</h4>
          <div className="p-3 bg-gray-50 rounded-md text-gray-700">
            {panelHc.commentaires || "Aucun commentaire"}
          </div>
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error || !panel) {
    return (
      <div className="bg-red-100 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-red-800 mb-2">Erreur</h2>
        <p className="text-red-700">{error || "Panel non trouvé"}</p>
        <button
          onClick={() => navigate('/panels')}
          className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <IconArrowLeft width={16} height={16} className="mr-1" />
          Retour à la liste
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* En-tête avec informations principales et actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/panels')}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <IconArrowLeft width={16} height={16} className="mr-1" />
          Retour à la liste
        </button>
        
        <div className="flex space-x-3">
          <Link
            to={`/panels/${idPanel}/edit`}
            className="flex items-center px-4 py-2 border border-gray-300 bg-white rounded-md hover:bg-gray-50 text-gray-700"
          >
            <IconEdit width={16} height={16} className="mr-2" />
            Modifier
          </Link>
          <button
            onClick={handleDeletePanel}
            className="flex items-center px-4 py-2 border border-red-300 bg-white rounded-md hover:bg-red-50 text-red-700"
          >
            <IconTrash width={16} height={16} className="mr-2" />
            Supprimer
          </button>
        </div>
      </div>
      
      {/* Section profil avec informations non-personnelles */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-bold mr-4">
              {/* Initiales remplacées par un identifiant anonyme */}
              P{panel.idPanel}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Panel #{panel.idPanel}
              </h1>
              <p className="mt-1 text-gray-600">
                {panel.sexe} • Étude {panel.idEtude} • Groupe {panel.idGroupe}
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
        
        {/* Onglets */}
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'info'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Caractéristiques
            </button>
            <button
              onClick={() => setActiveTab('cosmetics')}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'cosmetics'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Habitudes Cosmétiques
            </button>
            <button
              onClick={() => setActiveTab('studies')}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'studies'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Études
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'appointments'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rendez-vous
            </button>
          </nav>
        </div>
        
        {/* Contenu des onglets */}
        <div className="p-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2">Caractéristiques générales</h3>
                <div className="grid grid-cols-1 gap-4">
                  <DetailItem
                    icon={<IconTag width={20} height={20} />}
                    label="Sexe"
                    value={panel.sexe}
                  />
                  <DetailItem
                    icon={<IconTag width={20} height={20} />}
                    label="Étude"
                    value={`Étude ${panel.idEtude}`}
                  />
                  <DetailItem
                    icon={<IconTag width={20} height={20} />}
                    label="Groupe"
                    value={`Groupe ${panel.idGroupe}`}
                  />
                  <DetailItem
                    icon={<IconTag width={20} height={20} />}
                    label="Phototype"
                    value={`Type ${panel.phototype}`}
                  />
                  <DetailItem
                    icon={<IconTag width={20} height={20} />}
                    label="Carnation"
                    value={panel.carnation}
                  />
                </div>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2">Caractéristiques cutanées</h3>
                <div className="grid grid-cols-1 gap-4">
                  <DetailItem
                    icon={<IconTag width={20} height={20} />}
                    label="Type de peau visage"
                    value={panel.typePeauVisage}
                  />
                  <DetailItem
                    icon={<IconTag width={20} height={20} />}
                    label="Type de peau corps"
                    value={panel.typePeauCorps}
                  />
                  <DetailItem
                    icon={<IconTag width={20} height={20} />}
                    label="Sensibilité cutanée"
                    value={panel.sensibiliteCutanee}
                  />
                  <DetailItem
                    icon={<IconTag width={20} height={20} />}
                    label="Bronzage"
                    value={panel.bronzage}
                  />
                  <DetailItem
                    icon={<IconTag width={20} height={20} />}
                    label="Exposition solaire"
                    value={panel.expositionSolaire}
                  />
                </div>
              </div>
              
              {panel.commentaires && (
                <div className="md:col-span-2 mt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Commentaires</h4>
                  <div className="p-3 bg-gray-50 rounded-md text-gray-700">
                    {panel.commentaires}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'cosmetics' && (
            <PanelCosmeticsDetails />
          )}
          
          {activeTab === 'studies' && (
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Études associées</h3>
              <PanelStudies panelId={idPanel} />
            </div>
          )}
          
          {activeTab === 'appointments' && (
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Historique des rendez-vous</h3>
              <div className="p-4 text-center text-gray-500">
                Fonctionnalité en cours de développement.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PanelDetail;