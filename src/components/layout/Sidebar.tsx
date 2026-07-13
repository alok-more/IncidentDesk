import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Ticket, PlusCircle, Settings,
  LogOut, ShieldCheck, X, Users, BarChart3, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import toast from 'react-hot-toast';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [openCount, setOpenCount] = useState(0);

  useEffect(() => {
    ticketService.getOpenTicketCount()
      .then(setOpenCount)
      .catch(() => {});
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const employeeLinks: NavItem[] = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tickets', icon: Ticket, label: 'My Tickets', badge: openCount || undefined },
    { to: '/tickets/new', icon: PlusCircle, label: 'Raise Incident' },
  ];

  const adminLinks: NavItem[] = [
    { to: '/admin', icon: BarChart3, label: 'Dashboard' },
    { to: '/admin/tickets', icon: AlertCircle, label: 'All Tickets', badge: openCount || undefined },
    { to: '/admin/users', icon: Users, label: 'Users' },
  ];

  const links = isAdmin ? adminLinks : employeeLinks;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 z-40 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-base tracking-tight">IncidentDesk</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-4 pt-3 pb-1">
          <span className={`text-[11px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-md inline-block ${
            isAdmin ? 'text-amber-400 bg-amber-400/10' : 'text-primary-400 bg-primary-400/10'
          }`}>
            {isAdmin ? 'Administrator' : 'Employee'}
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {links.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard' || to === '/admin'}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  {badge !== undefined && badge > 0 && (
                    <span className={`text-[11px] font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-red-500/90 text-white'
                    }`}>
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User info + bottom actions */}
        <div className="border-t border-slate-700/60 p-4 space-y-1">
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 shadow">
              <span className="text-white text-sm font-bold">
                {user?.profile.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.profile.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
            }
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </NavLink>
          <button
            onClick={handleSignOut}
            className="sidebar-link sidebar-link-inactive w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
