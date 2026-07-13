import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, User, Tag, BarChart, Clock,
  AlertCircle, History, ChevronDown,
} from 'lucide-react';
import { ticketService } from '../../services/ticketService';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badges';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { TICKET_STATUSES, TICKET_PRIORITIES } from '../../types/constants';
import type { Ticket, TicketHistory, TicketStatus, TicketPriority } from '../../types/database';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export function AdminTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [history, setHistory] = useState<TicketHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editStatus, setEditStatus] = useState<TicketStatus>('Open');
  const [editPriority, setEditPriority] = useState<TicketPriority>('Medium');

  const reload = async () => {
    if (!id) return;
    const [t, h] = await Promise.all([
      ticketService.getTicketById(id),
      ticketService.getTicketHistory(id),
    ]);
    setTicket(t);
    setEditStatus(t.status);
    setEditPriority(t.priority);
    setHistory(h as any);
  };

  useEffect(() => {
    (async () => {
      try { await reload(); } catch { toast.error('Failed to load ticket'); navigate(-1); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const handleSave = async () => {
    if (!ticket || !user) return;
    setSaving(true);
    try {
      await ticketService.updateTicket(ticket.id, { status: editStatus, priority: editPriority }, user.id, ticket);
      toast.success('Ticket updated');
      await reload();
    } catch {
      toast.error('Failed to update ticket');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading ticket..." />;
  if (!ticket) return null;

  const hasChanges = editStatus !== ticket.status || editPriority !== ticket.priority;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {ticket.ticket_number}
            </span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1 truncate">{ticket.title}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-slate-400" /> Description
            </h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
          </div>

          <div className="card p-5 grid grid-cols-2 gap-4">
            <MetaField icon={<Tag className="w-4 h-4" />} label="Category" value={ticket.category} />
            <MetaField icon={<User className="w-4 h-4" />} label="Reporter" value={(ticket.creator as any)?.name ?? '—'} />
            <MetaField icon={<Calendar className="w-4 h-4" />} label="Created" value={formatDateTime(ticket.created_at)} />
            <MetaField icon={<Calendar className="w-4 h-4" />} label="Updated" value={formatDateTime(ticket.updated_at)} />
          </div>
        </div>

        {/* Admin controls */}
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Update Ticket</h3>

            <div>
              <label className="label">Status</label>
              <div className="relative">
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as TicketStatus)}
                  className="input bg-white appearance-none pr-8"
                >
                  {TICKET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="label">Priority</label>
              <div className="relative">
                <select
                  value={editPriority}
                  onChange={e => setEditPriority(e.target.value as TicketPriority)}
                  className="input bg-white appearance-none pr-8"
                >
                  {TICKET_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="btn-primary w-full justify-center"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-1.5">
          <History className="w-4 h-4 text-slate-400" /> Activity Timeline
        </h3>
        <div className="space-y-3">
          <TimelineItem
            icon={<div className="w-2 h-2 bg-primary-500 rounded-full" />}
            label={`Ticket created by ${(ticket.creator as any)?.name ?? 'Unknown'}`}
            date={formatDateTime(ticket.created_at)}
          />
          {history.length === 0 && (
            <p className="text-sm text-slate-400 pl-5">No changes recorded yet.</p>
          )}
          {history.map(h => (
            <TimelineItem
              key={h.id}
              icon={<div className="w-2 h-2 bg-amber-500 rounded-full" />}
              label={`${(h as any).changer?.name ?? 'Admin'} changed ${h.field} from "${h.old_value}" to "${h.new_value}"`}
              date={formatDateTime(h.created_at)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MetaField({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-slate-400 flex items-center gap-1 mb-1 uppercase tracking-wide font-medium">{icon} {label}</p>
      <div className="text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}

function TimelineItem({ icon, label, date }: { icon: React.ReactNode; label: string; date: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center pt-1.5">
        {icon}
        <div className="w-px flex-1 bg-slate-200 mt-1 min-h-[12px]" />
      </div>
      <div className="pb-3">
        <p className="text-sm text-slate-700">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{date}</p>
      </div>
    </div>
  );
}
