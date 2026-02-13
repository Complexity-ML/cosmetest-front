import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import volontaireService from '../../services/volontaireService'
import { usePagination } from '../../hooks/usePagination'
import { Plus, X, Search } from 'lucide-react'
import VolontairesTable from '../../components/Volontaires/VolontairesTable'
import DuplicateCheckDialog from '../../components/Volontaires/DuplicateCheckDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const MIN_CHARS = 3

interface SearchFields {
  nom: string
  prenom: string
  email: string
  tel: string
  idVol: string
}

const emptyFields: SearchFields = { nom: '', prenom: '', email: '', tel: '', idVol: '' }

const VolontairesPage = () => {
  const { t } = useTranslation()
  const [volontaires, setVolontaires] = useState([])
  const [searchFields, setSearchFields] = useState<SearchFields>(emptyFields)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [includeArchived, setIncludeArchived] = useState(false)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const { page, size, updateTotal, goToPage, nextPage, prevPage, pageCount, total } = usePagination()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Vérifie si un champ a assez de caractères pour déclencher la recherche
  const isFieldActive = (field: string, value: string) => {
    if (field === 'idVol') return value.trim().length >= 1
    return value.trim().length >= MIN_CHARS
  }

  // Vérifie si au moins un champ de recherche est actif
  const hasActiveSearch = Object.entries(searchFields).some(
    ([field, value]) => isFieldActive(field, value)
  )

  const fetchVolontaires = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Construire les params pour la recherche multi-champs
      const activeParams: Record<string, string | boolean | number> = {
        page,
        size,
        includeArchived,
      }

      let useMultiSearch = false
      for (const [field, value] of Object.entries(searchFields)) {
        if (isFieldActive(field, value)) {
          activeParams[field] = value.trim()
          useMultiSearch = true
        }
      }

      let response
      if (useMultiSearch) {
        response = await volontaireService.searchMulti(activeParams as any)
      } else {
        response = await volontaireService.getAll({ page, size, includeArchived })
      }

      setVolontaires(response.data?.content || [])
      updateTotal(response.data?.totalElements || 0)
    } catch (error) {
      console.error('Erreur lors du chargement des volontaires:', error)
      setError(t('volunteers.loadError'))
    } finally {
      setIsLoading(false)
    }
  }, [page, size, searchFields, includeArchived])

  // Recherche avec debounce quand les champs changent
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchVolontaires()
    }, 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [fetchVolontaires])

  const updateField = (field: keyof SearchFields, value: string) => {
    setSearchFields(prev => ({ ...prev, [field]: value }))
    goToPage(0)
  }

  const clearSearch = () => {
    setSearchFields(emptyFields)
    goToPage(0)
  }

  const handleDeleteVolontaire = async (id: string | number) => {
    if (window.confirm(t('volunteers.archiveConfirm'))) {
      try {
        await volontaireService.archive(id)
        fetchVolontaires()
      } catch (error) {
        console.error("Erreur lors de l'archivage du volontaire:", error)
        alert(t('volunteers.archiveError'))
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('volunteers.title')}</h1>
        <Button onClick={() => setDuplicateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('common.add')}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Champs de recherche multi-critères */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="space-y-1">
              <Label htmlFor="searchId" className="text-xs font-medium">ID</Label>
              <Input
                id="searchId"
                type="text"
                placeholder="ex: 1023"
                value={searchFields.idVol}
                onChange={(e) => updateField('idVol', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="searchNom" className="text-xs font-medium">Nom</Label>
              <Input
                id="searchNom"
                type="text"
                placeholder="3 lettres min."
                value={searchFields.nom}
                onChange={(e) => updateField('nom', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="searchPrenom" className="text-xs font-medium">Pr&eacute;nom</Label>
              <Input
                id="searchPrenom"
                type="text"
                placeholder="3 lettres min."
                value={searchFields.prenom}
                onChange={(e) => updateField('prenom', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="searchEmail" className="text-xs font-medium">Email</Label>
              <Input
                id="searchEmail"
                type="text"
                placeholder="3 lettres min."
                value={searchFields.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="searchTel" className="text-xs font-medium">T&eacute;l&eacute;phone</Label>
              <Input
                id="searchTel"
                type="text"
                placeholder="3 chiffres min."
                value={searchFields.tel}
                onChange={(e) => updateField('tel', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="flex items-end gap-2">
              {hasActiveSearch && (
                <Button
                  onClick={clearSearch}
                  variant="ghost"
                  size="sm"
                  className="h-9 text-xs"
                  title="Effacer la recherche"
                >
                  <X className="h-4 w-4 mr-1" />
                  Effacer
                </Button>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeArchived"
                checked={includeArchived}
                onCheckedChange={(checked) => setIncludeArchived(checked as boolean)}
              />
              <Label htmlFor="includeArchived" className="font-normal text-sm">
                {t('volunteers.includeArchived')}
              </Label>
            </div>
            {hasActiveSearch && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Search className="h-4 w-4" />
                {total} r&eacute;sultat{total !== 1 ? 's' : ''}
              </div>
            )}
          </div>
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
                  {t('pagination.of')} <span className="font-semibold">{total}</span> {t('sidebar.volunteers').toLowerCase()}
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
                    {t('pagination.next')} &raquo;
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <DuplicateCheckDialog
        open={duplicateDialogOpen}
        onOpenChange={setDuplicateDialogOpen}
      />
    </div>
  )
}

export default VolontairesPage
