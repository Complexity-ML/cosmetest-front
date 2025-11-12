import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MarquesCutaneesSection = ({ formData, onChange }: any) => (
    <Card>
      <CardHeader>
        <CardTitle>Marques cutanées</CardTitle>
      </CardHeader>
      <CardContent>
  
      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        Caractéristiques
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="cicatrices"
            name="cicatrices"
            checked={formData.cicatrices === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="cicatrices"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Cicatrices
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="tatouages"
            name="tatouages"
            checked={formData.tatouages === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="tatouages"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Tatouages
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="piercings"
            name="piercings"
            checked={formData.piercings === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="piercings"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Piercings
          </label>
        </div>
      </div>
  
      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        Taches pigmentaires
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="tachesPigmentairesVisage"
            name="tachesPigmentairesVisage"
            checked={formData.tachesPigmentairesVisage === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="tachesPigmentairesVisage"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Visage
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="tachesPigmentairesCou"
            name="tachesPigmentairesCou"
            checked={formData.tachesPigmentairesCou === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="tachesPigmentairesCou"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Cou
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="tachesPigmentairesDecollete"
            name="tachesPigmentairesDecollete"
            checked={formData.tachesPigmentairesDecollete === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="tachesPigmentairesDecollete"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Décolleté
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="tachesPigmentairesMains"
            name="tachesPigmentairesMains"
            checked={formData.tachesPigmentairesMains === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="tachesPigmentairesMains"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Mains
          </label>
        </div>
      </div>
  
      <h3 className="text-md font-medium text-gray-800 mt-6 mb-3">
        Vergetures
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="vergeturesJambes"
            name="vergeturesJambes"
            checked={formData.vergeturesJambes === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="vergeturesJambes"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Jambes
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="vergeturesFessesHanches"
            name="vergeturesFessesHanches"
            checked={formData.vergeturesFessesHanches === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="vergeturesFessesHanches"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Fesses/Hanches
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="vergeturesVentreTaille"
            name="vergeturesVentreTaille"
            checked={formData.vergeturesVentreTaille === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="vergeturesVentreTaille"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Ventre/Taille
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="vergeturesPoitrineDecollete"
            name="vergeturesPoitrineDecollete"
            checked={formData.vergeturesPoitrineDecollete === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="vergeturesPoitrineDecollete"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Poitrine/Décolleté
          </label>
        </div>
      </div>
      </CardContent>
    </Card>
  );
  
export default MarquesCutaneesSection;
