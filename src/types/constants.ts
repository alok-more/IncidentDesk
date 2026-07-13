import type { TicketStatus, TicketPriority } from './database';

export const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; bg: string; dot: string }> = {
  'Open':        { label: 'Open',        color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',   dot: 'bg-blue-500' },
  'In Progress': { label: 'In Progress', color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
  'Resolved':    { label: 'Resolved',    color: 'text-green-700',  bg: 'bg-green-50 border-green-200', dot: 'bg-green-500' },
  'Closed':      { label: 'Closed',      color: 'text-slate-600',  bg: 'bg-slate-100 border-slate-200', dot: 'bg-slate-400' },
};

export const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string; bg: string; dot: string }> = {
  'Low':      { label: 'Low',      color: 'text-slate-600', bg: 'bg-slate-100 border-slate-200', dot: 'bg-slate-400' },
  'Medium':   { label: 'Medium',   color: 'text-blue-700',  bg: 'bg-blue-50 border-blue-200',   dot: 'bg-blue-500' },
  'High':     { label: 'High',     color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', dot: 'bg-orange-500' },
  'Critical': { label: 'Critical', color: 'text-red-700',   bg: 'bg-red-50 border-red-200',     dot: 'bg-red-500' },
};

export const TICKET_CATEGORIES = [
  'Hardware','Software','Network','Email','Printer',
  'Access','Security','Database','Server','Other',
] as const;

export const TICKET_STATUSES: TicketStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed'];
export const TICKET_PRIORITIES: TicketPriority[] = ['Low', 'Medium', 'High', 'Critical'];
