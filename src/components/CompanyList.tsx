import React, { useState } from 'react';
import { EmpresaCNPJ } from '../types';
import { 
  Building2, 
  Copy, 
  Check, 
  MapPin, 
  Phone, 
  Mail, 
  Download, 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink,
  ChevronRight,
  ArrowUpDown,
  LayoutGrid,
  Table as TableIcon,
  Navigation
} from 'lucide-react';

interface CompanyListProps {
  companies: EmpresaCNPJ[];
  selectedCompany: EmpresaCNPJ | null;
  savedCnpjs: Set<string>;
  onSelectCompany: (company: EmpresaCNPJ) => void;
  onToggleSaveLead: (company: EmpresaCNPJ) => void;
  onExportCsv: () => void;
}

export const CompanyList: React.FC<CompanyListProps> = ({
  companies,
  selectedCompany,
  savedCnpjs,
  onSelectCompany,
  onToggleSaveLead,
  onExportCsv,
}) => {
  const [copiedCnpj, setCopiedCnpj] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'distancia' | 'nome' | 'capital'>('distancia');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const handleCopy = (cnpj: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cnpj);
    setCopiedCnpj(cnpj);
    setTimeout(() => setCopiedCnpj(null), 2000);
  };

  const sortedCompanies = [...companies].sort((a, b) => {
    if (sortBy === 'distancia') {
      return (a.distanciaMetros || 0) - (b.distanciaMetros || 0);
    }
    if (sortBy === 'nome') {
      return a.razaoSocial.localeCompare(b.razaoSocial);
    }
    if (sortBy === 'capital') {
      return b.capitalSocial - a.capitalSocial;
    }
    return 0;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col h-full">
      {/* Header da Lista e Controles */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-100">
              Empresas Identificadas
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-950 text-blue-300 border border-blue-800/80">
              {companies.length} resultados
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Ordenadas por proximidade do ponto GPS selecionado
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Ordenação */}
          <div className="flex items-center gap-1 text-xs text-slate-300 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="distancia" className="bg-slate-800">Menor Distância</option>
              <option value="nome" className="bg-slate-800">Razão Social (A-Z)</option>
              <option value="capital" className="bg-slate-800">Maior Capital Social</option>
            </select>
          </div>

          {/* Toggle Cards / Table */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1 rounded ${viewMode === 'cards' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Visualização em Cards"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded ${viewMode === 'table' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Visualização em Tabela"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Exportar CSV */}
          <button
            onClick={onExportCsv}
            disabled={companies.length === 0}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition"
            title="Exportar planilha CSV com todos os dados e contatos"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Conteúdo: Lista ou Tabela */}
      <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-3 min-h-[300px] max-h-[720px] scrollbar-thin">
        {companies.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
              <Building2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200">
              Nenhuma empresa encontrada com os filtros atuais
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Tente aumentar o raio de varredura GPS ou selecionar outra atividade CNAE nos controles acima.
            </p>
          </div>
        ) : viewMode === 'cards' ? (
          sortedCompanies.map((emp) => {
            const isSelected = selectedCompany?.cnpjRaw === emp.cnpjRaw;
            const isSaved = savedCnpjs.has(emp.cnpjRaw);

            return (
              <div
                key={emp.cnpjRaw}
                onClick={() => onSelectCompany(emp)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-500/80 shadow-md ring-1 ring-blue-500/40'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/70 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Linha 1: Status & CNPJ */}
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          emp.situacaoCadastral === 'ATIVA'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {emp.situacaoCadastral}
                      </span>

                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                        {emp.porte}
                      </span>

                      {/* CNPJ com botão Copiar */}
                      <div className="flex items-center gap-1 font-mono text-xs text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                        <span>{emp.cnpj}</span>
                        <button
                          onClick={(e) => handleCopy(emp.cnpj, e)}
                          className="hover:text-white transition ml-1"
                          title="Copiar CNPJ"
                        >
                          {copiedCnpj === emp.cnpj ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400" />
                          )}
                        </button>
                      </div>

                      {/* Distância */}
                      {emp.distanciaMetros !== undefined && (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 bg-blue-950/50 px-2 py-0.5 rounded border border-blue-800/40">
                          <Navigation className="w-3 h-3" />
                          <span>
                            {emp.distanciaMetros >= 1000
                              ? `${(emp.distanciaMetros / 1000).toFixed(2)} km`
                              : `${emp.distanciaMetros} m`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Nome Fantasia e Razão Social */}
                    <h4 className="font-bold text-sm text-slate-100 hover:text-blue-300 transition truncate">
                      {emp.nomeFantasia || emp.razaoSocial}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">
                      {emp.razaoSocial}
                    </p>

                    {/* CNAE Principal */}
                    <div className="mt-2 text-xs text-indigo-300 bg-indigo-950/40 border border-indigo-900/60 p-1.5 rounded-lg flex items-center gap-1.5">
                      <span className="font-mono font-bold text-[11px] bg-indigo-900 px-1.5 py-0.2 rounded text-indigo-200">
                        {emp.cnaePrincipal.codigo}
                      </span>
                      <span className="truncate text-[11px]">
                        {emp.cnaePrincipal.descricao}
                      </span>
                    </div>

                    {/* Endereço e Contato */}
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">
                          {emp.endereco.logradouro}, {emp.endereco.numero} - {emp.endereco.bairro}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{emp.telefone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ações Rápidas do Card */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSaveLead(emp);
                      }}
                      className={`p-2 rounded-lg border transition ${
                        isSaved
                          ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                      title={isSaved ? 'Remover dos Leads Salvos' : 'Salvar Lead'}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => onSelectCompany(emp)}
                      className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
                      title="Abrir Ficha Cadastral"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          /* Visualização em Tabela */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-semibold sticky top-0">
                <tr>
                  <th className="p-2">CNPJ</th>
                  <th className="p-2">Razão Social / Nome</th>
                  <th className="p-2">CNAE Principal</th>
                  <th className="p-2">Distância</th>
                  <th className="p-2">Situação</th>
                  <th className="p-2">Porte</th>
                  <th className="p-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sortedCompanies.map((emp) => (
                  <tr
                    key={emp.cnpjRaw}
                    onClick={() => onSelectCompany(emp)}
                    className="hover:bg-slate-800/70 transition cursor-pointer"
                  >
                    <td className="p-2 font-mono text-[11px] whitespace-nowrap text-slate-200">
                      {emp.cnpj}
                    </td>
                    <td className="p-2">
                      <div className="font-semibold text-white truncate max-w-[200px]">
                        {emp.nomeFantasia || emp.razaoSocial}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                        {emp.razaoSocial}
                      </div>
                    </td>
                    <td className="p-2">
                      <span className="font-mono text-indigo-400">{emp.cnaePrincipal.codigo}</span>
                    </td>
                    <td className="p-2 font-semibold text-blue-400 whitespace-nowrap">
                      {emp.distanciaMetros ? `${emp.distanciaMetros} m` : '-'}
                    </td>
                    <td className="p-2">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          emp.situacaoCadastral === 'ATIVA'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {emp.situacaoCadastral}
                      </span>
                    </td>
                    <td className="p-2 text-slate-400">{emp.porte}</td>
                    <td className="p-2 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCompany(emp);
                        }}
                        className="text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
