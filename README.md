# 🚀 TaskFlow - Gerenciador Inteligente de Tarefas (SaaS Premium)

Um aplicativo web moderno, intuitivo, altamente performático e com acabamento visual de padrão internacional (estilo SaaS premium) com persistência em nuvem diretamente no **Supabase (Auth, PostgreSQL e Row Level Security - RLS)**.

---

## ✨ Destaques de UX/UI & Design System

- **Estética Dark Glassmorphism:** Painéis translúcidos em camadas (`backdrop-filter: blur(16px)`), sombras neon calibradas e paleta sofisticada em tons de azul profundo, índigo e violeta.
- **Micro-interações nos Inputs:** Foco com anéis bioluminescentes, expansão suave de borda, alternância dinâmica de visibilidade de senha e efeito de *shake* em caso de dados inválidos.
- **Medidor Interativo de Força de Senha:** Checklist dinâmico em tempo real com validação de 4 critérios (mínimo de 8 caracteres, maiúscula, número e caractere especial) e barra de progresso gradiente multicolorida.
- **Entrada Escalonada (Staggered Fade-in):** Apresentação gradual e cinematográfica dos cards de tarefas ao carregar a dashboard.
- **Efeito Comemorativo:** Explosão de confetes (`canvas-confetti`) e toasts flutuantes ao concluir tarefas.
- **Responsividade Total (Mobile-First):** Layout fluido em telas móveis, tablets e monitores widescreen.

---

## 🔒 Arquitetura de Dados & Segurança (Supabase)

### 1. Isolamento por Usuário (Row Level Security - RLS)
- **Tabela `public.profiles`:** Armazena dados de exibição do usuário (`full_name`, `avatar_url`), vinculada à tabela nativa `auth.users` com trigger automático pós-cadastro.
- **Tabela `public.tasks`:** Cada tarefa possui a coluna `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`.
- As políticas de segurança garantem que nenhum usuário tenha acesso de leitura, inserção, atualização ou remoção sobre tarefas de outras contas.

---

## 📋 Script SQL de Configuração e Políticas (Supabase)

Caso queira replicar o schema em um novo ambiente Supabase, execute o seguinte script no **SQL Editor** do Supabase:

```sql
-- 1. Criação da tabela de Perfis de Usuário
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ativar RLS em profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para profiles
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

-- Trigger para sincronizar novos cadastros em auth.users para public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Tabela de Tarefas com Isolamento por user_id
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'TRABALHO',
  priority TEXT DEFAULT 'MÉDIA',
  due_date TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ativar Row Level Security estrito
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para isolamento de tarefas por usuário
CREATE POLICY "Users can manage own tasks" 
  ON public.tasks FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Habilitar Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
```

---

## 🔑 Credenciais Pré-configuradas de Demonstração

Para testar imediatamente a aplicação, utilize o usuário fornecido:

- **E-mail:** `patrickliloferabella7@gmail.com`
- **Senha:** `123456789`
- *(A tela de login conta com o botão **"Acesso Rápido de Teste"** para autopreenchimento com 1 clique)*

---

## 🛠️ Variáveis de Ambiente (`.env`)

Crie o arquivo `.env` na raiz do projeto com as credenciais do seu projeto Supabase:

```env
VITE_SUPABASE_URL=https://nevqszplwtxkpssyjwjd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🏃 Como Executar Localmente

```bash
# 1. Instalar as dependências
npm install

# 2. Executar o servidor de desenvolvimento
npm run dev
```

Acesse no navegador: **`http://localhost:3000/`** ou **`http://localhost:5173/`**.

Para compilação de produção:
```bash
npm run build
```
