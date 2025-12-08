import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowUpDown } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface Volontaire {
  id?: string | number
  volontaireId?: string | number
  nomVol?: string
  nom?: string
  prenomVol?: string
  prenom?: string
  sexe: string
  emailVol?: string
  email?: string
  typePeauVisage?: string
  typePeau?: string
  archive?: boolean
}

interface VolontairesTableProps {
  volontaires: Volontaire[]
  onArchive: (volontaireId: string | number) => void
}

type SortKey = keyof Volontaire

const VolontairesTable = ({ volontaires, onArchive }: VolontairesTableProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  // État pour le tri
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey
    direction: 'ascending' | 'descending'
  }>({
    key: 'nomVol',
    direction: 'ascending'
  })

  // Fonction pour gérer le tri des colonnes
  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending'
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  // Fonction pour gérer le clic sur une ligne
  const handleRowClick = (volontaireId: string | number) => {
    navigate(`/volontaires/${volontaireId}`)
  }

  // Tri des volontaires selon la configuration
  const sortedVolontaires = [...volontaires].sort((a, b) => {
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]
    
    if (!aValue || !bValue) return 0
    
    let comparison = 0
    if (String(aValue).toLowerCase() > String(bValue).toLowerCase()) {
      comparison = 1
    } else if (String(aValue).toLowerCase() < String(bValue).toLowerCase()) {
      comparison = -1
    }
    return sortConfig.direction === 'descending' ? comparison * -1 : comparison
  })

  // Fonctions pour empêcher la propagation des clics sur les actions
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleArchiveClick = (e: React.MouseEvent, volontaireId: string | number) => {
    e.stopPropagation()
    onArchive(volontaireId)
  }

  const getSexeColor = (sexe: string): string => {
    return sexe === 'Féminin'
      ? 'bg-pink-100 text-pink-800 border-pink-200'
      : 'bg-blue-100 text-blue-800 border-blue-200'
  }

  const getTypePeauColor = (typePeau: string): string => {
    switch (typePeau) {
      case 'Normale':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Mixte':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Sèche':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'Grasse':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Sensible':
        return 'bg-pink-100 text-pink-800 border-pink-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card className="w-full">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-accent"
                onClick={() => requestSort('id')}
              >
                <div className="flex items-center">
                  <span>ID</span>
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-accent"
                onClick={() => requestSort('nomVol')}
              >
                <div className="flex items-center">
                  <span>{t('volunteers.lastName')}</span>
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-accent"
                onClick={() => requestSort('prenomVol')}
              >
                <div className="flex items-center">
                  <span>{t('volunteers.firstName')}</span>
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-accent"
                onClick={() => requestSort('sexe')}
              >
                <div className="flex items-center">
                  <span>{t('volunteers.gender')}</span>
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-accent"
                onClick={() => requestSort('emailVol')}
              >
                <div className="flex items-center">
                  <span>{t('volunteers.email')}</span>
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-accent"
                onClick={() => requestSort('typePeauVisage')}
              >
                <div className="flex items-center">
                  <span>{t('volunteers.skinType')}</span>
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-right">
                {t('common.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedVolontaires.length > 0 ? (
              sortedVolontaires.map((volontaire, index) => {
                const id = volontaire.id || volontaire.volontaireId || ''
                const typePeau = volontaire.typePeauVisage || volontaire.typePeau || t('volunteers.notDefined')
                
                return (
                <TableRow
                  key={id || index}
                  className="cursor-pointer"
                  onClick={() => id && handleRowClick(id)}
                >
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {id}
                  </TableCell>
                  <TableCell className="font-medium">
                    {volontaire.nomVol || volontaire.nom}
                  </TableCell>
                  <TableCell>
                    {volontaire.prenomVol || volontaire.prenom}
                  </TableCell>
                  <TableCell>
                    <Badge className={getSexeColor(volontaire.sexe)}>
                      {volontaire.sexe}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <a 
                      href={`mailto:${volontaire.emailVol || volontaire.email}`} 
                      className="text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {volontaire.emailVol || volontaire.email}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypePeauColor(typePeau)}>
                      {typePeau}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        onClick={handleEditClick}
                      >
                        <Link to={`/volontaires/${id}/edit`}>
                          {t('common.edit')}
                        </Link>
                      </Button>
                      {!volontaire.archive ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => id && handleArchiveClick(e, id)}
                          className="text-destructive hover:text-destructive"
                        >
                          {t('common.archive')}
                        </Button>
                      ) : (
                        <Badge variant="secondary">
                          {t('volunteers.archived')}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )})
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {t('volunteers.noVolunteers')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

export default VolontairesTable