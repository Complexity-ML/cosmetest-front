import { useTranslation } from 'react-i18next';
import { displayYesNo } from '../../../pages/Volontaires/utils/detailsHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Separator } from '../../ui/separator';

const MarquesCutaneesSection = ({ volontaireDisplayData }: { volontaireDisplayData: any }) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('volunteers.skinMarks')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.scars')}</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.cicatrices)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.tattoos')}</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.tatouages)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.piercings')}</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.piercings)}</p>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">{t('volunteers.pigmentSpots')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">{t('volunteers.face')}</p>
              <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.tachesPigmentairesVisage)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">{t('volunteers.neck')}</p>
              <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.tachesPigmentairesCou)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">{t('volunteers.neckline')}</p>
              <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.tachesPigmentairesDecollete)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">{t('volunteers.hands')}</p>
              <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.tachesPigmentairesMains)}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">{t('volunteers.stretchMarks')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">{t('volunteers.legs')}</p>
              <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.vergeturesJambes)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">{t('volunteers.buttocksHips')}</p>
              <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.vergeturesFessesHanches)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">{t('volunteers.bellyWaist')}</p>
              <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.vergeturesVentreTaille)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-cyan">{t('volunteers.chestNeckline')}</p>
              <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.vergeturesPoitrineDecollete)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarquesCutaneesSection;
