import { useState, useEffect, useContext, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import parametreService from "../../services/parametreService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { ShieldAlert, ArrowLeft, RefreshCw, CheckCircle, XCircle, Clock, Activity, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

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
    const [tab, setTab] = useState<"connexions" | "audit">("connexions");

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
        else fetchAudit(auditPage);
    };

    const isLoading = tab === "connexions" ? logsLoading : auditLoading;

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
        </div>
    );
};

export default ConnectionLogsPage;
