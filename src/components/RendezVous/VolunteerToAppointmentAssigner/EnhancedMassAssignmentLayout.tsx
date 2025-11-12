import React from 'react';
import { MassAssignmentHeader, AssignmentSummary } from '../AssignmentComponents/index';
import { StudyControlsPanel, VolunteersPanel } from '../PanelComponents/index';
import EnhancedAppointmentsPanel from './EnhancedAppointmentsPanel';
import AppointmentSwitcher from '../AppointmentSwitcher';

interface Study {
  idEtude: number;
  nomEtude: string;
  [key: string]: any;
}

interface Groupe {
  idGroupe: number;
  nomGroupe: string;
  [key: string]: any;
}

interface Appointment {
  idRdv?: number;
  id?: number;
  date?: string;
  heure?: string;
  etat?: string;
  commentaires?: string;
  idVolontaire?: number;
  [key: string]: any;
}

interface Volunteer {
  id?: number;
  idVolontaire?: number;
  volontaireId?: number;
  prenomVol?: string;
  prenom?: string;
  nomVol?: string;
  nom?: string;
  email?: string;
  [key: string]: any;
}

interface Stats {
  totalAppointments: number;
  unassignedAppointments: number;
  assignedAppointments: number;
  totalVolunteers: number;
  totalGroups: number;
  [key: string]: any;
}

interface EnhancedMassAssignmentLayoutProps {
  etudeDetails: Study | null;
  selectedEtudeId: number | null;
  onBack: () => void;
  studies: Study[];
  setSelectedEtudeId: (id: number | null) => void;
  actionMode: 'assign' | 'unassign';
  setActionMode: (mode: 'assign' | 'unassign') => void;
  assignmentMode: 'manual' | 'auto';
  setAssignmentMode: (mode: 'manual' | 'auto') => void;
  groupes: Groupe[];
  selectedGroupeId: number | null;
  setSelectedGroupeId: (id: number | null) => void;
  selectedGroupeDetails: Groupe | null;
  stats: Stats;
  combinedLoading: boolean;
  filteredAppointments: Appointment[];
  selectedAppointments: Appointment[];
  handleSelectAppointment: (appointment: Appointment) => void;
  handleSelectAllAppointments: () => void;
  handleUnassignSingle: (appointment: Appointment) => void;
  filteredVolunteers: Volunteer[];
  selectedVolunteers: Volunteer[];
  handleSelectVolunteer: (volunteer: Volunteer) => void;
  handleSelectAllVolunteers: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  volunteerFilterOption: string;
  setVolunteerFilterOption: (option: string) => void;
  getVolunteerAppointmentCount?: (id: number) => number | undefined;
  summaryVisible: boolean;
  loading: boolean;
  setSelectedAppointments: (appointments: Appointment[]) => void;
  setSelectedVolunteers: (volunteers: Volunteer[]) => void;
  handleMassAssignment: () => void;
  showSwitcher: boolean;
  switcherRdv: Appointment | null;
  handleOpenSwitcher: (appointment: Appointment) => void;
  handleCloseSwitcher: () => void;
  handleSwitchComplete: () => void;
}

const EnhancedMassAssignmentLayout: React.FC<EnhancedMassAssignmentLayoutProps> = ({
  etudeDetails,
  selectedEtudeId,
  onBack,
  studies,
  setSelectedEtudeId,
  actionMode,
  assignmentMode,
  setAssignmentMode,
  groupes,
  selectedGroupeId,
  setSelectedGroupeId,
  selectedGroupeDetails,
  stats,
  combinedLoading,
  filteredAppointments,
  selectedAppointments,
  handleSelectAppointment,
  handleSelectAllAppointments,
  handleUnassignSingle,
  filteredVolunteers,
  selectedVolunteers,
  handleSelectVolunteer,
  handleSelectAllVolunteers,
  searchQuery,
  setSearchQuery,
  volunteerFilterOption,
  setVolunteerFilterOption,
  getVolunteerAppointmentCount,
  summaryVisible,
  loading,
  setSelectedAppointments,
  setSelectedVolunteers,
  handleMassAssignment,
  showSwitcher,
  switcherRdv,
  handleOpenSwitcher,
  handleCloseSwitcher,
  handleSwitchComplete
}) => (
  <div className="max-w-7xl mx-auto px-4">
    <MassAssignmentHeader
      etudeDetails={etudeDetails}
      selectedEtudeId={selectedEtudeId}
      onBack={onBack}
    />

    <StudyControlsPanel
      studies={studies}
      selectedEtudeId={selectedEtudeId}
      onStudyChange={(value: string) => setSelectedEtudeId(value ? parseInt(value, 10) : null)}
      assignmentMode={assignmentMode}
      onAssignmentModeChange={(value: string) => setAssignmentMode(value as 'manual' | 'auto')}
      groupes={groupes}
      selectedGroupeId={selectedGroupeId}
      onGroupeChange={(value: string) => setSelectedGroupeId(value ? parseInt(value, 10) : null)}
      selectedGroupeDetails={selectedGroupeDetails as any}
      stats={stats}
      disabled={combinedLoading}
    />

    {selectedEtudeId && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnhancedAppointmentsPanel
          appointments={filteredAppointments}
          selectedAppointments={selectedAppointments}
          onSelectAppointment={handleSelectAppointment}
          onSelectAllAppointments={handleSelectAllAppointments}
          onUnassignSingle={handleUnassignSingle}
          onSwitch={handleOpenSwitcher}
        />

        {actionMode === 'assign' && (
          <VolunteersPanel
            volunteers={filteredVolunteers}
            selectedVolunteers={selectedVolunteers}
            onSelectVolunteer={handleSelectVolunteer}
            onSelectAll={handleSelectAllVolunteers}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            volunteerFilterOption={volunteerFilterOption}
            onVolunteerFilterChange={setVolunteerFilterOption}
            getVolunteerAppointmentCount={(id: number | undefined) => {
              if (id === undefined) return 0;
              return getVolunteerAppointmentCount ? getVolunteerAppointmentCount(id) ?? 0 : 0;
            }}
          />
        )}
      </div>
    )}

    <AssignmentSummary
      visible={summaryVisible}
      actionMode={actionMode as any}
      assignmentMode={assignmentMode as any}
      selectedAppointmentsCount={selectedAppointments.length}
      selectedVolunteersCount={selectedVolunteers.length}
      selectedGroupeId={selectedGroupeId}
      selectedGroupeDetails={selectedGroupeDetails}
      loading={loading}
      onReset={() => {
        setSelectedAppointments([]);
        setSelectedVolunteers([]);
      }}
      onSubmit={handleMassAssignment}
    />

    {/* Appointment Switcher Modal */}
    {showSwitcher && (
      <AppointmentSwitcher
        preSelectedRdv={switcherRdv as any}
        etudeId={selectedEtudeId as any}
        onClose={handleCloseSwitcher}
        onSwitchComplete={handleSwitchComplete}
      />
    )}
  </div>
);

export default EnhancedMassAssignmentLayout;