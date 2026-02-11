import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useCallback } from "react";

const createSyntheticEvent = (name: string, value: string) => ({
  target: { name, value, type: 'text' }
} as any);

const PeauSection = ({ formData, errors, onChange }: any) => {
  const { t } = useTranslation();

  const handleNoneToggle = useCallback((
    groupIds: string[],
    noneId: string,
    clickedId: string,
    isCurrentlyChecked: boolean,
  ) => {
    if (clickedId === noneId) {
      if (!isCurrentlyChecked) {
        groupIds.forEach(id => {
          if (id !== noneId && formData[id] === 'Oui') {
            onChange(createSyntheticEvent(id, ''));
          }
        });
        onChange(createSyntheticEvent(noneId, 'Oui'));
      } else {
        onChange(createSyntheticEvent(noneId, ''));
      }
    } else {
      if (!isCurrentlyChecked && formData[noneId] === 'Oui') {
        onChange(createSyntheticEvent(noneId, ''));
      }
      onChange(createSyntheticEvent(clickedId, isCurrentlyChecked ? '' : 'Oui'));
    }
  }, [formData, onChange]);

  const celluliteIds = ['celluliteBras', 'celluliteFessesHanches', 'celluliteJambes', 'celluliteVentreTaille', 'celluliteAucun'];
  const secheresseIds = ['secheresseLevres', 'secheresseCou', 'secheressePoitrineDecollete', 'secheresseVentreTaille', 'secheresseFessesHanches', 'secheresseBras', 'secheresseMains', 'secheresseJambes', 'secheressePieds', 'secheresseAucun'];
  const yeuxIds = ['cernesPigmentaires', 'cernesVasculaires', 'poches', 'yeuxAucun'];
  const fermeteIds = ['perteDeFermeteVisage', 'perteDeFermeteCou', 'perteDeFermeteDecollete', 'perteDeFermeteAvantBras', 'fermeteAucun'];

  const NoneCheckbox = ({ groupIds, noneId }: { groupIds: string[], noneId: string }) => (
    <div className="flex items-center col-span-full">
      <input
        type="checkbox"
        id={noneId}
        name={noneId}
        checked={formData[noneId] === "Oui"}
        onChange={() => handleNoneToggle(groupIds, noneId, noneId, formData[noneId] === "Oui")}
        className="form-checkbox h-5 w-5 text-primary-600"
      />
      <label htmlFor={noneId} className="ml-2 block text-sm font-medium text-gray-700">
        Aucun
      </label>
    </div>
  );

  const GroupCheckbox = ({ id, label, groupIds, noneId }: { id: string, label: string, groupIds: string[], noneId: string }) => (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={id}
        name={id}
        checked={formData[id] === "Oui"}
        onChange={() => handleNoneToggle(groupIds, noneId, id, formData[id] === "Oui")}
        className="form-checkbox h-5 w-5 text-primary-600"
      />
      <label htmlFor={id} className="ml-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('volunteers.skinCharacteristics')}</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="typePeau"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.skinType')} <span className="text-red-500">*</span>
          </label>
          <select
            id="typePeau"
            name="typePeauVisage"
            value={formData.typePeauVisage || ""}
            onChange={onChange}
            className={`form-select block w-full ${errors.typePeauVisage ? "border-red-500" : ""}`}
            required
          >
            <option value="">{t('common.select')}</option>
            <option value="Normale">{t('volunteers.skinTypeOptions.Normale')}</option>
            <option value="Sèche">{t('volunteers.skinTypeOptions.Sèche')}</option>
            <option value="Grasse">{t('volunteers.skinTypeOptions.Grasse')}</option>
            <option value="Mixte">{t('volunteers.skinTypeOptions.Mixte')}</option>
            <option value="Mixte à tendance grasse">{t('volunteers.skinTypeOptions.Mixte à tendance grasse')}</option>
            <option value="Mixte à tendance sèche">{t('volunteers.skinTypeOptions.Mixte à tendance sèche')}</option>
            <option value="Sensible">{t('volunteers.skinTypeOptions.Sensible')}</option>
          </select>
          {errors.typePeauVisage && (
            <p className="mt-1 text-sm text-red-500">{errors.typePeauVisage}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="carnation"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.complexion')}
          </label>
          <select
            id="carnation"
            name="carnation"
            value={formData.carnation}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">{t('common.select')}</option>
            <option value="Très claire">{t('volunteers.complexionOptions.Très claire')}</option>
            <option value="Claire">{t('volunteers.complexionOptions.Claire')}</option>
            <option value="Moyenne">{t('volunteers.complexionOptions.Moyenne')}</option>
            <option value="Mate">{t('volunteers.complexionOptions.Mate')}</option>
            <option value="Foncée">{t('volunteers.complexionOptions.Foncée')}</option>
            <option value="Très foncée">{t('volunteers.complexionOptions.Très foncée')}</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="phototype"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.phototype')}
          </label>
          <select
            id="phototype"
            name="phototype"
            value={formData.phototype}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">{t('common.select')}</option>
            <option value="I">{t('volunteers.phototypeOptions.I')}</option>
            <option value="II">{t('volunteers.phototypeOptions.II')}</option>
            <option value="III">{t('volunteers.phototypeOptions.III')}</option>
            <option value="IV">{t('volunteers.phototypeOptions.IV')}</option>
            <option value="V">{t('volunteers.phototypeOptions.V')}</option>
            <option value="VI">{t('volunteers.phototypeOptions.VI')}</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="sensibiliteCutanee"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.skinSensitivity')}
          </label>
          <select
            id="sensibiliteCutanee"
            name="sensibiliteCutanee"
            value={formData.sensibiliteCutanee}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">{t('common.select')}</option>
            <option value="Peau sensible">{t('volunteers.skinSensitivityOptions.Peau sensible')}</option>
            <option value="Peau non sensible">{t('volunteers.skinSensitivityOptions.Peau non sensible')}</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="teintInhomogene"
            name="teintInhomogene"
            checked={formData.teintInhomogene === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="teintInhomogene"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            {t('volunteers.unevenComplexion')}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="teintTerne"
            name="teintTerne"
            checked={formData.teintTerne === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="teintTerne"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            {t('volunteers.dullComplexion')}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="poresVisibles"
            name="poresVisibles"
            checked={formData.poresVisibles === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="poresVisibles"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            {t('volunteers.visiblePores')}
          </label>
        </div>
      </div>
      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        {t('volunteers.sunExposure')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="expositionSolaire"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.sunExposure')}
          </label>
          <select
            id="expositionSolaire"
            name="expositionSolaire"
            value={formData.expositionSolaire}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">{t('common.select')}</option>
            <option value="Faiblement">{t('volunteers.sunExposureOptions.Faiblement')}</option>
            <option value="Moyennement">{t('volunteers.sunExposureOptions.Moyennement')}</option>
            <option value="Fortement">{t('volunteers.sunExposureOptions.Fortement')}</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="bronzage"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.tanning')}
          </label>
          <select
            id="bronzage"
            name="bronzage"
            value={formData.bronzage}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">{t('common.select')}</option>
            <option value="Progressif">{t('volunteers.tanningOptions.Progressif')}</option>
            <option value="Rapide">{t('volunteers.tanningOptions.Rapide')}</option>
            <option value="Difficile">{t('volunteers.tanningOptions.Difficile')}</option>
            <option value="Inexistant">{t('volunteers.tanningOptions.Inexistant')}</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="coupsDeSoleil"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.sunburns')}
          </label>
          <select
            id="coupsDeSoleil"
            name="coupsDeSoleil"
            value={formData.coupsDeSoleil}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">{t('common.select')}</option>
            <option value="Jamais">{t('volunteers.sunburnOptions.Jamais')}</option>
            <option value="Rarement">{t('volunteers.sunburnOptions.Rarement')}</option>
            <option value="Parfois">{t('volunteers.sunburnOptions.Parfois')}</option>
            <option value="Souvent">{t('volunteers.sunburnOptions.Souvent')}</option>
            <option value="Toujours">{t('volunteers.sunburnOptions.Toujours')}</option>
          </select>
        </div>
      </div>
      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        {t('volunteers.cellulite')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NoneCheckbox groupIds={celluliteIds} noneId="celluliteAucun" />
        <GroupCheckbox id="celluliteBras" label={t('volunteers.celluliteArms')} groupIds={celluliteIds} noneId="celluliteAucun" />
        <GroupCheckbox id="celluliteFessesHanches" label={t('volunteers.celluliteButtocksHips')} groupIds={celluliteIds} noneId="celluliteAucun" />
        <GroupCheckbox id="celluliteJambes" label={t('volunteers.celluliteLegs')} groupIds={celluliteIds} noneId="celluliteAucun" />
        <GroupCheckbox id="celluliteVentreTaille" label={t('volunteers.celluliteBellyWaist')} groupIds={celluliteIds} noneId="celluliteAucun" />
      </div>
      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        {t('volunteers.skinDryness')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NoneCheckbox groupIds={secheresseIds} noneId="secheresseAucun" />
        <GroupCheckbox id="secheresseLevres" label={t('volunteers.lips')} groupIds={secheresseIds} noneId="secheresseAucun" />
        <GroupCheckbox id="secheresseCou" label={t('volunteers.neck')} groupIds={secheresseIds} noneId="secheresseAucun" />
        <GroupCheckbox id="secheressePoitrineDecollete" label={t('volunteers.chestNeckline')} groupIds={secheresseIds} noneId="secheresseAucun" />
        <GroupCheckbox id="secheresseVentreTaille" label={t('volunteers.bellyWaist')} groupIds={secheresseIds} noneId="secheresseAucun" />
        <GroupCheckbox id="secheresseFessesHanches" label={t('volunteers.buttocksHips')} groupIds={secheresseIds} noneId="secheresseAucun" />
        <GroupCheckbox id="secheresseBras" label={t('volunteers.arms')} groupIds={secheresseIds} noneId="secheresseAucun" />
        <GroupCheckbox id="secheresseMains" label={t('volunteers.hands')} groupIds={secheresseIds} noneId="secheresseAucun" />
        <GroupCheckbox id="secheresseJambes" label={t('volunteers.legs')} groupIds={secheresseIds} noneId="secheresseAucun" />
        <GroupCheckbox id="secheressePieds" label={t('volunteers.feet')} groupIds={secheresseIds} noneId="secheresseAucun" />
      </div>
      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        {t('volunteers.eyeProblems')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NoneCheckbox groupIds={yeuxIds} noneId="yeuxAucun" />
        <GroupCheckbox id="cernesPigmentaires" label={t('volunteers.pigmentaryCircles')} groupIds={yeuxIds} noneId="yeuxAucun" />
        <GroupCheckbox id="cernesVasculaires" label={t('volunteers.vascularCircles')} groupIds={yeuxIds} noneId="yeuxAucun" />
        <GroupCheckbox id="poches" label={t('volunteers.bags')} groupIds={yeuxIds} noneId="yeuxAucun" />
      </div>
      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        {t('volunteers.lossOfFirmness')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NoneCheckbox groupIds={fermeteIds} noneId="fermeteAucun" />
        <GroupCheckbox id="perteDeFermeteVisage" label={t('volunteers.face')} groupIds={fermeteIds} noneId="fermeteAucun" />
        <GroupCheckbox id="perteDeFermeteCou" label={t('volunteers.neck')} groupIds={fermeteIds} noneId="fermeteAucun" />
        <GroupCheckbox id="perteDeFermeteDecollete" label={t('volunteers.neckline')} groupIds={fermeteIds} noneId="fermeteAucun" />
        <GroupCheckbox id="perteDeFermeteAvantBras" label="Avant-bras" groupIds={fermeteIds} noneId="fermeteAucun" />
      </div>
      </CardContent>
    </Card>
  );
};

export default PeauSection;
