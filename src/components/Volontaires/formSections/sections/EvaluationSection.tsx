import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const STAR_VALUES = [1, 2, 3, 4, 5];
const STAR_ICON_PATH = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

const getNumericValue = (value: any) => Number.parseInt(value || 0, 10);

const EvaluationSection = ({ formData, errors, onChange }: any) => {
  const { t } = useTranslation();

  const SPECIFIC_EVALUATIONS = [
    { name: "evaluationYeux", label: t('volunteers.eyes') },
    { name: "evaluationLevres", label: t('volunteers.lips') },
    { name: "evaluationTeint", label: t('volunteers.complexion') },
    { name: "evaluationCynetique", label: t('volunteers.kinetic') },
  ];

  const handleStarSelection = (fieldName: string, starValue: number) => {
    const currentValue = getNumericValue(formData[fieldName]);
    const nextValue = starValue === currentValue ? 0 : starValue;

    onChange({
      target: {
        name: fieldName,
        value: nextValue,
      },
    });
  };

  const renderStarRow = (fieldName: string, label: string, size = "md") => {
    const currentValue = getNumericValue(formData[fieldName]);
    const iconSize = size === "lg" ? "w-8 h-8" : "w-6 h-6";
    const ariaSuffix = label ? ` ${t('volunteers.for')} ${label}` : "";

    return (
      <div className="flex items-center">
        <div className="flex items-center space-x-1">
          {STAR_VALUES.map((star) => {
            const isActive = star <= currentValue;

            return (
              <button
                key={`${fieldName}-${star}`}
                type="button"
                onClick={() => handleStarSelection(fieldName, star)}
                className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-sm transition-transform duration-150 hover:scale-110"
                aria-label={`${star} ${t('volunteers.star')}${star > 1 ? "s" : ""}${ariaSuffix}`}
              >
                <svg
                  className={`${iconSize} transition-colors duration-200 ${
                    isActive ? "text-yellow-400 fill-current" : "text-gray-300 hover:text-yellow-200"
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d={STAR_ICON_PATH} />
                </svg>
              </button>
            );
          })}
        </div>

        <span className="ml-3 text-sm text-gray-600">
          {currentValue}/{STAR_VALUES.length} {t('volunteers.star')}{currentValue > 1 ? "s" : ""}
        </span>
      </div>
    );
  };

  const resetOverallEvaluation = () => {
    onChange({
      target: {
        name: "evaluation",
        value: 0,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('volunteers.volunteerEvaluation')}</CardTitle>
      </CardHeader>
      <CardContent>

      <div className="space-y-8">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">{t('volunteers.overallEvaluation')}</p>
          {renderStarRow("evaluation", "", "lg")}

          {errors.evaluation && (
            <p className="mt-2 text-sm text-red-500">{errors.evaluation}</p>
          )}

          <button
            type="button"
            onClick={resetOverallEvaluation}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
          >
            {t('volunteers.resetRating')}
          </button>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-4">{t('volunteers.specificAreasEvaluation')}</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {SPECIFIC_EVALUATIONS.map(({ name, label }) => (
              <div key={name}>
                <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
                {renderStarRow(name, label)}
              </div>
            ))}
          </div>
        </div>
      </div>
      </CardContent>
    </Card>
  );
};

export default EvaluationSection;
