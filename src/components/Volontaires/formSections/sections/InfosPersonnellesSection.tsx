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

const InfosPersonnellesSection: React.FC<InfosPersonnellesSectionProps> = ({ formData, errors, onChange, volontaireId }) => (
  <Card>
    <CardHeader>
      <CardTitle>
        Informations personnelles {volontaireId ? `#${volontaireId}` : ""}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="titre">
            Titre
          </Label>
          <Select
            value={formData.titre}
            onValueChange={(value) => onChange({ target: { name: 'titre', value } } as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Madame">Madame</SelectItem>
              <SelectItem value="Monsieur">Monsieur</SelectItem>
              <SelectItem value="Autre">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
  
        <div>
          <Label htmlFor="nom">
            Nom <span className="text-red-500">*</span>
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
            Prénom <span className="text-red-500">*</span>
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
            Email <span className="text-red-500">*</span>
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
            Téléphone portable
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
            Téléphone fixe
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
            Date de naissance
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
            Sexe <span className="text-red-500">*</span>
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
            <option value="">Sélectionner</option>
            <option value="Masculin">Masculin</option>
            <option value="Féminin">Féminin</option>
            <option value="O">Autre</option>
          </select>
          {errors.sexe && (
            <p className="mt-1 text-sm text-red-500">{errors.sexe}</p>
          )}
        </div>
      </div>
  
      {/* Section Adresse */}
      <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-4">
        Adresse
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label
            htmlFor="adresse"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Adresse
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
            Code postal
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
            Ville
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
            Pays
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
  

export default InfosPersonnellesSection;
