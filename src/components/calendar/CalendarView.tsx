import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
} from 'lucide-react';
import { Task } from '../../types/task';
import { TaskCard } from '../tasks/TaskCard';

interface CalendarViewProps {
  tasks: Task[];
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onOpenNewTask: () => void;
}

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onOpenNewTask,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Primeiro dia do mês e total de dias
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Navegar meses
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(now.toISOString().split('T')[0]);
  };

  // Mapear tarefas por data ISO (YYYY-MM-DD)
  const tasksByDate: { [key: string]: Task[] } = {};
  tasks.forEach((task) => {
    if (task.due_date) {
      if (!tasksByDate[task.due_date]) {
        tasksByDate[task.due_date] = [];
      }
      tasksByDate[task.due_date].push(task);
    }
  });

  // Tarefas do dia selecionado
  const selectedDayTasks = tasksByDate[selectedDateStr] || [];

  // Data de hoje em string
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header do Calendário */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            <span>Calendário de Tarefas e Entregas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualize os prazos organizados por dia do mês.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-soft"
          >
            Hoje
          </button>
          <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-soft p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 px-3 min-w-[130px] text-center">
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Principal: Calendário + Painel do Dia Selecionado */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendário Mensal (7 Colunas) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-soft">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-1 text-center mb-3">
            {WEEK_DAYS.map((day) => (
              <span key={day} className="text-xs font-bold text-slate-400 py-1">
                {day}
              </span>
            ))}
          </div>

          {/* Grid de Dias */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Espaçadores antes do dia 1 */}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="h-14 sm:h-20 p-1 rounded-xl bg-slate-50/40" />
            ))}

            {/* Dias do Mês */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const dayNum = index + 1;
              const dayMonthStr = String(month + 1).padStart(2, '0');
              const dayFormatted = String(dayNum).padStart(2, '0');
              const dateStr = `${year}-${dayMonthStr}-${dayFormatted}`;

              const dayTasks = tasksByDate[dateStr] || [];
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDateStr;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-14 sm:h-20 p-1.5 rounded-2xl flex flex-col justify-between items-start transition-all border text-left ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-sm'
                      : isToday
                      ? 'border-indigo-200 bg-white hover:border-indigo-300'
                      : 'border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-indigo-600 text-white'
                          : isSelected
                          ? 'text-indigo-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Indicadores Visuais de Tarefas */}
                  <div className="flex flex-wrap gap-1 w-full overflow-hidden">
                    {dayTasks.slice(0, 3).map((task) => (
                      <span
                        key={task.id}
                        className={`w-1.5 h-1.5 rounded-full ${
                          task.completed
                            ? 'bg-emerald-400'
                            : task.priority === 'ALTA'
                            ? 'bg-rose-500'
                            : 'bg-indigo-500'
                        }`}
                        title={task.title}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[9px] text-slate-400 font-bold leading-none">
                        +{dayTasks.length - 3}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detalhes do Dia Selecionado */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-soft flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {selectedDateStr === todayStr ? 'Hoje' : selectedDateStr}
              </h3>
              <p className="text-xs text-slate-400">
                {selectedDayTasks.length} tarefa(s) agendada(s) para este dia
              </p>
            </div>

            <button
              onClick={onOpenNewTask}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
              title="Adicionar tarefa neste dia"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de Tarefas do Dia */}
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
            {selectedDayTasks.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">
                  Nenhuma tarefa para esta data
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Clique no botão + acima para adicionar uma nova atividade.
                </p>
              </div>
            ) : (
              selectedDayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
