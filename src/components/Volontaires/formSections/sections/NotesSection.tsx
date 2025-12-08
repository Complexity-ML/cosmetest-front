import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const NotesSection = ({ formData, onChange }: any) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('volunteers.notesAndComments')}</CardTitle>
      </CardHeader>
      <CardContent>
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {t('volunteers.notes')}
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
      </CardContent>
    </Card>
  );
};

export default NotesSection;
