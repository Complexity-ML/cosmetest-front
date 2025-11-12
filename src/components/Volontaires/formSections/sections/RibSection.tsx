import infoBancaireService from '../../../../services/infoBancaireService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RibSection = ({ formData, errors, onChange }: any) => (
    <Card>
      <CardHeader>
        <CardTitle>Informations bancaires (RIB)</CardTitle>
      </CardHeader>
      <CardContent>
  
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Informations optionnelles</strong> - Ces informations ne sont pas obligatoires.
              Elles peuvent être utiles pour les remboursements ou paiements éventuels.
            </p>
          </div>
        </div>
      </div>
  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="iban"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            IBAN
          </label>
          <input
            type="text"
            id="iban"
            name="iban"
            value={formData.iban}
            onChange={(e) => {
              // Formatage automatique de l'IBAN pendant la saisie
              const formatted = infoBancaireService.validation.formatIban(e.target.value);
              onChange({
                target: {
                  name: 'iban',
                  value: formatted
                }
              });
            }}
            className={`form-input block w-full ${errors.iban ? "border-red-500" : ""}`}
            placeholder="FR76 1234 5678 9012 3456 7890 123"
            maxLength={34}
          />
          {errors.iban && (
            <p className="mt-1 text-sm text-red-500">{errors.iban}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Format français : FR + 2 chiffres de contrôle + 23 caractères
          </p>
        </div>
  
        <div>
          <label
            htmlFor="bic"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            BIC / Code SWIFT
          </label>
          <input
            type="text"
            id="bic"
            name="bic"
            value={formData.bic}
            onChange={(e) => {
              // Formatage automatique du BIC
              const formatted = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
              onChange({
                target: {
                  name: 'bic',
                  value: formatted
                }
              });
            }}
            className={`form-input block w-full ${errors.bic ? "border-red-500" : ""}`}
            placeholder="BREDFRPPXXX"
            maxLength={11}
          />
          {errors.bic && (
            <p className="mt-1 text-sm text-red-500">{errors.bic}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            8 ou 11 caractères alphanumériques
          </p>
        </div>
      </div>
  
      {/* Section d'aide avec les codes BIC courants */}
      <div className="mt-6">
        <h3 className="text-md font-medium text-gray-800 mb-3">
          Codes BIC des principales banques françaises
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
          {infoBancaireService.getCommonFrenchBicCodes().map((bank, index) => (
            <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="font-medium">{bank.name}</span>
              <span className="text-gray-600">{bank.code}</span>
            </div>
          ))}
        </div>
      </div>
  
      {/* Messages d'aide */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">À propos de l'IBAN</h4>
          <p className="text-sm text-gray-600">
            {infoBancaireService.getHelpMessages().iban.help}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {infoBancaireService.getHelpMessages().iban.where}
          </p>
        </div>
  
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">À propos du BIC</h4>
          <p className="text-sm text-gray-600">
            {infoBancaireService.getHelpMessages().bic.help}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {infoBancaireService.getHelpMessages().bic.where}
          </p>
        </div>
      </div>
      </CardContent>
    </Card>
  )


export default RibSection;
