import { Task } from '../types/task';
import { supabase } from './supabase';

function getStorageKey(userId?: string): string {
  return userId ? `taskflow_tasks_${userId}` : 'taskflow_tasks_guest';
}

// Normaliza dados vindos do banco de dados PostgreSQL do Supabase
function formatTaskFromDb(dbTask: any): Task {
  return {
    id: String(dbTask.id),
    user_id: dbTask.user_id ? String(dbTask.user_id) : undefined,
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

// Gerenciamento de cache local por usuário para resiliência e velocidade
function getLocalCache(userId?: string): Task[] {
  try {
    const key = getStorageKey(userId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setLocalCache(tasks: Task[], userId?: string): void {
  try {
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(tasks));
  } catch (err) {
    console.error('Erro ao salvar no cache local:', err);
  }
}

export const TaskService = {
  /**
   * Busca todas as tarefas do usuário autenticado diretamente do Supabase
   * O isolamento é garantido tanto pelo filtro explícito quanto pelas Políticas de RLS
   */
  async getTasks(userId?: string): Promise<Task[]> {
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Aviso ao carregar tarefas do Supabase, utilizando cache local:', error.message);
        return getLocalCache(userId);
      }

      if (data) {
        const formatted = data.map(formatTaskFromDb);
        setLocalCache(formatted, userId);
        return formatted;
      }

      return getLocalCache(userId);
    } catch (err) {
      console.error('Erro de conexão com o Supabase:', err);
      return getLocalCache(userId);
    }
  },

  /**
   * Cria uma nova tarefa atribuída ao usuário conectado
   */
  async createTask(taskData: Omit<Task, 'id' | 'created_at'>, userId?: string): Promise<Task> {
    const newId = 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    const nowIso = new Date().toISOString();

    const insertPayload: any = {
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

    if (userId) {
      insertPayload.user_id = userId;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([insertPayload])
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir tarefa no Supabase:', error);
      }

      const createdTask = data ? formatTaskFromDb(data) : (insertPayload as Task);

      // Atualiza o cache do usuário
      const current = getLocalCache(userId);
      setLocalCache([createdTask, ...current.filter((t) => t.id !== createdTask.id)], userId);

      return createdTask;
    } catch (err) {
      console.error('Exceção ao inserir tarefa no Supabase:', err);
      const fallbackTask: Task = insertPayload as Task;
      const current = getLocalCache(userId);
      setLocalCache([fallbackTask, ...current], userId);
      return fallbackTask;
    }
  },

  /**
   * Atualiza os campos de uma tarefa existente
   */
  async updateTask(id: string, updates: Partial<Task>, userId?: string): Promise<Task | null> {
    const nowIso = new Date().toISOString();
    const updatePayload: any = {
      ...updates,
      updated_at: nowIso,
    };

    if (updates.completed !== undefined) {
      updatePayload.completed_at = updates.completed ? nowIso : null;
    }

    try {
      let query = supabase
        .from('tasks')
        .update(updatePayload)
        .eq('id', id);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.select().single();

      if (error) {
        console.error('Erro ao atualizar tarefa no Supabase:', error);
      }

      const current = getLocalCache(userId);
      let updatedTask: Task;

      if (data) {
        updatedTask = formatTaskFromDb(data);
      } else {
        const existing = current.find((t) => t.id === id);
        if (!existing) return null;
        updatedTask = { ...existing, ...updatePayload };
      }

      setLocalCache(
        current.map((t) => (t.id === id ? updatedTask : t)),
        userId
      );
      return updatedTask;
    } catch (err) {
      console.error('Exceção ao atualizar tarefa no Supabase:', err);
      const current = getLocalCache(userId);
      const existing = current.find((t) => t.id === id);
      if (!existing) return null;
      const fallbackTask: Task = { ...existing, ...updatePayload };
      setLocalCache(
        current.map((t) => (t.id === id ? fallbackTask : t)),
        userId
      );
      return fallbackTask;
    }
  },

  /**
   * Exclui uma tarefa no Supabase
   */
  async deleteTask(id: string, userId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { error } = await query;

      if (error) {
        console.error('Erro ao deletar tarefa no Supabase:', error);
      }

      const current = getLocalCache(userId);
      setLocalCache(
        current.filter((t) => t.id !== id),
        userId
      );
      return true;
    } catch (err) {
      console.error('Exceção ao deletar tarefa no Supabase:', err);
      const current = getLocalCache(userId);
      setLocalCache(
        current.filter((t) => t.id !== id),
        userId
      );
      return true;
    }
  },

  /**
   * Assina eventos em tempo real com o Supabase Realtime
   */
  subscribeToChanges(userId: string | undefined, onChange: () => void) {
    const channelName = userId ? `public:tasks_${userId}` : 'public:tasks_all';
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
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
   * Cria tarefas padrão para um novo usuário começar a usar o app imediatamente
   */
  async seedInitialTasksForUser(userId: string): Promise<Task[]> {
    const samples: Omit<Task, 'id' | 'created_at'>[] = [
      {
        title: 'Explorar o TaskFlow e configurar meu perfil',
        description: 'Conheça os recursos de filtragem, prioridades e acompanhamento analítico.',
        category: 'TRABALHO',
        priority: 'ALTA',
        due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        completed: false,
      },
      {
        title: 'Criar minha primeira tarefa personalizada',
        description: 'Clique no botão "+ Nova Tarefa" e defina categoria e prioridade.',
        category: 'ESTUDO',
        priority: 'MÉDIA',
        due_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        completed: false,
      },
      {
        title: 'Testar a persistência em nuvem com Supabase',
        description: 'Marque esta tarefa como concluída e observe a sincronização em tempo real.',
        category: 'PESSOAL',
        priority: 'BAIXA',
        due_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        completed: false,
      },
    ];

    const createdList: Task[] = [];
    for (const sample of samples) {
      const created = await TaskService.createTask(sample, userId);
      createdList.push(created);
    }

    return createdList;
  },
};
