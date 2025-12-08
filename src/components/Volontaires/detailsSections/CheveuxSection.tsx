import { useTranslation } from 'react-i18next';
import { displayValue, displayYesNo } from '../../../pages/Volontaires/utils/detailsHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Separator } from '../../ui/separator';

const CheveuxSection = ({ volontaireDisplayData }: { volontaireDisplayData: any }) => {
  const { t } = useTranslation();

  return (
  <Card>
    <CardHeader>
      <CardTitle>{t('volunteers.hairCharacteristics')}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">{t('volunteers.hairColor')}</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.couleurCheveux)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">{t('volunteers.hairLength')}</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.longueurCheveux)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">{t('volunteers.hairNature')}</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.natureCheveux)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">{t('volunteers.hairThickness')}</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.epaisseurCheveux)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">{t('volunteers.scalpNature')}</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.natureCuirChevelu)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">{t('volunteers.sensitiveScalp')}</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.cuirCheveluSensible)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">{t('volunteers.hairLoss')}</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.chuteDeCheveux)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">{t('volunteers.brittleHair')}</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.cheveuxCassants)}</p>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">{t('volunteers.nails')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.brittleNails')}</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.onglesCassants)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.splitNails')}</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.onglesDedoubles)}</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
  );
};

export default CheveuxSection;
