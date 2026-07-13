interface SkeletonProps {
  className?: string;
}

function Bone({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-slate-200 animate-pulse rounded ${className}`} />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card p-5 flex items-center gap-4">
      <Bone className="w-12 h-12 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Bone className="h-7 w-16" />
        <Bone className="h-3.5 w-24" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <Bone className={`h-4 ${i === 1 ? 'w-40' : i === 0 ? 'w-20' : 'w-16'}`} />
        </td>
      ))}
    </tr>
  );
}

export function TableSkeleton({ rows = 6, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-5 py-3">
                <Bone className="h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner skeleton */}
      <Bone className="h-28 rounded-2xl w-full" />
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      {/* Table card */}
      <div className="card p-5 space-y-3">
        <Bone className="h-5 w-36" />
        <TableSkeleton rows={5} cols={6} />
      </div>
    </div>
  );
}

export function UserCardSkeleton() {
  return (
    <div className="card p-5 flex items-center gap-4">
      <Bone className="w-12 h-12 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Bone className="h-4 w-32" />
        <Bone className="h-3 w-44" />
      </div>
      <Bone className="h-6 w-16 rounded-full" />
    </div>
  );
}
