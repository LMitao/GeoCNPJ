import React from 'react';
import { Building2, Navigation, History, BookmarkCheck, Search } from 'lucide-react';

interface HeaderProps {
  onOpenDirectLookup: () => void;
  onOpenHistory: () => void;
  onOpenSavedLeads: () => void;
  historyCount: number;
  savedLeadsCount: number;
  currentGpsLabel: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDirectLookup,
  onOpenHistory,
  onOpenSavedLeads,
  historyCount,
  savedLeadsCount,
  currentGpsLabel
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Marca */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  GeoCNPJ
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Radar GPS + CNAE
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Consulta e Prospecção Corporativa Georreferenciada
              </p>
            </div>
          </div>

          {/* Current GPS Badge & BrasilAPI Status */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-[11px] text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold">BrasilAPI: Dados Reais RFB</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <Navigation className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span className="text-slate-400">Ponto Focal:</span>
              <span className="font-medium text-slate-200 truncate max-w-[200px]" title={currentGpsLabel}>
                {currentGpsLabel}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenDirectLookup}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Consultar dados de um CNPJ específico"
            >
              <Search className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Buscar por CNPJ</span>
              <span className="sm:hidden">CNPJ</span>
            </button>

            <button
              onClick={onOpenSavedLeads}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition relative"
              title="Empresas Salvas para Prospecção"
            >
              <BookmarkCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Leads Salvos</span>
              {savedLeadsCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-emerald-500 text-slate-950 rounded-full">
                  {savedLeadsCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition relative"
              title="Rastreio e Histórico de Varreduras GPS"
            >
              <History className="w-4 h-4" />
              <span className="hidden md:inline">Rastreio de Buscas</span>
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-white text-blue-900 rounded-full">
                  {historyCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
