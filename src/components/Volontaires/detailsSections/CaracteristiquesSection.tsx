import { useTranslation } from 'react-i18next';
import { formatPhototype, formatEthnie } from '../../../utils/formatters';
import { displayValue } from '../../../pages/Volontaires/utils/detailsHelpers';
import { VolontaireData } from '../../../types/volontaire.types';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

interface CaracteristiquesSectionProps {
  volontaireDisplayData: VolontaireData;
}

const CaracteristiquesSection = ({ volontaireDisplayData }: CaracteristiquesSectionProps) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('volunteers.physicalCharacteristics')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.height')}</p>
            <p className="text-sm text-gray-900">
              {volontaireDisplayData.taille ? volontaireDisplayData.taille + ' cm' : '-'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.weight')}</p>
            <p className="text-sm text-gray-900">
              {volontaireDisplayData.poids ? volontaireDisplayData.poids + ' kg' : '-'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.phototype')}</p>
            <p className="text-sm text-gray-900">
              {formatPhototype(volontaireDisplayData.phototype) || '-'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.ethnicity')}</p>
            <p className="text-sm text-gray-900">
              {formatEthnie(volontaireDisplayData.ethnie) || '-'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.subEthnicity')}</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.sousEthnie)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.eyeColor')}</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.yeux)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.hairiness')}</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.pilosite)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.fatherOrigin')}</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.originePere)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.motherOrigin')}</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.origineMere)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaracteristiquesSection;
