import React, { useState, useMemo } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Loader2, Check, X, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { authService } from '../../services/authService';

interface SignUpFormProps {
  onSuccess: (user: any) => void;
  onSwitchMode: (mode: 'login') => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onSuccess,
  onSwitchMode,
  onShowToast,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Avaliação da força da senha em tempo real
  const strength = useMemo(() => {
    return authService.calculatePasswordStrength(password);
  }, [password]);

  // Validação em tempo real
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordMatch = password.length > 0 && password === confirmPassword;
  const isStrongEnough = strength.score >= 2; // Pelo menos 2 critérios atendidos
  const canSubmit =
    fullName.trim().length >= 2 &&
    isEmailValid &&
    isStrongEnough &&
    isPasswordMatch &&
    !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    try {
      const data = await authService.signUp(email, password, fullName);
      onShowToast(
        'success',
        'Conta criada com sucesso!',
        `Bem-vindo, ${fullName}! Seu perfil e tarefas foram configurados no Supabase.`
      );
      if (data.user) {
        onSuccess(data.user);
      } else {
        onSwitchMode('login');
      }
    } catch (err: any) {
      setHasError(true);
      const msg = err.message || 'Falha ao registrar nova conta no Supabase.';
      setErrorMessage(msg);
      onShowToast('error', 'Erro no Cadastro', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Alerta de Erro com Shake */}
      {hasError && errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 shake-error">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Nome Completo */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-slate-300">
          Nome Completo
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <User className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setHasError(false);
            }}
            placeholder="Seu nome ou apelido"
            required
            autoComplete="name"
            className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl glass-input"
          />
        </div>
      </div>

      {/* E-mail */}
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

      {/* Senha */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-slate-300">
            Senha
          </label>
          {password && (
            <span className={`text-[11px] font-semibold ${strength.colorClass}`}>
              {strength.label}
            </span>
          )}
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
            placeholder="Crie uma senha forte"
            required
            autoComplete="new-password"
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

        {/* Medidor visual de força da senha */}
        {password && (
          <div className="pt-1 space-y-2">
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${strength.bgGradient} transition-all duration-300 rounded-full`}
                style={{ width: `${(strength.score / 4) * 100}%` }}
              />
            </div>

            {/* Checklist de requisitos de segurança */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {strength.requirements.map((req) => (
                <div
                  key={req.id}
                  className={`flex items-center gap-1.5 text-[11px] transition-colors ${
                    req.met ? 'text-emerald-400 font-medium' : 'text-slate-500'
                  }`}
                >
                  {req.met ? (
                    <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  ) : (
                    <X className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                  )}
                  <span>{req.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmação de Senha */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-slate-300">
          Confirmar Senha
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setHasError(false);
            }}
            placeholder="Repita sua senha"
            required
            autoComplete="new-password"
            className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl glass-input ${
              confirmPassword && !isPasswordMatch ? 'border-rose-500/70' : ''
            }`}
          />
        </div>
        {confirmPassword && !isPasswordMatch && (
          <p className="text-[11px] text-rose-400 mt-1">As senhas não coincidem.</p>
        )}
      </div>

      {/* Botão de Cadastro */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white btn-gradient-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Criando sua conta...</span>
          </>
        ) : (
          <>
            <span>Cadastrar Conta</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Voltar para Login */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-400">
          Já tem uma conta?{' '}
          <button
            type="button"
            onClick={() => onSwitchMode('login')}
            className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors ml-1"
          >
            Fazer login
          </button>
        </p>
      </div>
    </form>
  );
};
