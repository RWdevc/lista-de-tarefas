import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';

interface LoginFormProps {
  onSuccess: (user: any) => void;
  onSwitchMode: (mode: 'signup' | 'forgot') => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchMode,
  onShowToast,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Validação em tempo real
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = isEmailValid && password.length >= 6 && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    try {
      const data = await authService.signIn(email, password);
      onShowToast('success', 'Bem-vindo de volta!', `Sessão iniciada com sucesso.`);
      onSuccess(data.user);
    } catch (err: any) {
      setHasError(true);
      const msg = err.message || 'Falha ao autenticar no Supabase.';
      setErrorMessage(msg);
      onShowToast('error', 'Erro no Login', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('patrickliloferabella7@gmail.com');
    setPassword('123456789');
    setHasError(false);
    setErrorMessage('');
    onShowToast('info', 'Credenciais Inseridas', 'Usuário pré-cadastrado preenchido. Clique em Entrar!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Botão de Demonstração Rápida */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-200">Acesso Rápido de Teste</p>
            <p className="text-[11px] text-slate-400">patrickliloferabella7@gmail.com</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleFillDemo}
          className="px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 hover:text-white border border-indigo-400/30 transition-all font-medium text-[11px]"
        >
          Preencher
        </button>
      </div>

      {/* Alerta de erro com animação de shake */}
      {hasError && errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 shake-error">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Campo E-mail */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-slate-300">
          Endereço de E-mail
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setHasError(false);
            }}
            placeholder="seu.email@exemplo.com"
            required
            autoComplete="email"
            className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl glass-input ${
              email && !isEmailValid ? 'border-amber-500/60' : ''
            }`}
          />
        </div>
      </div>

      {/* Campo Senha */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-slate-300">
            Senha
          </label>
          <button
            type="button"
            onClick={() => onSwitchMode('forgot')}
            className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
          >
            Esqueceu a senha?
          </button>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setHasError(false);
            }}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl glass-input"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Botão de Enviar */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white btn-gradient-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Autenticando no Supabase...</span>
          </>
        ) : (
          <>
            <span>Entrar na Plataforma</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Alternar para Cadastro */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-400">
          Não tem uma conta ainda?{' '}
          <button
            type="button"
            onClick={() => onSwitchMode('signup')}
            className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors ml-1"
          >
            Criar conta gratuita
          </button>
        </p>
      </div>
    </form>
  );
};
