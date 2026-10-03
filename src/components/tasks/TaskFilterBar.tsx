import React from 'react';
import { Search, Plus, X } from 'lucide-react';
import { FilterStatus, Category, SortBy } from '../../types/task';

interface TaskFilterBarProps {
  statusFilter: FilterStatus;
  onStatusChange: (status: FilterStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
  priorityFilter: string;
  onPriorityChange: (priority: string) => void;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
  categories: Category[];
  counts: {
    total: number;
    pending: number;
    completed: number;
  };
  onOpenNewTask: () => void;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  statusFilter,
  onStatusChange,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  priorityFilter,
  onPriorityChange,
  sortBy,
  onSortChange,
  categories,
  counts,
  onOpenNewTask,
}) => {
  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Top Bar: Botão Nova Tarefa + Busca + Ações Rápidas */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar tarefas por título ou descrição..."
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200/90 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-soft transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Botão + Nova Tarefa */}
        <button
          onClick={onOpenNewTask}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold text-sm rounded-xl shadow-sm shadow-indigo-200 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nova Tarefa</span>
        </button>
      </div>

      {/* Filter Row: Botões 'Todas', 'Pendentes', 'Concluídas' + Selects de Categoria, Prioridade e Ordenação */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Filtros de Status (Todas, Pendentes, Concluídas) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/60 overflow-x-auto">
          <button
            onClick={() => onStatusChange('TODAS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'TODAS'
                ? 'bg-white text-indigo-600 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Todas</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === 'TODAS' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {counts.total}
            </span>
          </button>

          <button
            onClick={() => onStatusChange('PENDENTES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'PENDENTES'
                ? 'bg-white text-amber-600 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Pendentes</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === 'PENDENTES'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {counts.pending}
            </span>
          </button>

          <button
            onClick={() => onStatusChange('CONCLUÍDAS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'CONCLUÍDAS'
                ? 'bg-white text-emerald-600 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Concluídas</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === 'CONCLUÍDAS'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {counts.completed}
            </span>
          </button>
        </div>

        {/* Filtros adicionais (Categoria, Prioridade, Ordenar) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Categoria */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 pr-7 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-soft hover:border-slate-300"
            >
              <option value="ALL">Todas Categorias</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Prioridade */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 pr-7 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-soft hover:border-slate-300"
            >
              <option value="ALL">Todas Prioridades</option>
              <option value="ALTA">Alta</option>
              <option value="MÉDIA">Média</option>
              <option value="BAIXA">Baixa</option>
            </select>
          </div>

          {/* Ordenação */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortBy)}
              className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 pr-7 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-soft hover:border-slate-300"
            >
              <option value="dueDateAsc">Vencimento (Mais próximo)</option>
              <option value="dueDateDesc">Vencimento (Mais distante)</option>
              <option value="priorityHigh">Prioridade (Alta primeiro)</option>
              <option value="priorityLow">Prioridade (Baixa primeiro)</option>
              <option value="createdAtDesc">Mais recentes</option>
              <option value="titleAsc">Alfabética (A-Z)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
