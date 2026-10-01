import React, { useState } from 'react';
import { EmpresaCNPJ } from '../types';
import {
  X,
  Building2,
  Copy,
  Check,
  MapPin,
  ExternalLink,
  Phone,
  Mail,
  Users,
  Calendar,
  DollarSign,
  Briefcase,
  Bookmark,
  BookmarkCheck,
  Printer,
  Navigation,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface CompanyDetailModalProps {
  company: EmpresaCNPJ | null;
  isSaved: boolean;
  onClose: () => void;
  onToggleSave: (company: EmpresaCNPJ) => void;
}

export const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({
  company,
  isSaved,
  onClose,
  onToggleSave,
}) => {
  const [copied, setCopied] = useState(false);

  if (!company) return null;

  const handleCopyCNPJ = () => {
    navigator.clipboard.writeText(company.cnpj);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedCapital = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(company.capitalSocial);

  const googleMapsRouteUrl = `https://www.google.com/maps/dir/?api=1&destination=${company.location.lat},${company.location.lng}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl text-slate-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 sm:p-6 border-b border-slate-700/80 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  company.situacaoCadastral === 'ATIVA'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {company.situacaoCadastral === 'ATIVA' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                )}
                SITUAÇÃO: {company.situacaoCadastral}
              </span>

              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                PORTE: {company.porte}
              </span>

              {company.distanciaMetros !== undefined && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-blue-400" />
                  {company.distanciaMetros >= 1000
                    ? `${(company.distanciaMetros / 1000).toFixed(2)} km do ponto GPS`
                    : `${company.distanciaMetros} metros do ponto GPS`}
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
              {company.razaoSocial}
            </h2>
            {company.nomeFantasia && company.nomeFantasia !== company.razaoSocial && (
              <p className="text-sm font-medium text-blue-300 mt-0.5">
                Nome Fantasia: {company.nomeFantasia}
              </p>
            )}

            {/* CNPJ Copy Bar */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-950 border border-slate-700 rounded-lg font-mono text-sm text-slate-200">
                <span className="text-slate-400 text-xs font-sans">CNPJ:</span>
                <span className="font-bold text-indigo-300">{company.cnpj}</span>
              </div>
              <button
                onClick={handleCopyCNPJ}
                className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition shrink-0"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
          
          {/* Seção 1: CNAEs */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              Atividade Econômica (CNAE)
            </h3>

            {/* CNAE Principal */}
            <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-xl p-3.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1">
                Atividade Principal (Primária)
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="font-mono font-bold text-sm bg-indigo-900/80 text-indigo-200 px-2 py-0.5 rounded border border-indigo-700/60 shrink-0">
                  {company.cnaePrincipal.codigo}
                </span>
                <span className="text-xs sm:text-sm text-slate-200 font-medium">
                  {company.cnaePrincipal.descricao}
                </span>
              </div>
            </div>

            {/* CNAEs Secundários */}
            {company.cnaesSecundarios && company.cnaesSecundarios.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-3.5 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Atividades Secundárias Registradas ({company.cnaesSecundarios.length})
                </div>
                <div className="space-y-1.5">
                  {company.cnaesSecundarios.map((sec, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <span className="font-mono text-slate-300 font-semibold bg-slate-900 px-1.5 py-0.5 rounded text-[11px] shrink-0">
                        {sec.codigo}
                      </span>
                      <span className="text-slate-300">{sec.descricao}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Seção 2: Localização e Rotas GPS */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-400" />
              Localização Cadastral e Rastreamento
            </h3>

            <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-white text-sm">
                  {company.endereco.logradouro}, nº {company.endereco.numero}
                  {company.endereco.complemento ? ` - ${company.endereco.complemento}` : ''}
                </p>
                <p className="text-slate-300">
                  Bairro: {company.endereco.bairro} — CEP: {company.endereco.cep}
                </p>
                <p className="text-slate-400">
                  {company.endereco.municipio} / {company.endereco.uf} — Coordenadas GPS: {company.location.lat.toFixed(5)}, {company.location.lng.toFixed(5)}
                </p>
              </div>

              <a
                href={googleMapsRouteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/30 transition shrink-0"
              >
                <Navigation className="w-4 h-4" />
                <span>Traçar Rota no Maps</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>
          </div>

          {/* Seção 3: Quadro Societário (QSA) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-400" />
              Quadro de Sócios e Administradores (QSA)
            </h3>

            {company.qsa && company.qsa.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {company.qsa.map((socio, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/70 text-xs space-y-1"
                  >
                    <div className="font-bold text-slate-100 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{socio.nome}</span>
                    </div>
                    <div className="text-cyan-300 text-[11px] font-medium">
                      {socio.qualificacao}
                    </div>
                    {socio.faixaEtaria && (
                      <div className="text-[10px] text-slate-400">
                        Faixa Etária: {socio.faixaEtaria}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Nenhum sócio informado no registro simplificado.
              </p>
            )}
          </div>

          {/* Seção 4: Informações Fiscais e Porte */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Informações Cadastrais & Fiscais
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-slate-800/60 border border-slate-700/70 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Capital Social</span>
                <span className="font-bold text-emerald-400 text-sm">{formattedCapital}</span>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/70 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Início Atividades</span>
                <span className="font-semibold text-slate-200">{company.dataAbertura}</span>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/70 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Simples Nacional</span>
                <span className={`font-bold ${company.opcaoSimples ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {company.opcaoSimples ? 'Optante' : 'Não Optante'}
                </span>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/70 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Regime MEI</span>
                <span className={`font-bold ${company.opcaoMei ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {company.opcaoMei ? 'Enquadrado' : 'Não MEI'}
                </span>
              </div>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/60 p-3 rounded-xl text-xs text-slate-300">
              <span className="font-semibold text-slate-400">Natureza Jurídica:</span>{' '}
              {company.naturezaJuridica}
            </div>
          </div>

          {/* Seção 5: Dados de Contato */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-amber-400" />
              Contatos Registrados
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/70">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Telefone Comercial</span>
                  <a href={`tel:${company.telefone.replace(/\D/g, '')}`} className="font-semibold text-slate-200 hover:text-blue-300">
                    {company.telefone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/70">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">E-mail Corporativo</span>
                  <a href={`mailto:${company.email}`} className="font-semibold text-slate-200 hover:text-blue-300 truncate block">
                    {company.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 p-4 sm:p-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={company.urlComprovanteReceita || `https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp?cnpj=${company.cnpjRaw}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/80 transition shadow-sm"
              title="Abrir consulta oficial do Comprovante de Inscrição na Receita Federal do Brasil"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Cartão CNPJ Oficial (Receita Federal)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>

            <button
              onClick={() => onToggleSave(company)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                isSaved
                  ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                  <span>Lead Salvo em Minha Lista</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Salvar como Lead</span>
                </>
              )}
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Imprimir ou Salvar em PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir Ficha</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
