import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MedicalSection = ({ formData, onChange }: any) => (
    <Card>
      <CardHeader>
        <CardTitle>Informations médicales</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="traitement"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Traitement en cours
          </label>
          <textarea
            id="traitement"
            name="traitement"
            rows={2}
            value={formData.traitement}
            onChange={onChange}
            className="form-textarea block w-full"
            placeholder="Traitements médicaux en cours"
          />
        </div>
  
        <div>
          <label
            htmlFor="anamnese"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Anamnèse
          </label>
          <textarea
            id="anamnese"
            name="anamnese"
            rows={2}
            value={formData.anamnese}
            onChange={onChange}
            className="form-textarea block w-full"
            placeholder="Antécédents médicaux"
          />
        </div>
  
        <div>
          <label
            htmlFor="contraception"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Contraception
          </label>
          <select
            id="contraception"
            name="contraception"
            value={formData.contraception}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="">Sélectionner</option>
            <option value="Pilule">Pilule</option>
            <option value="Stérilet">Stérilet</option>
            <option value="Implant">Implant</option>
            <option value="Patch">Patch</option>
            <option value="Anneau vaginal">Anneau vaginal</option>
            <option value="Préservatif">Préservatif</option>
            <option value="Autre">Autre</option>
            <option value="Aucune">Aucune</option>
            <option value="Abstinence">Abstinence</option>
          </select>
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            id="menopause"
            name="menopause"
            checked={formData.menopause === "Oui"}
            onChange={onChange}
            className="form-checkbox h-5 w-5 text-primary-600"
          />
          <label
            htmlFor="menopause"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Ménopause
          </label>
        </div>
  
        <div className="md:col-span-2">
          <label
            htmlFor="allergiesCommentaires"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Allergies connues
          </label>
          <textarea
            id="allergiesCommentaires"
            name="allergiesCommentaires"
            rows={2}
            value={formData.allergiesCommentaires}
            onChange={onChange}
            className="form-textarea block w-full"
            placeholder="Allergies connues (médicaments, aliments, autres substances)"
          />
        </div>
  
        <div>
          <label
            htmlFor="santeCompatible"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Santé compatible
          </label>
          <select
            id="santeCompatible"
            name="santeCompatible"
            value={formData.santeCompatible}
            onChange={onChange}
            className="form-select block w-full"
          >
            <option value="Oui">Oui</option>
            <option value="Non">Non</option>
          </select>
        </div>
      </div>
      </CardContent>
    </Card>
  );
  
export default MedicalSection;
