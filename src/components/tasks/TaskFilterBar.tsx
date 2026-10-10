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
    <div className="flex flex-col gap-4 mb-6 animate-fade-in">
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
            className="w-full pl-10 pr-9 py-2.5 glass-input rounded-xl text-sm placeholder:text-slate-500 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Botão + Nova Tarefa */}
        <button
          onClick={onOpenNewTask}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 btn-gradient-primary text-white font-semibold text-sm rounded-xl shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nova Tarefa</span>
        </button>
      </div>

      {/* Filter Row: Botões 'Todas', 'Pendentes', 'Concluídas' + Selects de Categoria, Prioridade e Ordenação */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Filtros de Status (Todas, Pendentes, Concluídas) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-white/10 overflow-x-auto backdrop-blur-md">
          <button
            onClick={() => onStatusChange('TODAS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'TODAS'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Todas</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === 'TODAS' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {counts.total}
            </span>
          </button>

          <button
            onClick={() => onStatusChange('PENDENTES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'PENDENTES'
                ? 'bg-amber-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Pendentes</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === 'PENDENTES'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {counts.pending}
            </span>
          </button>

          <button
            onClick={() => onStatusChange('CONCLUÍDAS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'CONCLUÍDAS'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Concluídas</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === 'CONCLUÍDAS'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-800 text-slate-400'
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
              className="text-xs font-medium text-slate-300 bg-slate-900/80 border border-white/10 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm hover:border-white/20 transition-all"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">Todas Categorias</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
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
              className="text-xs font-medium text-slate-300 bg-slate-900/80 border border-white/10 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm hover:border-white/20 transition-all"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">Todas Prioridades</option>
              <option value="ALTA" className="bg-slate-900 text-slate-200">Alta</option>
              <option value="MÉDIA" className="bg-slate-900 text-slate-200">Média</option>
              <option value="BAIXA" className="bg-slate-900 text-slate-200">Baixa</option>
            </select>
          </div>

          {/* Ordenação */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortBy)}
              className="text-xs font-medium text-slate-300 bg-slate-900/80 border border-white/10 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm hover:border-white/20 transition-all"
            >
              <option value="dueDateAsc" className="bg-slate-900 text-slate-200">Vencimento (Mais próximo)</option>
              <option value="dueDateDesc" className="bg-slate-900 text-slate-200">Vencimento (Mais distante)</option>
              <option value="priorityHigh" className="bg-slate-900 text-slate-200">Prioridade (Alta primeiro)</option>
              <option value="priorityLow" className="bg-slate-900 text-slate-200">Prioridade (Baixa primeiro)</option>
              <option value="createdAtDesc" className="bg-slate-900 text-slate-200">Mais recentes</option>
              <option value="titleAsc" className="bg-slate-900 text-slate-200">Alfabética (A-Z)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
