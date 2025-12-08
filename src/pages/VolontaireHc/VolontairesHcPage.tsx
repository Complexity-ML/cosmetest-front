import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import volontaireService from '../../services/volontaireService'
import { usePagination } from '../../hooks/usePagination'
import { Search, Plus } from 'lucide-react'
import VolontairesTable from '../../components/VolontaireHc/VolontairesHcTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const VolontairesHcPage = () => {
  const { t } = useTranslation()
  const [volontaires, setVolontaires] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [includeArchived, setIncludeArchived] = useState(false)
  const { page, size, updateTotal, goToPage, nextPage, prevPage, pageCount, total } = usePagination()

  useEffect(() => {
    const fetchVolontaires = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Envoyer `includeArchived` pour que le serveur gère le filtrage
        const response = await volontaireService.getAll({
          page,
          size,
          search: searchQuery.trim() || undefined,
          includeArchived
        });

        // Met à jour la liste directement depuis l'API
        setVolontaires(response.data?.content || []);
        updateTotal(response.data?.totalElements || 0);

      } catch (error) {
        console.error('Erreur lors du chargement des volontaires:', error);
        setError(t('volunteers.loadError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchVolontaires();
  }, [page, size, searchQuery, includeArchived]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Reset à la première page lors d'une nouvelle recherche
    goToPage(0)
  }

  const handleDeleteVolontaire = async (id: string | number) => {
    if (window.confirm(t('volunteers.archiveConfirm'))) {
      try {
        await volontaireService.archive(id);

        //  Rafraîchir la liste après suppression, en conservant les filtres et la pagination actuelle
        const response = await volontaireService.getAll({
          page,
          size,
          search: searchQuery,
          includeArchived
        });

        setVolontaires(response.data?.content || []);
        updateTotal(response.data?.totalElements || 0);

      } catch (error) {
        console.error("Erreur lors de l'archivage du volontaire:", error);
        alert(t('volunteers.archiveError'));
      }
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('volunteers.hcManagement')}</h1>
        <Button asChild>
          <Link to="/volontaires-hc/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            {t('common.add')}
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-end">
            <div className="flex-grow space-y-2">
              <Label htmlFor="searchQuery">{t('common.search')}</Label>
              <div className="relative">
                <Input
                  id="searchQuery"
                  type="text"
                  placeholder={t('volunteers.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeArchived"
                checked={includeArchived}
                onCheckedChange={(checked) => setIncludeArchived(checked as boolean)}
              />
              <Label htmlFor="includeArchived" className="font-normal">
                {t('volunteers.includeArchived')}
              </Label>
            </div>

            <Button type="submit">
              {t('common.search')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <VolontairesTable
            volontaires={volontaires}
            onArchive={handleDeleteVolontaire}
          />

          {volontaires.length > 0 && (
            <Card>
              <CardContent className="flex flex-col sm:flex-row justify-between items-center py-4">
                <p className="text-sm text-muted-foreground mb-4 sm:mb-0">
                  {t('pagination.showing')} <span className="font-semibold">{page * size + 1}</span>
                  {t('pagination.to')} <span className="font-semibold">{Math.min((page + 1) * size, total)}</span>
                  {t('pagination.of')} <span className="font-semibold">{total}</span> {t('volunteers.title').toLowerCase()}
                </p>
                <div className="flex space-x-2">
                  <Button
                    onClick={prevPage}
                    disabled={page === 0}
                    variant="outline"
                    size="sm"
                  >
                    &laquo; {t('pagination.previous')}
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
                          className="w-8 h-8"
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
                    {t('pagination.next')} &raquo;
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

export default VolontairesHcPage
