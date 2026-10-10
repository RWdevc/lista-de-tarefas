import React from 'react';
import { Category, Priority } from '../../types/task';

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = 'md' }) => {
  const normalized = (category || '').toUpperCase().trim();

  let colorClasses = 'bg-slate-800/80 text-slate-300 border-slate-700/60';
  let dotColor = 'bg-slate-400';

  if (normalized === 'TRABALHO') {
    colorClasses = 'bg-blue-950/60 text-blue-300 border-blue-500/40';
    dotColor = 'bg-blue-400';
  } else if (normalized === 'PESSOAL') {
    colorClasses = 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40';
    dotColor = 'bg-emerald-400';
  } else if (normalized === 'ESTUDO' || normalized === 'ESTUDOS') {
    colorClasses = 'bg-amber-950/60 text-amber-300 border-amber-500/40';
    dotColor = 'bg-amber-400';
  } else if (normalized === 'FINANÇAS' || normalized === 'FINANCAS') {
    colorClasses = 'bg-purple-950/60 text-purple-300 border-purple-500/40';
    dotColor = 'bg-purple-400';
  } else if (normalized === 'SAÚDE' || normalized === 'SAUDE') {
    colorClasses = 'bg-teal-950/60 text-teal-300 border-teal-500/40';
    dotColor = 'bg-teal-400';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px] font-semibold' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border tracking-wide uppercase transition-all backdrop-blur-sm ${colorClasses} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shadow-sm`} />
      {category}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const normalized = (priority || '').toUpperCase().trim();

  let colorClasses = 'bg-slate-800/80 text-slate-300 border-slate-700/60';
  let dotColor = 'bg-slate-400';

  if (normalized === 'ALTA') {
    colorClasses = 'bg-rose-950/60 text-rose-300 border-rose-500/40';
    dotColor = 'bg-rose-400';
  } else if (normalized === 'MÉDIA' || normalized === 'MEDIA') {
    colorClasses = 'bg-amber-950/60 text-amber-300 border-amber-500/40';
    dotColor = 'bg-amber-400';
  } else if (normalized === 'BAIXA') {
    colorClasses = 'bg-slate-800/70 text-slate-300 border-slate-700/50';
    dotColor = 'bg-slate-400';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px] font-semibold' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border tracking-wide uppercase transition-all backdrop-blur-sm ${colorClasses} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shadow-sm`} />
      {priority}
    </span>
  );
};
