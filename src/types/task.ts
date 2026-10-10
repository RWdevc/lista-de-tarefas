export type Priority = 'ALTA' | 'MÉDIA' | 'BAIXA';

export type Category = 'TRABALHO' | 'PESSOAL' | 'ESTUDO' | 'FINANÇAS' | 'SAÚDE' | string;

export interface Task {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  category: Category;
  priority: Priority;
  due_date: string; // YYYY-MM-DD
  completed: boolean;
  completed_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export type FilterStatus = 'TODAS' | 'PENDENTES' | 'CONCLUÍDAS';

export type TabView = 'TAREFAS' | 'ANALISES' | 'CALENDARIO';

export type SortBy = 'dueDateAsc' | 'dueDateDesc' | 'priorityHigh' | 'priorityLow' | 'titleAsc' | 'createdAtDesc';

export interface CategoryMeta {
  name: string;
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  dotColor: string;
}

export interface PriorityMeta {
  level: Priority;
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  accentColor: string;
}
