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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 animate-fade-in">
      {/* Total */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 hover:border-indigo-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Total de Tarefas</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <ListTodo className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">{total}</span>
          <span className="text-xs text-slate-500">no Supabase</span>
        </div>
      </div>

      {/* Pendentes */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 hover:border-amber-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Pendentes</span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-400">{pending}</span>
          <span className="text-xs text-slate-500">a realizar</span>
        </div>
      </div>

      {/* Concluídas */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Concluídas</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-400">{completed}</span>
          <span className="text-xs text-slate-500">finalizadas</span>
        </div>
      </div>

      {/* Taxa de Eficiência / Progresso */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 hover:border-indigo-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Progresso Geral</span>
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-2xl font-bold text-white">{percentage}%</span>
            {highPriorityCount > 0 && (
              <span className="text-[10px] font-semibold text-rose-300 bg-rose-950/70 px-1.5 py-0.5 rounded-md border border-rose-500/30">
                {highPriorityCount} urgentes
              </span>
            )}
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden border border-white/5">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
