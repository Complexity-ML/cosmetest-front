import { useTranslation } from 'react-i18next';
import { displayValue, displayYesNo } from '../../../pages/Volontaires/utils/detailsHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Separator } from '../../ui/separator';

const CilsSection = ({ volontaireDisplayData }: { volontaireDisplayData: any }) => {
  const { t } = useTranslation();

  return (
  <Card>
    <CardHeader>
      <CardTitle>{t('volunteers.lashCharacteristics')}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">{t('volunteers.lashThickness')}</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.epaisseurCils)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">{t('volunteers.lashLength')}</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.longueurCils)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">{t('volunteers.lashCurvature')}</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.courbureCils)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">{t('volunteers.damagedLashes')}</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.cilsAbimes)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">{t('volunteers.bushyLashes')}</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.cilsBroussailleux)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">{t('volunteers.lashLoss')}</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.chuteDeCils)}</p>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">{t('volunteers.eyebrows')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.eyebrowCharacteristics')}</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.caracteristiqueSourcils)}</p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">{t('volunteers.lips')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.lipType')}</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.levres)}</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
  );
};

export default CilsSection;
