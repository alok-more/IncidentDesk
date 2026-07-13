interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  onClick?: () => void;
}

export function StatCard({ label, value, icon, color, onClick }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`card p-5 flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-150' : ''}`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500 truncate">{label}</p>
      </div>
    </div>
  );
}
