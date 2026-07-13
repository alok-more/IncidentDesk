import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Trash2, Eye, RefreshCw, Download } from 'lucide-react';
import { ticketService } from '../../services/ticketService';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badges';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { TICKET_STATUSES, TICKET_PRIORITIES, TICKET_CATEGORIES } from '../../types/constants';
import { useDebounce } from '../../hooks/useDebounce';
import { exportTicketsToCSV } from '../../utils/csvExport';
import type { Ticket, TicketStatus, TicketPriority } from '../../types/database';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const PER_PAGE = 15;

export function AdminTicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [allForExport, setAllForExport] = useState<Ticket[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const debouncedSearch = useDebounce(search);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ticketService.getTickets({
        search: debouncedSearch,
        status: status as TicketStatus | '',
        priority: priority as TicketPriority | '',
        category: category as any,
        page,
        limit: PER_PAGE,
      });
      setTickets(res.tickets);
      setCount(res.count);
    } catch {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, priority, category, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [debouncedSearch, status, priority, category]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await ticketService.deleteTicket(deleteId);
      toast.success('Ticket deleted');
      setDeleteId(null);
      load();
    } catch {
      toast.error('Failed to delete ticket');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusChange = async (ticket: Ticket, newStatus: TicketStatus) => {
    if (!user) return;
    try {
      await ticketService.updateTicket(ticket.id, { status: newStatus }, user.id, ticket);
      toast.success('Status updated');
      load();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handlePriorityChange = async (ticket: Ticket, newPriority: TicketPriority) => {
    if (!user) return;
    try {
      await ticketService.updateTicket(ticket.id, { priority: newPriority }, user.id, ticket);
      toast.success('Priority updated');
      load();
    } catch {
      toast.error('Failed to update priority');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await ticketService.getTickets({
        search: debouncedSearch,
        status: status as TicketStatus | '',
        priority: priority as TicketPriority | '',
        category: category as any,
        limit: 5000,
      });
      exportTicketsToCSV(res.tickets, `tickets-${Date.now()}.csv`);
      toast.success(`Exported ${res.tickets.length} ticket${res.tickets.length !== 1 ? 's' : ''}`);
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const clearFilters = () => { setStatus(''); setPriority(''); setCategory(''); setSearch(''); };
  const hasFilters = status || priority || category || debouncedSearch;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Ticket Management</h2>
          <p className="text-sm text-slate-500">{count} total ticket{count !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} disabled={exporting || loading} className="btn-secondary">
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button onClick={load} className="btn-secondary">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="card p-4">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or ticket ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`btn-secondary ${showFilters ? 'bg-slate-100' : ''}`}>
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasFilters && <span className="w-2 h-2 bg-primary-500 rounded-full" />}
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-3 mt-3 flex-wrap animate-slide-in">
            <select value={status} onChange={e => setStatus(e.target.value)} className="input max-w-[150px] bg-white">
              <option value="">All Status</option>
              {TICKET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={priority} onChange={e => setPriority(e.target.value)} className="input max-w-[150px] bg-white">
              <option value="">All Priority</option>
              {TICKET_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={category} onChange={e => setCategory(e.target.value)} className="input max-w-[150px] bg-white">
              <option value="">All Categories</option>
              {TICKET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {hasFilters && (
              <button onClick={clearFilters} className="btn-secondary text-red-600 border-red-200 hover:bg-red-50">Clear</button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <TableSkeleton rows={10} cols={7} />
        ) : tickets.length === 0 ? (
          <EmptyState
            type={hasFilters ? 'search' : 'empty'}
            title="No tickets found"
            description="No tickets match your criteria."
            action={hasFilters ? <button onClick={clearFilters} className="btn-secondary">Clear Filters</button> : undefined}
          />
        ) : (
          <div>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 uppercase tracking-wide">Ticket ID</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 uppercase tracking-wide">Title</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 uppercase tracking-wide">Employee</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 uppercase tracking-wide hidden lg:table-cell">Category</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 uppercase tracking-wide">Priority</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 uppercase tracking-wide">Status</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 uppercase tracking-wide hidden xl:table-cell">Date</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tickets.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {ticket.ticket_number}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-[180px]">
                        <p className="text-sm font-medium text-slate-800 truncate">{ticket.title}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{(ticket.creator as any)?.name ?? '—'}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-sm text-slate-600">{ticket.category}</td>
                      <td className="px-4 py-3">
                        <select
                          value={ticket.priority}
                          onChange={e => handlePriorityChange(ticket, e.target.value as TicketPriority)}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer hover:border-slate-300 transition-colors"
                        >
                          {TICKET_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={ticket.status}
                          onChange={e => handleStatusChange(ticket, e.target.value as TicketStatus)}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer hover:border-slate-300 transition-colors"
                        >
                          {TICKET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell text-xs text-slate-500">{formatDate(ticket.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            to={`/admin/tickets/${ticket.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteId(ticket.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Delete ticket"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden divide-y divide-slate-100">
              {tickets.map(ticket => (
                <div key={ticket.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{ticket.ticket_number}</span>
                    <div className="flex gap-1.5">
                      <Link to={`/admin/tickets/${ticket.id}`} className="p-1 rounded text-slate-400 hover:text-primary-600">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button onClick={() => setDeleteId(ticket.id)} className="p-1 rounded text-slate-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 mb-1">{ticket.title}</p>
                  <p className="text-xs text-slate-500 mb-2">{(ticket.creator as any)?.name ?? '—'} · {ticket.category}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <PriorityBadge priority={ticket.priority} size="sm" />
                    <StatusBadge status={ticket.status} size="sm" />
                    <span className="text-xs text-slate-400 ml-auto">{formatDate(ticket.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 pb-4">
              <Pagination page={page} totalPages={Math.ceil(count / PER_PAGE)} totalItems={count} perPage={PER_PAGE} onPageChange={setPage} />
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Ticket"
        message="This will permanently delete the ticket and all its history. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
