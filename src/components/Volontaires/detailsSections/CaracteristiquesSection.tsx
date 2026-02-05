import { useTranslation } from 'react-i18next';
import { formatPhototype } from '../../../utils/formatters';
import { displayValue } from '../../../pages/Volontaires/utils/detailsHelpers';
import { VolontaireData } from '../../../types/volontaire.types';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

interface CaracteristiquesSectionProps {
  volontaireDisplayData: VolontaireData;
}

const CaracteristiquesSection = ({ volontaireDisplayData }: CaracteristiquesSectionProps) => {
  const { t } = useTranslation();

  // Parser les ethnies (peut être un string séparé par des virgules)
  const getEthniesArray = (): string[] => {
    if (!volontaireDisplayData.ethnie) return [];
    if (Array.isArray(volontaireDisplayData.ethnie)) return volontaireDisplayData.ethnie;
    return volontaireDisplayData.ethnie.split(',').filter((e: string) => e.trim() !== '');
  };

  // Parser les sous-ethnies (peut être un string séparé par des virgules)
  const getSousEthniesArray = (): string[] => {
    if (!volontaireDisplayData.sousEthnie) return [];
    if (Array.isArray(volontaireDisplayData.sousEthnie)) return volontaireDisplayData.sousEthnie;
    return volontaireDisplayData.sousEthnie.split(',').filter((e: string) => e.trim() !== '');
  };

  const ethnies = getEthniesArray();
  const sousEthnies = getSousEthniesArray();

  // Formater les ethnies pour l'affichage
  const formatEthnies = (): string => {
    if (ethnies.length === 0) return '-';
    return ethnies
      .map(e => t(`volunteers.ethnicityOptions.${e}`, e))
      .join(', ');
  };

  // Formater les sous-ethnies pour l'affichage
  const formatSousEthnies = (): string => {
    if (sousEthnies.length === 0) return '-';
    return sousEthnies
      .map(se => t(`volunteers.subEthnicityOptions.${se}`, se))
      .join(', ');
  };

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
            <p className="text-sm text-gray-900">{formatEthnies()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.subEthnicity')}</p>
            <p className="text-sm text-gray-900">{formatSousEthnies()}</p>
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
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.scars')}</p>
            <p className="text-sm text-gray-900">
              {!volontaireDisplayData.cicatrices || volontaireDisplayData.cicatrices === 'Non' ? t('common.no') : volontaireDisplayData.cicatrices === 'Oui' ? t('common.yes') : `${t('common.yes')} — ${volontaireDisplayData.cicatrices}`}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.tattoos')}</p>
            <p className="text-sm text-gray-900">
              {!volontaireDisplayData.tatouages || volontaireDisplayData.tatouages === 'Non' ? t('common.no') : volontaireDisplayData.tatouages === 'Oui' ? t('common.yes') : `${t('common.yes')} — ${volontaireDisplayData.tatouages}`}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.piercings')}</p>
            <p className="text-sm text-gray-900">
              {!volontaireDisplayData.piercings || volontaireDisplayData.piercings === 'Non' ? t('common.no') : volontaireDisplayData.piercings === 'Oui' ? t('common.yes') : `${t('common.yes')} — ${volontaireDisplayData.piercings}`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaracteristiquesSection;
