import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import rdvService from '../../services/rdvService';
import volontaireService from '../../services/volontaireService';
import { ArrowLeftRight, Search, CheckCircle2, Calendar, Filter } from 'lucide-react';
import { RendezVous, Volontaire } from '../../types/types';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';

interface AppointmentSwitcherProps {
  onClose: () => void;
  onSwitchComplete?: () => void;
  preSelectedRdv?: RendezVous | null;
  etudeId?: number | null;
}

/**
 * Simple and practical appointment switcher
 * Click on RDV1 → Click on RDV2 → Switch!
 */
const AppointmentSwitcher: React.FC<AppointmentSwitcherProps> = ({ onClose, onSwitchComplete, preSelectedRdv = null, etudeId = null }) => {
  const { t } = useTranslation();
  const [selectedRdvs, setSelectedRdvs] = useState<RendezVous[]>(preSelectedRdv ? [preSelectedRdv] : []);
  const [appointments, setAppointments] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [volunteerCache, setVolunteerCache] = useState<Record<number, Volontaire>>({});
  const [selectedDate, setSelectedDate] = useState(''); // Filtre par date

  // Load appointments
  useEffect(() => {
    const loadAppointments = async () => {
      if (!etudeId) {
        return;
      }

      try {
        setLoading(true);
        const rdvs = await rdvService.getByEtudeId(etudeId);

        // Normaliser les données si nécessaire
        const rdvArray = Array.isArray(rdvs) ? rdvs : [];

        // Only appointments with volunteers
        const assigned = rdvArray.filter(rdv => {
          const hasVolunteer = rdv.volontaire?.id || rdv.idVolontaire;
          return hasVolunteer;
        });
        setAppointments(assigned);
      } catch (err) {
        console.error('Error loading appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [etudeId]);

  // Preload volunteer info when RDVs are selected
  useEffect(() => {
    const preloadVolunteers = async () => {
      for (const rdv of selectedRdvs) {
        const volId = getVolunteerId(rdv);
        if (volId && !volunteerCache[volId]) {
          await getVolunteerInfo(volId);
        }
      }
    };

    if (selectedRdvs.length > 0) {
      preloadVolunteers();
    }
  }, [selectedRdvs]);

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatTime = (timeString: string | undefined): string => timeString || t('appointments.timeNotSpecified');

  const getRdvId = (rdv: RendezVous): number | undefined => rdv?.idRdv || rdv?.id;

  const getVolunteerId = (rdv: RendezVous): number | undefined | null => rdv?.volontaire?.id || rdv?.idVolontaire;

  // Load volunteer info with cache
  const getVolunteerInfo = async (volunteerId: number): Promise<Volontaire | null> => {
    if (!volunteerId) return null;

    if (volunteerCache[volunteerId]) {
      return volunteerCache[volunteerId];
    }

    try {
      const response = await volontaireService.getDetails(volunteerId);
      const info = response.data || response;
      setVolunteerCache(prev => ({ ...prev, [volunteerId]: info }));
      return info;
    } catch (error) {
      console.error('Error loading volunteer:', error);
      return null;
    }
  };

  const getVolunteerName = (rdv: RendezVous, volunteerInfo: Volontaire | null = null): string => {
    // First try provided volunteer info
    if (volunteerInfo) {
      const prenom = (volunteerInfo as any).prenomVol || (volunteerInfo as any).prenom || (volunteerInfo as any).firstName || '';
      const nom = (volunteerInfo as any).nomVol || (volunteerInfo as any).nom || (volunteerInfo as any).lastName || '';
      const title = (volunteerInfo as any).titreVol || (volunteerInfo as any).titre || (volunteerInfo as any).civilite || '';
      const fullName = `${title} ${prenom} ${nom}`.trim();
      if (fullName) return fullName;
    }

    // Try to get from cache
    const volId = getVolunteerId(rdv);
    if (volId && volunteerCache[volId]) {
      const cached = volunteerCache[volId];
      const prenom = (cached as any).prenomVol || (cached as any).prenom || (cached as any).firstName || '';
      const nom = (cached as any).nomVol || (cached as any).nom || (cached as any).lastName || '';
      const title = (cached as any).titreVol || (cached as any).titre || (cached as any).civilite || '';
      const fullName = `${title} ${prenom} ${nom}`.trim();
      if (fullName) return fullName;
    }

    // Try volontaire object on rdv
    if (rdv?.volontaire) {
      const prenom = (rdv.volontaire as any).prenomVol || (rdv.volontaire as any).prenom || (rdv.volontaire as any).firstName || '';
      const nom = (rdv.volontaire as any).nomVol || (rdv.volontaire as any).nom || (rdv.volontaire as any).lastName || '';
      const title = (rdv.volontaire as any).titreVol || (rdv.volontaire as any).titre || (rdv.volontaire as any).civilite || '';
      const fullName = `${title} ${prenom} ${nom}`.trim();
      if (fullName) return fullName;
    }

    // Try direct properties on rdv
    const prenomDirect = (rdv as any)?.prenomVol || (rdv as any)?.prenomVolontaire || '';
    const nomDirect = (rdv as any)?.nomVol || (rdv as any)?.nomVolontaire || '';
    if (prenomDirect || nomDirect) {
      return `${prenomDirect} ${nomDirect}`.trim();
    }

    return `${t('appointments.volunteerID')}: ${getVolunteerId(rdv)}`;
  };

  const handleSelectRdv = (rdv: RendezVous) => {
    const id = getRdvId(rdv);
    const isSelected = selectedRdvs.some(r => getRdvId(r) === id);

    if (isSelected) {
      setSelectedRdvs(selectedRdvs.filter(r => getRdvId(r) !== id));
    } else if (selectedRdvs.length < 2) {
      setSelectedRdvs([...selectedRdvs, rdv]);
    } else {
      // Replace the second one
      setSelectedRdvs([selectedRdvs[0], rdv]);
    }
  };

  const handleSwitch = async () => {
    if (selectedRdvs.length !== 2) return;

    const [rdv1, rdv2] = selectedRdvs;
    const vol1Id = getVolunteerId(rdv1);
    const vol2Id = getVolunteerId(rdv2);

    if (vol1Id === vol2Id) {
      alert(t('appointments.bothAppointmentsSameVolunteer'));
      return;
    }

    if (!window.confirm(
      `${t('appointments.confirmSwitch')}\n\n` +
      `${getVolunteerName(rdv1)} (${formatDate(rdv1.date || '')} ${formatTime(rdv1.heure)})\n` +
      `↕\n` +
      `${getVolunteerName(rdv2)} (${formatDate(rdv2.date || '')} ${formatTime(rdv2.heure)})`
    )) {
      return;
    }

    try {
      setLoading(true);

      const etude1Id = rdv1.idEtude || etudeId || 0;
      const etude2Id = rdv2.idEtude || etudeId || 0;
      const rdv1Id = getRdvId(rdv1) || 0;
      const rdv2Id = getRdvId(rdv2) || 0;

      // Step 1: Unassign RDV1
      await rdvService.update(etude1Id, rdv1Id, {
        idEtude: etude1Id,
        idRdv: rdv1Id,
        idVolontaire: null,
        idGroupe: (rdv1 as any).idGroupe || (rdv1 as any).groupe?.id || (rdv1 as any).groupe?.idGroupe,
        date: rdv1.date,
        heure: rdv1.heure,
        etat: rdv1.etat || 'PLANIFIE',
        commentaires: (rdv1 as any).commentaires
      });

      // Step 2: Assign Vol1 to RDV2
      await rdvService.update(etude2Id, rdv2Id, {
        idEtude: etude2Id,
        idRdv: rdv2Id,
        idVolontaire: vol1Id,
        idGroupe: (rdv2 as any).idGroupe || (rdv2 as any).groupe?.id || (rdv2 as any).groupe?.idGroupe,
        date: rdv2.date,
        heure: rdv2.heure,
        etat: rdv2.etat || 'PLANIFIE',
        commentaires: (rdv2 as any).commentaires
      });

      // Step 3: Assign Vol2 to RDV1
      await rdvService.update(etude1Id, rdv1Id, {
        idEtude: etude1Id,
        idRdv: rdv1Id,
        idVolontaire: vol2Id,
        idGroupe: (rdv1 as any).idGroupe || (rdv1 as any).groupe?.id || (rdv1 as any).groupe?.idGroupe,
        date: rdv1.date,
        heure: rdv1.heure,
        etat: rdv1.etat || 'PLANIFIE',
        commentaires: (rdv1 as any).commentaires
      });

      alert(t('appointments.appointmentsSwitchedSuccess'));

      if (onSwitchComplete) {
        onSwitchComplete();
      }
      onClose();

    } catch (err) {
      console.error('Switch error:', err);
      alert(t('appointments.errorSwitchingAppointments'));
    } finally {
      setLoading(false);
    }
  };

  // Get unique dates from appointments
  const availableDates = [...new Set(appointments.map(rdv => rdv.date))].sort();

  // Filter appointments
  const filteredAppointments = appointments.filter(rdv => {
    // Don't show rdv1 in the list
    const rdv1 = selectedRdvs[0];
    if (rdv1 && getRdvId(rdv) === getRdvId(rdv1)) {
      return false;
    }

    // Date filter
    if (selectedDate && rdv.date !== selectedDate) {
      return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      const name = getVolunteerName(rdv).toLowerCase();
      const date = formatDate(rdv.date || '').toLowerCase();
      const time = formatTime(rdv.heure).toLowerCase();
      const comments = ((rdv as any).commentaires || '').toLowerCase();

      return name.includes(search) ||
             date.includes(search) ||
             time.includes(search) ||
             comments.includes(search);
    }

    return true;
  });

  // Sort appointments by time (hour)
  const sortByTime = (rdvs: RendezVous[]): RendezVous[] => {
    return [...rdvs].sort((a, b) => {
      const timeA = a.heure || '00h00';
      const timeB = b.heure || '00h00';
      
      // Parse time in format "09h00" or "09:00"
      const parseTime = (time: string): { hours: number; minutes: number } => {
        // Handle both "09h00" and "09:00" formats
        let hours = 0;
        let minutes = 0;
        
        if (time.includes('h')) {
          const parts = time.toLowerCase().split('h');
          hours = parseInt(parts[0]) || 0;
          minutes = parseInt(parts[1]) || 0;
        } else if (time.includes(':')) {
          const parts = time.split(':');
          hours = parseInt(parts[0]) || 0;
          minutes = parseInt(parts[1]) || 0;
        }
        
        return { hours, minutes };
      };
      
      const parsedA = parseTime(timeA);
      const parsedB = parseTime(timeB);
      
      // Compare hours first, then minutes
      if (parsedA.hours !== parsedB.hours) {
        return parsedA.hours - parsedB.hours;
      }
      return parsedA.minutes - parsedB.minutes;
    });
  };

  // Sort filtered appointments by time
  const sortedFilteredAppointments = sortByTime(filteredAppointments);

  // Group appointments by date and sort each group by time
  const appointmentsByDate = sortedFilteredAppointments.reduce((acc: Record<string, RendezVous[]>, rdv) => {
    const date = rdv.date;
    if (!acc[date!]) {
      acc[date!] = [];
    }
    acc[date!].push(rdv);
    return acc;
  }, {});

  // Sort each date group by time
  Object.keys(appointmentsByDate).forEach(date => {
    appointmentsByDate[date] = sortByTime(appointmentsByDate[date]);
  });

  const sortedDates = Object.keys(appointmentsByDate).sort();

  const isRdvSelected = (rdv: RendezVous): boolean => {
    const id = getRdvId(rdv);
    return selectedRdvs.some(r => getRdvId(r) === id);
  };

  const getSelectionNumber = (rdv: RendezVous): number | null => {
    const id = getRdvId(rdv);
    const index = selectedRdvs.findIndex(r => getRdvId(r) === id);
    return index >= 0 ? index + 1 : null;
  };

  // Component for selected RDV summary with volunteer loading
  interface SelectedRdvCardProps {
    rdv: RendezVous;
    selectionNum: number;
  }

  const SelectedRdvCard: React.FC<SelectedRdvCardProps> = ({ rdv, selectionNum }) => {
    const [volunteerInfo, setVolunteerInfo] = useState<Volontaire | null>(null);
    const [loadingVol, setLoadingVol] = useState(false);

    useEffect(() => {
      const loadVol = async () => {
        const volId = getVolunteerId(rdv);
        if (!volId) return;

        // Check cache first
        if (volunteerCache[volId]) {
          setVolunteerInfo(volunteerCache[volId]);
          return;
        }

        setLoadingVol(true);
        const info = await getVolunteerInfo(volId);
        setVolunteerInfo(info);
        setLoadingVol(false);
      };

      loadVol();
    }, [rdv]);

    return (
      <div className="flex-1 border-2 border-blue-500 shadow-sm rounded-lg">
        <div className="p-3">
          <Badge className="w-fit mb-2" variant="default">#{selectionNum}</Badge>
          <div className="text-sm font-medium">
            {loadingVol ? (
              <Skeleton className="h-5 w-40" />
            ) : (
              getVolunteerName(rdv, volunteerInfo)
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDate(rdv.date || '')} à {formatTime(rdv.heure)}
          </div>
        </div>
      </div>
    );
  };

  // Component for each appointment item with volunteer loading
  interface AppointmentItemProps {
    rdv: RendezVous;
    selected: boolean;
    selectionNum: number | null;
    onClick: () => void;
  }

  const AppointmentItemWithVolunteer: React.FC<AppointmentItemProps> = ({ rdv, selected, selectionNum, onClick }) => {
    const [volunteerInfo, setVolunteerInfo] = useState<Volontaire | null>(null);
    const [loadingVol, setLoadingVol] = useState(false);

    useEffect(() => {
      const loadVol = async () => {
        const volId = getVolunteerId(rdv);
        if (!volId) return;

        setLoadingVol(true);
        const info = await getVolunteerInfo(volId);
        setVolunteerInfo(info);
        setLoadingVol(false);
      };

      loadVol();
    }, [rdv]);

    return (
      <div
        key={getRdvId(rdv)}
        onClick={onClick}
        className={`cursor-pointer transition-all hover:shadow-lg rounded-lg min-h-[80px] ${
          selected
            ? 'border-3 border-blue-600 bg-blue-50 shadow-lg'
            : 'border-2 border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {selected && (
                  <Badge variant="default" className="flex-shrink-0 text-base px-2 py-1">
                    #{selectionNum}
                  </Badge>
                )}
                <div className="font-bold text-base sm:text-lg text-gray-900">
                  {loadingVol ? (
                    <Skeleton className="h-6 w-48" />
                  ) : (
                    getVolunteerName(rdv, volunteerInfo)
                  )}
                </div>
              </div>
              <div className="text-base sm:text-lg text-gray-700 mt-2 font-medium">
                <span className="inline-flex items-center gap-2">
                  📅 {formatDate(rdv.date || '')} • 🕐 {formatTime(rdv.heure)}
                </span>
              </div>
              {(rdv as any).commentaires && (
                <div className="text-sm text-gray-600 italic mt-3 p-3 bg-gray-100 rounded border-l-4 border-gray-300">
                  💬 {(rdv as any).commentaires}
                </div>
              )}
            </div>
            {selected && (
              <CheckCircle2 className="text-blue-600 flex-shrink-0" size={32} strokeWidth={3} />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-full sm:max-w-4xl lg:max-w-5xl max-h-[95vh] overflow-hidden flex flex-col p-0 w-[98vw] sm:w-auto">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <ArrowLeftRight className="text-blue-600" size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl">{t('appointments.switchAppointments')}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedRdvs.length === 0 && t('appointments.selectTwoAppointments')}
                {selectedRdvs.length === 1 && t('appointments.selectSecondAppointment')}
                {selectedRdvs.length === 2 && t('appointments.readyToSwitch')}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Selection Summary */}
        {selectedRdvs.length > 0 && (
          <div className="mx-3 sm:mx-6 mb-0 border-2 border-blue-200 bg-blue-50 rounded-lg">
            <div className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                {selectedRdvs.map((rdv, idx) => (
                  <React.Fragment key={getRdvId(rdv)}>
                    {idx > 0 && <ArrowLeftRight className="text-blue-600 flex-shrink-0" size={20} />}
                    <SelectedRdvCard rdv={rdv} selectionNum={idx + 1} />
                  </React.Fragment>
                ))}
                {selectedRdvs.length === 1 && (
                  <>
                    <ArrowLeftRight className="text-gray-300 flex-shrink-0" size={20} />
                    <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="p-8 text-center">
                        <p className="text-sm text-muted-foreground">{t('appointments.clickOnAppointment')}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 space-y-3 sm:space-y-4 border-y">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder={t('appointments.searchByVolunteerTimeComment')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Date Filter Section */}
          {availableDates.length > 1 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Filter className="text-blue-600" size={16} />
                <Label className="text-sm font-semibold text-gray-700">{t('appointments.filterByDate')}</Label>
                {selectedDate && (
                  <Badge variant="secondary" className="text-xs">
                    {appointments.filter(rdv => rdv.date === selectedDate).length} {t('appointments.rdv')}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={selectedDate === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDate('')}
                  className="gap-2"
                >
                  <Calendar size={14} />
                  {t('appointments.allDates')}
                  <Badge variant={selectedDate === '' ? 'secondary' : 'outline'} className="ml-1">
                    {appointments.length}
                  </Badge>
                </Button>
                <Separator orientation="vertical" className="h-6" />
                {availableDates.map((date) => {
                  const count = appointments.filter(rdv => rdv.date === date).length;
                  return (
                    <Button
                      key={date}
                      variant={selectedDate === date ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDate(date || '')}
                      className="gap-2"
                    >
                      <Calendar size={14} />
                      {formatDate(date || '')}
                      <Badge variant={selectedDate === date ? 'secondary' : 'outline'} className="ml-1">
                        {count}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Appointments List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
              <p className="text-gray-600">{t('appointments.loadingAppointments')}</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="border border-red-200 bg-red-50 rounded-lg">
              <div className="text-center py-8">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">{t('appointments.noAppointmentWithVolunteer')}</h4>
                <p className="text-sm text-muted-foreground">{t('appointments.assignVolunteersBeforeSwitch')}</p>
                <Badge variant="outline" className="mt-4">Étude ID: {etudeId}</Badge>
              </div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="border rounded-lg">
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-2">{t('appointments.noAppointmentFoundWithSearch')}</p>
                <Button
                  variant="link"
                  onClick={() => setSearchQuery('')}
                  size="sm"
                >
                  {t('appointments.resetSearch')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Si pas de filtre de date et plusieurs dates, grouper par date */}
              {!selectedDate && sortedDates.length > 1 ? (
                sortedDates.map((date) => (
                  <div key={date} className="space-y-3">
                    {/* Date header */}
                    <div className="sticky top-0 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 rounded-lg">
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-semibold flex items-center gap-2">
                            📅 {formatDate(date || '')}
                          </h4>
                          <Badge variant="default">
                            {appointmentsByDate[date].length} {t('appointments.rdv')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {/* Appointments for this date */}
                    <div className="grid gap-2">
                      {appointmentsByDate[date].map((rdv) => (
                        <AppointmentItemWithVolunteer
                          key={getRdvId(rdv)}
                          rdv={rdv}
                          selected={isRdvSelected(rdv)}
                          selectionNum={getSelectionNumber(rdv)}
                          onClick={() => handleSelectRdv(rdv)}
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                // Si une seule date ou filtre actif, liste simple
                <div className="grid gap-2">
                  {sortedFilteredAppointments.map((rdv) => (
                    <AppointmentItemWithVolunteer
                      key={getRdvId(rdv)}
                      rdv={rdv}
                      selected={isRdvSelected(rdv)}
                      selectionNum={getSelectionNumber(rdv)}
                      onClick={() => handleSelectRdv(rdv)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Footer */}
        <div className="p-6 bg-gray-50 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => setSelectedRdvs([])}
            disabled={loading || selectedRdvs.length === 0}
          >
            {t('common.reset')}
          </Button>
          <Button
            onClick={handleSwitch}
            disabled={loading || selectedRdvs.length !== 2}
            size="lg"
            className="gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                {t('appointments.switchInProgress')}
              </>
            ) : (
              <>
                <ArrowLeftRight size={18} />
                {t('appointments.switchAppointmentsButton')}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentSwitcher;