import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';

interface TopbarProps {
  onMenuToggle: () => void;
  title?: string;
}

export function Topbar({ onMenuToggle, title }: TopbarProps) {
  const { user, isAdmin } = useAuth();
  const [openCount, setOpenCount] = useState(0);

  useEffect(() => {
    ticketService.getOpenTicketCount()
      .then(setOpenCount)
      .catch(() => {});
  }, []);

  const bellTo = isAdmin ? '/admin/tickets' : '/tickets';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-20">
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 -ml-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {title && (
        <h1 className="text-base font-semibold text-slate-900 hidden sm:block">{title}</h1>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Link
          to={bellTo}
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          title={`${openCount} open ticket${openCount !== 1 ? 's' : ''}`}
        >
          <Bell className="w-5 h-5" />
          {openCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
              {openCount > 99 ? '99+' : openCount}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 ml-1">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {user?.profile.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800 leading-tight">{user?.profile.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.profile.role === 'admin' ? 'Administrator' : 'Employee'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
