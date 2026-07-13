import type { TicketStatus, TicketPriority } from '../../types/database';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../../types/constants';

interface StatusBadgeProps {
  status: TicketStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`badge border ${config.bg} ${config.color} ${size === 'sm' ? 'text-[11px]' : 'text-xs'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: TicketPriority;
  size?: 'sm' | 'md';
}

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <span className={`badge border ${config.bg} ${config.color} ${size === 'sm' ? 'text-[11px]' : 'text-xs'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
