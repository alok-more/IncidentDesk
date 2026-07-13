import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket, AlertCircle, Clock, CheckCircle, XCircle,
  ArrowRight, TrendingUp, Zap, BarChart3,
} from 'lucide-react';
import { ticketService } from '../../services/ticketService';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badges';
import { EmptyState } from '../../components/ui/EmptyState';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import type { DashboardStats, Ticket as TicketType } from '../../types/database';
import { formatDate } from '../../utils/formatters';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import toast from 'react-hot-toast';

const STATUS_COLORS  = ['#3b82f6', '#f59e0b', '#10b981', '#94a3b8'];
const PRIORITY_COLORS = ['#94a3b8', '#3b82f6', '#f97316', '#ef4444'];

function getMonthLabel(d: Date) {
  return d.toLocaleString('default', { month: 'short' });
}

export function AdminDashboard() {
  const [stats, setStats]         = useState<DashboardStats | null>(null);
  const [recent, setRecent]       = useState<TicketType[]>([]);
  const [monthlyData, setMonthly] = useState<{ month: string; count: number }[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statsData, { tickets }, monthly] = await Promise.all([
          ticketService.getDashboardStats(),
          ticketService.getTickets({ limit: 8 }),
          ticketService.getMonthlyStats(),
        ]);
        setStats(statsData);
        setRecent(tickets);

        const now = new Date();
        const buckets: Record<string, number> = {};
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          buckets[`${d.getFullYear()}-${d.getMonth()}`] = 0;
        }
        monthly.forEach(row => {
          const d   = new Date(row.created_at);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          if (key in buckets) buckets[key]++;
        });
        setMonthly(
          Object.entries(buckets).map(([key, count]) => {
            const [year, month] = key.split('-').map(Number);
            return { month: getMonthLabel(new Date(year, month, 1)), count };
          }),
        );
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const resolveRate = stats && stats.total > 0
    ? Math.round(((stats.resolved + stats.closed) / stats.total) * 100)
    : 0;

  const criticalAndHigh = (stats?.critical ?? 0) + (stats?.high ?? 0);

  const statusChartData = [
    { name: 'Open',        value: stats?.open ?? 0 },
    { name: 'In Progress', value: stats?.inProgress ?? 0 },
    { name: 'Resolved',    value: stats?.resolved ?? 0 },
    { name: 'Closed',      value: stats?.closed ?? 0 },
  ].filter(d => d.value > 0);

  const priorityChartData = [
    { name: 'Low',      value: stats?.low ?? 0 },
    { name: 'Medium',   value: stats?.medium ?? 0 },
    { name: 'High',     value: stats?.high ?? 0 },
    { name: 'Critical', value: stats?.critical ?? 0 },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize:'28px 28px'}} />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-slate-400 text-sm font-medium">Admin Console</p>
            <h2 className="text-2xl font-bold mt-0.5">Dashboard Overview</h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-sm bg-white/10 rounded-full px-3 py-1">
                <span className="text-white font-semibold">{stats?.open ?? 0}</span>
                <span className="text-slate-400"> open incidents</span>
              </span>
              {criticalAndHigh > 0 && (
                <span className="text-sm bg-red-500/20 text-red-300 rounded-full px-3 py-1 font-medium">
                  {criticalAndHigh} critical / high priority
                </span>
              )}
              {resolveRate > 0 && (
                <span className="text-sm bg-green-500/20 text-green-300 rounded-full px-3 py-1 font-medium">
                  {resolveRate}% resolution rate
                </span>
              )}
            </div>
          </div>
          <Link
            to="/admin/tickets"
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm shadow-lg"
          >
            <BarChart3 className="w-4 h-4" />
            Manage Tickets
          </Link>
        </div>
      </div>

      {/* Status stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Total Tickets" value={stats?.total ?? 0}    icon={<Ticket     className="w-6 h-6 text-blue-600"   />} color="bg-blue-100"   />
        <StatCard label="Open"          value={stats?.open ?? 0}     icon={<AlertCircle className="w-6 h-6 text-amber-600"  />} color="bg-amber-100"  />
        <StatCard label="In Progress"   value={stats?.inProgress ?? 0} icon={<Clock    className="w-6 h-6 text-orange-600" />} color="bg-orange-100" />
        <StatCard label="Resolved"      value={stats?.resolved ?? 0} icon={<CheckCircle className="w-6 h-6 text-green-600"  />} color="bg-green-100"  />
        <StatCard label="Closed"        value={stats?.closed ?? 0}   icon={<XCircle    className="w-6 h-6 text-slate-500"  />} color="bg-slate-100"  />
      </div>

      {/* Priority stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Critical" value={stats?.critical ?? 0} icon={<Zap        className="w-6 h-6 text-red-600"    />} color="bg-red-100"    />
        <StatCard label="High"     value={stats?.high ?? 0}     icon={<TrendingUp  className="w-6 h-6 text-orange-600" />} color="bg-orange-100" />
        <StatCard label="Medium"   value={stats?.medium ?? 0}   icon={<BarChart3   className="w-6 h-6 text-blue-600"   />} color="bg-blue-100"   />
        <StatCard label="Low"      value={stats?.low ?? 0}      icon={<BarChart3   className="w-6 h-6 text-slate-500"  />} color="bg-slate-100"  />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly bar chart */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-1">Monthly Incidents</h3>
          <p className="text-xs text-slate-400 mb-4">Last 6 months</p>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: 13 }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Tickets" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          )}
        </div>

        {/* Status donut */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-1">By Status</h3>
          <p className="text-xs text-slate-400 mb-2">Current distribution</p>
          {statusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {statusChartData.map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', fontSize: 13 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Priority donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-1">By Priority</h3>
          <p className="text-xs text-slate-400 mb-2">Current distribution</p>
          {priorityChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={priorityChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {priorityChartData.map((_, i) => (
                    <Cell key={i} fill={PRIORITY_COLORS[i % PRIORITY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', fontSize: 13 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          )}
        </div>

        {/* Resolution metric card */}
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-800 mb-1">Resolution Rate</h3>
            <p className="text-xs text-slate-400">Resolved + Closed vs Total</p>
          </div>
          <div className="my-6 text-center">
            <p className="text-5xl font-bold text-slate-900">{resolveRate}<span className="text-2xl text-slate-400">%</span></p>
            <p className="text-sm text-slate-500 mt-2">{(stats?.resolved ?? 0) + (stats?.closed ?? 0)} of {stats?.total ?? 0} tickets resolved</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-2.5 bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700"
              style={{ width: `${resolveRate}%` }}
            />
          </div>
        </div>

        {/* SLA-style urgent tickets callout */}
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-800 mb-1">Urgent Attention</h3>
            <p className="text-xs text-slate-400">Critical + High priority open tickets</p>
          </div>
          <div className="my-4 flex items-center gap-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-red-600">{stats?.critical ?? 0}</p>
              <p className="text-xs text-slate-500 mt-1">Critical</p>
            </div>
            <div className="text-slate-200 text-2xl font-light">+</div>
            <div className="text-center">
              <p className="text-4xl font-bold text-orange-500">{stats?.high ?? 0}</p>
              <p className="text-xs text-slate-500 mt-1">High</p>
            </div>
            <div className="text-slate-200 text-2xl font-light">=</div>
            <div className="text-center">
              <p className="text-4xl font-bold text-slate-800">{criticalAndHigh}</p>
              <p className="text-xs text-slate-500 mt-1">Total</p>
            </div>
          </div>
          {criticalAndHigh > 0 ? (
            <Link to="/admin/tickets" className="btn-danger justify-center text-sm">
              View Urgent Tickets
            </Link>
          ) : (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4" /> No urgent tickets
            </div>
          )}
        </div>
      </div>

      {/* Recent tickets table */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Recent Activity</h3>
          <Link to="/admin/tickets" className="text-sm text-primary-600 hover:underline flex items-center gap-1 font-medium">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <EmptyState title="No tickets yet" description="Tickets raised by employees will appear here." />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wide">Ticket ID</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wide">Title</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wide">Employee</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wide hidden lg:table-cell">Category</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wide">Priority</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wide">Status</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wide hidden xl:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recent.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link to={`/admin/tickets/${ticket.id}`} className="font-mono text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded hover:underline">
                          {ticket.ticket_number}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 max-w-[180px]">
                        <p className="text-sm font-medium text-slate-800 truncate">{ticket.title}</p>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{(ticket.creator as any)?.name ?? '—'}</td>
                      <td className="px-5 py-3.5 hidden lg:table-cell text-sm text-slate-600">{ticket.category}</td>
                      <td className="px-5 py-3.5"><PriorityBadge priority={ticket.priority} /></td>
                      <td className="px-5 py-3.5"><StatusBadge status={ticket.status} /></td>
                      <td className="px-5 py-3.5 hidden xl:table-cell text-xs text-slate-500">{formatDate(ticket.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {recent.map(ticket => (
                <Link key={ticket.id} to={`/admin/tickets/${ticket.id}`} className="block px-4 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-medium text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">{ticket.ticket_number}</span>
                    <StatusBadge status={ticket.status} size="sm" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 mb-1">{ticket.title}</p>
                  <p className="text-xs text-slate-500 mb-2">{(ticket.creator as any)?.name ?? '—'}</p>
                  <div className="flex gap-2 items-center">
                    <PriorityBadge priority={ticket.priority} size="sm" />
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
