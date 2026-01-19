import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface FormData {
  titre: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  telephoneDomicile: string;
  dateNaissance: string;
  sexe: string;
  adresse: string;
  codePostal: string;
  ville: string;
  pays: string;
  [key: string]: any;
}

interface Errors {
  nom?: string;
  prenom?: string;
  email?: string;
  sexe?: string;
  codePostal?: string;
  [key: string]: string | undefined;
}

interface InfosPersonnellesSectionProps {
  formData: FormData;
  errors: Errors;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  volontaireId?: number | string | null;
}

const InfosPersonnellesSection: React.FC<InfosPersonnellesSectionProps> = ({ formData, errors, onChange, volontaireId }) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('volunteers.personalInformation')} {volontaireId ? `#${volontaireId}` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="titre">
              {t('volunteers.title')}
            </Label>
            <Select
              value={formData.titre}
              onValueChange={(value) => onChange({ target: { name: 'titre', value } } as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('common.select')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Madame">{t('volunteers.titleOptions.Madame')}</SelectItem>
                <SelectItem value="Monsieur">{t('volunteers.titleOptions.Monsieur')}</SelectItem>
                <SelectItem value="Autre">{t('volunteers.titleOptions.Autre')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="nom">
              {t('volunteers.lastName')} <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={onChange}
              className={errors.nom ? "border-red-500" : ""}
              required
            />
            {errors.nom && (
              <p className="mt-1 text-sm text-red-500">{errors.nom}</p>
            )}
          </div>

          <div>
            <Label htmlFor="prenom">
              {t('volunteers.firstName')} <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              id="prenom"
              name="prenom"
              value={formData.prenom}
              onChange={onChange}
              className={errors.prenom ? "border-red-500" : ""}
              required
            />
            {errors.prenom && (
              <p className="mt-1 text-sm text-red-500">{errors.prenom}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">
              {t('volunteers.email')} <span className="text-red-500">*</span>
            </Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              className={errors.email ? "border-red-500" : ""}
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="telephone">
              {t('volunteers.mobilePhone')}
            </Label>
            <Input
              type="tel"
              id="telephone"
              name="telephone"
              value={formData.telephone}
              onChange={onChange}
            />
          </div>

          <div>
            <Label htmlFor="telephoneDomicile">
              {t('volunteers.landlinePhone')}
            </Label>
            <Input
              type="tel"
              id="telephoneDomicile"
              name="telephoneDomicile"
              value={formData.telephoneDomicile}
              onChange={onChange}
            />
          </div>

          <div>
            <label
              htmlFor="dateNaissance"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('volunteers.birthDate')}
            </label>
            <input
              type="date"
              id="dateNaissance"
              name="dateNaissance"
              value={formData.dateNaissance}
              onChange={onChange}
              className="form-input block w-full"
            />
          </div>

          <div>
            <label
              htmlFor="sexe"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('volunteers.gender')} <span className="text-red-500">*</span>
            </label>
            <select
              id="sexe"
              name="sexe"
              value={formData.sexe}
              onChange={onChange}
              className={`form-select block w-full ${errors.sexe ? "border-red-500" : ""
                }`}
              required
            >
              <option value="">{t('common.select')}</option>
              <option value="Masculin">{t('volunteers.genderOptions.Masculin')}</option>
              <option value="Féminin">{t('volunteers.genderOptions.Féminin')}</option>
              <option value="O">{t('volunteers.genderOptions.O')}</option>
            </select>
            {errors.sexe && (
              <p className="mt-1 text-sm text-red-500">{errors.sexe}</p>
            )}
          </div>
        </div>

        {/* Section Adresse */}
        <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-4">
          {t('volunteers.address')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label
              htmlFor="adresse"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('volunteers.address')}
            </label>
            <input
              type="text"
              id="adresse"
              name="adresse"
              value={formData.adresse}
              onChange={onChange}
              className="form-input block w-full"
            />
          </div>

          <div>
            <label
              htmlFor="codePostal"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('volunteers.postalCode')}
            </label>
            <input
              type="text"
              id="codePostal"
              name="codePostal"
              value={formData.codePostal}
              onChange={onChange}
              className={`form-input block w-full ${errors.codePostal ? "border-red-500" : ""
                }`}
            />
            {errors.codePostal && (
              <p className="mt-1 text-sm text-red-500">
                {errors.codePostal}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="ville"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('volunteers.city')}
            </label>
            <input
              type="text"
              id="ville"
              name="ville"
              value={formData.ville}
              onChange={onChange}
              className="form-input block w-full"
            />
          </div>

          <div>
            <Label htmlFor="pays">
              {t('volunteers.country')}
            </Label>
            <Input
              type="text"
              id="pays"
              name="pays"
              value={formData.pays}
              onChange={onChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfosPersonnellesSection;
