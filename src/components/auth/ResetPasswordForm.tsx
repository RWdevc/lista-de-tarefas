import React, { useState, useMemo } from 'react';
import { Lock, Eye, EyeOff, Loader2, Check, X, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { authService } from '../../services/authService';

interface ResetPasswordFormProps {
  onSuccess: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onSuccess,
  onShowToast,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const strength = useMemo(() => {
    return authService.calculatePasswordStrength(password);
  }, [password]);

  const isPasswordMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = strength.score >= 2 && isPasswordMatch && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      await authService.updatePassword(password);
      onShowToast('success', 'Senha atualizada!', 'Sua nova senha foi salva com segurança no Supabase.');
      onSuccess();
    } catch (err: any) {
      const msg = err.message || 'Erro ao redefinir senha.';
      setErrorMessage(msg);
      onShowToast('error', 'Erro', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-200">Definir Nova Senha</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Crie uma nova senha segura para acessar sua conta no TaskFlow.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 shake-error">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Nova Senha */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-slate-300">Nova Senha</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrorMessage('');
            }}
            placeholder="Nova senha forte"
            required
            className="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl glass-input"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Medidor visual */}
        {password && (
          <div className="pt-1 space-y-2">
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${strength.bgGradient} transition-all duration-300 rounded-full`}
                style={{ width: `${(strength.score / 4) * 100}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {strength.requirements.map((req) => (
                <div
                  key={req.id}
                  className={`flex items-center gap-1.5 text-[11px] ${
                    req.met ? 'text-emerald-400 font-medium' : 'text-slate-500'
                  }`}
                >
                  {req.met ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                  <span>{req.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmar Senha */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-slate-300">Confirmar Nova Senha</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrorMessage('');
            }}
            placeholder="Repita a nova senha"
            required
            className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl glass-input"
          />
        </div>
        {confirmPassword && !isPasswordMatch && (
          <p className="text-[11px] text-rose-400 mt-1">As senhas não coincidem.</p>
        )}
      </div>

      {/* Botão de Atualização */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white btn-gradient-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Atualizando credencial...</span>
          </>
        ) : (
          <>
            <span>Redefinir e Entrar</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};
