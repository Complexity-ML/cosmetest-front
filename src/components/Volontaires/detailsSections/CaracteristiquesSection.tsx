import { formatPhototype, formatEthnie } from '../../../utils/formatters';
import { displayValue } from '../../../pages/Volontaires/utils/detailsHelpers';
import { VolontaireData } from '../../../types/volontaire.types';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

interface CaracteristiquesSectionProps {
  volontaireDisplayData: VolontaireData;
}

const CaracteristiquesSection = ({ volontaireDisplayData }: CaracteristiquesSectionProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Caracteristiques physiques</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Taille</p>
          <p className="text-sm text-gray-900">
            {volontaireDisplayData.taille ? volontaireDisplayData.taille + ' cm' : '-'}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Poids</p>
          <p className="text-sm text-gray-900">
            {volontaireDisplayData.poids ? volontaireDisplayData.poids + ' kg' : '-'}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Phototype</p>
          <p className="text-sm text-gray-900">
            {formatPhototype(volontaireDisplayData.phototype) || '-'}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Ethnie</p>
          <p className="text-sm text-gray-900">
            {formatEthnie(volontaireDisplayData.ethnie) || '-'}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Sous-ethnie</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.sousEthnie)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Couleur des yeux</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.yeux)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Pilosite</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.pilosite)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Origine du pere</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.originePere)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">Origine de la mere</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.origineMere)}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default CaracteristiquesSection;
