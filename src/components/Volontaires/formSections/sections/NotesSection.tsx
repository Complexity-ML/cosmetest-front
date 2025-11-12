import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NotesSection = ({ formData, onChange }: any) => (
    <Card>
      <CardHeader>
        <CardTitle>Notes et commentaires</CardTitle>
      </CardHeader>
      <CardContent>
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={6}
          value={formData.notes}
          onChange={onChange}
          className="form-textarea block w-full"
          placeholder="Commentaires, observations, études précédentes, etc."
        />
      </div>
      </CardContent>
    </Card>
  );
  
export default NotesSection;
