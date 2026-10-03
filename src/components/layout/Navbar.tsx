import React from 'react';
import { CheckSquare, BarChart3, Calendar, LogOut, Database } from 'lucide-react';
import { TabView } from '../../types/task';

interface NavbarProps {
  activeTab: TabView;
  onTabChange: (tab: TabView) => void;
  onLogout: () => void;
  pendingCount: number;
  isSyncing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onLogout,
  pendingCount,
  isSyncing = false,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <CheckSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">TaskFlow</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Database className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  Supabase: lista-tarefas
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Gerenciamento conectado em tempo real</p>
            </div>
          </div>

          {/* Navigation Tabs (Tarefas, Análises, Calendário) */}
          <nav className="flex items-center gap-1 sm:gap-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => onTabChange('TAREFAS')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === 'TAREFAS'
                  ? 'bg-white text-indigo-600 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Tarefas</span>
              {pendingCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'TAREFAS'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-200 text-slate-700'
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
                  ? 'bg-white text-indigo-600 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Análises</span>
            </button>

            <button
              onClick={() => onTabChange('CALENDARIO')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === 'CALENDARIO'
                  ? 'bg-white text-indigo-600 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Calendário</span>
            </button>
          </nav>

          {/* User actions & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 border border-indigo-300 flex items-center justify-center text-xs font-bold text-indigo-700">
                US
              </div>
              <div className="text-left leading-none">
                <span className="text-xs font-semibold text-slate-800 block">Usuário</span>
                <span className="text-[10px] text-emerald-600 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Sincronizado
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Opções de sessão"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200/80 hover:border-rose-200 transition-all duration-200"
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
