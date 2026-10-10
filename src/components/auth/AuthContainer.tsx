import React, { useState } from 'react';
import { CheckSquare, Shield, Database, Lock, KeyRound, Sparkles } from 'lucide-react';
import { AuthMode } from '../../types/auth';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ResetPasswordForm } from './ResetPasswordForm';

interface AuthContainerProps {
  initialMode?: AuthMode;
  onAuthSuccess: (user: any) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({
  initialMode = 'login',
  onAuthSuccess,
  onShowToast,
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#090D16] overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Decorativo com Iluminação Ambiente e Glass Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Glow Superior Índigo */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/20 blur-[130px] animate-pulse-glow" />
        {/* Glow Central Violeta */}
        <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] rounded-full bg-purple-600/15 blur-[140px] animate-float-slow" />
        {/* Glow Inferior Ciano/Azul */}
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full bg-cyan-600/15 blur-[130px]" />
        
        {/* Grid Sutil de Fundo */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Card Principal Glassmorphism */}
      <div className="relative w-full max-w-md mx-auto z-10 animate-fade-in">
        {/* Cabeçalho da Marca */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-600/25 border border-white/20 mb-3.5 transform hover:scale-105 transition-transform duration-300">
            <CheckSquare className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Task<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Flow</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Plataforma Inteligente de Gerenciamento de Tarefas
          </p>

          {/* Badges de Destaque Tecnológico */}
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-900/80 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
              <Database className="w-3 h-3 text-indigo-400" />
              Supabase Auth & Database
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-900/80 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
              <Shield className="w-3 h-3 text-emerald-400" />
              Row Level Security Ativo
            </span>
          </div>
        </div>

        {/* Caixa de Autenticação */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          {/* Seletor de Abas (Login / Cadastro) */}
          {mode !== 'forgot' && mode !== 'reset-password' && (
            <div className="flex items-center bg-slate-900/80 p-1 rounded-2xl border border-white/10 mb-6">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Criar Conta</span>
              </button>
            </div>
          )}

          {/* Título de estado quando em Recuperação */}
          {mode === 'forgot' && (
            <div className="mb-5 pb-3 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Recuperação de Acesso</h2>
                <p className="text-xs text-slate-400">Redefina sua senha via link seguro</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Lock className="w-4 h-4" />
              </div>
            </div>
          )}

          {mode === 'reset-password' && (
            <div className="mb-5 pb-3 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Nova Credencial</h2>
                <p className="text-xs text-slate-400">Atualize sua senha no banco</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Renderização do Formulário Conforme o Modo */}
          {mode === 'login' && (
            <LoginForm
              onSuccess={onAuthSuccess}
              onSwitchMode={(nextMode) => setMode(nextMode)}
              onShowToast={onShowToast}
            />
          )}

          {mode === 'signup' && (
            <SignUpForm
              onSuccess={onAuthSuccess}
              onSwitchMode={(nextMode) => setMode(nextMode)}
              onShowToast={onShowToast}
            />
          )}

          {mode === 'forgot' && (
            <ForgotPasswordForm
              onBackToLogin={() => setMode('login')}
              onShowToast={onShowToast}
            />
          )}

          {mode === 'reset-password' && (
            <ResetPasswordForm
              onSuccess={() => setMode('login')}
              onShowToast={onShowToast}
            />
          )}
        </div>

        {/* Rodapé Informativo */}
        <div className="text-center mt-6 text-xs text-slate-500">
          <p>
            Autenticação segura via Supabase Auth • Isolamento estrito com RLS
          </p>
        </div>
      </div>
    </div>
  );
};
