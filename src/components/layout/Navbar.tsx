import React from 'react';
import { CheckSquare, BarChart3, Calendar, LogOut, Database } from 'lucide-react';
import { TabView } from '../../types/task';
import { UserProfile } from '../../types/auth';

interface NavbarProps {
  activeTab: TabView;
  onTabChange: (tab: TabView) => void;
  onLogout: () => void;
  pendingCount: number;
  isSyncing?: boolean;
  currentUser?: {
    email?: string;
    profile?: UserProfile | null;
  } | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onLogout,
  pendingCount,
  isSyncing = false,
  currentUser,
}) => {
  const displayName = currentUser?.profile?.full_name || (currentUser?.email ? currentUser.email.split('@')[0] : 'Usuário');
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'US';

  return (
    <header className="sticky top-0 z-30 bg-[#090D16]/85 backdrop-blur-xl border-b border-white/10 transition-all shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Marca */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 border border-white/20">
              <CheckSquare className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">
                  Task<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Flow</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                  <Database className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
                  Supabase RLS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Sincronização em tempo real</p>
            </div>
          </div>

          {/* Navegação entre Abas (Tarefas, Análises, Calendário) */}
          <nav className="flex items-center gap-1 sm:gap-2 bg-slate-900/80 p-1 rounded-xl border border-white/10 backdrop-blur-md">
            <button
              onClick={() => onTabChange('TAREFAS')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === 'TAREFAS'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Tarefas</span>
              {pendingCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'TAREFAS'
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-500/20 text-indigo-300'
                  }`}
                >
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('ANALISES')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === 'ANALISES'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Análises</span>
            </button>

            <button
              onClick={() => onTabChange('CALENDARIO')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === 'CALENDARIO'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Calendário</span>
            </button>
          </nav>

          {/* Perfil do Usuário e Ações de Sessão */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/20 flex items-center justify-center text-xs font-bold text-white shadow-sm shadow-indigo-500/20">
                {initials}
              </div>
              <div className="text-left leading-none">
                <span className="text-xs font-semibold text-slate-200 block truncate max-w-[130px]" title={displayName}>
                  {displayName}
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Conectado
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Encerrar sessão"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-white/10 hover:border-rose-500/30 transition-all duration-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
