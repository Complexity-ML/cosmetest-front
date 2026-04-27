import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const NotesSection = ({ formData, onChange }: any) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('volunteers.comments', 'Commentaires')}</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('volunteers.comments', 'Commentaires')}
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={6}
            value={formData.notes}
            onChange={onChange}
            className="form-textarea block w-full"
            placeholder={t('volunteers.notesAndComments')}
          />
        </div>

        <div>
          <label
            htmlFor="observations"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Observations
          </label>
          <textarea
            id="observations"
            name="observations"
            rows={4}
            value={formData.observations || ''}
            onChange={onChange}
            className="form-textarea block w-full"
            placeholder="Pièces manquantes, points à compléter dans le dossier…"
          />
        </div>
      </div>
      </CardContent>
    </Card>
  );
};

export default NotesSection;
