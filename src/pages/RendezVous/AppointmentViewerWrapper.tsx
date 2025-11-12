import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppointmentViewer from './AppointmentViewer';
import rdvService from '../../services/rdvService';
import { Loader2 } from 'lucide-react';

interface Appointment {
  idRdv?: number;
  id?: number;
  idEtude?: number;
  idVolontaire?: number | null;
  date?: string;
  heure?: string;
  etat?: string;
  [key: string]: any;
}

const AppointmentViewerWrapper: React.FC = () => {
  const { id, rdvId } = useParams<{ id: string; rdvId: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!rdvId || !id) {
        setError('ID de rendez-vous ou ID d\'étude manquant');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await rdvService.getById(parseInt(id, 10), parseInt(rdvId, 10));
        setAppointment(data);
      } catch (err: any) {
        console.error('Erreur lors du chargement du rendez-vous:', err);
        setError(err?.message || 'Erreur lors du chargement du rendez-vous');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id, rdvId]);

  const handleBack = () => {
    navigate('/rdvs');
  };

  const handleEdit = (apt: Appointment) => {
    // Navigate to edit page or open edit modal
    console.log('Edit appointment:', apt);
    // You can implement the edit functionality here
  };

  const handleRefresh = async () => {
    if (!rdvId || !id) return;
    
    try {
      const data = await rdvService.getById(parseInt(id, 10), parseInt(rdvId, 10));
      setAppointment(data);
    } catch (err: any) {
      console.error('Erreur lors du rechargement du rendez-vous:', err);
      setError(err?.message || 'Erreur lors du rechargement du rendez-vous');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h2 className="text-xl font-semibold text-red-700 mb-2">Erreur</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retour aux rendez-vous
        </button>
      </div>
    );
  }

  return (
    <AppointmentViewer
      appointment={appointment}
      onEdit={handleEdit}
      onBack={handleBack}
      onRefresh={handleRefresh}
    />
  );
};

export default AppointmentViewerWrapper;
