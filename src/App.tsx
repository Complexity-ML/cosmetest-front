import { ToastProvider } from '@/components/ui/ToastProvider';
import { RendezVousProvider } from './pages/RendezVous/context/RendezVousContext';
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from '@/components/Layout/AppLayout';
import { Loader2 } from 'lucide-react';

const LoginScreen = lazy(() => import('./pages/Auth/LoginScreen'));
const UnauthorizedPage = lazy(() => import('./pages/Auth/UnauthorizedPage'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const VolontairesPage = lazy(() => import('./pages/Volontaires/VolontairesPage'));
const VolontaireDetails = lazy(() => import('./pages/Volontaires/VolontaireDetails'));
const VolontaireForm = lazy(() => import('./pages/Volontaires/VolontaireForm'));
const VolontairesHcPage = lazy(() => import('./pages/VolontaireHc/VolontairesHcPage'));
const VolontaireHcDetail = lazy(() => import('./pages/VolontaireHc/VolontaireHcDetail'));
const VolontaireHcForm = lazy(() => import('./pages/VolontaireHc/VolontaireHcForm'));
const EtudesPage = lazy(() => import('./pages/Etudes/EtudesPage'));
const EtudeDetail = lazy(() => import('./pages/Etudes/EtudeDetail'));
const EtudeFormEnhanced = lazy(() => import('./pages/Etudes/EtudeFormEnhanced'));
const GroupesPage = lazy(() => import('./pages/Groupes/GroupesPage'));
const GroupeDetails = lazy(() => import('./pages/Groupes/GroupeDetails'));
const GroupeForm = lazy(() => import('./pages/Groupes/GroupeForm'));
const AppointmentManager = lazy(() => import('./pages/RendezVous/AppointmentManager'));
const VolunteerToAppointmentAssigner = lazy(() => import('./pages/RendezVous/VolunteerToAppointmentAssigner'));
const AppointmentViewerWrapper = lazy(() => import('./pages/RendezVous/AppointmentViewerWrapper'));
const PanelHcList = lazy(() => import('./pages/PanelHc/PanelHcList'));
const PanelHcForm = lazy(() => import('./pages/PanelHc/PanelHcForm'));
const PanelHcDetail = lazy(() => import('./pages/PanelHc/PanelHcDetail'));
const RapportsPage = lazy(() => import('./pages/Rapports/RapportsPage'));
const SettingsPage = lazy(() => import('./pages/Parametres/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/Parametres/ProfilePage'));
const ConnectionLogsPage = lazy(() => import('./pages/Parametres/ConnectionLogsPage'));
const PaiementsPage = lazy(() => import('./pages/Paiements/PaiementsPage'));

const RouteLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
  </div>
);

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <ToastProvider>
        <RouteLoader />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <Suspense fallback={<RouteLoader />}>
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
            <Route element={<ProtectedRoute requiredRole={2} />}>
              <Route path="/parametres/logs" element={<ConnectionLogsPage />} />
            </Route>

            <Route path="/paiements" element={<PaiementsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ToastProvider>
  );
}

export default App;



