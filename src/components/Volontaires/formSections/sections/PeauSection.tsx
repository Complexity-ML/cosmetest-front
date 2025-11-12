import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PeauSection = ({ formData, errors, onChange }: any) => (
    <Card>
      <CardHeader>
        <CardTitle>Caractéristiques de la peau</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="typePeau"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Type de peau <span className="text-red-500">*</span>
          </label>
          <select
            id="typePeau"
            name="typePeauVisage"
            value={formData.typePeauVisage || ""}
            onChange={onChange}
            className={`form-select block w-full ${errors.typePeauVisage ? "border-red-500" : ""}`}
            required
          >
            <option value="">Sélectionner</option>
            <option value="Normale">Normale</option>
            <option value="Sèche">Sèche</option>
            <option value="Grasse">Grasse</option>
            <option value="Mixte">Mixte</option>
            <option value="Sensible">Sensible</option>
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
            Carnation
          </label>
          <select
            id="carnation"
            name="carnation"
            value={formData.carnation}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">Sélectionner</option>
            <option value="Très claire">Très claire</option>
            <option value="Claire">Claire</option>
            <option value="Moyenne">Moyenne</option>
            <option value="Mate">Mate</option>
            <option value="Foncée">Foncée</option>
            <option value="Très foncée">Très foncée</option>
          </select>
        </div>
  
        <div>
          <label
            htmlFor="sensibiliteCutanee"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Sensibilité cutanée
          </label>
          <select
            id="sensibiliteCutanee"
            name="sensibiliteCutanee"
            value={formData.sensibiliteCutanee}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">Sélectionner</option>
            <option value="Peau sensible">Peau sensible</option>
            <option value="Peau peu sensible">Peau peu sensible</option>
            <option value="Peau non sensible">Peau non sensible</option>
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
            Teint inhomogène
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
            Teint terne
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
            Pores visibles
          </label>
        </div>
      </div>
      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        Exposition au soleil
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="expositionSolaire"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Exposition solaire
          </label>
          <select
            id="expositionSolaire"
            name="expositionSolaire"
            value={formData.expositionSolaire}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">Sélectionner</option>
            <option value="Faiblement">Faiblement</option>
            <option value="Moyennement">Moyennement</option>
            <option value="Fortement">Fortement</option>
          </select>
        </div>
  
        <div>
          <label
            htmlFor="bronzage"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Bronzage
          </label>
          <select
            id="bronzage"
            name="bronzage"
            value={formData.bronzage}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">Sélectionner</option>
            <option value="Progressif">Progressif</option>
            <option value="Rapide">Rapide</option>
            <option value="Difficile">Difficile</option>
            <option value="Inexistant">Inexistant</option>
          </select>
        </div>
  
        <div>
          <label
            htmlFor="coupsDeSoleil"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Coups de soleil
          </label>
          <select
            id="coupsDeSoleil"
            name="coupsDeSoleil"
            value={formData.coupsDeSoleil}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">Sélectionner</option>
            <option value="Jamais">Jamais</option>
            <option value="Rarement">Rarement</option>
            <option value="Parfois">Parfois</option>
            <option value="Souvent">Souvent</option>
            <option value="Toujours">Toujours</option>
          </select>
        </div>
      </div>
      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        Cellulite
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="celluliteBras"
            name="celluliteBras"
            checked={formData.celluliteBras === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="celluliteBras"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Cellulite bras
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="celluliteFessesHanches"
            name="celluliteFessesHanches"
            checked={formData.celluliteFessesHanches === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="celluliteFessesHanches"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Cellulite fesses/hanches
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="celluliteJambes"
            name="celluliteJambes"
            checked={formData.celluliteJambes === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="celluliteJambes"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Cellulite jambes
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="celluliteVentreTaille"
            name="celluliteVentreTaille"
            checked={formData.celluliteVentreTaille === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="celluliteVentreTaille"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Cellulite ventre/taille
          </label>
        </div>
      </div>
      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        Sécheresse cutanée
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="secheresseLevres"
            name="secheresseLevres"
            checked={formData.secheresseLevres === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="secheresseLevres"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Lèvres
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="secheresseCou"
            name="secheresseCou"
            checked={formData.secheresseCou === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="secheresseCou"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Cou
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="secheressePoitrineDecollete"
            name="secheressePoitrineDecollete"
            checked={formData.secheressePoitrineDecollete === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="secheressePoitrineDecollete"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Poitrine/Décolleté
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="secheresseVentreTaille"
            name="secheresseVentreTaille"
            checked={formData.secheresseVentreTaille === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="secheresseVentreTaille"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Ventre/Taille
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="secheresseFessesHanches"
            name="secheresseFessesHanches"
            checked={formData.secheresseFessesHanches === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="secheresseFessesHanches"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Fesses/Hanches
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="secheresseBras"
            name="secheresseBras"
            checked={formData.secheresseBras === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="secheresseBras"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Bras
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="secheresseMains"
            name="secheresseMains"
            checked={formData.secheresseMains === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="secheresseMains"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Mains
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="secheresseJambes"
            name="secheresseJambes"
            checked={formData.secheresseJambes === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="secheresseJambes"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Jambes
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="secheressePieds"
            name="secheressePieds"
            checked={formData.secheressePieds === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="secheressePieds"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Pieds
          </label>
        </div>
      </div>
      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        Problèmes autour des yeux
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="cernesPigmentaires"
            name="cernesPigmentaires"
            checked={formData.cernesPigmentaires === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="cernesPigmentaires"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Cernes pigmentaires
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="cernesVasculaires"
            name="cernesVasculaires"
            checked={formData.cernesVasculaires === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="cernesVasculaires"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Cernes vasculaires
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="poches"
            name="poches"
            checked={formData.poches === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="poches"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Poches
          </label>
        </div>
      </div>
      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        Perte de fermeté
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="perteDeFermeteVisage"
            name="perteDeFermeteVisage"
            checked={formData.perteDeFermeteVisage === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="perteDeFermeteVisage"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Visage
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="perteDeFermeteCou"
            name="perteDeFermeteCou"
            checked={formData.perteDeFermeteCou === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="perteDeFermeteCou"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Cou
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="perteDeFermeteDecollete"
            name="perteDeFermeteDecollete"
            checked={formData.perteDeFermeteDecollete === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="perteDeFermeteDecollete"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Décolleté
          </label>
        </div>
      </div>
      </CardContent>
    </Card>
  );


export default PeauSection;
