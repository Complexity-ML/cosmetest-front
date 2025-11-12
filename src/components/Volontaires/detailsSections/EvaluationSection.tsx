import { VolontaireData } from '../../../types/volontaire.types';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Separator } from '../../ui/separator';

const STAR_VALUES = [1, 2, 3, 4, 5];

const STAR_ICON_PATH = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

const SPECIFIC_EVALUATIONS = [
  { field: "notesYeux" as keyof VolontaireData, label: "Yeux" },
  { field: "notesLevres" as keyof VolontaireData, label: "Lèvres" },
  { field: "notesTeint" as keyof VolontaireData, label: "Teint" },
  { field: "notesCynetique" as keyof VolontaireData, label: "Cinétique" },
];

const getNumericValue = (value: string | number | null | undefined): number => {
  return Number.parseInt(String(value || 0), 10);
};

const renderStars = (value: string | number | null | undefined): JSX.Element => {
  const score = getNumericValue(value);

  return (
    <>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          {STAR_VALUES.map((star: number) => {
            const isActive: boolean = star <= score;

            return (
              <svg
                key={star}
                className={`w-5 h-5 ${isActive ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d={STAR_ICON_PATH} />
              </svg>
            );
          })}
        </div>
        <span className="text-sm text-gray-600">{score}/{STAR_VALUES.length}</span>
      </div>
    </>
  );
};

interface EvaluationSectionProps {
  volontaireDisplayData: VolontaireData;
}

const EvaluationSection = ({ volontaireDisplayData }: EvaluationSectionProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Évaluation du volontaire</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-brand-cyan">Évaluation globale</p>
        {renderStars(volontaireDisplayData.notes)}
      </div>

      <Separator />

      <div className="space-y-4">
        <p className="text-sm font-medium text-brand-cyan">Évaluation des zones spécifiques</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SPECIFIC_EVALUATIONS.map(({ field, label }) => (
            <div key={field} className="space-y-2">
              <p className="text-sm text-gray-700">{label}</p>
              {renderStars(volontaireDisplayData[field])}
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default EvaluationSection;
