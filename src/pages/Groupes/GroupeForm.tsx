import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import groupeService from '../../services/groupeService'
import etudeService from '../../services/etudeService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'
import { EtudeData } from '@/types/etude.types'

interface GroupeFormData {
  intitule: string
  description: string
  idEtude: string
  ageMinimum: string
  ageMaximum: string
  ethnie: string[]
  criteresSupplémentaires: string
  nbSujet: string
  iv: string
}

interface FormErrors {
  intitule?: string
  idEtude?: string
  ageRange?: string
}

const GroupeForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [groupe, setGroupe] = useState<GroupeFormData>({
    intitule: '',
    description: '',
    idEtude: '',
    ageMinimum: '',
    ageMaximum: '',
    ethnie: [],
    criteresSupplémentaires: '',
    nbSujet: '',
    iv: ''
  })

  const [etudes, setEtudes] = useState<EtudeData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Charger les études pour le select
  useEffect(() => {
    const fetchEtudes = async () => {
      try {
        const response = await etudeService.getAll()
        setEtudes(response)
      } catch (error) {
        console.error('Erreur lors du chargement des études:', error)
        setError('Impossible de charger la liste des études.')
      }
    }

    fetchEtudes()
  }, [])

  // 1. Fonctions utilitaires pour la conversion
  const ethniesArrayToString = (ethniesArray: string[]): string => {
    return Array.isArray(ethniesArray) ? ethniesArray.join(';') : ''
  }

  const ethniesStringToArray = (ethniesString: string): string[] => {
    if (!ethniesString || ethniesString === '') return []

    // Supporte à la fois la virgule et le point-virgule
    const separator = ethniesString.includes(';') ? ';' : ','
    return ethniesString.split(separator).filter((e: string) => e.trim() !== '')
  }

  // Charger le groupe si on est en mode édition
  useEffect(() => {
    if (isEditMode) {
      const fetchGroupe = async () => {
        try {
          setIsLoading(true)

          if (!id || id === 'undefined') {
            throw new Error('Identifiant du groupe non valide')
          }

          const data = await groupeService.getById(id)

          // Convertir la chaîne ethnie en tableau pour l'interface
          const ethniesArray = data.ethnie ? ethniesStringToArray(data.ethnie as string) : []

          const groupeData: GroupeFormData = {
            intitule: data.intitule || data.nom || '',
            description: data.description || '',
            idEtude: data.idEtude?.toString() || '',
            ageMinimum: data.ageMin?.toString() || '',
            ageMaximum: data.ageMax?.toString() || '',
            ethnie: ethniesArray,
            criteresSupplémentaires: data.criteresSupplémentaires || '',
            nbSujet: data.nbSujet?.toString() || '',
            iv: data.iv?.toString() || ''
          }

          setGroupe(groupeData)
        } catch (error) {
          console.error('Erreur lors du chargement du groupe:', error)
          const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
          setError('Impossible de charger les informations du groupe: ' + errorMessage)
        } finally {
          setIsLoading(false)
        }
      }

      fetchGroupe()
    }
  }, [id, isEditMode])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // Conversion des valeurs numériques
    if (['ageMin', 'ageMax', 'idEtude'].includes(name)) {
      setGroupe({
        ...groupe,
        [name]: value === '' ? '' : Number(value)
      })
    } else {
      setGroupe({
        ...groupe,
        [name]: value
      })
    }
  }

  const ethniesDisponibles = [
    'CAUCASIENNE',
    'AFRICAINE',
    'ASIATIQUE',
    'INDIENNE',
    'ANTILLAISE'
  ]

  const handleEthnieChange = (ethnieValue: string) => {
    setGroupe(prevGroupe => {
      const currentEthnies = Array.isArray(prevGroupe.ethnie) ? prevGroupe.ethnie : []

      if (currentEthnies.includes(ethnieValue)) {
        return {
          ...prevGroupe,
          ethnie: currentEthnies.filter((e: string) => e !== ethnieValue)
        }
      } else {
        return {
          ...prevGroupe,
          ethnie: [...currentEthnies, ethnieValue]
        }
      }
    })
  }

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {}

    if (!groupe.intitule) errors.intitule = 'L\'intitule du groupe est requis'
    if (!groupe.idEtude) errors.idEtude = 'L\'étude est requise'
    if (groupe.ageMinimum && groupe.ageMaximum && parseInt(groupe.ageMinimum) > parseInt(groupe.ageMaximum)) {
      errors.ageRange = 'L\'âge minimum doit être inférieur à l\'âge maximum'
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formErrors = validateForm()
    if (Object.keys(formErrors).length > 0) {
      setError('Veuillez corriger les erreurs suivantes: ' + Object.values(formErrors).join(', '))
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Préparer les données avec ethnie convertie en chaîne et conversion des nombres
      const dataToSend = {
        ...groupe,
        ethnie: ethniesArrayToString(groupe.ethnie), // Convertir le tableau en chaîne
        idEtude: groupe.idEtude ? Number(groupe.idEtude) : undefined,
        ageMinimum: groupe.ageMinimum ? Number(groupe.ageMinimum) : undefined,
        ageMaximum: groupe.ageMaximum ? Number(groupe.ageMaximum) : undefined,
        nbSujet: groupe.nbSujet ? Number(groupe.nbSujet) : undefined,
        iv: groupe.iv ? Number(groupe.iv) : undefined
      }

      if (isEditMode) {
        await groupeService.update(id, dataToSend)
      } else {
        await groupeService.create(dataToSend)
      }

      setSuccess(true)

      setTimeout(() => {
        navigate('/groupes')
      }, 1500)
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error)
      setError('Une erreur est survenue lors de l\'enregistrement du groupe.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditMode ? 'Modifier le groupe' : 'Créer un nouveau groupe'}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          Groupe {isEditMode ? 'modifié' : 'créé'} avec succès! Redirection en cours...
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div>
          <Label htmlFor="intitule">Intitule du groupe *</Label>
          <Input
            type="text"
            name="intitule"
            id="intitule"
            value={groupe.intitule}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="idEtude">Étude *</Label>
          <select
            name="idEtude"
            id="idEtude"
            value={groupe.idEtude}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="">-- Sélectionner une étude --</option>
            {etudes.map((etude) => (
              <option key={etude.idEtude} value={etude.idEtude}>
                {etude.ref || `Étude #${etude.idEtude}`}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ageMinimum">Âge minimum</Label>
            <Input
              type="number"
              name="ageMinimum"
              id="ageMinimum"
              value={groupe.ageMinimum}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div>
            <Label htmlFor="ageMaximum">Âge maximum</Label>
            <Input
              type="number"
              name="ageMaximum"
              id="ageMaximum"
              value={groupe.ageMaximum}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>

        <div>
          <Label className="mb-2">
            Ethnies
          </Label>
          <div className="space-y-2">
            {ethniesDisponibles.map((ethnieOption) => (
              <div key={ethnieOption} className="flex items-center space-x-2">
                <Checkbox
                  id={`ethnie-${ethnieOption}`}
                  checked={Array.isArray(groupe.ethnie) &&
                    groupe.ethnie.some(e => e.toLowerCase() === ethnieOption.toLowerCase())}
                  onCheckedChange={() => handleEthnieChange(ethnieOption)}
                />
                <Label 
                  htmlFor={`ethnie-${ethnieOption}`}
                  className="text-sm font-normal cursor-pointer capitalize"
                >
                  {ethnieOption.toLowerCase()}
                </Label>
              </div>
            ))}
          </div>
          {Array.isArray(groupe.ethnie) && groupe.ethnie.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {groupe.ethnie.length} ethnie(s) sélectionnée(s)
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="description">
            Description
          </Label>
          <Textarea
            name="description"
            id="description"
            value={groupe.description}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor='nbSujet'>
            Nombre de sujets
          </Label>
          <Input
            type='number'
            name='nbSujet'
            id='nbSujet'
            value={groupe.nbSujet}
            onChange={handleChange}
            min='0'
          />
        </div>

        <div>
          <Label htmlFor='iv'>
            Indemnité Volontaire
          </Label>
          <Input
            type='number'
            name='iv'
            id='iv'
            value={groupe.iv}
            onChange={handleChange}
            min='0'
          />
        </div>

        <div className="flex justify-end pt-4 gap-3">
          <Button
            type="button"
            onClick={() => navigate('/groupes')}
            variant="secondary"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditMode ? 'Modification...' : 'Création...'}
              </>
            ) : (
              isEditMode ? 'Modifier' : 'Créer'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default GroupeForm