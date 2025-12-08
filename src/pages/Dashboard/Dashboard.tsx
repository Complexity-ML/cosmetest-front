import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { formatDate } from "../../utils/dateUtils";
import {
  Calendar,
  Users,
  FlaskConical,
  BarChart3,
  ChevronRight,
  Plus,
  UserPlus,
  FileText,
  CalendarPlus,
  CalendarCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import api from "../../services/api";

// Configuration de l'URL de base de l'API
const API_URL =
  import.meta.env?.VITE_API_URL ||
  import.meta.env?.VITE_REACT_APP_API_URL ||
  "";

// Types
interface Stats {
  volontairesActifs: number;
  etudesEnCours: number;
  rdvToday: number;
}

interface RendezVous {
  id: string | number;
  etudeRef: string;
  commentaires: string;
  date: string;
  heure: string;
}

interface Etude {
  id: string | number;
  ref: string;
  titre: string;
  volontaires: number;
  status: "En cours" | "À venir" | "Terminée";
}

interface Activite {
  id: string | number;
  type: string;
  user: string;
  description: string;
  date: string;
}

interface StatsJour {
  volontairesAjoutes: number;
  rdvEffectues: number;
  nouvellesPreinscriptions: number;
}

interface ApiErrors {
  stats?: string;
  rdvs?: string;
  etudes?: string;
  activite?: string;
  statsJour?: string;
}

// Données par défaut
const defaultStats: Stats = {
  volontairesActifs: 0,
  etudesEnCours: 0,
  rdvToday: 0,
};

const defaultStatsJour: StatsJour = {
  volontairesAjoutes: 0,
  rdvEffectues: 0,
  nouvellesPreinscriptions: 0,
};

// Composant StatCard (using existing StatCard component pattern)
interface StatCardProps {
  title: string;
  value: number;
  color: "blue" | "green" | "yellow" | "purple";
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color, icon }) => {
  const colorClasses = {
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      iconBg: "bg-blue-200",
      hover: "hover:bg-blue-50",
    },
    green: {
      bg: "bg-green-100",
      text: "text-green-800",
      iconBg: "bg-green-200",
      hover: "hover:bg-green-50",
    },
    yellow: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      iconBg: "bg-yellow-200",
      hover: "hover:bg-yellow-50",
    },
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      iconBg: "bg-purple-200",
      hover: "hover:bg-purple-50",
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      className={cn(
        colors.bg,
        colors.text,
        colors.hover,
        "p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
      )}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center",
            colors.iconBg,
            colors.text
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

// Composant ActivityList (using Card components)
interface ActivityListProps<T> {
  title: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  viewAllLink?: string;
  viewAllLabel?: string;
}

function ActivityList<T extends { id: string | number }>({
  title,
  items,
  renderItem,
  viewAllLink,
  viewAllLabel = "Voir tous",
}: ActivityListProps<T>) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center group"
            >
              {viewAllLabel}
              <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-gray-100">
          {items.length > 0 ? (
            items.map((item, index) => (
              <li
                key={item.id || `item-${index}`}
                className="py-3 hover:bg-gray-50 transition-colors rounded"
              >
                {renderItem(item)}
              </li>
            ))
          ) : (
            <li className="py-8 text-center text-muted-foreground">
              Aucune donnée disponible
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

// Composant ActionCard
interface ActionCardProps {
  title: string;
  icon: React.ReactNode;
  link: string;
  color: "blue" | "green" | "yellow" | "purple";
}

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  icon,
  link,
  color,
}) => {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      hover: "hover:bg-blue-100",
      text: "text-blue-700",
      iconBg: "bg-blue-100",
      iconHover: "group-hover:bg-blue-200",
      iconText: "text-blue-600",
    },
    green: {
      bg: "bg-green-50",
      hover: "hover:bg-green-100",
      text: "text-green-700",
      iconBg: "bg-green-100",
      iconHover: "group-hover:bg-green-200",
      iconText: "text-green-600",
    },
    yellow: {
      bg: "bg-yellow-50",
      hover: "hover:bg-yellow-100",
      text: "text-yellow-700",
      iconBg: "bg-yellow-100",
      iconHover: "group-hover:bg-yellow-200",
      iconText: "text-yellow-600",
    },
    purple: {
      bg: "bg-purple-50",
      hover: "hover:bg-purple-100",
      text: "text-purple-700",
      iconBg: "bg-purple-100",
      iconHover: "group-hover:bg-purple-200",
      iconText: "text-purple-600",
    },
  };

  const colors = colorClasses[color];

  return (
    <Link
      to={link}
      className={cn(
        "flex items-center w-full py-3 px-4 rounded-lg transition-colors group",
        colors.bg,
        colors.text,
        colors.hover
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center mr-3 transition-colors",
          colors.iconBg,
          colors.iconText,
          colors.iconHover
        )}
      >
        {icon}
      </div>
      <span>{title}</span>
    </Link>
  );
};

// Composant Dashboard principal
const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [prochainRdvs, setProchainRdvs] = useState<RendezVous[]>([]);
  const [etudesRecentes, setEtudesRecentes] = useState<Etude[]>([]);
  const [activiteRecente, setActiviteRecente] = useState<Activite[]>([]);
  const [statsJour, setStatsJour] = useState<StatsJour>(defaultStatsJour);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiErrors, setApiErrors] = useState<ApiErrors>({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setApiErrors({});

        const errors: ApiErrors = {};

        // Configurer Axios avec un timeout
        const axiosConfig = {
          timeout: 10000, // 10 secondes
        };

        // Stats générales
        try {
          const statsResponse = await api.get(
            `${API_URL}/api/dashboard/stats`,
            axiosConfig
          );
          setStats(statsResponse.data);
        } catch (err) {
          console.error("Erreur lors du chargement des stats:", err);
          errors.stats = (err as Error).message;
        }

        // Rendez-vous
        try {
          const rdvsResponse = await api.get(
            `${API_URL}/api/dashboard/rdv/prochains`,
            axiosConfig
          );
          setProchainRdvs(rdvsResponse.data);
        } catch (err) {
          console.error("Erreur lors du chargement des rendez-vous:", err);
          errors.rdvs = (err as Error).message;
        }

        // Études
        try {
          const etudesResponse = await api.get(
            `${API_URL}/api/dashboard/etude/recentes`,
            axiosConfig
          );
          setEtudesRecentes(etudesResponse.data);
        } catch (err) {
          console.error("Erreur lors du chargement des études:", err);
          errors.etudes = (err as Error).message;
        }

        // Activité
        try {
          const activiteResponse = await api.get(
            `${API_URL}/api/dashboard/activite/recente`,
            axiosConfig
          );
          setActiviteRecente(activiteResponse.data);
        } catch (err) {
          console.error("Erreur lors du chargement de l'activité:", err);
          errors.activite = (err as Error).message;
        }

        // Stats du jour
        try {
          const statsJourResponse = await api.get(
            `${API_URL}/api/dashboard/stats-jour`,
            axiosConfig
          );
          setStatsJour(statsJourResponse.data);
        } catch (err) {
          console.error("Erreur lors du chargement des stats du jour:", err);
          errors.statsJour = (err as Error).message;
        }

        // Si toutes les requêtes ont échoué, afficher une erreur générale
        if (Object.keys(errors).length === 5) {
          setError(
            t('dashboard.loadError')
          );
        } else if (Object.keys(errors).length > 0) {
          setApiErrors(errors);
        }
      } catch (error) {
        console.error("Erreur générale lors du chargement des données:", error);
        setError(t('dashboard.unexpectedError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: Etude["status"]) => {
    const variants: Record<
      Etude["status"],
      "default" | "secondary" | "outline"
    > = {
      "En cours": "default",
      "À venir": "secondary",
      Terminée: "outline",
    };

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getActivityIcon = (type: string) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case "volontaire_ajout":
        return <UserPlus className={cn(iconClass, "text-blue-600")} />;
      case "rdv_planification":
        return <CalendarPlus className={cn(iconClass, "text-yellow-600")} />;
      case "etude_creation":
        return <FileText className={cn(iconClass, "text-green-600")} />;
      case "volontaire_inscription":
        return <FileText className={cn(iconClass, "text-purple-600")} />;
      case "etude_cloture":
        return <FlaskConical className={cn(iconClass, "text-gray-600")} />;
      default:
        return <BarChart3 className={cn(iconClass, "text-gray-400")} />;
    }
  };

  const getActivityBg = (type: string) => {
    switch (type) {
      case "volontaire_ajout":
        return "bg-blue-100";
      case "rdv_planification":
        return "bg-yellow-100";
      case "etude_creation":
        return "bg-green-100";
      case "volontaire_inscription":
        return "bg-purple-100";
      case "etude_cloture":
        return "bg-gray-100";
      default:
        return "bg-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error}
          <Button
            onClick={() => window.location.reload()}
            variant="link"
            className="ml-2 p-0 h-auto"
          >
            {t('common.retry')}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-800">{t('sidebar.dashboard')}</h1>
        <div className="text-sm text-muted-foreground bg-white px-3 py-1 rounded-md shadow">
          {t('dashboard.lastUpdate')}:{" "}
          {formatDate(new Date().toISOString())}
        </div>
      </div>

      {/* Affichage des erreurs partielles */}
      {Object.keys(apiErrors).length > 0 && (
        <Alert>
          <AlertDescription>
            <p className="font-medium">
              {t('dashboard.partialLoadError')}
            </p>
            <ul className="mt-2 text-sm">
              {apiErrors.stats && <li>• {t('dashboard.generalStats')}</li>}
              {apiErrors.rdvs && <li>• {t('dashboard.upcomingAppointments')}</li>}
              {apiErrors.etudes && <li>• {t('dashboard.recentStudies')}</li>}
              {apiErrors.activite && <li>• {t('dashboard.recentActivity')}</li>}
              {apiErrors.statsJour && <li>• {t('dashboard.todayStats')}</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title={t('dashboard.activeVolunteers')}
          value={stats.volontairesActifs}
          color="blue"
          icon={<Users className="h-7 w-7" />}
        />
        <StatCard
          title={t('dashboard.ongoingStudies')}
          value={stats.etudesEnCours}
          color="green"
          icon={<FlaskConical className="h-7 w-7" />}
        />
        <StatCard
          title={t('dashboard.todayAppointments')}
          value={stats.rdvToday}
          color="yellow"
          icon={<Calendar className="h-7 w-7" />}
        />
      </div>

      {/* Activity Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityList
          title={t('dashboard.upcomingAppointments')}
          items={prochainRdvs}
          viewAllLink="/rdvs"
          renderItem={(rdv) => (
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <CalendarCheck className="text-blue-600 h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {t('dashboard.study')} {rdv.etudeRef}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {rdv.commentaires}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{rdv.date}</p>
                <p className="text-xs text-blue-600 font-medium">{rdv.heure}</p>
              </div>
            </div>
          )}
        />

        <ActivityList
          title={t('dashboard.recentStudies')}
          items={etudesRecentes}
          viewAllLink="/etudes"
          renderItem={(etude) => (
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mr-3">
                  <FlaskConical className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {etude.ref}: {etude.titre}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {etude.volontaires} {t('dashboard.volunteers')}
                  </p>
                </div>
              </div>
              {getStatusBadge(etude.status)}
            </div>
          )}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activité récente */}
        <Card className="lg:col-span-2 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              {t('dashboard.recentActivity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flow-root">
              {activiteRecente.length > 0 ? (
                <ul className="-mb-8">
                  {activiteRecente.map((activite, index) => (
                    <li key={activite.id}>
                      <div className="relative pb-8">
                        {index !== activiteRecente.length - 1 && (
                          <span
                            className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex items-start space-x-3">
                          <div
                            className={cn(
                              "relative px-1 rounded-full flex h-10 w-10 items-center justify-center",
                              getActivityBg(activite.type)
                            )}
                          >
                            {getActivityIcon(activite.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium text-gray-900">
                                {activite.user}
                              </span>{" "}
                              {activite.description}
                              <span className="whitespace-nowrap text-xs text-gray-400 ml-2">
                                {formatDate(activite.date)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t('dashboard.noRecentActivity')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2 text-blue-600" />
              {t('dashboard.quickActions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ActionCard
                title={t('dashboard.addVolunteer')}
                link="/volontaires/nouveau"
                color="blue"
                icon={<UserPlus className="h-4 w-4" />}
              />
              <ActionCard
                title={t('dashboard.createStudy')}
                link="/etudes/nouvelle"
                color="green"
                icon={<FileText className="h-4 w-4" />}
              />
              <ActionCard
                title={t('dashboard.scheduleAppointment')}
                link="/rdvs"
                color="yellow"
                icon={<CalendarPlus className="h-4 w-4" />}
              />

              {/* Statistiques du jour */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-600 mb-3">
                  {t('dashboard.today')}
                </h3>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    {t('dashboard.volunteersAdded')}
                  </span>
                  <span className="font-medium text-gray-900">
                    {statsJour.volontairesAjoutes}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-muted-foreground">{t('dashboard.appointmentsCompleted')}</span>
                  <span className="font-medium text-gray-900">
                    {statsJour.rdvEffectues}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-muted-foreground">
                    {t('dashboard.newRegistrations')}
                  </span>
                  <span className="font-medium text-gray-900">
                    {statsJour.nouvellesPreinscriptions}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
