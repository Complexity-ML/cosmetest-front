import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
import { Loader2, Plus, Search, Archive, ArchiveRestore, Trash2, AlertTriangle } from 'lucide-react'
import type { Etude } from '../../types/types'

const EtudesPage = () => {
  const { t } = useTranslation()
  const [etudes, setEtudes] = useState<Etude[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const { page, size, updateTotal, goToPage, nextPage, prevPage, pageCount } = usePagination(0, 15)

  useEffect(() => {
    const fetchEtudes = async () => {
      try {
        setIsLoading(true)
        setError(null)

        let response;
        if (searchQuery.trim()) {
          const searchResults = await etudeService.search(searchQuery);
          const filtered = searchResults.filter(e => showArchived ? e.archive === true : e.archive !== true);
          response = {
            content: filtered.slice(page * size, (page + 1) * size),
            totalElements: filtered.length
          };
        } else {
          response = await etudeService.getPaginated(page, size, 'dateDebut', 'DESC');
          // Filtrer selon l'onglet actif
          const filtered = response.content.filter(e => showArchived ? e.archive === true : e.archive !== true);
          response = {
            ...response,
            content: filtered,
            totalElements: response.totalElements
          };
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
  }, [page, size, searchQuery, showArchived, updateTotal])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    goToPage(0)
  }

  const handleRowClick = (etudeId: number) => {
    window.location.href = `/etudes/${etudeId}`
  }

  const getStatusBadge = (etude: Etude) => {
    const now = new Date()
    const startDate = new Date(etude.dateDebut || etude.debut)
    const endDate = new Date(etude.dateFin || etude.fin)

    let status = '';

    if (now < startDate) {
      status = 'A_VENIR';
    } else if (now > endDate) {
      status = 'TERMINEE';
    } else {
      status = 'EN_COURS';
    }

    let statusBadge;
    switch (status) {
      case 'EN_COURS':
        statusBadge = <Badge variant="default" className="bg-green-500">{t('studies.ongoing')}</Badge>; break;
      case 'A_VENIR':
        statusBadge = <Badge variant="secondary">{t('studies.upcoming')}</Badge>; break;
      case 'TERMINEE':
        statusBadge = <Badge variant="outline">{t('studies.completed')}</Badge>; break;
      case 'ANNULEE':
        statusBadge = <Badge variant="destructive">{t('studies.cancelled')}</Badge>; break;
      default:
        statusBadge = <Badge variant="outline">{t('studies.unknown')}</Badge>;
    }

    return (
      <div className="flex items-center gap-1">
        {statusBadge}
        {etude.archive && (
          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
            <Archive className="w-3 h-3 mr-1" />{t('studies.archived') || 'Archivée'}
          </Badge>
        )}
      </div>
    );
  }

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()

    // Niveau 1 : première confirmation
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id)
      return
    }

    // Niveau 2 : deuxième confirmation (window.confirm)
    if (window.confirm(t('studies.deleteConfirmFinal') || 'ATTENTION : Cette suppression est irréversible. Confirmer la suppression définitive ?')) {
      try {
        await etudeService.delete(id)
        setEtudes(etudes.filter(etude => etude.idEtude !== id))
        setDeleteConfirmId(null)
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        alert(t('studies.deleteError'))
      }
    } else {
      setDeleteConfirmId(null)
    }
  }

  const handleArchiveToggle = async (e: React.MouseEvent, etude: Etude) => {
    e.stopPropagation()
    const newArchiveState = !etude.archive
    const confirmMsg = newArchiveState
      ? (t('studies.archiveConfirm') || 'Archiver cette étude ?')
      : (t('studies.unarchiveConfirm') || 'Désarchiver cette étude ?')
    if (window.confirm(confirmMsg)) {
      try {
        await etudeService.toggleArchive(etude.idEtude!, newArchiveState)
        setEtudes(etudes.filter(e => e.idEtude !== etude.idEtude))
      } catch (error) {
        console.error('Erreur lors de l\'archivage:', error)
        alert(t('studies.archiveError') || 'Erreur lors de l\'archivage')
      }
    }
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteConfirmId(null)
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

      <div className="flex justify-between items-center gap-4">
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

        {/* Onglets Actives / Archivées */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <Button
            size="sm"
            variant={!showArchived ? "default" : "ghost"}
            onClick={() => { setShowArchived(false); goToPage(0); setDeleteConfirmId(null); }}
            className="text-xs"
          >
            {t('studies.active') || 'Actives'}
          </Button>
          <Button
            size="sm"
            variant={showArchived ? "default" : "ghost"}
            onClick={() => { setShowArchived(true); goToPage(0); setDeleteConfirmId(null); }}
            className="text-xs"
          >
            <Archive className="w-3 h-3 mr-1" />
            {t('studies.archived') || 'Archivées'}
          </Button>
        </div>
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
                        className={`cursor-pointer ${etude.archive ? 'bg-gray-50 opacity-75' : ''}`}
                        onClick={() => etude.idEtude && handleRowClick(etude.idEtude)}
                      >
                        <TableCell className="font-medium">
                          <a
                            href={`/etudes/${etude.idEtude}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {etude.ref}
                          </a>
                        </TableCell>
                        <TableCell>{etude.titre}</TableCell>
                        <TableCell>{formatDate(etude.dateDebut || etude.debut)}</TableCell>
                        <TableCell>{formatDate(etude.dateFin || etude.fin)}</TableCell>
                        <TableCell>
                          {getStatusBadge(etude)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-3 items-center">
                            <Link
                              to={`/etudes/${etude.idEtude}/edit`}
                              className="text-primary hover:text-primary/80"
                              onClick={handleEditClick}
                            >
                              {t('common.edit')}
                            </Link>

                            {/* Archiver / Désarchiver */}
                            <button
                              onClick={(e) => handleArchiveToggle(e, etude)}
                              className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
                            >
                              {etude.archive ? (
                                <><ArchiveRestore className="w-3 h-3" />{t('studies.unarchive') || 'Désarchiver'}</>
                              ) : (
                                <><Archive className="w-3 h-3" />{t('common.archive') || 'Archiver'}</>
                              )}
                            </button>

                            {/* Suppression uniquement pour les études archivées (2 niveaux) */}
                            {etude.archive && (
                              <>
                                {deleteConfirmId === etude.idEtude ? (
                                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                    <button
                                      onClick={(e) => etude.idEtude && handleDelete(e, etude.idEtude)}
                                      className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                                    >
                                      {t('studies.confirmDelete') || 'Confirmer'}
                                    </button>
                                    <button
                                      onClick={handleCancelDelete}
                                      className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                                    >
                                      {t('common.cancel') || 'Annuler'}
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={(e) => etude.idEtude && handleDelete(e, etude.idEtude)}
                                    className="text-destructive hover:text-destructive/80 flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    {t('common.delete')}
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground h-32">
                        {showArchived
                          ? (t('studies.noArchivedStudies') || 'Aucune étude archivée')
                          : t('studies.noStudies')
                        }
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
