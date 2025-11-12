import React from 'react';
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
  allPaiementsLoaded,
  paiementStatusMap = {},
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtres</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
            <Label htmlFor="statut-select">
              Statut de paiement
              <span className="text-xs text-muted-foreground ml-1">(filtre les etudes)</span>
            </Label>
            <Select
              value={statutPaiement}
              onValueChange={setStatutPaiement}
              disabled={statutPaiement !== 'all' && !allPaiementsLoaded}
            >
              <SelectTrigger id="statut-select">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
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
              Etude <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedEtude}
              onValueChange={setSelectedEtude}
            >
              <SelectTrigger id="etude-select">
                <SelectValue
                  placeholder={etudesFiltrees.length === 0 ? '-- Aucune etude correspondante --' : '-- Selectionnez une etude --'}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  {etudesFiltrees.length === 0 ? '-- Aucune etude correspondante --' : '-- Selectionnez une etude --'}
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
              Date de debut
              <span className="text-xs text-muted-foreground ml-1">(filtre les etudes)</span>
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
              Date de fin
              <span className="text-xs text-muted-foreground ml-1">(filtre les etudes)</span>
            </Label>
            <Input
              type="date"
              id="date-fin"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="only-unpaid"
              checked={showOnlyUnpaid}
              onCheckedChange={setShowOnlyUnpaid}
              disabled={!selectedEtude}
            />
            <Label
              htmlFor="only-unpaid"
              className="text-sm font-normal cursor-pointer"
            >
              Afficher seulement les paiements non effectues
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-annules"
              checked={showAnnules}
              onCheckedChange={setShowAnnules}
              disabled={!selectedEtude}
            />
            <Label
              htmlFor="show-annules"
              className="text-sm font-normal cursor-pointer"
            >
              Afficher les volontaires annules
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FiltersPanel;
