import React from 'react';
import {
  PieChart,
  BarChart2,
  Clock,
  Flame,
  Target,
  Award,
} from 'lucide-react';
import { Task } from '../../types/task';
import { CategoryBadge, PriorityBadge } from '../ui/Badge';

interface AnalyticsViewProps {
  tasks: Task[];
  onOpenNewTask: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ tasks, onOpenNewTask }) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Distribuição por Categoria
  const categoryCounts: { [key: string]: { total: number; completed: number } } = {};
  tasks.forEach((t) => {
    const cat = t.category.toUpperCase();
    if (!categoryCounts[cat]) {
      categoryCounts[cat] = { total: 0, completed: 0 };
    }
    categoryCounts[cat].total += 1;
    if (t.completed) categoryCounts[cat].completed += 1;
  });

  // Distribuição por Prioridade
  const priorityCounts = {
    ALTA: tasks.filter((t) => t.priority === 'ALTA').length,
    MÉDIA: tasks.filter((t) => t.priority === 'MÉDIA').length,
    BAIXA: tasks.filter((t) => t.priority === 'BAIXA').length,
  };

  // Tarefas com vencimento próximo (próximos 3 dias)
  const today = new Date().toISOString().split('T')[0];
  const upcomingTasks = tasks
    .filter((t) => !t.completed && t.due_date >= today)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header da Seção de Análises */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            <span>Painel de Análises e Produtividade</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhe o desempenho, categorização e taxa de conclusão das suas atividades.
          </p>
        </div>

        <button
          onClick={onOpenNewTask}
          className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors"
        >
          + Adicionar Nova Tarefa
        </button>
      </div>

      {/* Grid de Cards de Destaque */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Taxa Geral */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Taxa de Conclusão
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{completionRate}%</span>
            <span className="text-xs text-emerald-600 font-semibold">
              {completed} de {total} tarefas
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Foco Pendente */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tarefas Ativas
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{pending}</span>
            <span className="text-xs text-amber-600 font-medium">aguardando finalização</span>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            {priorityCounts.ALTA} com prioridade alta requerem atenção imediata.
          </p>
        </div>

        {/* Produtividade & Ritmo */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Nível de Produtividade
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-indigo-600">
              {completionRate >= 70 ? 'Excelente 🔥' : completionRate >= 40 ? 'Constante ⚡' : 'Iniciando 🎯'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            {completionRate >= 70
              ? 'Ótimo ritmo! Você está mantendo a maioria das tarefas em dia.'
              : 'Continue avançando nas pendências para alcançar suas metas semanais.'}
          </p>
        </div>
      </div>

      {/* Seção com Gráficos e Distribuições */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Categoria */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" />
              <span>Desempenho por Categoria</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">{Object.keys(categoryCounts).length} categorias</span>
          </div>

          <div className="space-y-4">
            {Object.keys(categoryCounts).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Nenhuma categoria registrada.</p>
            ) : (
              Object.entries(categoryCounts).map(([catName, stats]) => {
                const catRate = Math.round((stats.completed / stats.total) * 100);
                return (
                  <div key={catName} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <CategoryBadge category={catName} size="sm" />
                      <span className="text-slate-600 font-semibold">
                        {stats.completed}/{stats.total} ({catRate}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${catRate}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Distribuição por Nível de Prioridade */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-600" />
              <span>Distribuição por Prioridade</span>
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100 text-center">
              <span className="text-[11px] font-bold text-rose-700 uppercase block">Alta</span>
              <span className="text-2xl font-bold text-rose-600">{priorityCounts.ALTA}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">tarefas</span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 text-center">
              <span className="text-[11px] font-bold text-amber-700 uppercase block">Média</span>
              <span className="text-2xl font-bold text-amber-600">{priorityCounts.MÉDIA}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">tarefas</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-100/70 border border-slate-200 text-center">
              <span className="text-[11px] font-bold text-slate-700 uppercase block">Baixa</span>
              <span className="text-2xl font-bold text-slate-700">{priorityCounts.BAIXA}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">tarefas</span>
            </div>
          </div>

          {/* Próximos Vencimentos */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Próximos Prazos
            </h4>
            {upcomingTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">Nenhuma tarefa pendente com prazo próximo.</p>
            ) : (
              <div className="space-y-2">
                {upcomingTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                      {t.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={t.priority} size="sm" />
                      <span className="text-slate-500 font-mono text-[11px]">{t.due_date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
