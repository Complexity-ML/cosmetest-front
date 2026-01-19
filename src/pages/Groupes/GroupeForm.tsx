import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  phototype: string[]
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
  const { t } = useTranslation()
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
    phototype: [],
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
        setError(t('groups.errorLoadingStudies'))
      }
    }

    fetchEtudes()
  }, [])

  // 1. Fonctions utilitaires pour la conversion
  const ethniesArrayToString = (ethniesArray: string[]): string => {
    return Array.isArray(ethniesArray) ? ethniesArray.join(';') : ''
  }

  const phototypesArrayToString = (phototypesArray: string[]): string => {
    return Array.isArray(phototypesArray) ? phototypesArray.join(';') : ''
  }

  const ethniesStringToArray = (ethniesString: string): string[] => {
    if (!ethniesString || ethniesString === '') return []

    // Supporte à la fois la virgule et le point-virgule
    const separator = ethniesString.includes(';') ? ';' : ','
    return ethniesString.split(separator).filter((e: string) => e.trim() !== '')
  }

  const phototypesStringToArray = (phototypesString: string): string[] => {
    if (!phototypesString || phototypesString === '') return []

    const separator = phototypesString.includes(';') ? ';' : ','
    return phototypesString.split(separator).filter((p: string) => p.trim() !== '')
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
          const phototypesArray = data.phototype ? phototypesStringToArray(data.phototype as string) : []

          const groupeData: GroupeFormData = {
            intitule: data.intitule || data.nom || '',
            description: data.description || '',
            idEtude: data.idEtude?.toString() || '',
            ageMinimum: data.ageMin?.toString() || '',
            ageMaximum: data.ageMax?.toString() || '',
            ethnie: ethniesArray,
            phototype: phototypesArray,
            criteresSupplémentaires: data.criteresSupplémentaires || '',
            nbSujet: data.nbSujet?.toString() || '',
            iv: data.iv?.toString() || ''
          }

          setGroupe(groupeData)
        } catch (error) {
          console.error('Erreur lors du chargement du groupe:', error)
          const errorMessage = error instanceof Error ? error.message : t('errors.unknownError')
          setError(t('groups.errorLoadingGroup') + ' ' + errorMessage)
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

  const phototypesDisponibles = [
    'Type 1',
    'Type 2',
    'Type 3',
    'Type 4',
    'Type 5',
    'Type 6'
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

  const handlePhototypeChange = (phototypeValue: string) => {
    setGroupe(prevGroupe => {
      const currentPhototypes = Array.isArray(prevGroupe.phototype) ? prevGroupe.phototype : []

      if (currentPhototypes.includes(phototypeValue)) {
        return {
          ...prevGroupe,
          phototype: currentPhototypes.filter((p: string) => p !== phototypeValue)
        }
      } else {
        return {
          ...prevGroupe,
          phototype: [...currentPhototypes, phototypeValue]
        }
      }
    })
  }

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {}

    if (!groupe.intitule) errors.intitule = t('groups.titleRequired')
    if (!groupe.idEtude) errors.idEtude = t('groups.studyRequired')
    if (groupe.ageMinimum && groupe.ageMaximum && parseInt(groupe.ageMinimum) > parseInt(groupe.ageMaximum)) {
      errors.ageRange = t('groups.ageRangeInvalid')
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formErrors = validateForm()
    if (Object.keys(formErrors).length > 0) {
      setError(t('groups.correctErrors') + ' ' + Object.values(formErrors).join(', '))
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Préparer les données avec ethnie et phototype converties en chaîne et conversion des nombres
      const dataToSend = {
        ...groupe,
        ethnie: ethniesArrayToString(groupe.ethnie), // Convertir le tableau en chaîne
        phototype: phototypesArrayToString(groupe.phototype), // Convertir le tableau en chaîne
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
      setError(t('groups.saveError'))
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
        {isEditMode ? t('groups.editGroup') : t('groups.createNewGroup')}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          {t('groups.groupSaved', { action: isEditMode ? t('groups.modified') : t('groups.created') })}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div>
          <Label htmlFor="intitule">{t('groups.groupTitle')} *</Label>
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
          <Label htmlFor="idEtude">{t('groups.study')} *</Label>
          <select
            name="idEtude"
            id="idEtude"
            value={groupe.idEtude}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="">{t('groups.selectStudy')}</option>
            {etudes.map((etude) => (
              <option key={etude.idEtude} value={etude.idEtude}>
                {etude.ref || `${t('groups.study')} #${etude.idEtude}`}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ageMinimum">{t('groups.ageMin')}</Label>
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
            <Label htmlFor="ageMaximum">{t('groups.ageMax')}</Label>
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
            {t('groups.ethnicities')}
          </Label>
          <div className="space-y-2">
            {ethniesDisponibles.map((ethnieOption) => (
              <div
                key={ethnieOption}
                className="flex items-center space-x-2"
              >
                <Checkbox
                  id={`ethnie-${ethnieOption}`}
                  checked={Array.isArray(groupe.ethnie) &&
                    groupe.ethnie.some(e => e.toLowerCase() === ethnieOption.toLowerCase())}
                  onCheckedChange={() => handleEthnieChange(ethnieOption)}
                />
                <label
                  htmlFor={`ethnie-${ethnieOption}`}
                  className="text-sm font-normal capitalize cursor-pointer"
                >
                  {ethnieOption.toLowerCase()}
                </label>
              </div>
            ))}
          </div>
          {Array.isArray(groupe.ethnie) && groupe.ethnie.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {t('groups.ethnicitiesSelected', { count: groupe.ethnie.length })}
            </p>
          )}
        </div>

        <div>
          <Label className="mb-2">
            {t('groups.phototypes') || 'Phototypes'}
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {phototypesDisponibles.map((phototypeOption) => (
              <div
                key={phototypeOption}
                className="flex items-center space-x-2"
              >
                <Checkbox
                  id={`phototype-${phototypeOption}`}
                  checked={Array.isArray(groupe.phototype) &&
                    groupe.phototype.some(p => p === phototypeOption)}
                  onCheckedChange={() => handlePhototypeChange(phototypeOption)}
                />
                <label
                  htmlFor={`phototype-${phototypeOption}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {phototypeOption}
                </label>
              </div>
            ))}
          </div>
          {Array.isArray(groupe.phototype) && groupe.phototype.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {t('groups.phototypesSelected', { count: groupe.phototype.length }) || `${groupe.phototype.length} phototype(s) sélectionné(s)`}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="description">
            {t('groups.description')}
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
            {t('groups.subjectCount')}
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
            {t('groups.volunteerCompensation')}
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
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditMode ? t('groups.updating') : t('groups.creating')}
              </>
            ) : (
              isEditMode ? t('common.update') : t('common.create')
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default GroupeForm