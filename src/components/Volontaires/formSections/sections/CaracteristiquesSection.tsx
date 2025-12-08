import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const CaracteristiquesSection = ({ formData, onChange }: any) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('volunteers.physicalCharacteristics')}</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="taille"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.height')} (cm)
          </label>
          <input
            type="number"
            id="taille"
            name="taille"
            value={formData.taille}
            onChange={onChange}
            className="form-input block w-full"
          />
        </div>
  
        <div>
          <label
            htmlFor="poids"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.weight')} (kg)
          </label>
          <input
            type="number"
            id="poids"
            name="poids"
            value={formData.poids}
            onChange={onChange}
            className="form-input block w-full"
          />
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
            <option value="I">I - Peau très claire</option>
            <option value="II">II - Peau claire</option>
            <option value="III">III - Peau claire à mate</option>
            <option value="IV">IV - Peau mate</option>
            <option value="V">V - Peau foncée</option>
            <option value="VI">VI - Peau noire</option>
          </select>
        </div>
  
        <div>
          <label
            htmlFor="ethnie"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.ethnicity')}
          </label>
          <select
            id="ethnie"
            name="ethnie"
            value={formData.ethnie}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">{t('common.select')}</option>
            <option value="CAUCASIEN">Caucasien(ne)</option>
            <option value="Caucasienne">Caucasienne</option>
            <option value="AFRICAIN">Africain(e)</option>
            <option value="Africaine">Africaine</option>
            <option value="ASIATIQUE">Asiatique</option>
            <option value="HISPANIQUE">Hispanique</option>
            <option value="MOYEN_ORIENT">Moyen-Orient</option>
            <option value="AUTRE">Autre</option>
          </select>
        </div>
  
        <div>
          <label
            htmlFor="sousEthnie"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.subEthnicity')}
          </label>
          <input
            type="text"
            id="sousEthnie"
            name="sousEthnie"
            value={formData.sousEthnie}
            onChange={onChange}
            className="form-input block w-full"
          />
        </div>
  
        <div>
          <label
            htmlFor="yeux"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.eyeColor')}
          </label>
          <select
            id="yeux"
            name="yeux"
            value={formData.yeux}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">{t('common.select')}</option>
            <option value="Bleus">Bleus</option>
            <option value="Verts">Verts</option>
            <option value="Marrons">Marrons</option>
            <option value="Noisette">Noisette</option>
            <option value="Gris">Gris</option>
            <option value="Noirs">Noirs</option>
          </select>
        </div>
  
        <div>
          <label
            htmlFor="pilosite"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.hairiness')}
          </label>
          <select
            id="pilosite"
            name="pilosite"
            value={formData.pilosite}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">{t('common.select')}</option>
            <option value="Faible_pilosite">Faible pilosité</option>
            <option value="Moyenne_pilosite">Pilosité moyenne</option>
            <option value="Forte_pilosite">Forte pilosité</option>
          </select>
        </div>
  
        <div>
          <label
            htmlFor="originePere"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.fatherOrigin')}
          </label>
          <input
            type="text"
            id="originePere"
            name="originePere"
            value={formData.originePere}
            onChange={onChange}
            className="form-input block w-full"
          />
        </div>
  
        <div>
          <label
            htmlFor="origineMere"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.motherOrigin')}
          </label>
          <input
            type="text"
            id="origineMere"
            name="origineMere"
            value={formData.origineMere}
            onChange={onChange}
            className="form-input block w-full"
          />
        </div>
      </div>
      </CardContent>
    </Card>
  );
};

export default CaracteristiquesSection;
