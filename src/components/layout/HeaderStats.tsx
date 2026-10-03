import React from 'react';
import { CheckCircle2, Clock, ListTodo, TrendingUp } from 'lucide-react';

interface HeaderStatsProps {
  total: number;
  pending: number;
  completed: number;
  highPriorityCount: number;
}

export const HeaderStats: React.FC<HeaderStatsProps> = ({
  total,
  pending,
  completed,
  highPriorityCount,
}) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Total */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Total de Tarefas</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ListTodo className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{total}</span>
          <span className="text-xs text-slate-400">cadastradas</span>
        </div>
      </div>

      {/* Pendentes */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Pendentes</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-600">{pending}</span>
          <span className="text-xs text-slate-400">a realizar</span>
        </div>
      </div>

      {/* Concluídas */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Concluídas</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-600">{completed}</span>
          <span className="text-xs text-slate-400">finalizadas</span>
        </div>
      </div>

      {/* Taxa de Eficiência / Progresso */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Progresso</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-2xl font-bold text-slate-900">{percentage}%</span>
            {highPriorityCount > 0 && (
              <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                {highPriorityCount} alta prioridade
              </span>
            )}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
