import { supabase } from './supabase';
import { UserProfile, PasswordStrength } from '../types/auth';

export const authService = {
  /**
   * Realiza login com e-mail e senha
   */
  async signIn(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      throw new Error(authService.formatAuthError(error.message));
    }

    return data;
  },

  /**
   * Realiza cadastro de novo usuário com metadados de perfil
   */
  async signUp(email: string, password: string, fullName: string) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
        },
      },
    });

    if (error) {
      throw new Error(authService.formatAuthError(error.message));
    }

    // Se o usuário foi criado, garante que haja linha em public.profiles
    if (data.user) {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: cleanEmail,
          full_name: cleanName || cleanEmail.split('@')[0],
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Erro ao atualizar perfil pós-cadastro:', err);
      }
    }

    return data;
  },

  /**
   * Encerra a sessão ativa
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(authService.formatAuthError(error.message));
    }
  },

  /**
   * Envia e-mail de recuperação de senha (Magic Link / Reset de senha)
   */
  async resetPasswordForEmail(email: string) {
    const cleanEmail = email.trim().toLowerCase();
    const redirectUrl = window.location.origin;

    const { data, error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: redirectUrl,
    });

    if (error) {
      throw new Error(authService.formatAuthError(error.message));
    }

    return data;
  },

  /**
   * Atualiza a senha do usuário atualmente autenticado
   */
  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(authService.formatAuthError(error.message));
    }

    return data;
  },

  /**
   * Obtém a sessão atual
   */
  async getCurrentSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Erro ao obter sessão atual:', error);
      return null;
    }
    return data.session;
  },

  /**
   * Obtém o usuário atual autenticado
   */
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return null;
    }
    return data.user;
  },

  /**
   * Obtém os dados de perfil da tabela public.profiles
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Se ainda não existir perfil cadastrado, constrói a partir dos metadados de autenticação
        const user = await authService.getCurrentUser();
        if (user && user.id === userId) {
          const fallbackProfile: UserProfile = {
            id: user.id,
            email: user.email || '',
            full_name: (user.user_metadata?.full_name as string) || (user.email ? user.email.split('@')[0] : 'Usuário'),
            avatar_url: (user.user_metadata?.avatar_url as string) || null,
          };
          return fallbackProfile;
        }
        return null;
      }

      return data as UserProfile;
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
      return null;
    }
  },

  /**
   * Atualiza dados de perfil
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data as UserProfile;
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      throw err;
    }
  },

  /**
   * Inscreve um ouvinte para alterações no estado de autenticação
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return () => {
      subscription.unsubscribe();
    };
  },

  /**
   * Avalia a força da senha em tempo real
   */
  calculatePasswordStrength(password: string): PasswordStrength {
    const requirements = [
      {
        id: 'length',
        label: 'Mínimo de 8 caracteres',
        met: password.length >= 8,
      },
      {
        id: 'uppercase',
        label: 'Pelo menos uma letra maiúscula',
        met: /[A-Z]/.test(password),
      },
      {
        id: 'number',
        label: 'Pelo menos um número',
        met: /[0-9]/.test(password),
      },
      {
        id: 'special',
        label: 'Pelo menos um caractere especial (!@#$...)',
        met: /[^A-Za-z0-9]/.test(password),
      },
    ];

    const metCount = requirements.filter((r) => r.met).length;

    if (!password) {
      return {
        score: 0,
        label: 'Digite uma senha',
        colorClass: 'text-slate-400',
        bgGradient: 'from-slate-500 to-slate-400',
        requirements,
      };
    }

    if (metCount <= 1) {
      return {
        score: 1,
        label: 'Muito fraca',
        colorClass: 'text-rose-500',
        bgGradient: 'from-rose-500 to-rose-600',
        requirements,
      };
    }

    if (metCount === 2) {
      return {
        score: 2,
        label: 'Média',
        colorClass: 'text-amber-500',
        bgGradient: 'from-amber-400 to-amber-500',
        requirements,
      };
    }

    if (metCount === 3) {
      return {
        score: 3,
        label: 'Forte',
        colorClass: 'text-emerald-500',
        bgGradient: 'from-emerald-400 to-emerald-500',
        requirements,
      };
    }

    return {
      score: 4,
      label: 'Excelente & Segura',
      colorClass: 'text-indigo-400',
      bgGradient: 'from-emerald-400 via-indigo-500 to-purple-500',
      requirements,
    };
  },

  /**
   * Traduz e amigabiliza mensagens de erro do Supabase Auth
   */
  formatAuthError(errorMessage: string): string {
    const lower = errorMessage.toLowerCase();

    if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
      return 'E-mail ou senha incorretos. Por favor, verifique suas credenciais.';
    }
    if (lower.includes('email not confirmed')) {
      return 'E-mail ainda não confirmado. Verifique sua caixa de entrada ou spam.';
    }
    if (lower.includes('user already registered') || lower.includes('already registered')) {
      return 'Já existe uma conta cadastrada com este endereço de e-mail.';
    }
    if (lower.includes('password should be at least')) {
      return 'A senha deve conter no mínimo 6 caracteres (recomendado 8+).';
    }
    if (lower.includes('over email rate limit') || lower.includes('rate limit')) {
      return 'Muitas solicitações recentes. Por favor, aguarde alguns minutos e tente novamente.';
    }
    if (lower.includes('invalid email') || lower.includes('unable to validate email')) {
      return 'O endereço de e-mail informado não possui um formato válido.';
    }
    if (lower.includes('network') || lower.includes('failed to fetch')) {
      return 'Falha na conexão de rede. Verifique sua conexão com a internet.';
    }

    return errorMessage || 'Ocorreu um erro inesperado ao autenticar.';
  },
};
