import { useTranslation } from 'react-i18next';
import { formatSkinType } from '../../../utils/formatters';
import { displayValue, displayYesNo } from '../../../pages/Volontaires/utils/detailsHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Separator } from '../../ui/separator';

const PeauSection = ({ volontaireDisplayData }: { volontaireDisplayData: any }) => {
  const { t } = useTranslation();

  return (
  <Card>
    <CardHeader>
      <CardTitle>{t('volunteers.skinCharacteristics')}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">{t('volunteers.skinType')}</p>
          <p className="text-sm text-gray-900">
            {formatSkinType(volontaireDisplayData.typePeauVisage) || '-'}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">{t('volunteers.complexion')}</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.carnation)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">{t('volunteers.phototype')}</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.phototype)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">{t('volunteers.skinSensitivity')}</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.sensibiliteCutanee)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">{t('volunteers.unevenComplexion')}</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.teintInhomogene)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">{t('volunteers.dullComplexion')}</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.teintTerne)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">{t('volunteers.visiblePores')}</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.poresVisibles)}</p>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">{t('volunteers.sunExposure')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.solarExposure')}</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.expositionSolaire)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.tanning')}</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.bronzage)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.sunburn')}</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.coupsDeSoleil)}</p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">{t('volunteers.cellulite')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Aucun</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.celluliteAucun)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.arms')}</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.celluliteBras)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.buttocksHips')}</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.celluliteFessesHanches)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.legs')}</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.celluliteJambes)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.bellyWaist')}</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.celluliteVentreTaille)}</p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">{t('volunteers.skinDryness')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Aucun</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.secheresseAucun)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.lips')}</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.secheresseLevres)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.neck')}</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.secheresseCou)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.chestNeckline')}</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.secheressePoitrineDecollete)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.bellyWaist')}</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.secheresseVentreTaille)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.buttocksHips')}</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.secheresseFessesHanches)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.arms')}</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.secheresseBras)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.hands')}</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.secheresseMains)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.legs')}</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.secheresseJambes)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.feet')}</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.secheressePieds)}</p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">{t('volunteers.eyeProblems')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Aucun</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.yeuxAucun)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.pigmentaryCircles')}</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.cernesPigmentaires)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.vascularCircles')}</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.cernesVasculaires)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.bags')}</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.poches)}</p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">{t('volunteers.lossOfFirmness')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Aucun</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.fermeteAucun)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.face')}</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.perteDeFermeteVisage)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.neck')}</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.perteDeFermeteCou)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.neckline')}</p>
            <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.perteDeFermeteDecollete)}</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
  );
};

export default PeauSection;
