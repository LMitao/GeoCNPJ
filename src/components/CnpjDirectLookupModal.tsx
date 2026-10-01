import React, { useState } from 'react';
import { EmpresaCNPJ } from '../types';
import { consultarCNPJLive, formatCNPJ, isValidCNPJ } from '../services/cnpjService';
import { 
  Search, 
  X, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  MapPin, 
  ExternalLink 
} from 'lucide-react';

interface CnpjDirectLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompanyFound: (company: EmpresaCNPJ) => void;
}

export const CnpjDirectLookupModal: React.FC<CnpjDirectLookupModalProps> = ({
  isOpen,
  onClose,
  onCompanyFound,
}) => {
  const [cnpjInput, setCnpjInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [foundCompany, setFoundCompany] = useState<EmpresaCNPJ | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 14);
    setCnpjInput(formatCNPJ(raw));
    setErrorMsg(null);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = cnpjInput.replace(/\D/g, '');
    if (clean.length !== 14) {
      setErrorMsg('O CNPJ deve conter exatamente 14 dígitos numéricos.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setFoundCompany(null);

    try {
      const result = await consultarCNPJLive(clean);
      if (result) {
        setFoundCompany(result);
      } else {
        // Fallback simulação com dados válidos se a API externa demorar ou estiver indisponível
        setErrorMsg('CNPJ não localizado na base pública ou serviço temporariamente instável.');
      }
    } catch (err) {
      setErrorMsg('Falha na comunicação com os servidores da Receita Federal.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFocusOnMap = () => {
    if (foundCompany) {
      onCompanyFound(foundCompany);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl text-slate-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Consulta Direta por CNPJ
              </h2>
              <p className="text-xs text-slate-400">
                Localize e plote qualquer empresa brasileira no mapa
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

        {/* Form */}
        <div className="p-5 space-y-4">
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
              Informe o CNPJ da Empresa (14 dígitos)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={cnpjInput}
                onChange={handleInputChange}
                placeholder="00.000.000/0001-00"
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 font-mono text-sm text-slate-100 focus:outline-none tracking-wider"
                autoFocus
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow-md shadow-indigo-600/30"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Consultar</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Exemplos para teste:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCnpjInput('00.000.000/0001-91')}
                  className="hover:text-indigo-400 underline font-mono"
                >
                  Banco do Brasil
                </button>
                <button
                  type="button"
                  onClick={() => setCnpjInput('33.000.167/0001-01')}
                  className="hover:text-indigo-400 underline font-mono"
                >
                  Petrobras
                </button>
              </div>
            </div>
          </form>

          {/* Erro */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Empresa Encontrada */}
          {foundCompany && (
            <div className="p-4 rounded-xl bg-slate-800/80 border border-indigo-700/80 space-y-3 animate-in fade-in">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {foundCompany.situacaoCadastral}
                  </span>
                  <h4 className="font-bold text-sm text-white mt-1">
                    {foundCompany.razaoSocial}
                  </h4>
                  {foundCompany.nomeFantasia && (
                    <p className="text-xs text-indigo-300">
                      Fantasia: {foundCompany.nomeFantasia}
                    </p>
                  )}
                </div>
                <div className="font-mono text-xs text-slate-400 font-semibold bg-slate-900 px-2 py-1 rounded border border-slate-700">
                  {foundCompany.cnpj}
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-1 border-t border-slate-700/60 pt-2">
                <div>
                  <span className="font-semibold text-slate-400">CNAE Principal:</span>{' '}
                  <span className="font-mono text-indigo-400">{foundCompany.cnaePrincipal.codigo}</span> - {foundCompany.cnaePrincipal.descricao}
                </div>
                <div>
                  <span className="font-semibold text-slate-400">Endereço:</span>{' '}
                  {foundCompany.endereco.logradouro}, {foundCompany.endereco.numero} - {foundCompany.endereco.bairro}, {foundCompany.endereco.municipio}/{foundCompany.endereco.uf}
                </div>
              </div>

              <button
                onClick={handleFocusOnMap}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition"
              >
                <MapPin className="w-4 h-4" />
                <span>Centralizar e Rastrear no Mapa</span>
              </button>
            </div>
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
