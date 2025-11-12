import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useMassAssignment from './hooks/useMassAssignment';
import { LoadingSpinner, ErrorMessage, EnhancedMassAssignmentLayout } from '../../components/RendezVous/VolunteerToAppointmentAssigner';

const VolunteerToAppointmentAssigner = () => {
  const navigate = useNavigate();
  const { id: etudeIdFromUrl } = useParams();

  const {
    studies,

    selectedEtudeId,
    setSelectedEtudeId,
    etudeDetails,
    groupes,
    selectedGroupeId,
    setSelectedGroupeId,
    selectedGroupeDetails,
    filteredAppointments,
    filteredVolunteers,
    selectedAppointments,
    selectedVolunteers,
    stats,
    searchQuery,
    setSearchQuery,
    volunteerFilterOption,
    setVolunteerFilterOption,
    assignmentMode,
    setAssignmentMode,
    actionMode,
    setActionMode,
    getVolunteerAppointmentCount,
    loading,
    combinedLoading,
    error,
    handleSelectAppointment,
    handleSelectAllAppointments,
    handleSelectVolunteer,
    handleSelectAllVolunteers,
    setSelectedAppointments,
    setSelectedVolunteers,
    handleMassAssignment,
    handleUnassignSingle,
    showSwitcher,
    switcherRdv,
    handleOpenSwitcher,
    handleCloseSwitcher,
    handleSwitchComplete,
  } = useMassAssignment(etudeIdFromUrl);

  const summaryVisible = useMemo(
    () =>
      Boolean(
        selectedEtudeId &&
          selectedAppointments.length > 0 &&
          (actionMode === 'unassign' || (actionMode === 'assign' && selectedVolunteers.length > 0 && selectedGroupeId)),
      ),
    [actionMode, selectedAppointments.length, selectedEtudeId, selectedGroupeId, selectedVolunteers.length],
  );

  if (combinedLoading && !studies.length) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage error={error} onReturnToAppointments={() => navigate('/rdv')} />;
  }

  return (
    <EnhancedMassAssignmentLayout
      etudeDetails={etudeDetails as any}
      selectedEtudeId={selectedEtudeId}
      onBack={() => navigate('/rdv')}
      studies={studies as any}
      setSelectedEtudeId={setSelectedEtudeId}
      actionMode={actionMode as 'assign' | 'unassign'}
      setActionMode={setActionMode}
      assignmentMode={assignmentMode as 'manual' | 'auto'}
      setAssignmentMode={setAssignmentMode}
      groupes={groupes as any}
      selectedGroupeId={selectedGroupeId}
      setSelectedGroupeId={setSelectedGroupeId}
      selectedGroupeDetails={selectedGroupeDetails as any}
      stats={stats}
      combinedLoading={combinedLoading}
      filteredAppointments={filteredAppointments as any}
      selectedAppointments={selectedAppointments as any}
      handleSelectAppointment={handleSelectAppointment}
      handleSelectAllAppointments={handleSelectAllAppointments}
      handleUnassignSingle={handleUnassignSingle}
      filteredVolunteers={filteredVolunteers}
      selectedVolunteers={selectedVolunteers}
      handleSelectVolunteer={handleSelectVolunteer}
      handleSelectAllVolunteers={handleSelectAllVolunteers}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      volunteerFilterOption={volunteerFilterOption}
      setVolunteerFilterOption={setVolunteerFilterOption}
      getVolunteerAppointmentCount={getVolunteerAppointmentCount}
      summaryVisible={summaryVisible}
      loading={loading}
      setSelectedAppointments={setSelectedAppointments}
      setSelectedVolunteers={setSelectedVolunteers}
      handleMassAssignment={handleMassAssignment}
      showSwitcher={showSwitcher}
      switcherRdv={switcherRdv as any}
      handleOpenSwitcher={handleOpenSwitcher}
      handleCloseSwitcher={handleCloseSwitcher}
      handleSwitchComplete={handleSwitchComplete}
    />
  );
};

export default VolunteerToAppointmentAssigner;

