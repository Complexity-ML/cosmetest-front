import { useState, useEffect, useContext, memo } from "react";
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
}

// ===============================
// FORMULAIRE COMPLÈTEMENT ISOLÉ
// ===============================
const IsolatedParametreForm = memo(({ onSubmit, isLoading, initialData, selectedParametre, onClose }: IsolatedParametreFormProps) => {
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
                    Identifiant <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="identifiant"
                    name="identifiant"
                    value={localData.identifiant}
                    onChange={handleLocalChange}
                    required
                    disabled={isLoading}
                    autoComplete="off"
                    placeholder="Entrez l'identifiant"
                />
                <p className="text-xs text-muted-foreground">Le login sera automatiquement identique à cet identifiant</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={localData.description}
                    onChange={handleLocalChange}
                    rows={3}
                    disabled={isLoading}
                    placeholder="Décrivez ce paramètre..."
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select 
                    value={localData.role} 
                    onValueChange={(value) => handleLocalChange({ target: { name: 'role', value } } as any)}
                    disabled={isLoading}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ADMIN">Administrateur</SelectItem>
                        <SelectItem value="UTILISATEUR">Utilisateur</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="login">Login (automatique)</Label>
                <Input
                    id="login"
                    name="login"
                    value={localData.login}
                    readOnly
                    disabled
                    className="bg-muted"
                    placeholder="Sera identique à l'identifiant"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="mailIdentifiant">Email</Label>
                <Input
                    id="mailIdentifiant"
                    type="email"
                    name="mailIdentifiant"
                    value={localData.mailIdentifiant}
                    onChange={handleLocalChange}
                    disabled={isLoading}
                    placeholder="email@exemple.com"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="mdpIdentifiant">
                    {selectedParametre ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}
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
                    placeholder="••••••••"
                />
            </div>

            <div className="flex gap-3 pt-4">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1"
                >
                    {isLoading ? "Enregistrement..." : (selectedParametre ? "Modifier" : "Créer")}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1"
                >
                    Annuler
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
            const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue est survenue';
            setError('Erreur lors du chargement des données: ' + errorMessage);
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
            setError("Vous n'avez pas la permission de créer ou modifier des paramètres.");
            return;
        }

        // Validation côté client
        if (!formData.identifiant.trim()) {
            setError("L'identifiant est obligatoire.");
            return;
        }

        if (!selectedParametre && !formData.mdpIdentifiant.trim()) {
            setError("Le mot de passe est obligatoire pour un nouveau paramètre.");
            return;
        }

        setFormLoading(true);

        try {
            if (selectedParametre) {
                await parametreService.updateParametres(selectedParametre.idIdentifiant, formData);
                setSuccess("Paramètre modifié avec succès.");
                setShowEditForm(false);
            } else {
                await parametreService.createParametre(formData);
                setSuccess("Paramètre créé avec succès.");
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
                    setError(`Erreur serveur (500): ${axiosError.response?.data?.message || 'Erreur interne du serveur. Vérifiez les logs côté serveur.'}`);
                } else if (axiosError.response?.status === 400) {
                    setError(`Données invalides (400): ${axiosError.response?.data?.message || 'Vérifiez les données saisies.'}`);
                } else {
                    const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue est survenue';
                    setError(`Erreur lors de l'enregistrement: ${errorMessage}`);
                }
            } else {
                const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue est survenue';
                setError(`Erreur lors de l'enregistrement: ${errorMessage}`);
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
            setError("Vous n'avez pas la permission de créer des paramètres.");
            return;
        }

        setSelectedParametre(null);
        setInitialFormData({
            identifiant: '',
            description: '',
            role: '',
            login: '', // Sera automatiquement rempli quand identifiant sera saisi
            mailIdentifiant: '',
            mdpIdentifiant: ''
        });
        setShowCreateForm(true);
    };

    const handleEdit = async (id: number) => {
        if (!auth || !auth.hasPermission(2)) {
            setError("Vous n'avez pas la permission de modifier des paramètres.");
            return;
        }

        try {
            const parametre = await parametreService.getParametreById(id);
            setSelectedParametre(parametre);
            setInitialFormData({
                identifiant: parametre.identifiant || '',
                description: parametre.description || '',
                role: parametre.role || '',
                login: parametre.identifiant || '', // Login = identifiant
                mailIdentifiant: parametre.mailIdentifiant || '',
                mdpIdentifiant: ''
            });
            setShowEditForm(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue est survenue';
            setError("Erreur lors de la récupération : " + errorMessage);
        }
    };

    const handleDelete = async (id: number) => {
        if (!auth || !auth.hasPermission(2)) {
            setError("Vous n'avez pas la permission de supprimer des paramètres.");
            return;
        }
        if (!window.confirm("Voulez-vous vraiment supprimer ce paramètre ?")) return;

        try {
            await parametreService.deleteParametre(id);
            setParametres(prev => prev.filter(p => p.idIdentifiant !== id));
            setSuccess("Paramètre supprimé avec succès.");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue est survenue';
            setError("Erreur lors de la suppression : " + errorMessage);
        }
    };

    const handleView = async (id: number) => {
        try {
            const parametre = await parametreService.getParametreById(id);
            setSelectedParametre(parametre);
            setShowViewModal(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue est survenue';
            setError("Erreur lors de la récupération : " + errorMessage);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div
                        className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"
                        role="status"
                        aria-label="Chargement en cours"
                    ></div>
                    <p className="text-muted-foreground">Chargement...</p>
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
                        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
                        <p className="text-muted-foreground">Gérez les utilisateurs et leurs permissions</p>
                    </div>
                </div>

                {auth && auth.hasPermission(2) && (
                    <Button onClick={handleCreate} size="lg">
                        <Plus className="mr-2 h-4 w-4" />
                        Nouveau paramètre
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
                        <CardTitle className="mb-2">Aucun paramètre trouvé</CardTitle>
                        <CardDescription className="mb-4">
                            Commencez par créer votre premier paramètre.
                        </CardDescription>
                        {auth && auth.hasPermission(2) && (
                            <Button onClick={handleCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                Créer un paramètre
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
                                        ID: {parametre.idIdentifiant}
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
                                            {parametre.role === "2" ? "Administrateur" : 
                                             parametre.role === "1" ? "Utilisateur" : 
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
                                        Voir
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
                                                Modifier
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
                        <DialogTitle>Créer un nouveau paramètre</DialogTitle>
                        <DialogDescription>
                            Remplissez les informations pour créer un nouvel utilisateur.
                        </DialogDescription>
                    </DialogHeader>
                    <IsolatedParametreForm 
                        key="create-isolated"
                        onSubmit={handleSubmit} 
                        isLoading={formLoading}
                        initialData={initialFormData}
                        selectedParametre={null}
                        onClose={closeModals}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={showEditForm} onOpenChange={(open) => !open && closeModals()}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Modifier le paramètre</DialogTitle>
                        <DialogDescription>
                            Modifiez les informations de l'utilisateur.
                        </DialogDescription>
                    </DialogHeader>
                    <IsolatedParametreForm 
                        key={`edit-isolated-${selectedParametre?.idIdentifiant}`}
                        onSubmit={handleSubmit} 
                        isLoading={formLoading}
                        initialData={initialFormData}
                        selectedParametre={selectedParametre}
                        onClose={closeModals}
                    />
                </DialogContent>
            </Dialog>
            
            <Dialog open={showViewModal} onOpenChange={(open) => !open && closeModals()}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Détails du paramètre</DialogTitle>
                        <DialogDescription>
                            Informations complètes de l'utilisateur.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedParametre && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">ID</Label>
                                    <p className="font-medium">{selectedParametre.idIdentifiant}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">Identifiant</Label>
                                    <p className="font-medium">{selectedParametre.identifiant}</p>
                                </div>
                                <div className="sm:col-span-2 space-y-1">
                                    <Label className="text-muted-foreground">Description</Label>
                                    <p className="font-medium">{selectedParametre.description || 'Aucune description'}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">Rôle</Label>
                                    <div>
                                        <Badge variant={selectedParametre.role === "2" ? "default" : "outline"}>
                                            {selectedParametre.role === "2" ? "Administrateur" : 
                                             selectedParametre.role === "1" ? "Utilisateur" : 
                                             selectedParametre.role || 'Non défini'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">Login</Label>
                                    <p className="font-medium">{selectedParametre.login || 'Non défini'}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">Email</Label>
                                    <p className="font-medium">{selectedParametre.mailIdentifiant || 'Non défini'}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">Date de création</Label>
                                    <p className="font-medium">
                                        {selectedParametre.createdAt 
                                            ? new Date(selectedParametre.createdAt).toLocaleDateString('fr-FR') 
                                            : 'Non disponible'}
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
                                        Modifier
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={closeModals}
                                >
                                    Fermer
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