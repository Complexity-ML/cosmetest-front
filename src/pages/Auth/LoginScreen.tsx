import { useState, useEffect } from 'react'
import { useNavigate, Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

const LoginScreen = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [localLoading, setLocalLoading] = useState(false)
  const { t } = useTranslation()

  const { isAuthenticated, isLoading: authLoading, authError, login: authLogin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Récupère le chemin d'origine pour redirection après connexion
  const from = location.state?.from?.pathname || '/'

  // Utilise l'erreur d'auth du contexte si disponible
  useEffect(() => {
    if (authError) {
      setError(authError)
    }
  }, [authError])

  // Si l'utilisateur est déjà authentifié, rediriger vers la page d'accueil ou la page d'origine
  if (isAuthenticated && !authLoading) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      setError(t('auth.fillAllFields'))
      return
    }

    setError('')
    setLocalLoading(true)

    try {
      const result = await authLogin(username, password)

      if (result.success) {
        navigate(from, { replace: true })
      } else {
        setError(result.message || t('auth.loginError'))
      }
    } catch (error) {
      console.error('LoginScreen - Erreur de connexion:', error)
      setError(t('auth.connectionError'))
    } finally {
      setLocalLoading(false)
    }
  }

  // Etat de chargement global (soit du composant local, soit du contexte d'auth)
  const isLoading = localLoading || authLoading

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">{t('app.title')}</CardTitle>
          <CardDescription className="text-xl font-semibold mt-2">
            {t('auth.login')}
          </CardDescription>
          {from !== '/' && (
            <p className="text-sm text-muted-foreground mt-2">
              {t('auth.redirectMessage')}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">{t('auth.username')}</Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                placeholder={t('auth.enterUsername')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder={t('auth.enterPassword')}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                t('auth.login')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginScreen
