import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { MAKEUP_OPTIONS, EVALUATION_FIELDS, ETHNIE_OPTIONS } from './constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const InfoBanner = () => {
  const { t } = useTranslation();
  return (
    <Alert className="bg-blue-50 border-blue-200">
      <AlertDescription>
        <h3 className="font-medium text-blue-800 mb-2">{t('reports.matching.configurationTitle')}</h3>
        <p className="text-blue-700 text-sm mb-2">
          {t('reports.matching.configurationDesc')}
        </p>
        <p className="text-blue-600 text-xs">
          {t('reports.matching.resultsDesc')}
        </p>
      </AlertDescription>
    </Alert>
  );
};

interface DemographicFiltersProps {
  values: {
    ageMin: string;
    ageMax: string;
    sexe: string;
    phototypes: string[];
    ethnies: string[];
  };
  onAgeChange: (field: string, value: string) => void;
  onSexChange: (value: string) => void;
  onPhototypeToggle: (value: string) => void;
  onEthnieToggle: (value: string) => void;
}

export const DemographicFilters: React.FC<DemographicFiltersProps> = ({
  values,
  onAgeChange,
  onSexChange,
  onPhototypeToggle,
  onEthnieToggle
}) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.matching.demographicCriteria')}</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ageMin">{t('reports.matching.ageMin')}</Label>
            <Input
              id="ageMin"
              type="number"
              min="18"
              max="100"
              value={values.ageMin}
              onChange={(e) => onAgeChange('ageMin', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ageMax">{t('reports.matching.ageMax')}</Label>
            <Input
              id="ageMax"
              type="number"
              min="18"
              max="100"
              value={values.ageMax}
              onChange={(e) => onAgeChange('ageMax', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sexe">{t('reports.matching.sex')}</Label>
            <Select value={values.sexe} onValueChange={onSexChange}>
              <SelectTrigger id="sexe">
                <SelectValue placeholder={t('reports.matching.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TOUS">{t('reports.matching.all')}</SelectItem>
                <SelectItem value="MASCULIN">{t('reports.matching.male')}</SelectItem>
                <SelectItem value="FEMININ">{t('reports.matching.female')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('reports.matching.phototypes')}</Label>
            <div className="flex flex-wrap gap-3 pt-2">
              {[1, 2, 3, 4, 5, 6].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`phototype-${type}`}
                    checked={values.phototypes.includes(type.toString())}
                    onCheckedChange={() => onPhototypeToggle(type.toString())}
                  />
                  <Label
                    htmlFor={`phototype-${type}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {t('reports.matching.type')} {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('reports.matching.ethnicity')}</Label>
            <div className="flex flex-wrap gap-3 pt-2">
              {ETHNIE_OPTIONS.map((ethnie) => (
                <div key={ethnie.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`ethnie-${ethnie.value}`}
                    checked={values.ethnies.includes(ethnie.value)}
                    onCheckedChange={() => onEthnieToggle(ethnie.value)}
                  />
                  <Label
                    htmlFor={`ethnie-${ethnie.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {ethnie.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MakeupCategoryProps {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
}

export const MakeupCategory: React.FC<MakeupCategoryProps> = ({ title, options, selected, onToggle }) => (
  <div>
    <h4 className="font-medium text-gray-700 mb-3">{title}</h4>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {options.map((option) => (
        <div key={option} className="flex items-center space-x-2">
          <Checkbox
            id={`makeup-${option}`}
            checked={selected.includes(option)}
            onCheckedChange={() => onToggle(option)}
          />
          <Label
            htmlFor={`makeup-${option}`}
            className="text-sm font-normal cursor-pointer"
          >
            {option}
          </Label>
        </div>
      ))}
    </div>
  </div>
);

interface MakeupFiltersProps {
  values: {
    visage: string[];
    yeux: string[];
    levres: string[];
  };
  onToggle: (category: string, value: string) => void;
}

export const MakeupFilters: React.FC<MakeupFiltersProps> = ({ values, onToggle }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.matching.makeupCriteria')}</h3>
      <div className="space-y-6">
        <MakeupCategory
          title={t('reports.matching.faceMakeup')}
          options={MAKEUP_OPTIONS.visage}
          selected={values.visage}
          onToggle={(value) => onToggle('visage', value)}
        />
        <MakeupCategory
          title={t('reports.matching.eyeMakeup')}
          options={MAKEUP_OPTIONS.yeux}
          selected={values.yeux}
          onToggle={(value) => onToggle('yeux', value)}
        />
        <MakeupCategory
          title={t('reports.matching.lipMakeup')}
          options={MAKEUP_OPTIONS.levres}
          selected={values.levres}
          onToggle={(value) => onToggle('levres', value)}
        />
      </div>
    </div>
  );
};

interface EvaluationFiltersProps {
  values: Record<string, { min?: string; max?: string }>;
  onChange: (key: string, type: 'min' | 'max', value: string) => void;
}

export const EvaluationFilters: React.FC<EvaluationFiltersProps> = ({ values, onChange }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.matching.evaluationThresholds')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EVALUATION_FIELDS.map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <Label className="text-sm font-medium">{label}</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor={`${key}-min`} className="text-xs text-muted-foreground">
                  {t('reports.matching.min')}
                </Label>
                <Input
                  id={`${key}-min`}
                  type="number"
                  min="0"
                  max="5"
                  step="1"
                  value={values[key]?.min ?? ''}
                  placeholder="0"
                  onChange={(e) => onChange(key, 'min', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${key}-max`} className="text-xs text-muted-foreground">
                  {t('reports.matching.max')}
                </Label>
                <Input
                  id={`${key}-max`}
                  type="number"
                  min="0"
                  max="5"
                  step="1"
                  value={values[key]?.max ?? ''}
                  placeholder="5"
                  onChange={(e) => onChange(key, 'max', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface FiltersActionBarProps {
  makeupCount: number;
  onExecute: () => void;
  onReset: () => void;
  loading: boolean;
}

export const FiltersActionBar: React.FC<FiltersActionBarProps> = ({
  makeupCount,
  onExecute,
  onReset,
  loading
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="text-sm text-muted-foreground">
        {makeupCount > 0
          ? `${makeupCount} ${t('reports.matching.criteriaSelected')}`
          : t('reports.matching.noCriteriaSelected')}
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          disabled={loading}
        >
          {t('common.reset')}
        </Button>
        <Button
          type="button"
          onClick={onExecute}
          disabled={loading}
        >
          <Search className="w-4 h-4 mr-2" />
          {loading ? t('reports.matching.searchInProgress') : t('reports.matching.launchMatching')}
        </Button>
      </div>
    </div>
  );
};

interface CriteriaPanelProps {
  filters: {
    demographics: {
      ageMin: string;
      ageMax: string;
      sexe: string;
      phototypes: string[];
      ethnies: string[];
    };
    makeup: {
      visage: string[];
      yeux: string[];
      levres: string[];
    };
    evaluations: Record<string, { min?: string; max?: string }>;
  };
  onAgeChange: (field: string, value: string) => void;
  onSexChange: (value: string) => void;
  onPhototypeToggle: (value: string) => void;
  onEthnieToggle: (value: string) => void;
  onMakeupToggle: (category: string, value: string) => void;
  onEvaluationChange: (key: string, type: 'min' | 'max', value: string) => void;
  onExecute: () => void;
  onReset: () => void;
  makeupCount: number;
  loading: boolean;
}

export const CriteriaPanel: React.FC<CriteriaPanelProps> = ({
  filters,
  onAgeChange,
  onSexChange,
  onPhototypeToggle,
  onEthnieToggle,
  onMakeupToggle,
  onEvaluationChange,
  onExecute,
  onReset,
  makeupCount,
  loading
}) => (
  <div className="space-y-6">
    <InfoBanner />
    <DemographicFilters
      values={filters.demographics}
      onAgeChange={onAgeChange}
      onSexChange={onSexChange}
      onPhototypeToggle={onPhototypeToggle}
      onEthnieToggle={onEthnieToggle}
    />
    <MakeupFilters values={filters.makeup} onToggle={onMakeupToggle} />
    <EvaluationFilters values={filters.evaluations} onChange={onEvaluationChange} />
    <FiltersActionBar
      makeupCount={makeupCount}
      onExecute={onExecute}
      onReset={onReset}
      loading={loading}
    />
  </div>
);
