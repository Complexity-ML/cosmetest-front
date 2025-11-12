import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FlaskConical,
  Calendar,
  FileText,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import logo from '../../assets/icons/logo.png';

interface MenuItem {
  label: string;
  icon: (isActive: boolean) => React.ReactNode;
  path: string;
  adminOnly?: boolean;
  subItems?: SubMenuItem[];
}

interface SubMenuItem {
  label: string;
  path: string;
}

interface SidebarProps {
  onToggle?: (collapsed: boolean) => void;
}

const CosmeTestLogo: React.FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => {
  return (
    <img src={logo} alt="CosmeTest Logo" className="w-10 h-10" />
  );
};

const Sidebar: React.FC<SidebarProps> = ({ onToggle }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);

    if (onToggle) {
      onToggle(newCollapsedState);
    }
  };

  const getMenuItems = (): MenuItem[] => {
    const baseMenuItems: MenuItem[] = [
      {
        label: 'Tableau de bord',
        icon: (isActive) => <LayoutDashboard className={cn("w-5 h-5", isActive && "text-blue-700")} />,
        path: '/dashboard'
      },
      {
        label: 'Volontaires',
        icon: (isActive) => <Users className={cn("w-5 h-5", isActive && "text-blue-700")} />,
        path: '/volontaires',
        subItems: [
          {
            label: 'Liste générale',
            path: '/volontaires'
          },
          {
            label: 'Habitudes cosmétiques',
            path: '/volontaires-hc'
          }
        ]
      },
      {
        label: 'Études',
        icon: (isActive) => <FlaskConical className={cn("w-5 h-5", isActive && "text-blue-700")} />,
        path: '/etudes',
        subItems: [
          {
            label: 'Groupes',
            path: '/groupes'
          },
        ]
      },
      {
        label: 'Rendez-vous',
        icon: (isActive) => <Calendar className={cn("w-5 h-5", isActive && "text-blue-700")} />,
        path: '/rdvs',
        subItems: [
          {
            label: 'Assigner un volontaire',
            path: '/rdvs/assigner'
          },
        ]
      },
      {
        label: 'Rapports',
        icon: (isActive) => <FileText className={cn("w-5 h-5", isActive && "text-blue-700")} />,
        path: '/rapports'
      },
      {
        label: 'Paiements',
        icon: (isActive) => <ShoppingBag className={cn("w-5 h-5", isActive && "text-blue-700")} />,
        path: '/paiements'
      }
    ];
    return baseMenuItems;
  };

  const menuItems = getMenuItems();

  return (
    <aside
      className={cn(
        "bg-white shadow-md h-full sticky top-0 transition-all duration-300 ease-in-out",
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo area */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200 py-2">
        <Link to="/dashboard" className="flex justify-center items-center">
          <CosmeTestLogo isCollapsed={isCollapsed} />
        </Link>
      </div>

      {/* Collapse button */}
      <div className="flex justify-end p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 text-gray-500"
          aria-label={isCollapsed ? "Déplier le menu" : "Replier le menu"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="mt-2 px-2">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <div key={item.path}>
              <NavLink
                to={item.path}
                end={!!item.subItems}
                className={({ isActive }) => cn(
                  "flex items-center px-3 py-2.5 rounded-lg font-medium transition-all duration-200",
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100',
                  isCollapsed && 'justify-center'
                )}
                title={item.adminOnly && isCollapsed ? `${item.label} (Admin uniquement)` : item.label}
              >
                {({ isActive }) => (
                  <>
                    <span className={isCollapsed ? '' : 'mr-3'}>
                      {item.icon(isActive)}
                    </span>
                    {!isCollapsed && (
                      <>
                        <span>{item.label}</span>
                        {item.adminOnly && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-800 rounded-full font-bold">
                            ADMIN
                          </span>
                        )}
                      </>
                    )}
                  </>
                )}
              </NavLink>

              {/* Submenu */}
              {!isCollapsed && item.subItems && (
                <div className="pl-8 mt-1 space-y-1">
                  {item.subItems.map(subItem => (
                    <NavLink
                      key={subItem.path}
                      to={subItem.path}
                      className={({ isActive }) => cn(
                        "block px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                        isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      {subItem.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom actions */}
      <div className="absolute bottom-0 w-full border-t border-gray-200 bg-gray-50 py-4 px-4">
        <div className="flex items-center space-x-3">
          {!isCollapsed && (
            <>
              <Link
                to="/etudes/nouvelle"
                className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Créer une étude
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                to="/rdvs"
                className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                <CalendarPlus className="w-4 h-4 mr-1" />
                Planifier un RDV
              </Link>
            </>
          )}
          {isCollapsed && (
            <div className="flex flex-col items-center w-full space-y-4">
              <Link
                to="/etudes/nouvelle"
                className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                <Plus className="w-5 h-5" />
              </Link>
              <Link
                to="/rdvs"
                className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                <CalendarPlus className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
