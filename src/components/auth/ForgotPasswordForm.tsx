import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { authService } from '../../services/authService';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBackToLogin,
  onShowToast,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid || isLoading) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      await authService.resetPasswordForEmail(email);
      setIsSuccess(true);
      onShowToast(
        'success',
        'Link de recuperação enviado!',
        'Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.'
      );
    } catch (err: any) {
      const msg = err.message || 'Erro ao enviar e-mail de recuperação.';
      setErrorMessage(msg);
      onShowToast('error', 'Erro', msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-5 text-center py-4 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-100">Verifique seu E-mail</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Enviamos um link seguro de recuperação para <strong className="text-indigo-400">{email}</strong>.
            Clique no link para definir uma nova senha.
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-850 border border-slate-700/60 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para o Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-slate-400 leading-relaxed">
        Informe o endereço de e-mail associado à sua conta e enviaremos um link de recuperação diretamente pelo Supabase Auth.
      </p>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 shake-error">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Campo E-mail */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-slate-300">
          E-mail Cadastrado
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
              setErrorMessage('');
            }}
            placeholder="seu.email@exemplo.com"
            required
            autoComplete="email"
            className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl glass-input"
          />
        </div>
      </div>

      {/* Botão de Enviar */}
      <button
        type="submit"
        disabled={!isEmailValid || isLoading}
        className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white btn-gradient-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Enviando link seguro...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Enviar Link de Recuperação</span>
          </>
        )}
      </button>

      {/* Botão Voltar */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={onBackToLogin}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para tela de Login
        </button>
      </div>
    </form>
  );
};
