import { Task } from '../types/task';
import { supabase } from './supabase';

const STORAGE_KEY = 'taskflow_tasks_supabase_cache';

// Fallback inicial caso não haja dados
const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Desenvolver a nova interface do painel de controle',
    description: 'Implementar os componentes de estatísticas e gráficos de produtividade utilizando Tailwind CSS.',
    category: 'TRABALHO',
    priority: 'ALTA',
    due_date: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0],
    completed: false,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'task-2',
    title: 'Revisar módulo de autenticação e permissões',
    description: 'Verificar tokens JWT e renovação de sessão para o próximo release.',
    category: 'TRABALHO',
    priority: 'MÉDIA',
    due_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    completed: false,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'task-3',
    title: 'Estudar arquitetura de banco de dados com Supabase',
    description: 'Ler documentação sobre Row Level Security (RLS) e Realtime subscriptions.',
    category: 'ESTUDO',
    priority: 'ALTA',
    due_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    completed: false,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

// Helper para normalizar dados vindos do Supabase
function formatTaskFromDb(dbTask: any): Task {
  return {
    id: String(dbTask.id),
    title: dbTask.title || '',
    description: dbTask.description || '',
    category: dbTask.category || 'TRABALHO',
    priority: dbTask.priority || 'MÉDIA',
    due_date: dbTask.due_date ? String(dbTask.due_date).split('T')[0].split(' ')[0] : new Date().toISOString().split('T')[0],
    completed: Boolean(dbTask.completed),
    completed_at: dbTask.completed_at || null,
    created_at: dbTask.created_at || new Date().toISOString(),
    updated_at: dbTask.updated_at || undefined,
  };
}

// Helper para cache local
function getLocalCache(): Task[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setLocalCache(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Erro ao salvar no cache local:', err);
  }
}

export const TaskService = {
  /**
   * Busca todas as tarefas diretamente do Supabase
   */
  async getTasks(): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Erro ao carregar do Supabase, usando cache local:', error.message);
        const cached = getLocalCache();
        return cached.length > 0 ? cached : INITIAL_TASKS;
      }

      if (data && data.length > 0) {
        const formatted = data.map(formatTaskFromDb);
        setLocalCache(formatted);
        return formatted;
      }

      // Se não houver tarefas no Supabase, tenta carregar dados padrão
      const cached = getLocalCache();
      return cached.length > 0 ? cached : [];
    } catch (err) {
      console.error('Erro de conexão com o Supabase:', err);
      const cached = getLocalCache();
      return cached.length > 0 ? cached : INITIAL_TASKS;
    }
  },

  /**
   * Cria uma nova tarefa no Supabase
   */
  async createTask(taskData: Omit<Task, 'id' | 'created_at'>): Promise<Task> {
    const newId = 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    const nowIso = new Date().toISOString();

    const insertPayload = {
      id: newId,
      title: taskData.title,
      description: taskData.description || '',
      category: taskData.category,
      priority: taskData.priority,
      due_date: taskData.due_date,
      completed: taskData.completed ?? false,
      completed_at: taskData.completed ? nowIso : null,
      created_at: nowIso,
      updated_at: nowIso,
    };

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([insertPayload])
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir no Supabase, salvando localmente:', error);
      }

      const createdTask = data ? formatTaskFromDb(data) : (insertPayload as Task);
      
      // Atualiza cache
      const current = getLocalCache();
      setLocalCache([createdTask, ...current.filter((t) => t.id !== createdTask.id)]);

      return createdTask;
    } catch (err) {
      console.error('Exceção ao inserir no Supabase:', err);
      const fallbackTask: Task = insertPayload as Task;
      const current = getLocalCache();
      setLocalCache([fallbackTask, ...current]);
      return fallbackTask;
    }
  },

  /**
   * Atualiza uma tarefa existente no Supabase
   */
  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const nowIso = new Date().toISOString();
    const updatePayload: any = {
      ...updates,
      updated_at: nowIso,
    };

    if (updates.completed !== undefined) {
      updatePayload.completed_at = updates.completed ? nowIso : null;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar no Supabase, atualizando localmente:', error);
      }

      // Atualiza cache
      const current = getLocalCache();
      let updatedTask: Task;

      if (data) {
        updatedTask = formatTaskFromDb(data);
      } else {
        const existing = current.find((t) => t.id === id);
        if (!existing) return null;
        updatedTask = { ...existing, ...updatePayload };
      }

      setLocalCache(current.map((t) => (t.id === id ? updatedTask : t)));
      return updatedTask;
    } catch (err) {
      console.error('Exceção ao atualizar no Supabase:', err);
      const current = getLocalCache();
      const existing = current.find((t) => t.id === id);
      if (!existing) return null;
      const fallbackTask: Task = { ...existing, ...updatePayload };
      setLocalCache(current.map((t) => (t.id === id ? fallbackTask : t)));
      return fallbackTask;
    }
  },

  /**
   * Exclui uma tarefa no Supabase
   */
  async deleteTask(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar no Supabase:', error);
      }

      // Remove do cache local
      const current = getLocalCache();
      setLocalCache(current.filter((t) => t.id !== id));
      return true;
    } catch (err) {
      console.error('Exceção ao deletar no Supabase:', err);
      const current = getLocalCache();
      setLocalCache(current.filter((t) => t.id !== id));
      return true;
    }
  },

  /**
   * Assina atualizações em tempo real com o Supabase Realtime
   */
  subscribeToChanges(onChange: () => void) {
    const channel = supabase
      .channel('public:tasks_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          onChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Restaura/Popula tarefas de exemplo no Supabase
   */
  async resetToDefault(): Promise<Task[]> {
    try {
      // Limpa tabela atual
      await supabase.from('tasks').delete().neq('id', '___non_existent___');
      
      // Insere tarefas padrão
      const { data, error } = await supabase
        .from('tasks')
        .insert(INITIAL_TASKS)
        .select();

      if (!error && data) {
        const formatted = data.map(formatTaskFromDb);
        setLocalCache(formatted);
        return formatted;
      }
    } catch (err) {
      console.error('Erro ao restaurar no Supabase:', err);
    }

    setLocalCache(INITIAL_TASKS);
    return INITIAL_TASKS;
  }
};
