import { TaskService } from './taskService';

/**
 * Storage unificado: agora sincronizado diretamente com o Supabase
 * mantendo compatibilidade de API.
 */
export const TaskStorage = {
  getTasks: TaskService.getTasks,
  addTask: TaskService.createTask,
  updateTask: TaskService.updateTask,
  deleteTask: TaskService.deleteTask,
  resetToDefault: TaskService.resetToDefault,
};

export { TaskService };
