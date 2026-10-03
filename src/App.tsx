import { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Task, TabView, FilterStatus, Category, Priority, SortBy } from './types/task';
import { TaskService } from './services/taskService';
import { Navbar } from './components/layout/Navbar';
import { HeaderStats } from './components/layout/HeaderStats';
import { TaskFilterBar } from './components/tasks/TaskFilterBar';
import { TaskList } from './components/tasks/TaskList';
import { TaskModal } from './components/tasks/TaskModal';
import { DeleteConfirmModal } from './components/tasks/DeleteConfirmModal';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { CalendarView } from './components/calendar/CalendarView';
import { ToastContainer, ToastMessage } from './components/ui/Toast';
import { LogOut, RefreshCw, Loader2 } from 'lucide-react';

export function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabView>('TAREFAS');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('TODAS');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('dueDateAsc');

  // Modais
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString();
    const newToast: ToastMessage = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Carregar tarefas do Supabase
  const loadTasks = useCallback(async (showLoader = false) => {
    if (showLoader) setIsLoading(true);
    setIsSyncing(true);
    try {
      const loaded = await TaskService.getTasks();
      setTasks(loaded);
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err);
      showToast('error', 'Erro de Sincronização', 'Não foi possível carregar as tarefas do Supabase.');
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, []);

  // Inicialização e escuta Realtime do Supabase
  useEffect(() => {
    loadTasks(true);

    // Inicia listener de mudanças em tempo real no Supabase
    const unsubscribe = TaskService.subscribeToChanges(() => {
      loadTasks(false);
    });

    return () => {
      unsubscribe();
    };
  }, [loadTasks]);

  // Efeito de Confetti ao concluir
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899'],
      });
    } catch {
      // Confetti fallback
    }
  };

  // Toggle de Conclusão da Tarefa
  const handleToggleTask = async (id: string, completed: boolean) => {
    setIsSyncing(true);
    // Atualização otimista na interface
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null } : t))
    );

    try {
      const updated = await TaskService.updateTask(id, { completed });
      if (updated) {
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
        if (completed) {
          triggerConfetti();
          showToast('success', 'Tarefa concluída no Supabase!', `"${updated.title}" foi marcada como finalizada.`);
        } else {
          showToast('info', 'Tarefa reaberta', `"${updated.title}" voltou para pendentes.`);
        }
      }
    } catch (err) {
      showToast('error', 'Erro ao atualizar', 'Não foi possível sincronizar o status no Supabase.');
      loadTasks(false);
    } finally {
      setIsSyncing(false);
    }
  };

  // Salvar (Criar ou Atualizar) Tarefa
  const handleSaveTask = async (taskData: {
    title: string;
    description?: string;
    category: Category;
    priority: Priority;
    due_date: string;
  }) => {
    setIsSyncing(true);
    try {
      if (editingTask) {
        const updated = await TaskService.updateTask(editingTask.id, taskData);
        if (updated) {
          setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updated : t)));
          showToast('success', 'Tarefa atualizada no Supabase', `Alterações salvas com sucesso.`);
        }
      } else {
        const created = await TaskService.createTask({
          ...taskData,
          completed: false,
        });
        setTasks((prev) => [created, ...prev.filter((t) => t.id !== created.id)]);
        showToast('success', 'Salvo no Supabase!', `"${created.title}" foi gravada no banco de dados.`);
      }
    } catch (err) {
      showToast('error', 'Erro ao salvar', 'Ocorreu um problema ao comunicar com o Supabase.');
    } finally {
      setIsSyncing(false);
      setEditingTask(null);
    }
  };

  // Abrir Modal de Edição
  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  // Abrir Modal de Exclusão
  const handleOpenDelete = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setDeletingTask(task);
      setIsDeleteModalOpen(true);
    }
  };

  // Confirmar Exclusão
  const handleConfirmDelete = async (id: string) => {
    setIsSyncing(true);
    // Atualização otimista
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      const success = await TaskService.deleteTask(id);
      if (success) {
        showToast('info', 'Tarefa removida do Supabase', 'A tarefa foi excluída do banco de dados.');
      }
    } catch (err) {
      showToast('error', 'Erro ao deletar', 'Não foi possível remover a tarefa do Supabase.');
      loadTasks(false);
    } finally {
      setIsSyncing(false);
    }
  };

  // Abrir Modal para Nova Tarefa
  const handleOpenNewTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  // Lista de Categorias Únicas
  const uniqueCategories = useMemo(() => {
    const set = new Set<string>(['TRABALHO', 'PESSOAL', 'ESTUDO', 'FINANÇAS', 'SAÚDE']);
    tasks.forEach((t) => {
      if (t.category) set.add(t.category.toUpperCase());
    });
    return Array.from(set);
  }, [tasks]);

  // Contagens
  const counts = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const highPriority = tasks.filter((t) => !t.completed && t.priority === 'ALTA').length;
    return { total, completed, pending, highPriority };
  }, [tasks]);

  // Filtragem e Ordenação das Tarefas
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Filtro por Status
        if (statusFilter === 'PENDENTES' && task.completed) return false;
        if (statusFilter === 'CONCLUÍDAS' && !task.completed) return false;

        // Filtro por Categoria
        if (categoryFilter !== 'ALL' && task.category.toUpperCase() !== categoryFilter.toUpperCase()) {
          return false;
        }

        // Filtro por Prioridade
        if (priorityFilter !== 'ALL' && task.priority.toUpperCase() !== priorityFilter.toUpperCase()) {
          return false;
        }

        // Filtro por Busca de Texto
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(query);
          const matchDesc = task.description?.toLowerCase().includes(query);
          const matchCat = task.category.toLowerCase().includes(query);
          if (!matchTitle && !matchDesc && !matchCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Ordenação
        if (sortBy === 'dueDateAsc') {
          return (a.due_date || '').localeCompare(b.due_date || '');
        }
        if (sortBy === 'dueDateDesc') {
          return (b.due_date || '').localeCompare(a.due_date || '');
        }
        if (sortBy === 'priorityHigh') {
          const weight = { ALTA: 3, MÉDIA: 2, MEDIA: 2, BAIXA: 1 };
          return (weight[b.priority] || 0) - (weight[a.priority] || 0);
        }
        if (sortBy === 'priorityLow') {
          const weight = { ALTA: 3, MÉDIA: 2, MEDIA: 2, BAIXA: 1 };
          return (weight[a.priority] || 0) - (weight[b.priority] || 0);
        }
        if (sortBy === 'titleAsc') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'createdAtDesc') {
          return (b.created_at || '').localeCompare(a.created_at || '');
        }
        return 0;
      });
  }, [tasks, statusFilter, categoryFilter, priorityFilter, searchQuery, sortBy]);

  const isFiltered = statusFilter !== 'TODAS' || categoryFilter !== 'ALL' || priorityFilter !== 'ALL' || searchQuery.trim().length > 0;

  // Logout / Sessão
  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    showToast('info', 'Sessão encerrada', 'Você saiu da sua conta.');
  };

  const handleResetData = async () => {
    setIsSyncing(true);
    try {
      const reset = await TaskService.resetToDefault();
      setTasks(reset);
      setIsLogoutModalOpen(false);
      showToast('success', 'Supabase Restaurado', 'Banco de dados recarregado com tarefas de exemplo.');
    } catch (err) {
      showToast('error', 'Erro', 'Não foi possível restaurar os dados no Supabase.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Navbar com Status Supabase */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        pendingCount={counts.pending}
        isSyncing={isSyncing}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Painel de Métricas do Topo */}
        <HeaderStats
          total={counts.total}
          pending={counts.pending}
          completed={counts.completed}
          highPriorityCount={counts.highPriority}
        />

        {/* Loading Skeleton inicial */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-medium">Sincronizando tarefas com o Supabase (lista-tarefas)...</p>
          </div>
        ) : (
          <>
            {/* Visão de Tarefas */}
            {activeTab === 'TAREFAS' && (
              <div className="space-y-6">
                <TaskFilterBar
                  statusFilter={statusFilter}
                  onStatusChange={setStatusFilter}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  categoryFilter={categoryFilter}
                  onCategoryChange={setCategoryFilter}
                  priorityFilter={priorityFilter}
                  onPriorityChange={setPriorityFilter}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  categories={uniqueCategories}
                  counts={counts}
                  onOpenNewTask={handleOpenNewTask}
                />

                <TaskList
                  tasks={filteredTasks}
                  onToggle={handleToggleTask}
                  onEdit={handleOpenEdit}
                  onDelete={handleOpenDelete}
                  onOpenNewTask={handleOpenNewTask}
                  isFiltered={isFiltered}
                />
              </div>
            )}

            {/* Visão de Análises */}
            {activeTab === 'ANALISES' && (
              <AnalyticsView tasks={tasks} onOpenNewTask={handleOpenNewTask} />
            )}

            {/* Visão de Calendário */}
            {activeTab === 'CALENDARIO' && (
              <CalendarView
                tasks={tasks}
                onToggle={handleToggleTask}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onOpenNewTask={handleOpenNewTask}
              />
            )}
          </>
        )}
      </main>

      {/* Footer Limpo e Profissional */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white/70 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TaskFlow • Gerenciador de Tarefas e Produtividade</span>
          <span className="text-slate-400">Banco de Dados: Supabase PostgreSQL (lista-tarefas)</span>
        </div>
      </footer>

      {/* Modal de Criação / Edição de Tarefa */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        editingTask={editingTask}
        existingCategories={uniqueCategories}
      />

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        task={deletingTask}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingTask(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* Modal de Opções de Conta / Reset */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-slide-up text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Opções da Conta</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Suas tarefas são armazenadas e sincronizadas na nuvem com o projeto Supabase <strong className="text-indigo-600">lista-tarefas</strong>.
            </p>
            <div className="space-y-2">
              <button
                onClick={handleConfirmLogout}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
              >
                Confirmar Saída
              </button>
              <button
                onClick={handleResetData}
                className="w-full py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Restaurar Dados Padrão no Supabase
              </button>
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="w-full py-2 px-4 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificações Toasts */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}

export default App;
