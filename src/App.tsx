import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { EmpresaCNPJ, CNAEItem, SearchQueryLog } from './types';
import { CNAES_CATALOG } from './data/cnaes';
import { fetchRealCompaniesFromBrasilAPI, generateCompaniesInRadius } from './services/cnpjService';
import { Header } from './components/Header';
import { SearchControls } from './components/SearchControls';
import { CompanyMap } from './components/CompanyMap';
import { CompanyList } from './components/CompanyList';
import { CompanyDetailModal } from './components/CompanyDetailModal';
import { SearchHistoryTracker } from './components/SearchHistoryTracker';
import { CnpjDirectLookupModal } from './components/CnpjDirectLookupModal';
import { SavedLeadsModal } from './components/SavedLeadsModal';

// Google Maps API Key
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyA84gF7wwTs68ZXXkVYcgj3tX5yX33h9OM';

export default function App() {
  // Quota Defense Banner State
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Coordenadas padrão (São Paulo - Av. Paulista)
  const [gpsOrigin, setGpsOrigin] = useState<{ lat: number; lng: number }>({
    lat: -23.5615,
    lng: -46.6559,
  });
  const [locationLabel, setLocationLabel] = useState('SP - Av. Paulista');

  // CNAE e Raio
  const [selectedCnae, setSelectedCnae] = useState<CNAEItem>(CNAES_CATALOG[0]);
  const [radiusMeters, setRadiusMeters] = useState<number>(2500);

  // Rastreamento Contínuo por GPS (watchPosition)
  const [isLiveTracking, setIsLiveTracking] = useState(false);

  // Filtros
  const [onlyActive, setOnlyActive] = useState<boolean>(true);
  const [selectedPorte, setSelectedPorte] = useState<string>('TODOS');

  // Resultados & Seleção
  const [allGeneratedCompanies, setAllGeneratedCompanies] = useState<EmpresaCNPJ[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<EmpresaCNPJ | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Modais
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDirectLookupOpen, setIsDirectLookupOpen] = useState(false);
  const [isSavedLeadsOpen, setIsSavedLeadsOpen] = useState(false);

  // Histórico e Leads Salvos com persistência no LocalStorage
  const [searchHistory, setSearchHistory] = useState<SearchQueryLog[]>(() => {
    try {
      const saved = localStorage.getItem('geocnpj_search_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedLeads, setSavedLeads] = useState<EmpresaCNPJ[]>(() => {
    try {
      const saved = localStorage.getItem('geocnpj_saved_leads');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Salva no LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('geocnpj_search_history', JSON.stringify(searchHistory));
    } catch (e) {
      console.warn('Erro ao salvar historico:', e);
    }
  }, [searchHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('geocnpj_saved_leads', JSON.stringify(savedLeads));
    } catch (e) {
      console.warn('Erro ao salvar leads:', e);
    }
  }, [savedLeads]);

  // Efeito de Rastreamento Contínuo em Tempo Real
  useEffect(() => {
    if (!isLiveTracking) return;
    if (!navigator.geolocation) {
      alert('Geolocalização contínua não suportada pelo seu dispositivo.');
      setIsLiveTracking(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setGpsOrigin({ lat: latitude, lng: longitude });
        setLocationLabel('GPS Ao Vivo (Em Movimento)');
      },
      (err) => {
        console.warn('Aviso no rastreamento contínuo de GPS:', err);
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isLiveTracking]);

  // Executa busca/varredura por GPS e CNAE com empresas reais da BrasilAPI
  const handleExecuteSearch = useCallback(
    async (customLat?: number, customLng?: number, customLabel?: string, customCnae?: CNAEItem, customRadius?: number) => {
      setIsSearching(true);

      const targetLat = customLat ?? gpsOrigin.lat;
      const targetLng = customLng ?? gpsOrigin.lng;
      const targetLabel = customLabel ?? locationLabel;
      const targetCnae = customCnae ?? selectedCnae;
      const targetRadius = customRadius ?? radiusMeters;

      try {
        const results = await fetchRealCompaniesFromBrasilAPI(
          targetLat,
          targetLng,
          targetRadius,
          targetCnae.codigo
        );

        setAllGeneratedCompanies(results);

        // Registra varredura no Rastreio de Buscas
        const newLog: SearchQueryLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: Date.now(),
          lat: targetLat,
          lng: targetLng,
          labelLocal: targetLabel,
          raioMetros: targetRadius,
          cnaeCodigo: targetCnae.codigo,
          cnaeDescricao: targetCnae.descricao,
          totalEncontrados: results.length,
          filtrosAtivos: {
            apenasAtivas: onlyActive,
            porte: selectedPorte,
          },
        };

        setSearchHistory((prev) => [newLog, ...prev.slice(0, 49)]);
      } catch (err) {
        console.warn('Erro ao carregar empresas reais:', err);
      } finally {
        setIsSearching(false);
      }
    },
    [gpsOrigin, locationLabel, selectedCnae, radiusMeters, onlyActive, selectedPorte]
  );

  // Sincronização Automática Reativa: Sempre que o ponto GPS, o CNAE ou o Raio mudarem, resincroniza imediatamente!
  useEffect(() => {
    handleExecuteSearch();
  }, [gpsOrigin.lat, gpsOrigin.lng, selectedCnae.codigo, radiusMeters]);

  // Quando o usuário clica ou arrasta no mapa para mover a origem
  const handleMapClickOrigin = useCallback(
    (lat: number, lng: number) => {
      const newLabel = `Ponto GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      setGpsOrigin({ lat, lng });
      setLocationLabel(newLabel);
    },
    []
  );

  // Troca de Ponto GPS via presets ou GPS real
  const handleSelectGps = (lat: number, lng: number, label: string) => {
    setGpsOrigin({ lat, lng });
    setLocationLabel(label);
  };

  // Repetir busca do histórico
  const handleReplaySearch = (log: SearchQueryLog) => {
    const cnaeFound = CNAES_CATALOG.find((c) => c.codigo === log.cnaeCodigo) || {
      codigo: log.cnaeCodigo,
      codigoRaw: log.cnaeCodigo.replace(/\D/g, ''),
      descricao: log.cnaeDescricao,
      categoria: 'Geral',
      palavrasChave: [],
    };

    setGpsOrigin({ lat: log.lat, lng: log.lng });
    setLocationLabel(log.labelLocal);
    setSelectedCnae(cnaeFound);
    setRadiusMeters(log.raioMetros);
  };

  // Quando uma empresa direta é localizada no modal de CNPJ
  const handleCompanyFoundDirect = (empresa: EmpresaCNPJ) => {
    setGpsOrigin(empresa.location);
    setLocationLabel(`${empresa.nomeFantasia || empresa.razaoSocial} (Ponto CNPJ)`);
    setAllGeneratedCompanies((prev) => [empresa, ...prev.filter((p) => p.cnpjRaw !== empresa.cnpjRaw)]);
    setSelectedCompany(empresa);
  };

  // Salvar / Remover Lead
  const handleToggleSaveLead = (company: EmpresaCNPJ) => {
    setSavedLeads((prev) => {
      const exists = prev.some((l) => l.cnpjRaw === company.cnpjRaw);
      if (exists) {
        return prev.filter((l) => l.cnpjRaw !== company.cnpjRaw);
      } else {
        return [company, ...prev];
      }
    });
  };

  const handleRemoveLead = (cnpjRaw: string) => {
    setSavedLeads((prev) => prev.filter((l) => l.cnpjRaw !== cnpjRaw));
  };

  const savedCnpjsSet = useMemo(() => new Set(savedLeads.map((l) => l.cnpjRaw)), [savedLeads]);

  // Filtragem local rigorosa por raio, situação e porte
  const filteredCompanies = useMemo(() => {
    return allGeneratedCompanies.filter((emp) => {
      if (emp.distanciaMetros !== undefined && emp.distanciaMetros > radiusMeters) return false;
      if (onlyActive && emp.situacaoCadastral !== 'ATIVA') return false;
      if (selectedPorte !== 'TODOS' && emp.porte !== selectedPorte) return false;
      return true;
    });
  }, [allGeneratedCompanies, radiusMeters, onlyActive, selectedPorte]);

  // Exportar CSV
  const handleExportCsv = () => {
    if (filteredCompanies.length === 0) return;
    const headers = [
      'CNPJ',
      'Razao Social',
      'Nome Fantasia',
      'Situacao Cadastral',
      'Distancia (Metros)',
      'CNAE Codigo',
      'CNAE Descricao',
      'Porte',
      'Capital Social',
      'Telefone',
      'Email',
      'Logradouro',
      'Numero',
      'Bairro',
      'Municipio',
      'UF',
      'CEP'
    ];

    const rows = filteredCompanies.map((emp) => [
      `"${emp.cnpj}"`,
      `"${emp.razaoSocial.replace(/"/g, '""')}"`,
      `"${emp.nomeFantasia.replace(/"/g, '""')}"`,
      `"${emp.situacaoCadastral}"`,
      emp.distanciaMetros ?? 0,
      `"${emp.cnaePrincipal.codigo}"`,
      `"${emp.cnaePrincipal.descricao.replace(/"/g, '""')}"`,
      `"${emp.porte}"`,
      emp.capitalSocial,
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
    link.download = `consulta_cnpj_gps_${selectedCnae.codigo}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Quota Defense Banner (Case A) */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Header Corporativo */}
      <Header
        onOpenDirectLookup={() => setIsDirectLookupOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSavedLeads={() => setIsSavedLeadsOpen(true)}
        historyCount={searchHistory.length}
        savedLeadsCount={savedLeads.length}
        currentGpsLabel={locationLabel}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-5">
        
        {/* Painel Superior: Controles de Busca e Sincronização GPS + CNAE */}
        <SearchControls
          currentLat={gpsOrigin.lat}
          currentLng={gpsOrigin.lng}
          locationLabel={locationLabel}
          selectedCnae={selectedCnae}
          radiusMeters={radiusMeters}
          onlyActive={onlyActive}
          selectedPorte={selectedPorte}
          isSearching={isSearching}
          isLiveTracking={isLiveTracking}
          synchronizedCount={filteredCompanies.length}
          onSelectGps={handleSelectGps}
          onUseCurrentGps={() => handleSelectGps(-23.5615, -46.6559, 'São Paulo - Centro')}
          onToggleLiveTracking={() => setIsLiveTracking(!isLiveTracking)}
          onSelectCnae={(cnae) => {
            setSelectedCnae(cnae);
            handleExecuteSearch(undefined, undefined, undefined, cnae, radiusMeters);
          }}
          onChangeRadius={(r) => {
            setRadiusMeters(r);
            handleExecuteSearch(undefined, undefined, undefined, selectedCnae, r);
          }}
          onToggleOnlyActive={(val) => setOnlyActive(val)}
          onChangePorte={(porte) => setSelectedPorte(porte)}
          onExecuteSearch={() => handleExecuteSearch()}
        />

        {/* Grade Principal: Mapa Interativo e Lista de Empresas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[580px]">
          
          {/* Coluna do Mapa do Google Maps (7 colunas em telas grandes) */}
          <div className="lg:col-span-7 flex flex-col h-[540px] lg:h-auto min-h-[500px]">
            <CompanyMap
              apiKey={API_KEY}
              center={gpsOrigin}
              radiusMeters={radiusMeters}
              selectedCnae={selectedCnae}
              companies={filteredCompanies}
              selectedCompany={selectedCompany}
              isLiveTracking={isLiveTracking}
              onSelectCompany={(comp) => setSelectedCompany(comp)}
              onMapClickOrigin={handleMapClickOrigin}
            />
          </div>

          {/* Coluna da Lista e Tabela de CNPJs (5 colunas) */}
          <div className="lg:col-span-5 flex flex-col h-[540px] lg:h-auto min-h-[500px]">
            <CompanyList
              companies={filteredCompanies}
              selectedCompany={selectedCompany}
              savedCnpjs={savedCnpjsSet}
              onSelectCompany={(comp) => setSelectedCompany(comp)}
              onToggleSaveLead={handleToggleSaveLead}
              onExportCsv={handleExportCsv}
            />
          </div>
        </div>
      </main>

      {/* Modais */}
      {selectedCompany && (
        <CompanyDetailModal
          company={selectedCompany}
          isSaved={savedCnpjsSet.has(selectedCompany.cnpjRaw)}
          onClose={() => setSelectedCompany(null)}
          onToggleSave={handleToggleSaveLead}
        />
      )}

      <SearchHistoryTracker
        isOpen={isHistoryOpen}
        history={searchHistory}
        onClose={() => setIsHistoryOpen(false)}
        onReplaySearch={handleReplaySearch}
        onClearHistory={() => setSearchHistory([])}
      />

      <CnpjDirectLookupModal
        isOpen={isDirectLookupOpen}
        onClose={() => setIsDirectLookupOpen(false)}
        onCompanyFound={handleCompanyFoundDirect}
      />

      <SavedLeadsModal
        isOpen={isSavedLeadsOpen}
        savedCompanies={savedLeads}
        onClose={() => setIsSavedLeadsOpen(false)}
        onSelectCompany={(comp) => setSelectedCompany(comp)}
        onRemoveLead={handleRemoveLead}
        onClearAll={() => setSavedLeads([])}
      />
    </div>
  );
}
