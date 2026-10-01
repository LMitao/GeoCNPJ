import React from 'react';
import { SearchQueryLog } from '../types';
import { 
  History, 
  X, 
  MapPin, 
  RotateCcw, 
  Trash2, 
  Download, 
  Building2, 
  Calendar,
  Layers
} from 'lucide-react';

interface SearchHistoryTrackerProps {
  isOpen: boolean;
  history: SearchQueryLog[];
  onClose: () => void;
  onReplaySearch: (log: SearchQueryLog) => void;
  onClearHistory: () => void;
}

export const SearchHistoryTracker: React.FC<SearchHistoryTrackerProps> = ({
  isOpen,
  history,
  onClose,
  onReplaySearch,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const handleExportHistory = () => {
    if (history.length === 0) return;
    const headers = [
      'Data e Hora',
      'Ponto GPS (Latitude)',
      'Ponto GPS (Longitude)',
      'Local Focal',
      'CNAE Codigo',
      'CNAE Descricao',
      'Raio de Varredura (Metros)',
      'Total CNPJs Encontrados'
    ];

    const rows = history.map((log) => [
      `"${new Date(log.timestamp).toLocaleString('pt-BR')}"`,
      log.lat.toFixed(6),
      log.lng.toFixed(6),
      `"${log.labelLocal.replace(/"/g, '""')}"`,
      `"${log.cnaeCodigo}"`,
      `"${log.cnaeDescricao.replace(/"/g, '""')}"`,
      log.raioMetros,
      log.totalEncontrados
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rastreio_buscas_geocnpj_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl text-slate-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
        role="dialog"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 border-b border-slate-700/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Rastreio & Histórico de Buscas GPS
              </h2>
              <p className="text-xs text-slate-400">
                Auditoria de varreduras geográficas realizadas no mapa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo de Métricas */}
        <div className="bg-slate-950/60 px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400">Varreduras Registradas:</span>{' '}
              <span className="font-bold text-blue-400">{history.length}</span>
            </div>
            <div>
              <span className="text-slate-400">CNPJs Mapeados:</span>{' '}
              <span className="font-bold text-emerald-400">
                {history.reduce((acc, curr) => acc + curr.totalEncontrados, 0)}
              </span>
            </div>
          </div>

          {history.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportHistory}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition"
                title="Exportar auditoria de rastreio em CSV"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Exportar Log</span>
              </button>

              <button
                onClick={onClearHistory}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-950/50 text-rose-400 text-xs transition"
                title="Limpar histórico da sessão"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>
            </div>
          )}
        </div>

        {/* Lista de Registros */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3 scrollbar-thin">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
                <History className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-300">
                Nenhuma busca registrada ainda
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Execute varreduras geográficas no mapa para acompanhar o rastreio das coordenadas e atividades pesquisadas.
              </p>
            </div>
          ) : (
            history.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} - {new Date(log.timestamp).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 text-[10px] font-mono">
                      Raio: {log.raioMetros >= 1000 ? `${(log.raioMetros / 1000).toFixed(1)} km` : `${log.raioMetros} m`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-200 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="font-semibold text-white">{log.labelLocal}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ({log.lat.toFixed(4)}, {log.lng.toFixed(4)})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-indigo-300 font-bold bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-900">
                      {log.cnaeCodigo}
                    </span>
                    <span className="text-slate-300 text-[11px] truncate max-w-sm">
                      {log.cnaeDescricao}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/50">
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400 block">
                      {log.totalEncontrados} CNPJs
                    </span>
                    <span className="text-[10px] text-slate-400">identificados</span>
                  </div>

                  <button
                    onClick={() => {
                      onReplaySearch(log);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition shadow-sm"
                    title="Repetir esta varredura no mapa"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Repetir</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
