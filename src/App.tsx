import { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Task, TabView, FilterStatus, Category, Priority, SortBy } from './types/task';
import { UserProfile, AuthMode } from './types/auth';
import { TaskService } from './services/taskService';
import { authService } from './services/authService';
import { Navbar } from './components/layout/Navbar';
import { HeaderStats } from './components/layout/HeaderStats';
import { TaskFilterBar } from './components/tasks/TaskFilterBar';
import { TaskList } from './components/tasks/TaskList';
import { TaskModal } from './components/tasks/TaskModal';
import { DeleteConfirmModal } from './components/tasks/DeleteConfirmModal';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { CalendarView } from './components/calendar/CalendarView';
import { ToastContainer, ToastMessage } from './components/ui/Toast';
import { AuthContainer } from './components/auth/AuthContainer';
import { LogOut, Loader2, Sparkles, Database } from 'lucide-react';

export function App() {
  // Estado de Autenticação e Perfil
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // Estado de Tarefas
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  const showToast = useCallback((type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString();
    const newToast: ToastMessage = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Carregar dados de Perfil do Supabase
  const loadProfile = useCallback(async (userId: string) => {
    try {
      const profile = await authService.getProfile(userId);
      setUserProfile(profile);
    } catch (err) {
      console.warn('Aviso ao buscar perfil:', err);
    }
  }, []);

  // Carregar tarefas específicas do usuário logado
  const loadTasks = useCallback(
    async (userId: string, showLoader = false) => {
      if (showLoader) setIsLoading(true);
      setIsSyncing(true);
      try {
        const loaded = await TaskService.getTasks(userId);
        setTasks(loaded);
      } catch (err) {
        console.error('Erro ao buscar tarefas do Supabase:', err);
        showToast('error', 'Erro de Sincronização', 'Não foi possível buscar as tarefas do Supabase.');
      } finally {
        setIsLoading(false);
        setIsSyncing(false);
      }
    },
    [showToast]
  );

  // Inicialização de Autenticação e Ouvinte Supabase Auth
  useEffect(() => {
    // Detectar hash de recuperação de senha na URL (#type=recovery ou access_token)
    if (window.location.hash.includes('type=recovery') || window.location.hash.includes('access_token')) {
      setAuthMode('reset-password');
    }

    const checkSession = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
        if (user) {
          await loadProfile(user.id);
          await loadTasks(user.id, true);
        }
      } catch (err) {
        console.error('Erro ao verificar sessão ativa:', err);
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkSession();

    // Ouvinte em tempo real para mudanças de autenticação
    const unsubscribeAuth = authService.onAuthStateChange(async (event, session) => {
      const user = session?.user || null;
      setCurrentUser(user);

      if (event === 'PASSWORD_RECOVERY') {
        setAuthMode('reset-password');
      }

      if (user) {
        await loadProfile(user.id);
        await loadTasks(user.id, false);
      } else {
        setUserProfile(null);
        setTasks([]);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [loadProfile, loadTasks]);

  // Escuta Realtime do Supabase para alterações na tabela tasks
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribeRealtime = TaskService.subscribeToChanges(currentUser.id, () => {
      loadTasks(currentUser.id, false);
    });

    return () => {
      unsubscribeRealtime();
    };
  }, [currentUser, loadTasks]);

  // Efeito de Confetti comemorativo ao concluir tarefa
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#a855f7', '#10b981', '#38bdf8'],
      });
    } catch {
      // Confetti fallback
    }
  };

  // Toggle de Conclusão da Tarefa
  const handleToggleTask = async (id: string, completed: boolean) => {
    if (!currentUser) return;

    setIsSyncing(true);
    // Atualização otimista
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null } : t))
    );

    try {
      const updated = await TaskService.updateTask(id, { completed }, currentUser.id);
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
      loadTasks(currentUser.id, false);
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
    if (!currentUser) return;

    setIsSyncing(true);
    try {
      if (editingTask) {
        const updated = await TaskService.updateTask(editingTask.id, taskData, currentUser.id);
        if (updated) {
          setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updated : t)));
          showToast('success', 'Tarefa atualizada no Supabase', 'Alterações sincronizadas com sucesso.');
        }
      } else {
        const created = await TaskService.createTask(
          {
            ...taskData,
            completed: false,
          },
          currentUser.id
        );
        setTasks((prev) => [created, ...prev.filter((t) => t.id !== created.id)]);
        showToast('success', 'Salvo no Supabase!', `"${created.title}" foi gravada com segurança no banco de dados.`);
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
    if (!currentUser) return;

    setIsSyncing(true);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      const success = await TaskService.deleteTask(id, currentUser.id);
      if (success) {
        showToast('info', 'Tarefa removida do Supabase', 'O registro foi excluído permanentemente da sua conta.');
      }
    } catch (err) {
      showToast('error', 'Erro ao deletar', 'Não foi possível remover a tarefa do Supabase.');
      loadTasks(currentUser.id, false);
    } finally {
      setIsSyncing(false);
    }
  };

  // Abrir Modal para Nova Tarefa
  const handleOpenNewTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  // Sucesso de autenticação vindo do AuthContainer
  const handleAuthSuccess = async (user: any) => {
    setCurrentUser(user);
    if (user) {
      await loadProfile(user.id);
      await loadTasks(user.id, true);
    }
  };

  // Logout
  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    try {
      await authService.signOut();
      setCurrentUser(null);
      setUserProfile(null);
      setTasks([]);
      showToast('info', 'Sessão encerrada', 'Você saiu da sua conta.');
    } catch (err: any) {
      showToast('error', 'Erro ao sair', err.message);
    }
  };

  // Criar tarefas de exemplo para contas novas
  const handleSeedSamples = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    try {
      const created = await TaskService.seedInitialTasksForUser(currentUser.id);
      setTasks((prev) => [...created, ...prev]);
      showToast('success', 'Tarefas Geradas', 'Exemplos criados com sucesso na sua conta do Supabase!');
    } catch (err) {
      showToast('error', 'Erro', 'Não foi possível gerar tarefas de exemplo.');
    } finally {
      setIsSyncing(false);
    }
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

  const isFiltered =
    statusFilter !== 'TODAS' ||
    categoryFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    searchQuery.trim().length > 0;

  // Estado de carregamento inicial da verificação de sessão
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#090D16] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 animate-pulse-glow">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-200">Verificando sessão segura no Supabase...</p>
        <p className="text-xs text-slate-500 mt-1">Carregando perfil e credenciais com criptografia</p>
      </div>
    );
  }

  // Se NÃO estiver autenticado, exibe a tela de Autenticação completa
  if (!currentUser) {
    return (
      <>
        <AuthContainer
          initialMode={authMode}
          onAuthSuccess={handleAuthSuccess}
          onShowToast={showToast}
        />
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </>
    );
  }

  // Dashboard Autenticada
  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans relative selection:bg-indigo-500 selection:text-white">
      {/* Background Decorativo com Iluminação Sutil */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/3 w-[36rem] h-[36rem] rounded-full bg-indigo-600/10 blur-[150px]" />
        <div className="absolute top-1/2 right-10 w-96 h-96 rounded-full bg-purple-600/10 blur-[140px]" />
      </div>

      {/* Navbar com Dados Reais do Perfil e Status Supabase */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={() => setIsLogoutModalOpen(true)}
        pendingCount={counts.pending}
        isSyncing={isSyncing}
        currentUser={{
          email: currentUser.email,
          profile: userProfile,
        }}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        {/* Painel de Métricas do Topo */}
        <HeaderStats
          total={counts.total}
          pending={counts.pending}
          completed={counts.completed}
          highPriorityCount={counts.highPriority}
        />

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3 glass-card rounded-3xl">
            <Loader2 className="w-9 h-9 text-indigo-400 animate-spin" />
            <p className="text-sm font-medium text-slate-200">
              Sincronizando tarefas com o Supabase (Row Level Security Ativo)...
            </p>
            <p className="text-xs text-slate-500">Filtrando dados exclusivos para {currentUser.email}</p>
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

                {tasks.length === 0 && !isFiltered && (
                  <div className="text-center pt-2">
                    <button
                      onClick={handleSeedSamples}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Popular conta com 3 tarefas de demonstração
                    </button>
                  </div>
                )}
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

      {/* Footer Minimalista e Elegante */}
      <footer className="mt-auto border-t border-white/10 bg-[#090D16]/80 backdrop-blur-md py-6 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TaskFlow • Gerenciador de Tarefas e Produtividade SaaS</span>
          <span className="text-slate-500 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            Supabase PostgreSQL • RLS: <code className="text-indigo-400">auth.uid() = user_id</code>
          </span>
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

      {/* Modal de Logout */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="glass-card rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-white/10 animate-slide-up text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Encerrar Sessão</h3>
            <p className="text-xs text-slate-400 mt-1 mb-6 leading-relaxed">
              Você está conectado como <strong className="text-slate-200">{currentUser.email}</strong>. Deseja sair do TaskFlow?
            </p>
            <div className="space-y-2">
              <button
                onClick={handleConfirmLogout}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md transition-all"
              >
                Confirmar Saída
              </button>
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="w-full py-2.5 px-4 text-xs font-medium text-slate-400 hover:text-white transition-colors"
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
