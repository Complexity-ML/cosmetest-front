import { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import parametreService from "../../services/parametreService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { ShieldAlert, ArrowLeft, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";

interface ConnectionLog {
    id: number;
    login: string;
    success: boolean;
    ip?: string;
    userAgent?: string;
    createdAt: string;
}

const ConnectionLogsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const [logs, setLogs] = useState<ConnectionLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await parametreService.getConnectionLogs();
            setLogs(data || []);
        } catch (err) {
            const msg = err instanceof Error ? err.message : t("logs.unknownError");
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!auth?.hasPermission(2)) {
            navigate("/unauthorized");
            return;
        }
        fetchLogs();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">{t("common.loading")}</p>
                </div>
            </div>
        );
    }

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
                <Button variant="outline" onClick={fetchLogs} size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t("logs.refresh")}
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Stats rapides */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-2xl font-bold">{logs.length}</p>
                                <p className="text-sm text-muted-foreground">{t("logs.totalConnections")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-2xl font-bold text-green-600">
                                    {logs.filter(l => l.success).length}
                                </p>
                                <p className="text-sm text-muted-foreground">{t("logs.successCount")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <XCircle className="h-5 w-5 text-destructive" />
                            <div>
                                <p className="text-2xl font-bold text-destructive">
                                    {logs.filter(l => !l.success).length}
                                </p>
                                <p className="text-sm text-muted-foreground">{t("logs.failureCount")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tableau des logs */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("logs.history")}</CardTitle>
                    <CardDescription>{t("logs.historyDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                    {logs.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p>{t("logs.noLogs")}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-muted-foreground">
                                        <th className="text-left py-3 px-4 font-medium">{t("logs.loginCol")}</th>
                                        <th className="text-left py-3 px-4 font-medium">{t("logs.statusCol")}</th>
                                        <th className="text-left py-3 px-4 font-medium">{t("logs.ipCol")}</th>
                                        <th className="text-left py-3 px-4 font-medium">{t("logs.dateCol")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log.id} className="border-b hover:bg-muted/50 transition-colors">
                                            <td className="py-3 px-4 font-medium">{log.login}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant={log.success ? "default" : "destructive"}>
                                                    {log.success ? (
                                                        <><CheckCircle className="mr-1 h-3 w-3" />{t("logs.success")}</>
                                                    ) : (
                                                        <><XCircle className="mr-1 h-3 w-3" />{t("logs.failure")}</>
                                                    )}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground font-mono text-xs">
                                                {log.ip || "—"}
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground">
                                                {new Date(log.createdAt).toLocaleString("fr-FR")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ConnectionLogsPage;
