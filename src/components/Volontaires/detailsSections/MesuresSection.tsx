import { useTranslation } from 'react-i18next';
import { displayValue } from '../../../pages/Volontaires/utils/detailsHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Separator } from '../../ui/separator';

const MesuresSection = ({ volontaireDisplayData }: { volontaireDisplayData: any }) => {
  const { t } = useTranslation();

  return (
  <Card>
    <CardHeader>
      <CardTitle>{t('volunteers.measurementsAndScores')}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">{t('volunteers.hydrationIndex')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.hiRightArm')}</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.ihBrasDroit)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.hiLeftArm')}</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.ihBrasGauche)}</p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">{t('volunteers.evaluationScores')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Score POD</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.scorePod)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Score POG</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.scorePog)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Score Front</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.scoreFront)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Score Lion</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.scoreLion)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Score PPD</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.scorePpd)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Score PPG</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.scorePpg)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Score DOD</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.scoreDod)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Score DOG</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.scoreDog)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Score SNGD</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.scoreSngd)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Score SNGG</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.scoreSngg)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Score LEVSUP</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.scoreLevsup)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Score COMLEVD</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.scoreComlevd)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Score COMLEVG</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.scoreComlevg)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Score PTOSE</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.scorePtose)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Score ITA</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.ita)}</p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">{t('volunteers.others')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">{t('volunteers.cigarettesPerDay')}</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.nbCigarettesJour)}</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
  );
};

export default MesuresSection;
