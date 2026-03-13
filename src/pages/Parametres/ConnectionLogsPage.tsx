import { useState, useEffect, useContext, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import parametreService from "../../services/parametreService";
import volontaireService from "../../services/volontaireService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { ShieldAlert, ArrowLeft, RefreshCw, CheckCircle, XCircle, Clock, Activity, ChevronLeft, ChevronRight, Trash2, Radio, Eye, User } from "lucide-react";

interface ConnectionLog {
    id: number;
    login: string;
    success: boolean;
    ip?: string;
    createdAt: string;
}

interface AuditLog {
    id: number;
    utilisateur: string;
    action: string;
    entite: string;
    entiteId?: string;
    details?: string;
    ip?: string;
    createdAt: string;
}

interface LogPage<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
}

type AuditPage = LogPage<AuditLog>;
type ConnexionPage = LogPage<ConnectionLog>;

interface ActiveSession {
    login: string;
    connectedSince: string;
    durationSeconds: number;
}

interface SessionHistoryEntry {
    id: number;
    login: string;
    loginTime: string;
    logoutTime: string | null;
    durationSeconds: number | null;
    reason: string;
}

interface SessionHistoryPage {
    content: SessionHistoryEntry[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
}

const ACTION_COLORS: Record<string, string> = {
    CREATE: "bg-green-100 text-green-800",
    UPDATE: "bg-blue-100 text-blue-800",
    DELETE: "bg-red-100 text-red-800",
    ARCHIVE: "bg-orange-100 text-orange-800",
    UNARCHIVE: "bg-yellow-100 text-yellow-800",
    PAYE: "bg-purple-100 text-purple-800",
    ANNULATION: "bg-pink-100 text-pink-800",
    ASSIGN: "bg-teal-100 text-teal-800",
    UNASSIGN: "bg-gray-100 text-gray-800",
    LOGIN: "bg-green-100 text-green-800",
    LOGOUT: "bg-slate-100 text-slate-800",
};

const ConnectionLogsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const [tab, setTab] = useState<"connexions" | "audit" | "live">("connexions");

    // Connexions
    const [logsPage, setLogsPage] = useState<ConnexionPage | null>(null);
    const [logsCurrentPage, setLogsCurrentPage] = useState(0);
    const [logsLoading, setLogsLoading] = useState(true);
    const [logsError, setLogsError] = useState<string | null>(null);

    // Audit
    const [audit, setAudit] = useState<AuditPage | null>(null);
    const [auditPage, setAuditPage] = useState(0);
    const [auditLoading, setAuditLoading] = useState(false);
    const [auditError, setAuditError] = useState<string | null>(null);
    const [purgeDate, setPurgeDate] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 6);
        return d.toISOString().slice(0, 10);
    });
    const [purgeLoading, setPurgeLoading] = useState(false);
    const [purgeConfirm, setPurgeConfirm] = useState(false);

    // Live sessions
    const [liveSessions, setLiveSessions] = useState<ActiveSession[]>([]);
    const [liveLoading, setLiveLoading] = useState(false);
    const [liveError, setLiveError] = useState<string | null>(null);
    const [liveCount, setLiveCount] = useState(0);

    // Session history
    const [sessionHistory, setSessionHistory] = useState<SessionHistoryPage | null>(null);
    const [historyPage, setHistoryPage] = useState(0);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);

    // Audit detail modal
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [detailVol, setDetailVol] = useState<{ nom: string; prenom: string } | null>(null);
    const [detailVolLoading, setDetailVolLoading] = useState(false);

    const fetchLogs = useCallback(async () => {
        try {
            setLogsLoading(true);
            setLogsError(null);
            const data = await parametreService.getConnectionLogs(logsCurrentPage, 50);
            setLogsPage(data);
        } catch (err) {
            setLogsError(err instanceof Error ? err.message : t("logs.unknownError"));
        } finally {
            setLogsLoading(false);
        }
    }, [t, logsCurrentPage]);

    const fetchAudit = useCallback(async (page: number) => {
        try {
            setAuditLoading(true);
            setAuditError(null);
            const data = await parametreService.getAuditLogs(page, 50);
            setAudit(data);
        } catch (err) {
            setAuditError(err instanceof Error ? err.message : t("logs.unknownError"));
        } finally {
            setAuditLoading(false);
        }
    }, [t]);

    useEffect(() => {
        if (!auth?.hasPermission(2)) {
            navigate("/unauthorized");
            return;
        }
        fetchLogs();
        fetchAudit(0);
    }, []);

    useEffect(() => {
        if (tab === "audit") fetchAudit(auditPage);
    }, [auditPage]);

    useEffect(() => {
        if (tab === "connexions") fetchLogs();
    }, [logsCurrentPage]);

    const fetchLive = useCallback(async () => {
        try {
            setLiveLoading(true);
            setLiveError(null);
            const data = await parametreService.getActiveSessions();
            setLiveSessions(data.sessions);
            setLiveCount(data.count);
        } catch (err) {
            setLiveError(err instanceof Error ? err.message : t("logs.unknownError"));
        } finally {
            setLiveLoading(false);
        }
    }, [t]);

    const fetchHistory = useCallback(async (page: number) => {
        try {
            setHistoryLoading(true);
            setHistoryError(null);
            const data = await parametreService.getSessionHistory(page, 50);
            setSessionHistory(data);
        } catch (err) {
            setHistoryError(err instanceof Error ? err.message : t("logs.unknownError"));
        } finally {
            setHistoryLoading(false);
        }
    }, [t]);

    useEffect(() => {
        if (tab === "live") {
            fetchLive();
            fetchHistory(0);
            setHistoryPage(0);
            const interval = setInterval(fetchLive, 30000);
            return () => clearInterval(interval);
        }
    }, [tab, fetchLive]);

    useEffect(() => {
        if (tab === "live") fetchHistory(historyPage);
    }, [historyPage]);

    const extractVolId = (log: AuditLog): number | null => {
        // 1. Try to extract from details: "vol:#3969" or "volontaire:#42"
        if (log.details) {
            const m = log.details.match(/vol(?:ontaire)?:\s*#?(\d+)/i);
            if (m) return Number(m[1]);
        }
        // 2. If entity is exactly VOLONTAIRE, entiteId is the vol ID directly
        if (log.entite === "VOLONTAIRE" && log.entiteId && /^\d+$/.test(log.entiteId)) {
            return Number(log.entiteId);
        }
        return null;
    };

    const openAuditDetail = useCallback(async (log: AuditLog) => {
        setSelectedLog(log);
        setDetailVol(null);
        const volId = extractVolId(log);
        if (log.entite.includes("VOLONTAIRE") && volId) {
            try {
                setDetailVolLoading(true);
                const response = await volontaireService.getById(volId);
                const vol = (response as any)?.data ?? response;
                if (vol) setDetailVol({
                    nom: vol.nom || vol.nomVol || "",
                    prenom: vol.prenom || vol.prenomVol || ""
                });
            } catch {
                // volontaire introuvable ou supprimé
            } finally {
                setDetailVolLoading(false);
            }
        }
    }, []);

    const handlePurge = async () => {
        try {
            setPurgeLoading(true);
            const result = await parametreService.purgeAuditLogs(purgeDate);
            setPurgeConfirm(false);
            fetchAudit(0);
            setAuditPage(0);
            alert(`${result.deleted} entrée(s) supprimée(s).`);
        } catch (err) {
            setAuditError(err instanceof Error ? err.message : t("logs.unknownError"));
        } finally {
            setPurgeLoading(false);
        }
    };

    const handleRefresh = () => {
        if (tab === "connexions") fetchLogs();
        else if (tab === "audit") fetchAudit(auditPage);
        else fetchLive();
    };

    const isLoading = tab === "connexions" ? logsLoading : tab === "audit" ? auditLoading : liveLoading;

    return (
        <div className="container max-w-7xl mx-auto p-6 space-y-6">
            {/* En-tête */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/parametres")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <ShieldAlert className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t("logs.title")}</h1>
                        <p className="text-muted-foreground">{t("logs.subtitle")}</p>
                    </div>
                </div>
                <Button variant="outline" onClick={handleRefresh} size="sm" disabled={isLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    {t("logs.refresh")}
                </Button>
            </div>

            {/* Onglets */}
            <div className="flex gap-1 border-b">
                <button
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === "connexions" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setTab("connexions")}
                >
                    <Clock className="inline mr-2 h-4 w-4" />
                    {t("logs.tabConnexions")}
                    {logsPage && <span className="ml-2 bg-muted text-muted-foreground text-xs px-1.5 py-0.5 rounded-full">{logsPage.totalElements}</span>}
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === "audit" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setTab("audit")}
                >
                    <Activity className="inline mr-2 h-4 w-4" />
                    {t("logs.tabAudit")}
                    {audit && <span className="ml-2 bg-muted text-muted-foreground text-xs px-1.5 py-0.5 rounded-full">{audit.totalElements}</span>}
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === "live" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setTab("live")}
                >
                    <Radio className="inline mr-2 h-4 w-4" />
                    {t("logs.tabLive")}
                    {liveCount > 0 && <span className="ml-2 bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full">{liveCount}</span>}
                </button>
            </div>

            {/* ONGLET CONNEXIONS */}
            {tab === "connexions" && (
                <>
                    {logsError && (
                        <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>{logsError}</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card><CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <div><p className="text-2xl font-bold">{logsPage?.totalElements ?? 0}</p><p className="text-sm text-muted-foreground">{t("logs.totalConnections")}</p></div>
                            </div>
                        </CardContent></Card>
                        <Card><CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <div><p className="text-2xl font-bold text-green-600">{logsPage?.content.filter(l => l.success).length ?? 0}</p><p className="text-sm text-muted-foreground">{t("logs.successCount")}</p></div>
                            </div>
                        </CardContent></Card>
                        <Card><CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <XCircle className="h-5 w-5 text-destructive" />
                                <div><p className="text-2xl font-bold text-destructive">{logsPage?.content.filter(l => !l.success).length ?? 0}</p><p className="text-sm text-muted-foreground">{t("logs.failureCount")}</p></div>
                            </div>
                        </CardContent></Card>
                    </div>

                    <Card>
                        <CardHeader><CardTitle>{t("logs.history")}</CardTitle><CardDescription>{t("logs.historyDesc")}</CardDescription></CardHeader>
                        <CardContent>
                            {logsLoading ? (
                                <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto" /></div>
                            ) : !logsPage || logsPage.content.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground"><Clock className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>{t("logs.noLogs")}</p></div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead><tr className="border-b text-muted-foreground">
                                                <th className="text-left py-3 px-4 font-medium">{t("logs.loginCol")}</th>
                                                <th className="text-left py-3 px-4 font-medium">{t("logs.statusCol")}</th>
                                                <th className="text-left py-3 px-4 font-medium">{t("logs.ipCol")}</th>
                                                <th className="text-left py-3 px-4 font-medium">{t("logs.dateCol")}</th>
                                            </tr></thead>
                                            <tbody>
                                                {logsPage.content.map(log => (
                                                    <tr key={log.id} className="border-b hover:bg-muted/50 transition-colors">
                                                        <td className="py-3 px-4 font-medium">{log.login}</td>
                                                        <td className="py-3 px-4">
                                                            <Badge variant={log.success ? "default" : "destructive"}>
                                                                {log.success ? <><CheckCircle className="mr-1 h-3 w-3" />{t("logs.success")}</> : <><XCircle className="mr-1 h-3 w-3" />{t("logs.failure")}</>}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{log.ip || "—"}</td>
                                                        <td className="py-3 px-4 text-muted-foreground">{new Date(log.createdAt).toLocaleString("fr-FR")}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {logsPage.totalPages > 1 && (
                                        <div className="flex items-center justify-between pt-4 border-t">
                                            <p className="text-sm text-muted-foreground">
                                                {t("logs.page")} {logsPage.page + 1} / {logsPage.totalPages} ({logsPage.totalElements} {t("logs.entries")})
                                            </p>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" disabled={logsCurrentPage === 0} onClick={() => setLogsCurrentPage(p => p - 1)}>
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" disabled={logsCurrentPage >= logsPage.totalPages - 1} onClick={() => setLogsCurrentPage(p => p + 1)}>
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {/* ONGLET AUDIT */}
            {tab === "audit" && (
                <>
                    {auditError && (
                        <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>{auditError}</AlertDescription>
                        </Alert>
                    )}

                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <CardTitle>{t("logs.auditHistory")}</CardTitle>
                                    <CardDescription>{t("logs.auditHistoryDesc")}</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!purgeConfirm ? (
                                        <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive hover:text-white" onClick={() => setPurgeConfirm(true)}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            {t("logs.purge")}
                                        </Button>
                                    ) : (
                                        <>
                                            <input
                                                type="date"
                                                className="text-sm border rounded px-2 py-1"
                                                value={purgeDate}
                                                max={new Date().toISOString().slice(0, 10)}
                                                onChange={e => setPurgeDate(e.target.value)}
                                            />
                                            <Button variant="destructive" size="sm" disabled={purgeLoading} onClick={handlePurge}>
                                                {purgeLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                                {t("logs.purgeConfirm")}
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => setPurgeConfirm(false)}>{t("logs.cancel")}</Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {auditLoading ? (
                                <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto" /></div>
                            ) : !audit || audit.content.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground"><Activity className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>{t("logs.noAuditLogs")}</p></div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead><tr className="border-b text-muted-foreground">
                                                <th className="text-left py-3 px-4 font-medium">{t("logs.auditUser")}</th>
                                                <th className="text-left py-3 px-4 font-medium">{t("logs.auditAction")}</th>
                                                <th className="text-left py-3 px-4 font-medium">{t("logs.auditEntity")}</th>
                                                <th className="text-left py-3 px-4 font-medium">{t("logs.auditId")}</th>
                                                <th className="text-left py-3 px-4 font-medium">{t("logs.auditDetails")}</th>
                                                <th className="text-left py-3 px-4 font-medium">{t("logs.ipCol")}</th>
                                                <th className="text-left py-3 px-4 font-medium">{t("logs.dateCol")}</th>
                                                <th className="py-3 px-4"></th>
                                            </tr></thead>
                                            <tbody>
                                                {audit.content.map(log => (
                                                    <tr key={log.id} className="border-b hover:bg-muted/50 transition-colors">
                                                        <td className="py-3 px-4 font-medium">{log.utilisateur}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ACTION_COLORS[log.action] || "bg-gray-100 text-gray-800"}`}>
                                                                {log.action}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-muted-foreground">{log.entite}</td>
                                                        <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{log.entiteId || "—"}</td>
                                                        <td className="py-3 px-4 text-muted-foreground text-xs max-w-[200px] truncate">{log.details || "—"}</td>
                                                        <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{log.ip || "—"}</td>
                                                        <td className="py-3 px-4 text-muted-foreground">{new Date(log.createdAt).toLocaleString("fr-FR")}</td>
                                                        <td className="py-3 px-2">
                                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openAuditDetail(log)}>
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {audit.totalPages > 1 && (
                                        <div className="flex items-center justify-between pt-4 border-t">
                                            <p className="text-sm text-muted-foreground">
                                                {t("logs.page")} {audit.page + 1} / {audit.totalPages} ({audit.totalElements} {t("logs.entries")})
                                            </p>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" disabled={auditPage === 0} onClick={() => setAuditPage(p => p - 1)}>
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" disabled={auditPage >= audit.totalPages - 1} onClick={() => setAuditPage(p => p + 1)}>
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
            {/* ONGLET EN DIRECT */}
            {tab === "live" && (
                <>
                    {liveError && (
                        <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>{liveError}</AlertDescription>
                        </Alert>
                    )}

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        {t("logs.liveTitle")}
                                    </CardTitle>
                                    <CardDescription>{t("logs.liveDesc")}</CardDescription>
                                </div>
                                <span className="text-sm text-muted-foreground">{t("logs.liveRefresh")}</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {liveLoading ? (
                                <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto" /></div>
                            ) : liveSessions.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Radio className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p>{t("logs.liveEmpty")}</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="border-b text-muted-foreground">
                                            <th className="text-left py-3 px-4 font-medium">{t("logs.loginCol")}</th>
                                            <th className="text-left py-3 px-4 font-medium">{t("logs.liveConnectedSince")}</th>
                                            <th className="text-left py-3 px-4 font-medium">{t("logs.liveDuration")}</th>
                                        </tr></thead>
                                        <tbody>
                                            {liveSessions.map(s => (
                                                <tr key={s.login} className="border-b hover:bg-muted/50 transition-colors">
                                                    <td className="py-3 px-4 font-medium flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span>
                                                        {s.login}
                                                    </td>
                                                    <td className="py-3 px-4 text-muted-foreground">{new Date(s.connectedSince).toLocaleString("fr-FR")}</td>
                                                    <td className="py-3 px-4 font-mono text-sm">{formatDuration(s.durationSeconds)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Historique des sessions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                {t("logs.sessionHistoryTitle")}
                            </CardTitle>
                            <CardDescription>{t("logs.sessionHistoryDesc")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {historyError && (
                                <Alert variant="destructive" className="mb-4">
                                    <XCircle className="h-4 w-4" />
                                    <AlertDescription>{historyError}</AlertDescription>
                                </Alert>
                            )}
                            {historyLoading ? (
                                <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto" /></div>
                            ) : !sessionHistory || sessionHistory.content.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Clock className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                    <p>{t("logs.sessionHistoryEmpty")}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead><tr className="border-b text-muted-foreground">
                                                <th className="text-left py-3 px-4 font-medium">{t("logs.loginCol")}</th>
                                                <th className="text-left py-3 px-4 font-medium">{t("logs.liveConnectedSince")}</th>
                                                <th className="text-left py-3 px-4 font-medium">{t("logs.sessionHistoryEnd")}</th>
                                                <th className="text-left py-3 px-4 font-medium">{t("logs.liveDuration")}</th>
                                                <th className="text-left py-3 px-4 font-medium">{t("logs.sessionHistoryReason")}</th>
                                            </tr></thead>
                                            <tbody>
                                                {sessionHistory.content.map(s => (
                                                    <tr key={s.id} className="border-b hover:bg-muted/50 transition-colors">
                                                        <td className="py-3 px-4 font-medium">{s.login}</td>
                                                        <td className="py-3 px-4 text-muted-foreground">{new Date(s.loginTime).toLocaleString("fr-FR")}</td>
                                                        <td className="py-3 px-4 text-muted-foreground">{s.logoutTime ? new Date(s.logoutTime).toLocaleString("fr-FR") : "—"}</td>
                                                        <td className="py-3 px-4 font-mono text-sm">{s.durationSeconds != null ? formatDuration(s.durationSeconds) : "—"}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${s.reason === "LOGOUT" ? "bg-slate-100 text-slate-700" : "bg-orange-100 text-orange-700"}`}>
                                                                {s.reason}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {sessionHistory.totalPages > 1 && (
                                        <div className="flex items-center justify-between pt-4 border-t">
                                            <p className="text-sm text-muted-foreground">
                                                {t("logs.page")} {sessionHistory.page + 1} / {sessionHistory.totalPages} ({sessionHistory.totalElements} {t("logs.entries")})
                                            </p>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" disabled={historyPage === 0} onClick={() => setHistoryPage(p => p - 1)}>
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" disabled={historyPage >= sessionHistory.totalPages - 1} onClick={() => setHistoryPage(p => p + 1)}>
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        {/* Modal détail audit */}
        <Dialog open={!!selectedLog} onOpenChange={open => { if (!open) setSelectedLog(null); }}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Détail de l'action #{selectedLog?.id}
                    </DialogTitle>
                </DialogHeader>
                {selectedLog && (
                    <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Utilisateur</p>
                                <p className="font-medium">{selectedLog.utilisateur}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Action</p>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ACTION_COLORS[selectedLog.action] || "bg-gray-100 text-gray-800"}`}>
                                    {selectedLog.action}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Entité</p>
                                <p className="font-medium">{selectedLog.entite}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">ID entité</p>
                                <p className="font-mono">{selectedLog.entiteId || "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">IP</p>
                                <p className="font-mono text-xs">{selectedLog.ip || "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Date</p>
                                <p>{new Date(selectedLog.createdAt).toLocaleString("fr-FR")}</p>
                            </div>
                        </div>

                        {selectedLog.entite.includes("VOLONTAIRE") && extractVolId(selectedLog) && (
                            <div className="border rounded-lg p-3 bg-muted/40 flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <User className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Volontaire #{extractVolId(selectedLog)}</p>
                                    {detailVolLoading ? (
                                        <p className="text-sm text-muted-foreground animate-pulse">Chargement...</p>
                                    ) : detailVol ? (
                                        <p className="font-semibold">{detailVol.prenom} {detailVol.nom}</p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">Introuvable ou supprimé</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {selectedLog.details && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Détails</p>
                                <pre className="text-xs bg-muted p-3 rounded-lg whitespace-pre-wrap break-words font-mono">{selectedLog.details}</pre>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    </div>
    );
}

function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}min`;
    return `${m}min ${s.toString().padStart(2, "0")}s`;
}

export default ConnectionLogsPage;
