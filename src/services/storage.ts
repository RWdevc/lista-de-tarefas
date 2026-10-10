import { TaskService } from './taskService';

/**
 * Storage unificado sincronizado diretamente com o Supabase
 * garantindo compatibilidade e tipagem estrita
 */
export const TaskStorage = {
  getTasks: TaskService.getTasks,
  addTask: TaskService.createTask,
  updateTask: TaskService.updateTask,
  deleteTask: TaskService.deleteTask,
  seedInitialTasksForUser: TaskService.seedInitialTasksForUser,
};

export { TaskService };
