# 📋 TaskFlow - Gerenciador Inteligente de Tarefas (To-Do List)

Um aplicativo web moderno, intuitivo e responsivo para gerenciamento de tarefas diárias, metas e produtividade pessoal e profissional com persistência em nuvem diretamente no **Supabase**.

---

## ✨ Funcionalidades Principais

- **Persistência em Nuvem com Supabase:** Conexão direta com a base de dados Postgres do Supabase (projeto `lista-tarefas`) com suporte a sincronização em tempo real (*Realtime*) e fallback de cache local.
- **CRUD Completo:** Criação, listagem detalhada, edição rápida, alternância de conclusão e exclusão sincronizadas instantaneamente.
- **Categorização Visual:** Tags coloridas para categorias pré-definidas (`TRABALHO`, `PESSOAL`, `ESTUDO`, `FINANÇAS`, `SAÚDE`) e suporte a categorias customizadas.
- **Sistema de Priorização:** Classificação por níveis (`ALTA`, `MÉDIA`, `BAIXA`) com badges informativos e destaque para itens urgentes.
- **Gestão de Prazos e Vencimentos:** Indicador visual de data com ícone de calendário, cálculo de proximidade (*Hoje*, *Amanhã*, *Ontem*) e alerta para tarefas atrasadas.
- **Filtros e Busca em Tempo Real:** Filtre instantaneamente por status (*Todas*, *Pendentes*, *Concluídas*), categoria, prioridade ou termo pesquisado, além de ordenação customizada.
- **Navegação Multitelas (Navbar):**
  - **Tarefas:** Visão principal de fluxo de trabalho.
  - **Análises:** Painel com métricas de produtividade, taxa de conclusão e gráficos de distribuição por categoria e prioridade.
  - **Calendário:** Visão mensal interativa com mapeamento temporal das atividades.
  - **Sair / Opções:** Modal com opções de encerramento de sessão e restauração dos dados padrão no Supabase.
- **UX com Micro-interações:** Animação de conclusão de tarefas com confetes (`canvas-confetti`), notificações Toast e feedback visual claro de sincronização.

---

## 🛠️ Tecnologias Utilizadas

- **React 18** + **TypeScript**
- **Supabase Client (`@supabase/supabase-js`)**
- **Vite**
- **Tailwind CSS**
- **Lucide Icons**
- **Canvas Confetti**

---

## 🗄️ Estrutura do Banco de Dados (Supabase)

Tabela: `public.tasks`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | TEXT (PK) | Identificador único |
| `title` | TEXT | Título da tarefa |
| `description` | TEXT | Descrição detalhada |
| `category` | TEXT | Categoria (ex: TRABALHO, PESSOAL) |
| `priority` | TEXT | Prioridade (ALTA, MÉDIA, BAIXA) |
| `due_date` | TEXT | Data de vencimento (YYYY-MM-DD) |
| `completed` | BOOLEAN | Status de conclusão |
| `completed_at` | TIMESTAMPTZ | Data/hora de conclusão |
| `created_at` | TIMESTAMPTZ | Data de criação |
| `updated_at` | TIMESTAMPTZ | Data da última atualização |

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Instalação e Execução

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse no navegador: `http://localhost:3000/` ou `http://localhost:5173/`

### Build para Produção

```bash
npm run build
```

---

## 📁 Estrutura de Arquivos

```
├── src/
│   ├── components/
│   │   ├── analytics/       # Visão de análises e gráficos
│   │   ├── calendar/        # Visão de calendário mensal
│   │   ├── layout/          # Navbar (com status Supabase) e HeaderStats
│   │   ├── tasks/           # TaskCard, TaskList, TaskFilterBar, TaskModal
│   │   └── ui/              # Checkbox, Badge, Toast, EmptyState
│   ├── services/
│   │   ├── supabase.ts      # Instância do cliente Supabase
│   │   ├── taskService.ts   # Serviço CRUD assíncrono com Supabase e Realtime
│   │   └── storage.ts       # Camada unificada de compatibilidade
│   ├── types/
│   │   └── task.ts          # Interfaces e tipos TypeScript
│   ├── App.tsx              # Componente raiz
│   ├── main.tsx             # Ponto de entrada
│   └── index.css            # Estilos Tailwind e animações
├── .env                     # Credenciais do Supabase
├── index.html
├── package.json
└── vite.config.ts
```
