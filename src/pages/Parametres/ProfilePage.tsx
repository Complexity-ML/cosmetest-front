import { useState, useEffect } from "react";
import authService from "../../services/authService";
import parametreService from "../../services/parametreService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Separator } from "../../components/ui/separator";
import { User, Pencil, CheckCircle2, XCircle, Lock, Mail, Hash, AlertTriangle } from "lucide-react";

// Types
interface Authority {
    authority?: string;
    role?: string;
}

interface EnrichedUser {
    login: string;
    role?: string;
    roles?: Authority[];
    identifiant?: string;
    description?: string;
    mailIdentifiant?: string;
    idIdentifiant?: number;
}

interface FormData {
    identifiant: string;
    description: string;
    mdpIdentifiant: string;
    confirmMdp: string;
}

const ProfilePage = () => {
    const [user, setUser] = useState<EnrichedUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [editing, setEditing] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    const [formData, setFormData] = useState<FormData>({
        identifiant: '',
        description: '',
        mdpIdentifiant: '',
        confirmMdp: ''
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const userData = await authService.getCurrentUser();            
            if (userData) {
                // Extraire le rôle depuis authorities ou role
                let userRole: string | undefined;
                if (userData.authorities && userData.authorities.length > 0) {
                    userRole = userData.authorities[0]?.authority || userData.authorities[0]?.role;
                } else {
                    userRole = `ROLE_${userData.role}`;
                }
                
                const roleMapping: Record<string, string> = {
                    'ROLE_1': 'Recruteur',
                    'ROLE_2': 'Admin'
                };
                
                // Essayer de récupérer les données complètes via l'API identifiants
                let fullUserData: any = null;
                try {
                    fullUserData = await parametreService.getParametreByLogin(userData.login);
                } catch (err) {
                    console.warn('Aucune donnée de profil complète trouvée pour le login:', userData.login);
                }
                
                // Enrichir les données utilisateur
                const enrichedUser: EnrichedUser = {
                    login: userData.login,
                    role: userRole ? (roleMapping[userRole] || userRole) : undefined,
                    roles: userData.authorities,
                    // Données du profil complet si disponibles
                    ...(fullUserData && {
                        identifiant: fullUserData.identifiant,
                        description: fullUserData.description,
                        mailIdentifiant: fullUserData.mailIdentifiant,
                        idIdentifiant: fullUserData.idIdentifiant
                    })
                };
                
                setUser(enrichedUser);
                setFormData({
                    identifiant: enrichedUser.identifiant || enrichedUser.login || '',
                    description: enrichedUser.description || '',
                    mdpIdentifiant: '',
                    confirmMdp: ''
                });
            }
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue est survenue';
            setError('Erreur lors du chargement du profil: ' + errorMessage);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEdit = () => {
        setEditing(true);
        setError(null);
        setSuccess(null);
    };

    const handleCancel = () => {
        setEditing(false);
        if (user) {
            setFormData({
                identifiant: user.identifiant || user.login || '',
                description: user.description || '',
                mdpIdentifiant: '',
                confirmMdp: ''
            });
        }
        setError(null);
        setSuccess(null);
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            // Vérifier si l'utilisateur a un profil modifiable
            if (!user || !user.idIdentifiant) {
                throw new Error('Profil non modifiable - Aucun ID utilisateur trouvé dans la base des paramètres');
            }

            // Validation du mot de passe si modifié
            if (formData.mdpIdentifiant && formData.mdpIdentifiant !== formData.confirmMdp) {
                throw new Error('Les mots de passe ne correspondent pas');
            }

            if (formData.mdpIdentifiant && formData.mdpIdentifiant.length < 6) {
                throw new Error('Le mot de passe doit contenir au moins 6 caractères');
            }

            // Préparer les données à envoyer
            const updateData: {
                identifiant: string;
                description: string;
                mdpIdentifiant?: string;
            } = {
                identifiant: formData.identifiant,
                description: formData.description
            };

            // Ajouter le mot de passe seulement s'il a été modifié
            if (formData.mdpIdentifiant) {
                updateData.mdpIdentifiant = formData.mdpIdentifiant;
            }

            // Mettre à jour le profil
            await parametreService.updateParametres(user.idIdentifiant, updateData);
            
            // Rafraîchir les données utilisateur
            await fetchUserProfile();
            
            setEditing(false);
            setSuccess('Profil mis à jour avec succès');
            setTimeout(() => setSuccess(null), 3000);
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue est survenue';
            setError('Erreur lors de la mise à jour: ' + errorMessage);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div 
                        className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"
                        role="status"
                        aria-label="Chargement en cours"
                    ></div>
                    <p className="text-muted-foreground">Chargement du profil...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container max-w-2xl mx-auto p-6">
                <Card>
                    <CardContent className="text-center py-12">
                        <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <CardTitle className="mb-2">Profil non disponible</CardTitle>
                        <CardDescription>
                            Impossible de charger les informations du profil.
                        </CardDescription>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Obtenir les initiales pour l'avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="container max-w-4xl mx-auto p-6 space-y-6">
            <Card>
                {/* En-tête avec avatar */}
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                                    {getInitials(user.identifiant || user.login || 'U')}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-2xl">Mon Profil</CardTitle>
                                <CardDescription className="flex flex-wrap items-center gap-2 mt-1">
                                    {user.role && (
                                        <Badge variant="default">
                                            {user.role}
                                        </Badge>
                                    )}
                                    {!user.idIdentifiant && (
                                        <Badge variant="secondary" className="gap-1">
                                            <AlertTriangle className="h-3 w-3" />
                                            Lecture seule
                                        </Badge>
                                    )}
                                </CardDescription>
                            </div>
                        </div>
                        {!editing && (
                            <Button
                                onClick={handleEdit}
                                disabled={!user.idIdentifiant}
                                size="lg"
                                title={!user.idIdentifiant ? "Profil non modifiable - Aucune donnée dans la base des paramètres" : "Modifier le profil"}
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Modifier
                            </Button>
                        )}
                    </div>
                </CardHeader>

                {/* Messages de succès/erreur */}
                {success && (
                    <Alert className="mx-6 mt-4 border-green-200 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                            {success}
                        </AlertDescription>
                    </Alert>
                )}
                
                {error && (
                    <Alert variant="destructive" className="mx-6 mt-4">
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

                {/* Contenu */}
                <CardContent className="p-6">
                    {!editing ? (
                        // Mode visualisation
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Identifiant</Label>
                                <div className="text-lg font-medium bg-muted px-4 py-3 rounded-md">
                                    {user.identifiant || user.login || 'Non défini'}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Description</Label>
                                <div className="bg-muted px-4 py-3 rounded-md min-h-[100px]">
                                    {user.description || (
                                        <span className="text-muted-foreground italic">Aucune description</span>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Login
                                        <Badge variant="outline" className="text-xs">non modifiable</Badge>
                                    </Label>
                                    <div className="bg-muted px-4 py-3 rounded-md font-medium">
                                        {user.login || 'Non défini'}
                                    </div>
                                </div>
                                
                                {user.idIdentifiant && (
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground flex items-center gap-2">
                                            <Hash className="h-4 w-4" />
                                            ID
                                        </Label>
                                        <div className="bg-muted px-4 py-3 rounded-md text-muted-foreground">
                                            {user.idIdentifiant}
                                        </div>
                                    </div>
                                )}
                                
                                {!user.idIdentifiant && (
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Statut</Label>
                                        <Alert className="border-amber-200 bg-amber-50">
                                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                                            <AlertDescription className="text-amber-800 text-sm">
                                                Profil non enregistré dans la base des paramètres
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                )}
                                
                                {user.mailIdentifiant && (
                                    <div className="md:col-span-2 space-y-2">
                                        <Label className="text-muted-foreground flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            Email
                                        </Label>
                                        <div className="bg-muted px-4 py-3 rounded-md">
                                            {user.mailIdentifiant}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Mode édition
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="identifiant">
                                    Identifiant <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="identifiant"
                                    name="identifiant"
                                    value={formData.identifiant}
                                    onChange={handleInputChange}
                                    required
                                    placeholder={user.login || "Entrez votre identifiant"}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Ajoutez une description..."
                                />
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                    <Label className="text-base font-semibold">
                                        Changer le mot de passe (optionnel)
                                    </Label>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="mdpIdentifiant">
                                            Nouveau mot de passe
                                        </Label>
                                        <Input
                                            id="mdpIdentifiant"
                                            type="password"
                                            name="mdpIdentifiant"
                                            value={formData.mdpIdentifiant}
                                            onChange={handleInputChange}
                                            placeholder="Laisser vide pour ne pas changer"
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmMdp">
                                            Confirmer le mot de passe
                                        </Label>
                                        <Input
                                            id="confirmMdp"
                                            type="password"
                                            name="confirmMdp"
                                            value={formData.confirmMdp}
                                            onChange={handleInputChange}
                                            placeholder="Confirmer le nouveau mot de passe"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex gap-3">
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1"
                                    size="lg"
                                >
                                    {saving ? "Enregistrement..." : "Enregistrer"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="flex-1"
                                    size="lg"
                                >
                                    Annuler
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfilePage;