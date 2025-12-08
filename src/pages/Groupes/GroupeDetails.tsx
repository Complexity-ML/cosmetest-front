import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import groupeService from '../../services/groupeService'
import etudeService from '../../services/etudeService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { Loader2 } from 'lucide-react'
import type { Groupe, Etude } from '../../types/types'

const GroupeDetails = () => {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [groupe, setGroupe] = useState<Groupe | null>(null)
  const [etude, setEtude] = useState<Etude | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGroupe = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Vérifier si l'ID est défini
        if (!id || id === 'undefined') {
          throw new Error(t('groups.invalidId'))
        }

        const groupeData = await groupeService.getById(id)
        setGroupe(groupeData)
        
        // Charger les détails de l'étude associée si le groupe a un idEtude
        if (groupeData.idEtude) {
          const etudeData = await etudeService.getById(groupeData.idEtude)
          setEtude(etudeData)
        }
      } catch (error: unknown) {
        console.error('Erreur lors du chargement des données:', error)
        setError(t('groups.loadDetailError') + ' ' + (error as Error).message)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchGroupe()
  }, [id])
  
  const handleDelete = async () => {
    if (window.confirm(t('groups.deleteConfirm'))) {
      try {
        if (!id) return
        await groupeService.delete(id)
        navigate('/groupes', { replace: true })
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        setError(t('groups.deleteError'))
      }
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }
  
  if (!groupe) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">{t('groups.notFound')}</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/groupes">{t('groups.backToList')}</Link>
        </Button>
      </div>
    )
  }
  
  // Récupérer les informations de référence de l'étude
  const etudeReference = etude ? etude.ref : null;
  const etudeTitle = etude ? etude.titre : null;
  const etudeId = groupe.idEtude;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">{groupe.intitule || groupe.nom}</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to={`/groupes/${id}/edit`}>
              {t('common.edit')}
            </Link>
          </Button>
          <Button
            onClick={handleDelete}
            variant="destructive"
          >
            {t('common.delete')}
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('groups.groupInformation')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium w-1/3">{t('groups.associatedStudy')}</TableCell>
                <TableCell>
                  {etude ? (
                    <Link to={`/etudes/${etudeId}`} className="text-primary hover:underline">
                      {etudeReference || etudeTitle || `${t('studies.study')} #${etudeId}`}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">{t('groups.notSpecified')}</span>
                  )}
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="font-medium">{t('groups.ageRange')}</TableCell>
                <TableCell>
                  {groupe.ageMinimum || groupe.ageMin || groupe.ageMaximum || groupe.ageMax ? (
                    `${groupe.ageMinimum || groupe.ageMin || '0'} - ${groupe.ageMaximum || groupe.ageMax || '∞'} ${t('groups.years')}`
                  ) : (
                    <span className="text-muted-foreground">{t('groups.notSpecified')}</span>
                  )}
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="font-medium">{t('groups.ethnicity')}</TableCell>
                <TableCell>
                  {groupe.ethnie || <span className="text-muted-foreground">{t('groups.notSpecified')}</span>}
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="font-medium">{t('groups.participants')}</TableCell>
                <TableCell>
                  {groupe.nbSujet || groupe.nombreParticipants || 0}
                </TableCell>
              </TableRow>
              
              {groupe.description && (
                <TableRow>
                  <TableCell className="font-medium align-top">{t('common.details')}</TableCell>
                  <TableCell className="whitespace-pre-line">
                    {groupe.description}
                  </TableCell>
                </TableRow>
              )}
              
              {groupe.criteresSupplémentaires && (
                <TableRow>
                  <TableCell className="font-medium align-top">{t('groups.additionalCriteria')}</TableCell>
                  <TableCell className="whitespace-pre-line">
                    {groupe.criteresSupplémentaires}
                  </TableCell>
                </TableRow>
              )}
              
              {groupe.iv !== undefined && (
                <TableRow>
                  <TableCell className="font-medium">{t('groups.compensation')}</TableCell>
                  <TableCell>
                    {groupe.iv}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center pt-4">
        <Button asChild variant="link" className="p-0">
          <Link to="/groupes">
            ← {t('groups.backToList')}
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default GroupeDetails