import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { useNotifications } from '../../context/NotificationContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell, ChevronDown, User, Settings, LogOut, UserPlus, X } from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { unreadVolunteersCount, totalVolunteersToday, volunteersToday, loadVolunteersToday, markVolunteersAsConsulted } = useNotifications()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const hasLoadedRef = useRef(false)

  // Charger les volontaires quand on ouvre le panneau (une seule fois)
  useEffect(() => {
    if (notificationsOpen && !hasLoadedRef.current) {
      hasLoadedRef.current = true
      loadVolunteersToday()
    }
    
    // Réinitialiser quand on ferme
    if (!notificationsOpen) {
      hasLoadedRef.current = false
    }
  }, [notificationsOpen, loadVolunteersToday])

  // DEBUG: Afficher ce que le Navbar reçoit
  useEffect(() => {
    console.log('🔔 Navbar - État des notifications:', {
      totalVolunteersToday,
      unreadVolunteersCount,
      volunteersToday: volunteersToday.length,
      volunteers: volunteersToday
    })
  }, [totalVolunteersToday, unreadVolunteersCount, volunteersToday])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleNotificationClick = () => {
    setNotificationsOpen(!notificationsOpen)
  }

  const handleDismissNotification = (volunteerId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    markVolunteersAsConsulted()
    setTimeout(() => {
      loadVolunteersToday()
    }, 100)
  }

  const handleVolunteerClick = (volunteerId: number) => {
    navigate(`/volontaires/${volunteerId}`)
    setNotificationsOpen(false)
  }

  const getRoleLabel = () => {
    if (!user?.role) return t('settings.user')
    
    switch (user.role) {
      case 2:
        return t('settings.administrator')
      case 1:
        return t('settings.user')
      default:
        return t('settings.user')
    }
  }

  const getUserInitials = () => {
    if (!user?.login) return 'U'
    
    if (user.login.includes('.')) {
      const parts = user.login.split('.')
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    
    const nameParts = user.login.split(' ')
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    }
    
    return user.login.substring(0, 2).toUpperCase()
  }

  if (!user) return null

  return (
    <header className="bg-background border-b h-16 flex items-center px-6 justify-between">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-primary">CosmeTest</h1>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        
        <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNotificationClick}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {unreadVolunteersCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadVolunteersCount > 99 ? '99+' : unreadVolunteersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <Card className="border-0 shadow-none">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    {t('dates.today')} - {t('sidebar.volunteers')}
                  </span>
                  {unreadVolunteersCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {unreadVolunteersCount} {t('notifications.info').toLowerCase()}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {volunteersToday.length > 0 ? (
                  <ScrollArea className="max-h-96">
                    <div className="divide-y">
                      {volunteersToday.map((volunteer: any, index: number) => (
                        <div 
                          key={volunteer.id || volunteer.idVol || volunteer.idVolontaire || index}
                          className="p-4 hover:bg-muted/50 transition-colors cursor-pointer group relative"
                          onClick={() => handleVolunteerClick(volunteer.id || volunteer.idVol || volunteer.idVolontaire)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="bg-primary/10 rounded-full p-2">
                              <UserPlus className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {volunteer.nom || volunteer.nomVol || 'Nom inconnu'} {volunteer.prenom || volunteer.prenomVol || 'Prénom inconnu'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {t('notifications.updated')} {t('dates.today').toLowerCase()}
                              </p>
                              <p className="text-xs text-muted-foreground/70">
                                {t('settings.viewProfile')}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => handleDismissNotification(volunteer.id || volunteer.idVol || volunteer.idVolontaire, e)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{t('common.noData')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.login || 'Utilisateur'}</p>
                <p className="text-xs text-muted-foreground">{getRoleLabel()}</p>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate('/profil')}>
              <User className="mr-2 h-4 w-4" />
              {t('settings.myProfile')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/parametres')}>
              <Settings className="mr-2 h-4 w-4" />
              {t('sidebar.settings')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              {t('auth.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default Navbar
