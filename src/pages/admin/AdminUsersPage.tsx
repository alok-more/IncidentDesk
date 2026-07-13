import { useEffect, useState, useCallback } from 'react';
import {
  Users, Ticket, CheckCircle, AlertCircle,
  ShieldCheck, User, Search,
} from 'lucide-react';
import { ticketService } from '../../services/ticketService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { UserCardSkeleton } from '../../components/ui/Skeleton';
import { useDebounce } from '../../hooks/useDebounce';
import toast from 'react-hot-toast';

interface UserRow {
  id: string;
  name: string;
  email?: string;
  role: 'user' | 'admin';
  created_at: string;
  ticketCount: number;
  openCount: number;
  resolvedCount: number;
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-orange-500',
  'bg-pink-500', 'bg-cyan-500', 'bg-amber-500', 'bg-teal-500',
];

function avatarColor(name: string) {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const debouncedSearch = useDebounce(search);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ticketService.getAllUsers();
      setUsers(data as UserRow[]);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u => {
    const matchSearch = !debouncedSearch ||
      u.name.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const adminCount = users.filter(u => u.role === 'admin').length;
  const employeeCount = users.filter(u => u.role === 'user').length;
  const totalTickets = users.reduce((s, u) => s + u.ticketCount, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-900">User Management</h2>
          <p className="text-sm text-slate-500">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{users.length}</p>
            <p className="text-sm text-slate-500">Total Users</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{adminCount}</p>
            <p className="text-sm text-slate-500">Administrators</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
            <Ticket className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{totalTickets}</p>
            <p className="text-sm text-slate-500">Total Tickets Raised</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
            {(['all', 'user', 'admin'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                  roleFilter === r
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {r === 'all' ? 'All' : r === 'admin' ? 'Admins' : 'Employees'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <UserCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          type="search"
          title="No users found"
          description="No users match the current filters."
          action={
            <button onClick={() => { setSearch(''); setRoleFilter('all'); }} className="btn-secondary">
              Clear filters
            </button>
          }
        />
      ) : (
        <div className="card divide-y divide-slate-100 overflow-hidden">
          {filtered.map(user => (
            <div key={user.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors">
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full ${avatarColor(user.name)} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
              </div>

              {/* Name + role */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    user.role === 'admin'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-primary-100 text-primary-700'
                  }`}>
                    {user.role === 'admin' ? 'Admin' : 'Employee'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric', day: 'numeric' })}
                </p>
              </div>

              {/* Ticket stats */}
              <div className="hidden sm:flex items-center gap-5">
                <TicketStat
                  icon={<Ticket className="w-3.5 h-3.5 text-slate-400" />}
                  value={user.ticketCount}
                  label="Total"
                />
                <TicketStat
                  icon={<AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                  value={user.openCount}
                  label="Open"
                />
                <TicketStat
                  icon={<CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                  value={user.resolvedCount}
                  label="Resolved"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TicketStat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-slate-700 font-semibold text-sm">
        {icon}
        {value}
      </div>
      <p className="text-[11px] text-slate-400">{label}</p>
    </div>
  );
}
