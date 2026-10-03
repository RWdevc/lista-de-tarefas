import React from 'react';
import { Category, Priority } from '../../types/task';

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = 'md' }) => {
  const normalized = (category || '').toUpperCase().trim();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (normalized === 'TRABALHO') {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200/80';
    dotColor = 'bg-blue-500';
  } else if (normalized === 'PESSOAL') {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    dotColor = 'bg-emerald-500';
  } else if (normalized === 'ESTUDO' || normalized === 'ESTUDOS') {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200/80';
    dotColor = 'bg-amber-500';
  } else if (normalized === 'FINANÇAS' || normalized === 'FINANCAS') {
    colorClasses = 'bg-violet-50 text-violet-700 border-violet-200/80';
    dotColor = 'bg-violet-500';
  } else if (normalized === 'SAÚDE' || normalized === 'SAUDE') {
    colorClasses = 'bg-teal-50 text-teal-700 border-teal-200/80';
    dotColor = 'bg-teal-500';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs font-semibold' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border tracking-wide uppercase transition-all ${colorClasses} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
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

  let colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (normalized === 'ALTA') {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200/80';
    dotColor = 'bg-rose-500';
  } else if (normalized === 'MÉDIA' || normalized === 'MEDIA') {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200/80';
    dotColor = 'bg-amber-500';
  } else if (normalized === 'BAIXA') {
    colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
    dotColor = 'bg-slate-400';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs font-semibold' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border tracking-wide uppercase transition-all ${colorClasses} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {priority}
    </span>
  );
};
