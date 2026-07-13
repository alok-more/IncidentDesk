import type { Ticket } from '../types/database';

export function exportTicketsToCSV(tickets: Ticket[], filename = 'tickets.csv') {
  const headers = [
    'Ticket ID', 'Title', 'Category', 'Priority', 'Status',
    'Created By', 'Created At', 'Updated At',
  ];

  const rows = tickets.map(t => [
    t.ticket_number,
    `"${t.title.replace(/"/g, '""')}"`,
    t.category,
    t.priority,
    t.status,
    `"${((t as any).creator?.name ?? '').replace(/"/g, '""')}"`,
    new Date(t.created_at).toLocaleString(),
    new Date(t.updated_at).toLocaleString(),
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
