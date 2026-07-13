import { AlertTriangle, FileX, Search } from 'lucide-react';

interface EmptyStateProps {
  type?: 'empty' | 'search' | 'error';
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  type = 'empty',
  title = 'No items found',
  description = 'There are no items to display.',
  action,
}: EmptyStateProps) {
  const Icon = { empty: FileX, search: Search, error: AlertTriangle }[type];
  const iconColor = { empty: 'text-slate-400', search: 'text-slate-400', error: 'text-red-400' }[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className={`w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4`}>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
