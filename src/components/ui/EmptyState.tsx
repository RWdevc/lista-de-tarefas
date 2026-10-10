import React from 'react';
import { ClipboardList, Plus } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nenhuma tarefa encontrada',
  description = 'Você não possui tarefas nesta visualização ou filtro.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-dashed border-white/10 glass-card animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 border border-indigo-500/30">
        <ClipboardList className="w-8 h-8 stroke-[1.8]" />
      </div>
      <h3 className="text-base font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white btn-gradient-primary rounded-xl transition-all shadow-md"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
