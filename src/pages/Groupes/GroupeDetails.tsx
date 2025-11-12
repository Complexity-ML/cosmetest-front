import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import groupeService from '../../services/groupeService'
import etudeService from '../../services/etudeService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { Loader2 } from 'lucide-react'
import type { Groupe, Etude } from '../../types/types'

const GroupeDetails = () => {
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
          throw new Error('Identifiant du groupe non valide')
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
        setError('Impossible de charger les informations du groupe. ' + (error as Error).message)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchGroupe()
  }, [id])
  
  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
      try {
        if (!id) return
        await groupeService.delete(id)
        navigate('/groupes', { replace: true })
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        setError('Une erreur est survenue lors de la suppression du groupe.')
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
        <p className="text-muted-foreground">Groupe non trouvé.</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/groupes">Retour à la liste des groupes</Link>
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
              Modifier
            </Link>
          </Button>
          <Button
            onClick={handleDelete}
            variant="destructive"
          >
            Supprimer
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Informations du groupe</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium w-1/3">Étude associée</TableCell>
                <TableCell>
                  {etude ? (
                    <Link to={`/etudes/${etudeId}`} className="text-primary hover:underline">
                      {etudeReference || etudeTitle || `Étude #${etudeId}`}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">Non spécifiée</span>
                  )}
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="font-medium">Tranche d'âge</TableCell>
                <TableCell>
                  {groupe.ageMinimum || groupe.ageMin || groupe.ageMaximum || groupe.ageMax ? (
                    `${groupe.ageMinimum || groupe.ageMin || '0'} - ${groupe.ageMaximum || groupe.ageMax || '∞'} ans`
                  ) : (
                    <span className="text-muted-foreground">Non spécifiée</span>
                  )}
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="font-medium">Ethnie</TableCell>
                <TableCell>
                  {groupe.ethnie || <span className="text-muted-foreground">Non spécifiée</span>}
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="font-medium">Nombre de participants</TableCell>
                <TableCell>
                  {groupe.nbSujet || groupe.nombreParticipants || 0}
                </TableCell>
              </TableRow>
              
              {groupe.description && (
                <TableRow>
                  <TableCell className="font-medium align-top">Description</TableCell>
                  <TableCell className="whitespace-pre-line">
                    {groupe.description}
                  </TableCell>
                </TableRow>
              )}
              
              {groupe.criteresSupplémentaires && (
                <TableRow>
                  <TableCell className="font-medium align-top">Critères supplémentaires</TableCell>
                  <TableCell className="whitespace-pre-line">
                    {groupe.criteresSupplémentaires}
                  </TableCell>
                </TableRow>
              )}
              
              {groupe.iv !== undefined && (
                <TableRow>
                  <TableCell className="font-medium">IV</TableCell>
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
            ← Retour à la liste des groupes
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default GroupeDetails