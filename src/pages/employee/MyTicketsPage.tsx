import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, SlidersHorizontal } from 'lucide-react';
import { ticketService } from '../../services/ticketService';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badges';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { TICKET_CATEGORIES, TICKET_STATUSES, TICKET_PRIORITIES } from '../../types/constants';
import { useDebounce } from '../../hooks/useDebounce';
import type { Ticket } from '../../types/database';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const PER_PAGE = 10;

export function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearch = useDebounce(search);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ticketService.getTickets({
        search: debouncedSearch,
        status: status as any,
        priority: priority as any,
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
  }, [debouncedSearch, status, priority, page]);

  useEffect(() => { load(); }, [load]);

  // Reset to page 1 when search/filter changes
  useEffect(() => { setPage(1); }, [debouncedSearch, status, priority]);

  const clearFilters = () => { setStatus(''); setPriority(''); setSearch(''); };
  const hasFilters = status || priority || debouncedSearch;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Tickets</h2>
          <p className="text-sm text-slate-500">{count} ticket{count !== 1 ? 's' : ''} total</p>
        </div>
        <Link to="/tickets/new" className="btn-primary">
          <PlusCircle className="w-4 h-4" />
          Raise Incident
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="card p-4">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${showFilters ? 'bg-slate-100' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasFilters && <span className="w-2 h-2 bg-primary-500 rounded-full" />}
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-3 mt-3 flex-wrap animate-slide-in">
            <select value={status} onChange={e => setStatus(e.target.value)} className="input max-w-[160px] bg-white">
              <option value="">All Status</option>
              {TICKET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={priority} onChange={e => setPriority(e.target.value)} className="input max-w-[160px] bg-white">
              <option value="">All Priority</option>
              {TICKET_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {hasFilters && (
              <button onClick={clearFilters} className="btn-secondary text-red-600 border-red-200 hover:bg-red-50">
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table / cards */}
      <div className="card">
        {loading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : tickets.length === 0 ? (
          <EmptyState
            type={hasFilters ? 'search' : 'empty'}
            title={hasFilters ? 'No matching tickets' : 'No tickets yet'}
            description={hasFilters ? 'Try adjusting your filters.' : 'Raise your first incident to get started.'}
            action={!hasFilters
              ? <Link to="/tickets/new" className="btn-primary"><PlusCircle className="w-4 h-4" /> Raise Incident</Link>
              : <button onClick={clearFilters} className="btn-secondary">Clear Filters</button>
            }
          />
        ) : (
          <div>
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
                  {tickets.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{ticket.ticket_number}</span>
                      </td>
                      <td className="px-5 py-3.5 max-w-[220px]">
                        <p className="text-sm font-medium text-slate-800 truncate">{ticket.title}</p>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell text-sm text-slate-600">{ticket.category}</td>
                      <td className="px-5 py-3.5"><PriorityBadge priority={ticket.priority} /></td>
                      <td className="px-5 py-3.5"><StatusBadge status={ticket.status} /></td>
                      <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-slate-500">{formatDate(ticket.created_at)}</td>
                      <td className="px-5 py-3.5">
                        <Link
                          to={`/tickets/${ticket.id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-slate-100">
              {tickets.map(ticket => (
                <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="block px-4 py-4 hover:bg-slate-50 transition-colors active:bg-slate-100">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{ticket.ticket_number}</span>
                    <StatusBadge status={ticket.status} size="sm" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 mb-2 leading-snug">{ticket.title}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <PriorityBadge priority={ticket.priority} size="sm" />
                    <span className="text-xs text-slate-400">{ticket.category}</span>
                    <span className="text-xs text-slate-400 ml-auto">{formatDate(ticket.created_at)}</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="px-5 pb-4">
              <Pagination
                page={page}
                totalPages={Math.ceil(count / PER_PAGE)}
                totalItems={count}
                perPage={PER_PAGE}
                onPageChange={setPage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
