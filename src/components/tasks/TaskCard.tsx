import React from 'react';
import { Calendar, Trash2, Edit3, AlertCircle, Clock } from 'lucide-react';
import { Task } from '../../types/task';
import { CategoryBadge, PriorityBadge } from '../ui/Badge';
import { Checkbox } from '../ui/Checkbox';

interface TaskCardProps {
  task: Task;
  index?: number;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index = 0,
  onToggle,
  onEdit,
  onDelete,
}) => {
  // Formatar data de vencimento
  const formatDueDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const date = new Date(year, month, day);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const taskDate = new Date(year, month, day);
        taskDate.setHours(0, 0, 0, 0);

        if (taskDate.getTime() === today.getTime()) {
          return 'Hoje';
        }
        if (taskDate.getTime() === tomorrow.getTime()) {
          return 'Amanhã';
        }
        if (taskDate.getTime() === yesterday.getTime()) {
          return 'Ontem';
        }

        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        });
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  // Checagem de atraso
  const isOverdue = () => {
    if (task.completed || !task.due_date) return false;
    const parts = task.due_date.split('-');
    if (parts.length === 3) {
      const taskDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      taskDate.setHours(23, 59, 59, 999);
      return taskDate.getTime() < Date.now();
    }
    return false;
  };

  const overdue = isOverdue();
  const delayMs = Math.min(index * 45, 600);

  return (
    <div
      style={{ animationDelay: `${delayMs}ms` }}
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-300 animate-stagger-item ${
        task.completed
          ? 'opacity-55 bg-slate-900/40 border-white/5 shadow-none'
          : 'glass-card glass-card-hover border-white/10 hover:border-indigo-500/40'
      }`}
    >
      {/* Lado Esquerdo: Checkbox + Conteúdo */}
      <div className="flex items-start gap-3.5 sm:gap-4 flex-1 min-w-0">
        {/* Checkbox customizado */}
        <div className="pt-0.5 shrink-0">
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onChange={(checked) => onToggle(task.id, checked)}
          />
        </div>

        {/* Informações da Tarefa */}
        <div className="flex-1 min-w-0">
          {/* Tags de Categoria e Prioridade */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <CategoryBadge category={task.category} size="sm" />
            <PriorityBadge priority={task.priority} size="sm" />
            {overdue && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-500/40">
                <AlertCircle className="w-3 h-3" />
                Atrasada
              </span>
            )}
          </div>

          {/* Título da Tarefa em destaque */}
          <h3
            onClick={() => onToggle(task.id, !task.completed)}
            className={`text-base font-semibold cursor-pointer transition-all duration-200 leading-snug break-words ${
              task.completed
                ? 'line-through text-slate-500 font-normal'
                : 'text-slate-100 hover:text-indigo-400'
            }`}
          >
            {task.title}
          </h3>

          {/* Descrição opcional */}
          {task.description && (
            <p
              className={`text-xs mt-1 leading-relaxed ${
                task.completed ? 'line-through text-slate-600' : 'text-slate-400'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Exibição da data de vencimento com ícone de calendário */}
          <div className="flex items-center gap-4 mt-2.5 text-xs">
            <div
              className={`inline-flex items-center gap-1.5 font-medium ${
                overdue && !task.completed ? 'text-rose-400 font-semibold' : 'text-slate-400'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 stroke-[2]" />
              <span>{formatDueDate(task.due_date)}</span>
            </div>

            {task.completed && task.completed_at && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <Clock className="w-3 h-3" />
                Concluída
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Lado Direito: Ações (Editar & Lixeira) */}
      <div className="flex items-center justify-end gap-1 mt-3 sm:mt-0 sm:pl-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5 shrink-0">
        {/* Botão de Editar */}
        <button
          onClick={() => onEdit(task)}
          title="Editar tarefa"
          aria-label="Editar tarefa"
          className="p-2 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl transition-colors duration-150"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        {/* Ícone de Lixeira no canto direito para exclusão */}
        <button
          onClick={() => onDelete(task.id)}
          title="Excluir tarefa"
          aria-label="Excluir tarefa"
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors duration-150"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
