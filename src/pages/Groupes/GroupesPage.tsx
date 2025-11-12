import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import groupeService from '../../services/groupeService'
import etudeService from '../../services/etudeService'
import { usePagination } from '../../hooks/usePagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Plus, X } from 'lucide-react'
import { Etude, Groupe } from '../../types/types'

// Types locaux
interface EtudesCache {
  [key: number]: Etude;
}

const GroupesPage = () => {
  const navigate = useNavigate()
  const [groupes, setGroupes] = useState<Groupe[]>([])
  const [etudes, setEtudes] = useState<EtudesCache>({}) // Cache pour stocker les informations des études
  const [allEtudes, setAllEtudes] = useState<Etude[]>([]) // Toutes les études pour la recherche par référence
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [etudeFilter, setEtudeFilter] = useState('')
  const [etudeRefFilter, setEtudeRefFilter] = useState('') // Filtre par référence d'étude
  const [ageMinFilter, setAgeMinFilter] = useState('')
  const [ageMaxFilter, setAgeMaxFilter] = useState('')
  const [ethnieFilter, setEthnieFilter] = useState('')
  const { page, size, updateTotal, goToPage, nextPage, prevPage, pageCount } = usePagination(0, 15) // 15 groupes par page
  
  // Chargement initial de toutes les études pour le filtre par référence
  useEffect(() => {
    const loadAllEtudes = async () => {
      try {
        const etudesData = await etudeService.getAll();
        setAllEtudes(etudesData);
        
        // Pré-remplir le cache d'études
        const etudesCache: EtudesCache = {};
        etudesData.forEach((etude: Etude) => {
          if (etude.idEtude !== undefined) {
            etudesCache[etude.idEtude] = etude;
          }
        });
        setEtudes(etudesCache);
      } catch (error) {
        console.error('Erreur lors du chargement des études:', error);
      }
    };
    
    loadAllEtudes();
  }, []);
  
  // Fonction pour charger les détails d'une étude
  const fetchEtudeInfo = async (idEtude: number): Promise<Etude | null> => {
    // Si nous avons déjà les informations de cette étude, pas besoin de les recharger
    if (etudes[idEtude]) return etudes[idEtude];
    
    try {
      const etudeData = await etudeService.getById(idEtude);
      
      // Mettre à jour le cache d'études
      setEtudes(prev => ({
        ...prev,
        [idEtude]: etudeData
      }));
      
      return etudeData;
    } catch (error) {
      console.error(`Erreur lors du chargement de l'étude ${idEtude}:`, error);
      return null;
    }
  };
  
  // Fonction pour obtenir la référence d'une étude
  const getEtudeReference = (idEtude: number | undefined): string => {
    if (!idEtude) return 'Non spécifiée';
    
    const etude = etudes[idEtude];
    if (!etude) return `Étude #${idEtude}`;
    
    return etude.ref || etude.titre || `Étude #${idEtude}`;
  };
  
  // Fonction pour rechercher l'ID d'une étude à partir de sa référence
  const findEtudeIdByRef = (reference: string): number | null => {
    if (!reference.trim()) return null;
    
    const foundEtude = allEtudes.find(etude => 
      (etude.ref && etude.ref.toLowerCase().includes(reference.toLowerCase())) ||
      (etude.titre && etude.titre.toLowerCase().includes(reference.toLowerCase()))
    );
    
    return foundEtude?.idEtude ?? null;
  };
  
  // Gestionnaire pour la recherche par référence d'étude
  const handleEtudeRefSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    
    const etudeId = findEtudeIdByRef(etudeRefFilter);
    if (etudeId) {
      handleFilterByEtude(etudeId);
    } else if (etudeRefFilter.trim()) {
      // Notification à l'utilisateur si aucune étude n'est trouvée
      alert(`Aucune étude trouvée avec la référence "${etudeRefFilter}"`);
    }
  };
  
  useEffect(() => {
    const fetchGroupes = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        let response;
        
        // Applique les différents filtres selon les paramètres définis
        if (etudeFilter) {
          // Filtre par étude
          response = await groupeService.getGroupesByIdEtude(etudeFilter);
        } else if (ageMinFilter || ageMaxFilter) {
          // Filtre par tranche d'âge
          response = await groupeService.getGroupesByAgeRange(
            ageMinFilter ? parseInt(ageMinFilter, 10) : null, 
            ageMaxFilter ? parseInt(ageMaxFilter, 10) : null
          );
        } else if (ethnieFilter) {
          // Filtre par ethnie
          response = await groupeService.getGroupesByEthnie(ethnieFilter);
        } else {
          // Sans filtre - pagination standard (du plus récent au plus ancien)
          response = await groupeService.getPaginated(page, size, 'idGroupe', 'desc');
        }
        
        // Debug: voir la structure des données reçues
        console.log('Response from backend:', response);
        if (response.content && response.content.length > 0) {
          console.log('Premier groupe:', response.content[0]);
        }
        
        // Préparer les données pour l'affichage
        let groupesToDisplay;
        let totalElements;
        
        if (!response.content && Array.isArray(response)) {
          // Création manuelle d'une structure paginée pour l'affichage côté client
          groupesToDisplay = response.slice(page * size, (page + 1) * size);
          totalElements = response.length;
        } else {
          // Si la réponse est déjà au format paginé
          groupesToDisplay = response.content || response;
          totalElements = response.totalElements || response.length;
        }
        
        // Extraire tous les IDs d'études uniques
        const uniqueEtudeIds = [...new Set(groupesToDisplay
          .map((g: Groupe) => g.idEtude)
          .filter((id: number | undefined) => id !== undefined && id !== null))] as number[];
        
        // Charger les informations de toutes les études nécessaires en parallèle
        if (uniqueEtudeIds.length > 0) {
          await Promise.all(uniqueEtudeIds.map((id: number) => fetchEtudeInfo(id)));
        }
        
        setGroupes(groupesToDisplay);
        updateTotal(totalElements);
      } catch (error) {
        console.error('Erreur lors du chargement des groupes:', error)
        setError('Impossible de charger les groupes. Veuillez réessayer plus tard.')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchGroupes()
  }, [page, size, etudeFilter, ageMinFilter, ageMaxFilter, ethnieFilter, updateTotal])
  
  const handleFilterByAge = (e: React.FormEvent): void => {
    e.preventDefault()
    // Réinitialiser la page et les autres filtres non liés à l'âge
    goToPage(0)
    setEtudeFilter('')
    setEtudeRefFilter('')
    setEthnieFilter('')
  }
  
  const handleFilterByEtude = (idEtude: number | string): void => {
    // Réinitialiser la page et les autres filtres
    goToPage(0)
    setEtudeFilter(String(idEtude))
    
    // Mettre à jour le filtre de référence d'étude si on a l'étude
    const numericId = typeof idEtude === 'string' ? parseInt(idEtude, 10) : idEtude;
    const etude = etudes[numericId];
    setEtudeRefFilter(etude?.ref || '');
    
    setAgeMinFilter('')
    setAgeMaxFilter('')
    setEthnieFilter('')
  }
  
  const handleFilterByEthnie = (ethnie: string): void => {
    // Réinitialiser la page et les autres filtres
    goToPage(0)
    setEthnieFilter(ethnie)
    setEtudeFilter('')
    setEtudeRefFilter('')
    setAgeMinFilter('')
    setAgeMaxFilter('')
  }
  
  const resetFilters = (): void => {
    setEtudeFilter('')
    setEtudeRefFilter('')
    setAgeMinFilter('')
    setAgeMaxFilter('')
    setEthnieFilter('')
    goToPage(0)
  }

  // Gestionnaire pour le clic sur une ligne de groupe
  const handleRowClick = (groupeId: number | undefined): void => {
    if (groupeId !== undefined) {
      navigate(`/groupes/${groupeId}`)
    }
  }

  const handleDelete = async (id: number): Promise<void> => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
      try {
        await groupeService.delete(id)
        // Rafraîchir la liste après suppression
        setGroupes(groupes.filter(groupe => (groupe.idGroupe || groupe.id) !== id))
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        alert('Une erreur est survenue lors de la suppression du groupe')
      }
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Groupes</h1>
        <Button asChild>
          <Link to="/groupes/nouveau">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau groupe
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-3">
            {/* Recherche par référence d'étude */}
            <form onSubmit={handleEtudeRefSearch} className="flex-1">
              <div className="relative flex gap-2">
                <Input
                  type="text"
                  placeholder="Référence d'étude..."
                  value={etudeRefFilter}
                  onChange={(e) => setEtudeRefFilter(e.target.value)}
                  list="etudes-refs"
                  className="flex-1"
                />
                <datalist id="etudes-refs">
                  {allEtudes.map(etude => (
                    <option key={etude.idEtude} value={etude.ref || etude.titre} />
                  ))}
                </datalist>
                <Button type="submit" variant="outline">
                  Filtrer par étude
                </Button>
              </div>
            </form>
            
            {/* Filtre par âge */}
            <form onSubmit={handleFilterByAge} className="flex flex-1 gap-2">
              <Input
                type="number"
                placeholder="Âge min"
                min="0"
                value={ageMinFilter}
                onChange={(e) => setAgeMinFilter(e.target.value)}
                className="w-1/3"
              />
              <Input
                type="number"
                placeholder="Âge max"
                min="0"
                value={ageMaxFilter}
                onChange={(e) => setAgeMaxFilter(e.target.value)}
                className="w-1/3"
              />
              <Button type="submit" variant="outline">
                Filtrer par âge
              </Button>
            </form>
            
            {/* Bouton pour réinitialiser les filtres */}
            <Button
              onClick={resetFilters}
              variant="secondary"
              disabled={!etudeFilter && !etudeRefFilter && !ageMinFilter && !ageMaxFilter && !ethnieFilter}
            >
              Réinitialiser
            </Button>
          </div>
          
          {/* Affichage des filtres actifs */}
          {(etudeFilter || etudeRefFilter || ageMinFilter || ageMaxFilter || ethnieFilter) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {etudeFilter && (
                <Badge variant="secondary" className="gap-1">
                  Étude: {getEtudeReference(parseInt(etudeFilter, 10))}
                  <button 
                    onClick={() => {setEtudeFilter(''); setEtudeRefFilter('');}} 
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {(ageMinFilter || ageMaxFilter) && (
                <Badge variant="secondary" className="gap-1">
                  Âge: {ageMinFilter || '0'} - {ageMaxFilter || '∞'}
                  <button 
                    onClick={() => {
                      setAgeMinFilter('');
                      setAgeMaxFilter('');
                    }} 
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {ethnieFilter && (
                <Badge variant="secondary" className="gap-1">
                  Ethnie: {ethnieFilter}
                  <button 
                    onClick={() => setEthnieFilter('')} 
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Étude</TableHead>
                    <TableHead>Âge min</TableHead>
                    <TableHead>Âge max</TableHead>
                    <TableHead>Ethnie</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupes.length > 0 ? (
                    groupes.map(groupe => (
                      <TableRow 
                        key={groupe.idGroupe || groupe.id}
                        onClick={() => handleRowClick(groupe.idGroupe || groupe.id)}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">{groupe.intitule || groupe.nom}</TableCell>
                        <TableCell>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              groupe.idEtude && handleFilterByEtude(groupe.idEtude)
                            }}
                            className="text-primary hover:underline"
                            disabled={!groupe.idEtude}
                          >
                            {getEtudeReference(groupe.idEtude)}
                          </button>
                        </TableCell>
                        <TableCell>{groupe.ageMinimum || groupe.ageMin}</TableCell>
                        <TableCell>{groupe.ageMaximum || groupe.ageMax}</TableCell>
                        <TableCell>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              groupe.ethnie && handleFilterByEthnie(groupe.ethnie)
                            }}
                            className="text-primary hover:underline"
                            disabled={!groupe.ethnie}
                          >
                            {groupe.ethnie}
                          </button>
                        </TableCell>
                        <TableCell>
                          {groupe.nbSujet || groupe.nombreParticipants || 0}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-3">
                            <Link
                              to={`/groupes/${groupe.idGroupe || groupe.id}`}
                              className="text-primary hover:text-primary/80"
                            >
                              Détails
                            </Link>
                            <Link
                              to={`/groupes/${groupe.idGroupe || groupe.id}/edit`}
                              className="text-primary hover:text-primary/80"
                            >
                              Modifier
                            </Link>
                            <button
                              onClick={() => {
                                const id = groupe.idGroupe || groupe.id;
                                if (id !== undefined) handleDelete(id);
                              }}
                              className="text-destructive hover:text-destructive/80"
                              disabled={!groupe.idGroupe && !groupe.id}
                            >
                              Supprimer
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground h-32">
                        Aucun groupe trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
          
          {groupes.length > 0 && (
            <Card>
              <CardContent className="flex flex-col sm:flex-row justify-between items-center py-4">
                <p className="text-sm text-muted-foreground mb-4 sm:mb-0">
                  Affichage de {page * size + 1} à {Math.min((page + 1) * size, page * size + groupes.length)} groupes
                </p>
                <div className="flex space-x-2">
                  <Button
                    onClick={prevPage}
                    disabled={page === 0}
                    variant="outline"
                    size="sm"
                  >
                    Précédent
                  </Button>
                  
                  <div className="hidden sm:flex space-x-1">
                    {[...Array(Math.min(5, pageCount)).keys()]
                      .map(i => page < 2 ? i : page > pageCount - 3 ? pageCount - 5 + i : page - 2 + i)
                      .filter(i => i >= 0 && i < pageCount)
                      .map(i => (
                        <Button
                          key={i}
                          onClick={() => goToPage(i)}
                          variant={page === i ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                        >
                          {i + 1}
                        </Button>
                      ))}
                  </div>
                  
                  <Button
                    onClick={nextPage}
                    disabled={page >= pageCount - 1}
                    variant="outline"
                    size="sm"
                  >
                    Suivant
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

export default GroupesPage