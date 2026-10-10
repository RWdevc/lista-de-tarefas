import React from 'react';
import { Task } from '../../types/task';
import { TaskCard } from './TaskCard';
import { EmptyState } from '../ui/EmptyState';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onOpenNewTask: () => void;
  isFiltered: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onOpenNewTask,
  isFiltered,
}) => {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title={isFiltered ? 'Nenhuma tarefa corresponde aos filtros' : 'Sua lista de tarefas está vazia'}
        description={
          isFiltered
            ? 'Tente ajustar os filtros de status, categoria ou termo de busca para visualizar suas tarefas.'
            : 'Adicione sua primeira tarefa para começar a organizar sua rotina e aumentar sua produtividade.'
        }
        actionLabel={isFiltered ? undefined : 'Criar Primeira Tarefa'}
        onAction={isFiltered ? undefined : onOpenNewTask}
      />
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <TaskCard
          key={task.id}
          task={task}
          index={index}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
