import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const MesuresSection = ({ formData, onChange }: any) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('volunteers.measurementsAndScores')}</CardTitle>
      </CardHeader>
      <CardContent>

      <h3 className="text-md font-medium text-gray-800 mt-2 mb-3">
        {t('volunteers.hydrationIndex')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="ihBrasDroit"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.hiRightArm')}
          </label>
          <input
            type="number"
            step="0.01"
            id="ihBrasDroit"
            name="ihBrasDroit"
            value={formData.ihBrasDroit}
            onChange={onChange}
            className="form-input block w-full"
          />
        </div>

        <div>
          <label
            htmlFor="ihBrasGauche"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.hiLeftArm')}
          </label>
          <input
            type="number"
            step="0.01"
            id="ihBrasGauche"
            name="ihBrasGauche"
            value={formData.ihBrasGauche}
            onChange={onChange}
            className="form-input block w-full"
          />
        </div>
      </div>

      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        {t('volunteers.evaluationScores')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label
            htmlFor="scorePod"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Score POD
          </label>
          <input
            type="number"
            step="0.1"
            id="scorePod"
            name="scorePod"
            value={formData.scorePod}
            onChange={onChange}
            className="form-input block w-full"
          />
        </div>

        <div>
          <label
            htmlFor="scorePog"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Score POG
          </label>
          <input
            type="number"
            step="0.1"
            id="scorePog"
            name="scorePog"
            value={formData.scorePog}
            onChange={onChange}
            className="form-input block w-full"
          />
        </div>

        <div>
          <label
            htmlFor="scoreFront"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Score Front
          </label>
          <input
            type="number"
            step="0.1"
            id="scoreFront"
            name="scoreFront"
            value={formData.scoreFront}
            onChange={onChange}
            className="form-input block w-full"
          />
        </div>

        <div>
          <label
            htmlFor="scoreLion"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Score Lion
          </label>
          <input
            type="number"
            step="0.1"
            id="scoreLion"
            name="scoreLion"
            value={formData.scoreLion}
            onChange={onChange}
            className="form-input block w-full"
          />
        </div>

        <div>
          <label
            htmlFor="scorePpd"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Score PPD
          </label>
          <input
            type="number"
            step="0.1"
            id="scorePpd"
            name="scorePpd"
            value={formData.scorePpd}
            onChange={onChange}
            className="form-input block w-full"
          />
        </div>

        <div>
          <label
            htmlFor="scorePpg"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Score PPG
          </label>
          <input
            type="number"
            step="0.1"
            id="scorePpg"
            name="scorePpg"
            value={formData.scorePpg}
            onChange={onChange}
            className="form-input block w-full"
          />
        </div>

        <div>
          <label
            htmlFor="scoreDod"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Score DOD
          </label>
          <input
            type="number"
            step="0.1"
            id="scoreDod"
            name="scoreDod"
            value={formData.scoreDod}
            onChange={onChange}
            className="form-input block w-full"
          />
        </div>

        <div>
          <label
            htmlFor="scoreDog"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Score DOG
          </label>
          <input
            type="number"
            step="0.1"
            id="scoreDog"
            name="scoreDog"
            value={formData.scoreDog}
            onChange={onChange}
            className="form-input block w-full"
          />
        </div>

        <div>
          <label
            htmlFor="scoreSngd"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Score SNGD
          </label>
          <input
            type="number"
            step="0.1"
            id="scoreSngd"
            name="scoreSngd"
            value={formData.scoreSngd}
            onChange={onChange}
            className="form-input block w-full"
          />
        </div>

        <div>
          <label
            htmlFor="scoreSngg"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Score SNGG
          </label>
          <input
            type="number"
            step="0.1"
            id="scoreSngg"
            name="scoreSngg"
            value={formData.scoreSngg}
            onChange={onChange}
            className="form-input block w-full"
          />
        </div>

        <div>
          <label
            htmlFor="scoreLevsup"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Score LEVSUP
          </label>
          <input
            type="number"
            step="0.1"
            id="scoreLevsup"
            name="scoreLevsup"
            value={formData.scoreLevsup}
            onChange={onChange}
            className="form-input block w-full"
          />
        </div>

        <div>
          <label
            htmlFor="scoreComlevd"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Score COMLEVD
          </label>
          <input
            type="number"
            step="0.1"
            id="scoreComlevd"
            name="scoreComlevd"
            value={formData.scoreComlevd}
            onChange={onChange}
            className="form-input block w-full"
          />
        </div>

        <div>
          <label
            htmlFor="scoreComlevg"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Score COMLEVG
          </label>
          <input
            type="number"
            step="0.1"
            id="scoreComlevg"
            name="scoreComlevg"
            value={formData.scoreComlevg}
            onChange={onChange}
            className="form-input block w-full"
          />
        </div>

        <div>
          <label
            htmlFor="scorePtose"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Score PTOSE
          </label>
          <input
            type="number"
            step="0.1"
            id="scorePtose"
            name="scorePtose"
            value={formData.scorePtose}
            onChange={onChange}
            className="form-input block w-full"
          />
        </div>

        <div>
          <label
            htmlFor="ita"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Score ITA
          </label>
          <input
            type="number"
            step="0.1"
            id="ita"
            name="ita"
            value={formData.ita}
            onChange={onChange}
            className="form-input block w-full"
          />
        </div>
      </div>

      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        {t('volunteers.others')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="nbCigarettesJour"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.cigarettesPerDay')}
          </label>
          <input
            type="text"
            id="nbCigarettesJour"
            name="nbCigarettesJour"
            value={formData.nbCigarettesJour}
            onChange={onChange}
            className="form-input block w-full"
          />
        </div>
      </div>
      </CardContent>
    </Card>
  );
};

export default MesuresSection;
