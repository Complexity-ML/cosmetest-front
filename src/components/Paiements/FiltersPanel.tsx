import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface PaiementStatusConfig {
  label: string;
  [key: string]: any;
}

interface FiltersPanelProps {
  etudesFiltrees?: Array<{
    idEtude: string | number;
    ref: string;
    dateDebut?: string;
  }>;
  selectedEtude: string;
  setSelectedEtude: (value: string) => void;
  statutPaiement: string;
  setStatutPaiement: (value: string) => void;
  dateDebut: string;
  setDateDebut: (value: string) => void;
  dateFin: string;
  setDateFin: (value: string) => void;
  showOnlyUnpaid: boolean;
  setShowOnlyUnpaid: (value: boolean) => void;
  showAnnules: boolean;
  setShowAnnules: (value: boolean) => void;
  showCompleted6WeeksUnpaid: boolean;
  setShowCompleted6WeeksUnpaid: (value: boolean) => void;
  allPaiementsLoaded: boolean;
  paiementStatusMap?: Record<string, PaiementStatusConfig>;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({
  etudesFiltrees = [],
  selectedEtude,
  setSelectedEtude,
  statutPaiement,
  setStatutPaiement,
  dateDebut,
  setDateDebut,
  dateFin,
  setDateFin,
  showOnlyUnpaid,
  setShowOnlyUnpaid,
  showAnnules,
  setShowAnnules,
  showCompleted6WeeksUnpaid,
  setShowCompleted6WeeksUnpaid,
  allPaiementsLoaded,
  paiementStatusMap = {},
}) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('common.filter')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
            <Label htmlFor="statut-select">
              {t('payments.status')}
              <span className="text-xs text-muted-foreground ml-1">({t('payments.filterByStudy')})</span>
            </Label>
            <Select
              value={statutPaiement}
              onValueChange={setStatutPaiement}
              disabled={statutPaiement !== 'all' && !allPaiementsLoaded}
            >
              <SelectTrigger id="statut-select">
                <SelectValue placeholder={t('payments.allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('payments.allStatuses')}</SelectItem>
                {Object.entries(paiementStatusMap).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="etude-select">
              {t('payments.study')} <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedEtude}
              onValueChange={setSelectedEtude}
            >
              <SelectTrigger id="etude-select">
                <SelectValue
                  placeholder={etudesFiltrees.length === 0 ? `-- ${t('payments.noMatchingStudy')} --` : `-- ${t('payments.selectStudy')} --`}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  {etudesFiltrees.length === 0 ? `-- ${t('payments.noMatchingStudy')} --` : `-- ${t('payments.selectStudy')} --`}
                </SelectItem>
                {etudesFiltrees.map((etude) => (
                  <SelectItem key={etude.idEtude} value={String(etude.idEtude)}>
                    {etude.ref}
                    {etude.dateDebut && (
                      <> ({new Date(etude.dateDebut).toLocaleDateString('fr-FR')})</>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-debut">
              {t('payments.startDate')}
              <span className="text-xs text-muted-foreground ml-1">({t('payments.filterByStudy')})</span>
            </Label>
            <Input
              type="date"
              id="date-debut"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-fin">
              {t('payments.endDate')}
              <span className="text-xs text-muted-foreground ml-1">({t('payments.filterByStudy')})</span>
            </Label>
            <Input
              type="date"
              id="date-fin"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="completed-6weeks-unpaid"
              checked={showCompleted6WeeksUnpaid}
              onCheckedChange={setShowCompleted6WeeksUnpaid}
            />
            <Label
              htmlFor="completed-6weeks-unpaid"
              className="text-sm font-normal cursor-pointer"
            >
              {t('payments.showStudiesCompleted6Weeks')}
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="only-unpaid"
              checked={showOnlyUnpaid}
              onCheckedChange={setShowOnlyUnpaid}
              disabled={!selectedEtude || selectedEtude === 'none'}
            />
            <Label
              htmlFor="only-unpaid"
              className="text-sm font-normal cursor-pointer"
            >
              {t('payments.showOnlyUnpaid')}
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-annules"
              checked={showAnnules}
              onCheckedChange={setShowAnnules}
              disabled={!selectedEtude || selectedEtude === 'none'}
            />
            <Label
              htmlFor="show-annules"
              className="text-sm font-normal cursor-pointer"
            >
              {t('payments.showCancelled')}
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FiltersPanel;
