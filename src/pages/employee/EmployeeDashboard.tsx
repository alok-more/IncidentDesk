import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket, AlertCircle, Clock, CheckCircle, XCircle,
  PlusCircle, ArrowRight, TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badges';
import { StatCard } from '../../components/ui/StatCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import type { DashboardStats, Ticket as TicketType } from '../../types/database';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export function EmployeeDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statsData, { tickets }] = await Promise.all([
          ticketService.getDashboardStats(),
          ticketService.getTickets({ limit: 5 }),
        ]);
        setStats(statsData);
        setRecent(tickets);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const resolveRate = stats && stats.total > 0
    ? Math.round(((stats.resolved + stats.closed) / stats.total) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize:'24px 24px'}} />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-primary-200 text-sm font-medium">Good day,</p>
            <h2 className="text-2xl font-bold mt-0.5">{user?.profile.name}</h2>
            <p className="text-primary-200 text-sm mt-1.5 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 bg-white/10 rounded-full px-2.5 py-0.5 text-white font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> {stats?.open ?? 0} open
              </span>
              <span className="inline-flex items-center gap-1 bg-white/10 rounded-full px-2.5 py-0.5 text-white font-medium">
                <Clock className="w-3.5 h-3.5" /> {stats?.inProgress ?? 0} in progress
              </span>
              {resolveRate > 0 && (
                <span className="inline-flex items-center gap-1 bg-white/10 rounded-full px-2.5 py-0.5 text-white font-medium">
                  <TrendingUp className="w-3.5 h-3.5" /> {resolveRate}% resolved
                </span>
              )}
            </p>
          </div>
          <Link
            to="/tickets/new"
            className="flex items-center gap-2 bg-white text-primary-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-colors text-sm shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            Raise Incident
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Total Tickets" value={stats?.total ?? 0} icon={<Ticket className="w-6 h-6 text-blue-600" />} color="bg-blue-100" />
        <StatCard label="Open" value={stats?.open ?? 0} icon={<AlertCircle className="w-6 h-6 text-amber-600" />} color="bg-amber-100" />
        <StatCard label="In Progress" value={stats?.inProgress ?? 0} icon={<Clock className="w-6 h-6 text-orange-600" />} color="bg-orange-100" />
        <StatCard label="Resolved" value={stats?.resolved ?? 0} icon={<CheckCircle className="w-6 h-6 text-green-600" />} color="bg-green-100" />
        <StatCard label="Closed" value={stats?.closed ?? 0} icon={<XCircle className="w-6 h-6 text-slate-500" />} color="bg-slate-100" />
      </div>

      {/* Recent tickets */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Recent Tickets</h3>
          <Link to="/tickets" className="text-sm text-primary-600 hover:underline flex items-center gap-1 font-medium">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <EmptyState
            title="No tickets yet"
            description="Raise your first incident to get started."
            action={
              <Link to="/tickets/new" className="btn-primary">
                <PlusCircle className="w-4 h-4" /> Raise Incident
              </Link>
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wide">Ticket ID</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wide">Title</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wide hidden md:table-cell">Category</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wide">Priority</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wide">Status</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wide hidden lg:table-cell">Date</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recent.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {ticket.ticket_number}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 max-w-[220px]">
                        <p className="text-sm font-medium text-slate-800 truncate">{ticket.title}</p>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell text-sm text-slate-600">{ticket.category}</td>
                      <td className="px-5 py-3.5"><PriorityBadge priority={ticket.priority} /></td>
                      <td className="px-5 py-3.5"><StatusBadge status={ticket.status} /></td>
                      <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-slate-500">{formatDate(ticket.created_at)}</td>
                      <td className="px-5 py-3.5">
                        <Link to={`/tickets/${ticket.id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-slate-100">
              {recent.map(ticket => (
                <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="block px-4 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{ticket.ticket_number}</span>
                    <StatusBadge status={ticket.status} size="sm" />
                  </div>
                  <p className="text-sm font-medium text-slate-800 mb-2">{ticket.title}</p>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={ticket.priority} size="sm" />
                    <span className="text-xs text-slate-400">{ticket.category}</span>
                    <span className="text-xs text-slate-400 ml-auto">{formatDate(ticket.created_at)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
