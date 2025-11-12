import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProblemesSection = ({ formData, onChange }: any) => (
    <Card>
      <CardHeader>
        <CardTitle>Problèmes spécifiques</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="acne"
            name="acne"
            checked={formData.acne === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="acne"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Acné
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="couperoseRosacee"
            name="couperoseRosacee"
            checked={formData.couperoseRosacee === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="couperoseRosacee"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Couperose / Rosacée
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="dermiteSeborrheique"
            name="dermiteSeborrheique"
            checked={formData.dermiteSeborrheique === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="dermiteSeborrheique"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Dermite séborrhéique
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="eczema"
            name="eczema"
            checked={formData.eczema === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="eczema"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Eczéma
          </label>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="psoriasis"
            name="psoriasis"
            checked={formData.psoriasis === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="psoriasis"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Psoriasis
          </label>
        </div>
      </div>
      </CardContent>
    </Card>
  );


export default ProblemesSection;
