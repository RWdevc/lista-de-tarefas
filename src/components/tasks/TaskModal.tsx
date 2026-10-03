import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, AlertCircle, Sparkles } from 'lucide-react';
import { Task, Category, Priority } from '../../types/task';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    title: string;
    description?: string;
    category: Category;
    priority: Priority;
    due_date: string;
  }) => void;
  editingTask?: Task | null;
  existingCategories: Category[];
}

const DEFAULT_CATEGORIES: { name: string; color: string }[] = [
  { name: 'TRABALHO', color: 'border-blue-400 bg-blue-50 text-blue-700' },
  { name: 'PESSOAL', color: 'border-emerald-400 bg-emerald-50 text-emerald-700' },
  { name: 'ESTUDO', color: 'border-amber-400 bg-amber-50 text-amber-700' },
  { name: 'FINANÇAS', color: 'border-violet-400 bg-violet-50 text-violet-700' },
  { name: 'SAÚDE', color: 'border-teal-400 bg-teal-50 text-teal-700' },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTask,
  existingCategories,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('TRABALHO');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [priority, setPriority] = useState<Priority>('MÉDIA');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [error, setError] = useState('');

  // Sincronizar dados quando abrir em modo de edição ou criação
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority);
      setDueDate(editingTask.due_date);

      const isKnown = DEFAULT_CATEGORIES.some((c) => c.name === editingTask.category.toUpperCase());
      if (isKnown) {
        setCategory(editingTask.category.toUpperCase());
        setIsCustomCategory(false);
        setCustomCategory('');
      } else {
        setCategory('OUTRO');
        setIsCustomCategory(true);
        setCustomCategory(editingTask.category);
      }
    } else {
      // Padrões para nova tarefa
      setTitle('');
      setDescription('');
      setCategory('TRABALHO');
      setIsCustomCategory(false);
      setCustomCategory('');
      setPriority('MÉDIA');
      setDueDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    }
    setError('');
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor, informe o título da tarefa.');
      return;
    }

    if (!dueDate) {
      setError('Por favor, selecione uma data de conclusão.');
      return;
    }

    const finalCategory = isCustomCategory
      ? customCategory.trim().toUpperCase() || 'GERAL'
      : category;

    onSave({
      title: title.trim(),
      description: description.trim(),
      category: finalCategory,
      priority,
      due_date: dueDate,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-slide-up relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {editingTask ? 'Editar Tarefa' : 'Criar Nova Tarefa'}
              </h2>
              <p className="text-xs text-slate-500">
                {editingTask
                  ? 'Atualize os detalhes da tarefa selecionada'
                  : 'Preencha as informações para organizar seu dia'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título da Tarefa */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Título da Tarefa <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ex: Entregar relatório de métricas..."
              autoFocus
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Descrição Opcional */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Descrição (Opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes adicionais, links ou passos..."
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>Categoria</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
              {DEFAULT_CATEGORIES.map((cat) => {
                const isSelected = !isCustomCategory && category === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => {
                      setCategory(cat.name);
                      setIsCustomCategory(false);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all text-center ${
                      isSelected
                        ? `${cat.color} ring-2 ring-indigo-500/30 shadow-sm`
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Opção de Categoria Personalizada */}
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsCustomCategory(!isCustomCategory)}
                className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-all ${
                  isCustomCategory
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                    : 'bg-white text-slate-500 border-slate-200 hover:text-slate-700'
                }`}
              >
                + Outra Categoria
              </button>
              {isCustomCategory && (
                <>
                  <input
                    type="text"
                    list="category-suggestions"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Nome da categoria..."
                    className="flex-1 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                  <datalist id="category-suggestions">
                    {existingCategories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </>
              )}
            </div>
          </div>

          {/* Prioridade & Data em 2 Colunas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Prioridade */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Prioridade
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['BAIXA', 'MÉDIA', 'ALTA'] as Priority[]).map((p) => {
                  const isSelected = priority === p;
                  let activeStyle = '';
                  if (p === 'ALTA') activeStyle = 'bg-rose-50 border-rose-300 text-rose-700 ring-2 ring-rose-200';
                  if (p === 'MÉDIA') activeStyle = 'bg-amber-50 border-amber-300 text-amber-700 ring-2 ring-amber-200';
                  if (p === 'BAIXA') activeStyle = 'bg-slate-100 border-slate-300 text-slate-800 ring-2 ring-slate-200';

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all text-center ${
                        isSelected
                          ? activeStyle
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Data de Conclusão */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Data de Conclusão</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Ações do Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-4 mt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-xl shadow-sm shadow-indigo-200 transition-all"
            >
              {editingTask ? 'Salvar Alterações' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
