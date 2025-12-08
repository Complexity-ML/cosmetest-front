import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import etudeService from '../../services/etudeService'
import { usePagination } from '../../hooks/usePagination'
import { formatDate } from '../../utils/dateUtils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Plus, Search } from 'lucide-react'
import type { Etude } from '../../types/types'

const EtudesPage = () => {
  const { t } = useTranslation()
  const [etudes, setEtudes] = useState<Etude[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { page, size, updateTotal, goToPage, nextPage, prevPage, pageCount } = usePagination(0, 15) // 15 études par page
  const navigate = useNavigate()
  
  useEffect(() => {
    const fetchEtudes = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Utilisation du service pour récupérer les données paginées
        let response;
        if (searchQuery.trim()) {
          // Si une recherche est en cours, utiliser l'endpoint de recherche
          const searchResults = await etudeService.search(searchQuery);
          // Simuler une pagination côté client pour les résultats de recherche
          response = {
            content: searchResults.slice(page * size, (page + 1) * size),
            totalElements: searchResults.length
          };
        } else {
          // Sinon, utiliser la pagination standard
          response = await etudeService.getPaginated(page, size, 'dateDebut', 'DESC');
        }
        
        setEtudes(response.content)
        updateTotal(response.totalElements)
      } catch (error) {
        console.error('Erreur lors du chargement des études:', error)
        setError(t('studies.loadError'))
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchEtudes()
  }, [page, size, searchQuery, updateTotal])
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Réinitialiser la page à 0 lorsqu'une nouvelle recherche est effectuée
    goToPage(0)
  }
  
  const handleRowClick = (etudeId: number) => {
    navigate(`/etudes/${etudeId}`)
  }
  
  const getStatusBadge = (etude: Etude) => {
    const now = new Date()
    const startDate = new Date(etude.dateDebut || etude.debut)
    const endDate = new Date(etude.dateFin || etude.fin)
    
    let status = '';
    
    // Déterminer le statut en fonction des dates
    if (now < startDate) {
      status = 'A_VENIR';
    } else if (now > endDate) {
      status = 'TERMINEE';
    } else {
      status = 'EN_COURS';
    }
    
    switch (status) {
      case 'EN_COURS':
        return <Badge variant="default" className="bg-green-500">{t('studies.ongoing')}</Badge>
      case 'A_VENIR':
        return <Badge variant="secondary">{t('studies.upcoming')}</Badge>
      case 'TERMINEE':
        return <Badge variant="outline">{t('studies.completed')}</Badge>
      case 'ANNULEE':
        return <Badge variant="destructive">{t('studies.cancelled')}</Badge>
      default:
        return <Badge variant="outline">{t('studies.unknown')}</Badge>
    }
  }
  
  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation() // Empêcher la propagation du clic vers la ligne
    if (window.confirm(t('studies.deleteConfirm'))) {
      try {
        await etudeService.delete(id)
        // Rafraîchir la liste après suppression
        setEtudes(etudes.filter(etude => etude.idEtude !== id))
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        alert(t('studies.deleteError'))
      }
    }
  }
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Empêcher la propagation du clic vers la ligne
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">{t('studies.title')}</h1>
        <Button asChild>
          <Link to="/etudes/nouvelle">
            <Plus className="h-4 w-4 mr-2" />
            {t('studies.addStudy')}
          </Link>
        </Button>
      </div>
      
      <div className="flex justify-between items-center">
        <form onSubmit={handleSearch} className="w-full md:w-1/3">
          <div className="relative">
            <Input
              type="text"
              placeholder={t('studies.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <Search className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </form>
      </div>
      
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
                    <TableHead>{t('studies.reference')}</TableHead>
                    <TableHead>{t('studies.title')}</TableHead>
                    <TableHead>{t('studies.startDate')}</TableHead>
                    <TableHead>{t('studies.endDate')}</TableHead>
                    <TableHead>{t('studies.status')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {etudes.length > 0 ? (
                    etudes.map(etude => (
                      <TableRow 
                        key={etude.idEtude} 
                        className="cursor-pointer"
                        onClick={() => etude.idEtude && handleRowClick(etude.idEtude)}
                      >
                        <TableCell className="font-medium">{etude.ref}</TableCell>
                        <TableCell>{etude.titre}</TableCell>
                        <TableCell>{formatDate(etude.dateDebut || etude.debut)}</TableCell>
                        <TableCell>{formatDate(etude.dateFin || etude.fin)}</TableCell>
                        <TableCell>
                          {getStatusBadge(etude)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-3">
                            <Link
                              to={`/etudes/${etude.idEtude}/edit`}
                              className="text-primary hover:text-primary/80"
                              onClick={handleEditClick}
                            >
                              {t('common.edit')}
                            </Link>
                            <button
                              onClick={(e) => etude.idEtude && handleDelete(e, etude.idEtude)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              {t('common.delete')}
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground h-32">
                        {t('studies.noStudies')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
          
          {etudes.length > 0 && (
            <Card>
              <CardContent className="flex flex-col sm:flex-row justify-between items-center py-4">
                <p className="text-sm text-muted-foreground mb-4 sm:mb-0">
                  {t('pagination.showing')} {page * size + 1} {t('pagination.to')} {Math.min((page + 1) * size, page * size + etudes.length)} {t('sidebar.studies').toLowerCase()}
                </p>
                <div className="flex space-x-2">
                  <Button
                    onClick={prevPage}
                    disabled={page === 0}
                    variant="outline"
                    size="sm"
                  >
                    {t('pagination.previous')}
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
                    {t('pagination.next')}
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

export default EtudesPage