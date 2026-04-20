import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const MedecineEsthetiqueSection = ({ formData, onChange }: any) => {
  const { t } = useTranslation();

  const injectionsActive = formData.injectionsVisage === "Oui";
  const maquillageActive = formData.maquillagePermanentVisage === "Oui";

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t("volunteers.resume.groups.medecineEsthetique", "Médecine esthétique")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-800">
            {t("volunteers.resume.fields.injectionsVisage", "Injections sur le visage")}
          </h3>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="injectionsVisage"
              name="injectionsVisage"
              checked={injectionsActive}
              onChange={(e) =>
                onChange({
                  target: {
                    name: "injectionsVisage",
                    value: e.target.checked ? "Oui" : "Non",
                    type: "text",
                  },
                } as any)
              }
              className="form-checkbox h-5 w-5 text-primary-600"
            />
            <label htmlFor="injectionsVisage" className="ml-2 block text-sm font-medium text-gray-700">
              {t("common.yes", "Oui")}
            </label>
          </div>

          {injectionsActive && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6">
              <div>
                <label htmlFor="injectionsVisageZone" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("volunteers.resume.fields.injectionsVisageZone", "Zone des injections")}
                </label>
                <input
                  type="text"
                  id="injectionsVisageZone"
                  name="injectionsVisageZone"
                  value={formData.injectionsVisageZone || ""}
                  onChange={onChange}
                  placeholder="Ex: front, lèvres, pommettes..."
                  className="form-input block w-full"
                />
              </div>
              <div>
                <label htmlFor="injectionsVisageDate" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("volunteers.resume.fields.injectionsVisageDate", "Date de la dernière injection")}
                </label>
                <input
                  type="date"
                  id="injectionsVisageDate"
                  name="injectionsVisageDate"
                  value={formData.injectionsVisageDate || ""}
                  onChange={onChange}
                  className="form-input block w-full"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-800">
            {t(
              "volunteers.resume.fields.maquillagePermanentVisage",
              "Maquillage permanent sur le visage"
            )}
          </h3>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="maquillagePermanentVisage"
              name="maquillagePermanentVisage"
              checked={maquillageActive}
              onChange={(e) =>
                onChange({
                  target: {
                    name: "maquillagePermanentVisage",
                    value: e.target.checked ? "Oui" : "Non",
                    type: "text",
                  },
                } as any)
              }
              className="form-checkbox h-5 w-5 text-primary-600"
            />
            <label
              htmlFor="maquillagePermanentVisage"
              className="ml-2 block text-sm font-medium text-gray-700"
            >
              {t("common.yes", "Oui")}
            </label>
          </div>

          {maquillageActive && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6">
              <div>
                <label
                  htmlFor="maquillagePermanentVisageZone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t(
                    "volunteers.resume.fields.maquillagePermanentVisageZone",
                    "Zone du maquillage permanent"
                  )}
                </label>
                <input
                  type="text"
                  id="maquillagePermanentVisageZone"
                  name="maquillagePermanentVisageZone"
                  value={formData.maquillagePermanentVisageZone || ""}
                  onChange={onChange}
                  placeholder="Ex: sourcils, lèvres, eye-liner..."
                  className="form-input block w-full"
                />
              </div>
              <div>
                <label
                  htmlFor="maquillagePermanentVisageDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t(
                    "volunteers.resume.fields.maquillagePermanentVisageDate",
                    "Date du dernier maquillage permanent"
                  )}
                </label>
                <input
                  type="date"
                  id="maquillagePermanentVisageDate"
                  name="maquillagePermanentVisageDate"
                  value={formData.maquillagePermanentVisageDate || ""}
                  onChange={onChange}
                  className="form-input block w-full"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MedecineEsthetiqueSection;
