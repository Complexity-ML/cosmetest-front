import { displayValue } from '../../../pages/Volontaires/utils/detailsHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Separator } from '../../ui/separator';

const MesuresSection = ({ volontaireDisplayData }: { volontaireDisplayData: any }) => (
  <Card>
    <CardHeader>
      <CardTitle>Mesures et Scores</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Index d'hydratation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">IH Bras droit</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.ihBrasDroit)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">IH Bras gauche</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.ihBrasGauche)}</p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Scores d'évaluation</h3>
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
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Autres</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-cyan">Nombre de cigarettes par jour</p>
            <p className="text-sm text-gray-900">{displayValue(volontaireDisplayData.nbCigarettesJour)}</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default MesuresSection;
