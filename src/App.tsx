import { ToastProvider } from '@/components/ui/ToastProvider';
import { RendezVousProvider } from './pages/RendezVous/context/RendezVousContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginScreen from './pages/Auth/LoginScreen';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from '@/components/Layout/AppLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import VolontairesPage from './pages/Volontaires/VolontairesPage';
import VolontaireDetails from './pages/Volontaires/VolontaireDetails';
import VolontaireForm from './pages/Volontaires/VolontaireForm';
import EtudesPage from './pages/Etudes/EtudesPage';
import EtudeDetail from './pages/Etudes/EtudeDetail';
import PanelHcList from './pages/PanelHc/PanelHcList';
import PanelHcForm from './pages/PanelHc/PanelHcForm';
import PanelHcDetail from './pages/PanelHc/PanelHcDetail';
import AppointmentManager from './pages/RendezVous/AppointmentManager';
import VolunteerToAppointmentAssigner from './pages/RendezVous/VolunteerToAppointmentAssigner';
import VolontairesHcPage from './pages/VolontaireHc/VolontairesHcPage';
import VolontaireHcDetail from './pages/VolontaireHc/VolontaireHcDetail';
import VolontaireHcForm from './pages/VolontaireHc/VolontaireHcForm';
import RapportsPage from './pages/Rapports/RapportsPage';
import GroupesPage from './pages/Groupes/GroupesPage';
import GroupeDetails from './pages/Groupes/GroupeDetails';
import GroupeForm from './pages/Groupes/GroupeForm';
import EtudeFormEnhanced from './pages/Etudes/EtudeFormEnhanced';
import SettingsPage from './pages/Parametres/SettingsPage';
import ProfilePage from './pages/Parametres/ProfilePage';
import PaiementsPage from './pages/Paiements/PaiementsPage';
import UnauthorizedPage from './pages/Auth/UnauthorizedPage';
import AppointmentViewerWrapper from './pages/RendezVous/AppointmentViewerWrapper';
import { Loader2 } from 'lucide-react';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <ToastProvider>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/volontaires" element={<VolontairesPage />} />
            <Route path="/volontaires/nouveau" element={<VolontaireForm />} />
            <Route path="/volontaires/:id" element={<VolontaireDetails />} />
            <Route path="/volontaires/:id/edit" element={<VolontaireForm />} />

            <Route path="/volontaires-hc" element={<VolontairesHcPage />} />
            <Route path="/volontaires-hc/nouveau" element={<VolontaireHcForm />} />
            <Route path="/volontaires-hc/:idVol" element={<VolontaireHcDetail />} />
            <Route path="/volontaires-hc/:idVol/edit" element={<VolontaireHcForm />} />

            <Route path="/etudes" element={<EtudesPage />} />
            <Route path="/etudes/nouvelle" element={<EtudeFormEnhanced />} />
            <Route path="/etudes/:id" element={<EtudeDetail />} />
            <Route path="/etudes/:id/edit" element={<EtudeFormEnhanced />} />

            <Route path="/groupes" element={<GroupesPage />} />
            <Route path="/groupes/nouveau" element={<GroupeForm />} />
            <Route path="/groupes/:id" element={<GroupeDetails />} />
            <Route path="/groupes/:id/edit" element={<GroupeForm />} />

            <Route path="/rdvs" element={<AppointmentManager />} />
            <Route path="/rdvs/assigner" element={<RendezVousProvider><VolunteerToAppointmentAssigner /></RendezVousProvider>} />
            <Route path="/rdvs/:id/:rdvId" element={<RendezVousProvider><AppointmentViewerWrapper /></RendezVousProvider>} />

            <Route path="/panels-hc" element={<PanelHcList />} />
            <Route path="/panels-hc/nouveau" element={<PanelHcForm />} />
            <Route path="/panels-hc/:idPanel" element={<PanelHcDetail />} />
            <Route path="/panels-hc/:idPanel/edit" element={<PanelHcForm />} />

            <Route path="/rapports" element={<RapportsPage />} />

            <Route path="/parametres" element={<SettingsPage />} />
            <Route path="/profil" element={<ProfilePage />} />

            <Route path="/paiements" element={<PaiementsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;



