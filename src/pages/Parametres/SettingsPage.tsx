import { useState, useEffect, useContext, memo } from "react";
import { useTranslation } from "react-i18next";
import parametreService from "../../services/parametreService";
import { AuthContext } from "../../context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { Plus, Eye, Pencil, Trash2, CheckCircle2, XCircle, Settings2 } from "lucide-react";

// Types
interface Parametre {
    idIdentifiant: number;
    identifiant: string;
    description?: string;
    role?: string;
    login?: string;
    mailIdentifiant?: string;
    createdAt?: string;
}

interface FormData {
    identifiant: string;
    description: string;
    role: string;
    login: string;
    mailIdentifiant: string;
    mdpIdentifiant: string;
}

interface IsolatedParametreFormProps {
    onSubmit: (formData: FormData) => Promise<void>;
    isLoading: boolean;
    initialData: FormData;
    selectedParametre: Parametre | null;
    onClose: () => void;
    t: (key: string) => string;
}

// ===============================
// FORMULAIRE COMPLÈTEMENT ISOLÉ
// ===============================
const IsolatedParametreForm = memo(({ onSubmit, isLoading, initialData, selectedParametre, onClose, t }: IsolatedParametreFormProps) => {
    // STATE INTERNE - complètement isolé
    const [localData, setLocalData] = useState<FormData>({
        identifiant: '',
        description: '',
        role: '',
        login: '',
        mailIdentifiant: '',
        mdpIdentifiant: ''
    });

    // Initialiser SEULEMENT au premier rendu
    useEffect(() => {
        if (initialData) {
            const dataWithSyncedLogin = {
                ...initialData,
                login: initialData.identifiant || initialData.login || '' // Login = identifiant
            };
            setLocalData(dataWithSyncedLogin);
        }
    }, [initialData]);

    // Fonction de changement LOCALE
    const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;        
        setLocalData(prev => {
            const newData = {
                ...prev,
                [name]: value
            };
            
            // Synchroniser login avec identifiant
            if (name === 'identifiant') {
                newData.login = value;
            }
            
            return newData;
        });
    };

    // Soumission avec données locales
    const handleLocalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(localData);
    };

    return (
        <form onSubmit={handleLocalSubmit} className="space-y-6" autoComplete="off">
            <input type="text" name="fakeusernameremembered" style={{display: 'none'}} />
            <input type="password" name="fakepasswordremembered" style={{display: 'none'}} />

            <div className="space-y-2">
                <Label htmlFor="identifiant">
                    {t('settings.identifierRequired')} <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="identifiant"
                    name="identifiant"
                    value={localData.identifiant}
                    onChange={handleLocalChange}
                    required
                    disabled={isLoading}
                    autoComplete="off"
                    placeholder={t('settings.identifierPlaceholder')}
                />
                <p className="text-xs text-muted-foreground">{t('settings.identifierHint')}</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">{t('settings.description')}</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={localData.description}
                    onChange={handleLocalChange}
                    rows={3}
                    disabled={isLoading}
                    placeholder={t('settings.descriptionPlaceholder')}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="role">{t('settings.role')}</Label>
                <Select
                    value={localData.role}
                    onValueChange={(value) => handleLocalChange({ target: { name: 'role', value } } as any)}
                    disabled={isLoading}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={t('settings.selectRole')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ADMIN">{t('settings.administrator')}</SelectItem>
                        <SelectItem value="UTILISATEUR">{t('settings.user')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="login">{t('settings.loginAutomatic')}</Label>
                <Input
                    id="login"
                    name="login"
                    value={localData.login}
                    readOnly
                    disabled
                    className="bg-muted"
                    placeholder={t('settings.loginPlaceholder')}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="mailIdentifiant">{t('settings.email')}</Label>
                <Input
                    id="mailIdentifiant"
                    type="email"
                    name="mailIdentifiant"
                    value={localData.mailIdentifiant}
                    onChange={handleLocalChange}
                    disabled={isLoading}
                    placeholder={t('settings.emailPlaceholder')}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="mdpIdentifiant">
                    {selectedParametre ? t('settings.newPasswordOptional') : t('settings.password')}
                    {!selectedParametre && <span className="text-destructive"> *</span>}
                </Label>
                <Input
                    id="mdpIdentifiant"
                    type="password"
                    name="mdpIdentifiant"
                    value={localData.mdpIdentifiant}
                    onChange={handleLocalChange}
                    required={!selectedParametre}
                    disabled={isLoading}
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-lpignore="true"
                    placeholder={t('settings.passwordPlaceholder')}
                />
            </div>

            <div className="flex gap-3 pt-4">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1"
                >
                    {isLoading ? t('settings.saving') : (selectedParametre ? t('settings.modify') : t('settings.create'))}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1"
                >
                    {t('settings.cancel')}
                </Button>
            </div>
        </form>
    );
});

IsolatedParametreForm.displayName = 'IsolatedParametreForm';

// ===============================
// COMPOSANT PRINCIPAL SIMPLIFIÉ
// ===============================
const SettingsPage = () => {
    const { t } = useTranslation();
    const [parametres, setParametres] = useState<Parametre[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // États pour les modales
    const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
    const [showEditForm, setShowEditForm] = useState<boolean>(false);
    const [showViewModal, setShowViewModal] = useState<boolean>(false);
    const [selectedParametre, setSelectedParametre] = useState<Parametre | null>(null);
    const [formLoading, setFormLoading] = useState<boolean>(false);

    // Données initiales pour le formulaire
    const [initialFormData, setInitialFormData] = useState<FormData>({
        identifiant: '',
        description: '',
        role: '',
        login: '',
        mailIdentifiant: '',
        mdpIdentifiant: ''
    });

    const auth = useContext(AuthContext);

    const fetchParametres = async () => {
        try {
            setLoading(true);
            const data = await parametreService.getParametres();
            setParametres(data || []);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : t('settings.unknownError');
            setError(t('settings.loadError') + ': ' + errorMessage);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParametres();
    }, []);

    // Soumission - reçoit les données du formulaire isolé
    const handleSubmit = async (formData: FormData) => {
        if (!auth || !auth.hasPermission(2)) {
            setError(t('settings.permissionError'));
            return;
        }

        // Validation côté client
        if (!formData.identifiant.trim()) {
            setError(t('settings.identifierRequiredError'));
            return;
        }

        if (!selectedParametre && !formData.mdpIdentifiant.trim()) {
            setError(t('settings.passwordRequiredError'));
            return;
        }

        setFormLoading(true);

        try {
            if (selectedParametre) {
                await parametreService.updateParametres(selectedParametre.idIdentifiant, formData);
                setSuccess(t('settings.updateSuccess'));
                setShowEditForm(false);
            } else {
                await parametreService.createParametre(formData);
                setSuccess(t('settings.createSuccess'));
                setShowCreateForm(false);
            }

            await fetchParametres();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('❌ Erreur lors de la soumission:', err);

            // Affichage d'erreur plus détaillé
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as any;
                if (axiosError.response?.status === 500) {
                    setError(`${t('settings.serverError')}: ${axiosError.response?.data?.message || t('settings.serverErrorDetail')}`);
                } else if (axiosError.response?.status === 400) {
                    setError(`${t('settings.invalidDataError')}: ${axiosError.response?.data?.message || t('settings.invalidDataErrorDetail')}`);
                } else {
                    const errorMessage = err instanceof Error ? err.message : t('settings.unknownError');
                    setError(`${t('settings.saveError')}: ${errorMessage}`);
                }
            } else {
                const errorMessage = err instanceof Error ? err.message : t('settings.unknownError');
                setError(`${t('settings.saveError')}: ${errorMessage}`);
            }
        } finally {
            setFormLoading(false);
        }
    };

    const closeModals = () => {
        setShowCreateForm(false);
        setShowEditForm(false);
        setShowViewModal(false);
        setSelectedParametre(null);
        setFormLoading(false);
        setInitialFormData({
            identifiant: '',
            description: '',
            role: '',
            login: '', // Login sera automatiquement synchronisé
            mailIdentifiant: '',
            mdpIdentifiant: ''
        });
    };

    const handleCreate = () => {
        if (!auth || !auth.hasPermission(2)) {
            setError(t('settings.permissionCreateError'));
            return;
        }

        setSelectedParametre(null);
        setInitialFormData({
            identifiant: '',
            description: '',
            role: '',
            login: '',
            mailIdentifiant: '',
            mdpIdentifiant: ''
        });
        setShowCreateForm(true);
    };

    const handleEdit = async (id: number) => {
        if (!auth || !auth.hasPermission(2)) {
            setError(t('settings.permissionEditError'));
            return;
        }

        try {
            const parametre = await parametreService.getParametreById(id);
            setSelectedParametre(parametre);
            setInitialFormData({
                identifiant: parametre.identifiant || '',
                description: parametre.description || '',
                role: parametre.role || '',
                login: parametre.identifiant || '',
                mailIdentifiant: parametre.mailIdentifiant || '',
                mdpIdentifiant: ''
            });
            setShowEditForm(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : t('settings.unknownError');
            setError(t('settings.retrieveError') + ' : ' + errorMessage);
        }
    };

    const handleDelete = async (id: number) => {
        if (!auth || !auth.hasPermission(2)) {
            setError(t('settings.permissionDeleteError'));
            return;
        }
        if (!window.confirm(t('settings.deleteConfirm'))) return;

        try {
            await parametreService.deleteParametre(id);
            setParametres(prev => prev.filter(p => p.idIdentifiant !== id));
            setSuccess(t('settings.deleteSuccess'));
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : t('settings.unknownError');
            setError(t('settings.deleteError') + ' : ' + errorMessage);
        }
    };

    const handleView = async (id: number) => {
        try {
            const parametre = await parametreService.getParametreById(id);
            setSelectedParametre(parametre);
            setShowViewModal(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : t('settings.unknownError');
            setError(t('settings.retrieveError') + ' : ' + errorMessage);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div
                        className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"
                        role="status"
                        aria-label={t('common.loading')}
                    ></div>
                    <p className="text-muted-foreground">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-7xl mx-auto p-6 space-y-6">
            {/* En-tête */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Settings2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
                        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
                    </div>
                </div>

                {auth && auth.hasPermission(2) && (
                    <Button onClick={handleCreate} size="lg">
                        <Plus className="mr-2 h-4 w-4" />
                        {t('settings.newParameter')}
                    </Button>
                )}
            </div>

            {/* Messages de succès/erreur */}
            {success && (
                <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                        {success}
                    </AlertDescription>
                </Alert>
            )}

            {error && (
                <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                        <span>{error}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setError(null)}
                            className="h-6 w-6 p-0"
                        >
                            ×
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* Liste des paramètres */}
            {parametres.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent className="pt-6">
                        <Settings2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <CardTitle className="mb-2">{t('settings.noParameterFound')}</CardTitle>
                        <CardDescription className="mb-4">
                            {t('settings.noParameterFoundDesc')}
                        </CardDescription>
                        {auth && auth.hasPermission(2) && (
                            <Button onClick={handleCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                {t('settings.createParameter')}
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {parametres.map((parametre) => (
                        <Card key={parametre.idIdentifiant} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start gap-2">
                                    <CardTitle className="line-clamp-2 text-lg">
                                        {parametre.identifiant}
                                    </CardTitle>
                                    <Badge variant="secondary" className="text-xs">
                                        {t('settings.id')}: {parametre.idIdentifiant}
                                    </Badge>
                                </div>
                                {parametre.description && (
                                    <CardDescription className="line-clamp-3">
                                        {parametre.description}
                                    </CardDescription>
                                )}
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {parametre.role && (
                                    <div>
                                        <Badge variant={parametre.role === "2" ? "default" : "outline"}>
                                            {parametre.role === "2" ? t('settings.administrator') :
                                             parametre.role === "1" ? t('settings.user') :
                                             parametre.role}
                                        </Badge>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleView(parametre.idIdentifiant)}
                                    >
                                        <Eye className="mr-2 h-4 w-4" />
                                        {t('settings.view')}
                                    </Button>
                                    {auth && auth.hasPermission(2) && (
                                        <>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => handleEdit(parametre.idIdentifiant)}
                                            >
                                                <Pencil className="mr-2 h-4 w-4" />
                                                {t('settings.modify')}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(parametre.idIdentifiant)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* MODALES AVEC FORMULAIRE ISOLÉ */}
            <Dialog open={showCreateForm} onOpenChange={(open) => !open && closeModals()}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{t('settings.createNewParameter')}</DialogTitle>
                        <DialogDescription>
                            {t('settings.createNewParameterDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <IsolatedParametreForm
                        key="create-isolated"
                        onSubmit={handleSubmit}
                        isLoading={formLoading}
                        initialData={initialFormData}
                        selectedParametre={null}
                        onClose={closeModals}
                        t={t}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={showEditForm} onOpenChange={(open) => !open && closeModals()}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{t('settings.editParameter')}</DialogTitle>
                        <DialogDescription>
                            {t('settings.editParameterDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <IsolatedParametreForm
                        key={`edit-isolated-${selectedParametre?.idIdentifiant}`}
                        onSubmit={handleSubmit}
                        isLoading={formLoading}
                        initialData={initialFormData}
                        selectedParametre={selectedParametre}
                        onClose={closeModals}
                        t={t}
                    />
                </DialogContent>
            </Dialog>
            
            <Dialog open={showViewModal} onOpenChange={(open) => !open && closeModals()}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{t('settings.parameterDetails')}</DialogTitle>
                        <DialogDescription>
                            {t('settings.parameterDetailsDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedParametre && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">{t('settings.id')}</Label>
                                    <p className="font-medium">{selectedParametre.idIdentifiant}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">{t('settings.identifier')}</Label>
                                    <p className="font-medium">{selectedParametre.identifiant}</p>
                                </div>
                                <div className="sm:col-span-2 space-y-1">
                                    <Label className="text-muted-foreground">{t('settings.description')}</Label>
                                    <p className="font-medium">{selectedParametre.description || t('settings.noDescription')}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">{t('settings.role')}</Label>
                                    <div>
                                        <Badge variant={selectedParametre.role === "2" ? "default" : "outline"}>
                                            {selectedParametre.role === "2" ? t('settings.administrator') :
                                             selectedParametre.role === "1" ? t('settings.user') :
                                             selectedParametre.role || t('settings.notDefined')}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">{t('settings.login')}</Label>
                                    <p className="font-medium">{selectedParametre.login || t('settings.notDefined')}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">{t('settings.email')}</Label>
                                    <p className="font-medium">{selectedParametre.mailIdentifiant || t('settings.notDefined')}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">{t('settings.creationDate')}</Label>
                                    <p className="font-medium">
                                        {selectedParametre.createdAt
                                            ? new Date(selectedParametre.createdAt).toLocaleDateString('fr-FR')
                                            : t('settings.notAvailable')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-4 border-t">
                                {auth && auth.hasPermission(2) && (
                                    <Button
                                        onClick={() => {
                                            setShowViewModal(false);
                                            handleEdit(selectedParametre.idIdentifiant);
                                        }}
                                    >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        {t('settings.modify')}
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={closeModals}
                                >
                                    {t('settings.close')}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SettingsPage;