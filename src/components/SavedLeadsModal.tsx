import React from 'react';
import { EmpresaCNPJ } from '../types';
import { 
  BookmarkCheck, 
  X, 
  Trash2, 
  Download, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink 
} from 'lucide-react';

interface SavedLeadsModalProps {
  isOpen: boolean;
  savedCompanies: EmpresaCNPJ[];
  onClose: () => void;
  onSelectCompany: (company: EmpresaCNPJ) => void;
  onRemoveLead: (cnpjRaw: string) => void;
  onClearAll: () => void;
}

export const SavedLeadsModal: React.FC<SavedLeadsModalProps> = ({
  isOpen,
  savedCompanies,
  onClose,
  onSelectCompany,
  onRemoveLead,
  onClearAll,
}) => {
  if (!isOpen) return null;

  const handleExportCsv = () => {
    if (savedCompanies.length === 0) return;
    const headers = [
      'CNPJ',
      'Razao Social',
      'Nome Fantasia',
      'Situacao Cadastral',
      'CNAE Codigo',
      'CNAE Descricao',
      'Porte',
      'Telefone',
      'Email',
      'Logradouro',
      'Numero',
      'Bairro',
      'Municipio',
      'UF',
      'CEP'
    ];

    const rows = savedCompanies.map((emp) => [
      `"${emp.cnpj}"`,
      `"${emp.razaoSocial.replace(/"/g, '""')}"`,
      `"${emp.nomeFantasia.replace(/"/g, '""')}"`,
      `"${emp.situacaoCadastral}"`,
      `"${emp.cnaePrincipal.codigo}"`,
      `"${emp.cnaePrincipal.descricao.replace(/"/g, '""')}"`,
      `"${emp.porte}"`,
      `"${emp.telefone}"`,
      `"${emp.email}"`,
      `"${emp.endereco.logradouro}"`,
      `"${emp.endereco.numero}"`,
      `"${emp.endereco.bairro}"`,
      `"${emp.endereco.municipio}"`,
      `"${emp.endereco.uf}"`,
      `"${emp.endereco.cep}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_prospeccao_cnpj_${new Date().toISOString().slice(0, 10)}.csv`;
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
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Carteira de Leads Salvos
              </h2>
              <p className="text-xs text-slate-400">
                Empresas arquivadas para prospecção comercial e follow-up
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

        {/* Resumo */}
        <div className="bg-slate-950/60 px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div>
            <span className="text-slate-400">Total de Empresas Salvas:</span>{' '}
            <span className="font-bold text-emerald-400">{savedCompanies.length}</span>
          </div>

          {savedCompanies.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1 px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Planilha</span>
              </button>

              <button
                onClick={onClearAll}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-950/50 text-rose-400 text-xs transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Todos</span>
              </button>
            </div>
          )}
        </div>

        {/* Lista */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3 scrollbar-thin">
          {savedCompanies.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
                <BookmarkCheck className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-300">
                Nenhum lead salvo ainda
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Ao consultar empresas no mapa ou na lista, clique no ícone de marcador para arquivar as empresas de seu interesse aqui.
              </p>
            </div>
          ) : (
            savedCompanies.map((emp) => (
              <div
                key={emp.cnpjRaw}
                className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                      {emp.cnpj}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                      {emp.situacaoCadastral}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white truncate">
                    {emp.nomeFantasia || emp.razaoSocial}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">
                    {emp.razaoSocial}
                  </p>

                  <div className="text-[11px] text-indigo-300 truncate">
                    CNAE: {emp.cnaePrincipal.codigo} - {emp.cnaePrincipal.descricao}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span>Tel: {emp.telefone}</span>
                    <span className="truncate">Email: {emp.email}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/50">
                  <button
                    onClick={() => {
                      onSelectCompany(emp);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
                  >
                    <span>Ver Ficha</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onRemoveLead(emp.cnpjRaw)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition"
                    title="Remover Lead"
                  >
                    <Trash2 className="w-4 h-4" />
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
