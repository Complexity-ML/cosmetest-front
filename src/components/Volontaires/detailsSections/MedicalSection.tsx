import { useTranslation } from 'react-i18next';
import { displayValue, displayYesNo } from '../../../pages/Volontaires/utils/detailsHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';

const MedicalSection = ({ volontaireDisplayData }: { volontaireDisplayData: any }) => {
  const { t } = useTranslation();

  return (
  <Card>
    <CardHeader>
      <CardTitle>{t('volunteers.medicalInformation')}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium text-brand-cyan">{t('volunteers.currentTreatment')}</p>
        <p className="text-sm text-gray-900 whitespace-pre-line">
          {displayValue(volontaireDisplayData.traitement)}
        </p>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-brand-cyan">{t('volunteers.anamnesis')}</p>
        <p className="text-sm text-gray-900 whitespace-pre-line">
          {displayValue(volontaireDisplayData.anamnese)}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">{t('volunteers.contraception')}</p>
          <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.contraception)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">{t('volunteers.menopause')}</p>
          <p className="text-sm text-gray-900">{displayYesNo(volontaireDisplayData.menopause)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-cyan">{t('volunteers.compatibleHealth')}</p>
          <div className="mt-1">
            {volontaireDisplayData.santeCompatible ? (
              <Badge variant="default" className="bg-green-500">{t('common.yes')}</Badge>
            ) : (
              <Badge variant="destructive">{t('common.no')}</Badge>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-brand-cyan">{t('volunteers.knownAllergies')}</p>
        <p className="text-sm text-gray-900 whitespace-pre-line">
          {displayValue(volontaireDisplayData.allergiesCommentaires)}
        </p>
      </div>
    </CardContent>
  </Card>
  );
};

export default MedicalSection;
