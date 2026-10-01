import React, { useState, useMemo } from 'react';
import { 
  Crosshair, 
  MapPin, 
  Search, 
  Filter, 
  Sliders, 
  Sparkles,
  ChevronDown,
  Building,
  RotateCcw,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { CNAES_CATALOG, CATEGORIAS_CNAE } from '../data/cnaes';
import { CNAEItem } from '../types';

interface SearchControlsProps {
  currentLat: number;
  currentLng: number;
  locationLabel: string;
  selectedCnae: CNAEItem;
  radiusMeters: number;
  onlyActive: boolean;
  selectedPorte: string;
  isSearching: boolean;
  isLiveTracking: boolean;
  synchronizedCount: number;
  onSelectGps: (lat: number, lng: number, label: string) => void;
  onUseCurrentGps: () => void;
  onToggleLiveTracking: () => void;
  onSelectCnae: (cnae: CNAEItem) => void;
  onChangeRadius: (radius: number) => void;
  onToggleOnlyActive: (val: boolean) => void;
  onChangePorte: (porte: string) => void;
  onExecuteSearch: () => void;
}

const PRESET_HUBS = [
  { label: 'SP - Av. Paulista', lat: -23.5615, lng: -46.6559 },
  { label: 'SP - Faria Lima (Itaim)', lat: -23.5855, lng: -46.6811 },
  { label: 'RJ - Centro Financeiro', lat: -22.9068, lng: -43.1729 },
  { label: 'MG - Savassi (BH)', lat: -19.9387, lng: -43.9345 },
  { label: 'PR - Batel (Curitiba)', lat: -25.4411, lng: -49.2818 },
  { label: 'DF - Asa Sul (Brasília)', lat: -15.7998, lng: -47.8885 },
];

const RADIUS_OPTIONS = [
  { label: '500m', value: 500 },
  { label: '1 km', value: 1000 },
  { label: '2.5 km', value: 2500 },
  { label: '5 km', value: 5000 },
  { label: '10 km', value: 10000 },
  { label: '20 km', value: 20000 },
];

export const SearchControls: React.FC<SearchControlsProps> = ({
  currentLat,
  currentLng,
  locationLabel,
  selectedCnae,
  radiusMeters,
  onlyActive,
  selectedPorte,
  isSearching,
  isLiveTracking,
  synchronizedCount,
  onSelectGps,
  onUseCurrentGps,
  onToggleLiveTracking,
  onSelectCnae,
  onChangeRadius,
  onToggleOnlyActive,
  onChangePorte,
  onExecuteSearch,
}) => {
  const [cnaeSearchQuery, setCnaeSearchQuery] = useState('');
  const [isCnaeDropdownOpen, setIsCnaeDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [isGpsPresetOpen, setIsGpsPresetOpen] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Filtragem de CNAEs no dropdown
  const filteredCnaes = useMemo(() => {
    let list = CNAES_CATALOG;
    if (selectedCategory !== 'Todas') {
      list = list.filter((c) => c.categoria === selectedCategory);
    }
    if (!cnaeSearchQuery.trim()) return list;

    const term = cnaeSearchQuery.toLowerCase().trim();
    const digits = cnaeSearchQuery.replace(/\D/g, '');

    return list.filter((c) => {
      if (digits && c.codigoRaw.includes(digits)) return true;
      if (c.codigo.toLowerCase().includes(term)) return true;
      if (c.descricao.toLowerCase().includes(term)) return true;
      return c.palavrasChave.some((kw) => kw.includes(term));
    });
  }, [selectedCategory, cnaeSearchQuery]);

  const handleGetCurrentLocation = () => {
    setGpsLoading(true);
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada pelo seu navegador.');
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        onSelectGps(
          pos.coords.latitude,
          pos.coords.longitude,
          'Meu GPS Atual'
        );
      },
      (err) => {
        setGpsLoading(false);
        console.warn('Erro ao obter GPS:', err);
        alert('Não foi possível obter a sua localização GPS direta. Usando polo central.');
        onUseCurrentGps();
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl text-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        
        {/* Bloco 1: Seleção de Origem GPS (4 colunas) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              1. Ponto de Origem GPS
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {currentLat.toFixed(4)}, {currentLng.toFixed(4)}
            </span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsGpsPresetOpen(!isGpsPresetOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 rounded-xl text-left text-sm transition"
            >
              <div className="flex items-center gap-2 truncate">
                <span className={`w-2.5 h-2.5 rounded-full ${isLiveTracking ? 'bg-emerald-400 animate-ping' : 'bg-blue-500 animate-pulse'}`}></span>
                <span className="font-medium text-slate-100 truncate">{locationLabel}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            </button>

            {isGpsPresetOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase">
                  Polos Comerciais Predefinidos
                </div>
                {PRESET_HUBS.map((hub) => (
                  <button
                    key={hub.label}
                    onClick={() => {
                      onSelectGps(hub.lat, hub.lng, hub.label);
                      setIsGpsPresetOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700/80 rounded-lg flex items-center justify-between transition"
                  >
                    <span>{hub.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {hub.lat.toFixed(2)}, {hub.lng.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Botões de Ação GPS: Captura e Rastreio Contínuo */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              onClick={handleGetCurrentLocation}
              disabled={gpsLoading}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-blue-950/70 hover:bg-blue-900/70 border border-blue-800/80 rounded-lg text-xs font-medium text-blue-300 transition"
              title="Obter coordenadas pontuais do sensor GPS do dispositivo"
            >
              <Crosshair className={`w-3.5 h-3.5 text-blue-400 ${gpsLoading ? 'animate-spin' : ''}`} />
              <span className="truncate">{gpsLoading ? 'Obtendo...' : 'Usar Meu GPS'}</span>
            </button>

            <button
              onClick={onToggleLiveTracking}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 border rounded-lg text-xs font-semibold transition ${
                isLiveTracking
                  ? 'bg-emerald-950 border-emerald-600 text-emerald-300 shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
              title="Rastreamento em tempo real contínuo conforme você se move"
            >
              <Radio className={`w-3.5 h-3.5 ${isLiveTracking ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="truncate">{isLiveTracking ? 'GPS Ao Vivo (ON)' : 'Rastreio Ao Vivo'}</span>
            </button>
          </div>
        </div>

        {/* Bloco 2: Seleção de Atividade CNAE (5 colunas) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-400" />
              2. Atividade Econômica (CNAE)
            </label>
            <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-800/50">
              {selectedCnae.codigo}
            </span>
          </div>

          {/* Trigger do Seletor de CNAE */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCnaeDropdownOpen(!isCnaeDropdownOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 rounded-xl text-left text-sm transition"
            >
              <div className="truncate pr-2">
                <span className="font-semibold text-indigo-300 block text-xs truncate">
                  {selectedCnae.codigo} - {selectedCnae.categoria}
                </span>
                <span className="text-slate-200 text-xs truncate block">
                  {selectedCnae.descricao}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {/* Dropdown Modal de Pesquisa de CNAE */}
            {isCnaeDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 max-h-[380px] flex flex-col space-y-2">
                {/* Campo de Busca Rápida */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar código CNAE ou termo (ex: farmácia, software, mercado)..."
                    value={cnaeSearchQuery}
                    onChange={(e) => setCnaeSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                </div>

                {/* Filtro por Categoria */}
                <div className="flex gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-thin">
                  <button
                    onClick={() => setSelectedCategory('Todas')}
                    className={`px-2 py-1 rounded-md whitespace-nowrap transition ${
                      selectedCategory === 'Todas'
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Todas
                  </button>
                  {CATEGORIAS_CNAE.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2 py-1 rounded-md whitespace-nowrap transition ${
                        selectedCategory === cat
                          ? 'bg-indigo-600 text-white font-medium'
                          : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Lista de CNAEs Encontrados */}
                <div className="overflow-y-auto space-y-1 pr-1 max-h-[220px]">
                  {filteredCnaes.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400">
                      Nenhum CNAE correspondente a "{cnaeSearchQuery}".
                    </div>
                  ) : (
                    filteredCnaes.map((cnae) => (
                      <button
                        key={cnae.codigo}
                        onClick={() => {
                          onSelectCnae(cnae);
                          setIsCnaeDropdownOpen(false);
                          setCnaeSearchQuery('');
                        }}
                        className={`w-full text-left p-2 rounded-lg text-xs transition flex flex-col gap-0.5 ${
                          selectedCnae.codigo === cnae.codigo
                            ? 'bg-indigo-950/80 border border-indigo-700/80 text-indigo-200'
                            : 'hover:bg-slate-700/70 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-indigo-400">
                            {cnae.codigo}
                          </span>
                          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                            {cnae.categoria}
                          </span>
                        </div>
                        <span className="line-clamp-2 text-slate-200 text-[11px]">
                          {cnae.descricao}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pt-0.5 scrollbar-none">
            <span className="text-slate-400 shrink-0">Populares:</span>
            {CNAES_CATALOG.slice(0, 4).map((topCnae) => (
              <button
                key={topCnae.codigo}
                onClick={() => onSelectCnae(topCnae)}
                className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap transition ${
                  selectedCnae.codigo === topCnae.codigo
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                {topCnae.palavrasChave[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Bloco 3: Raio Geográfico & Ação de Varredura (3 colunas) */}
        <div className="lg:col-span-3 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              3. Raio de Varredura
            </label>
            <span className="text-xs font-bold text-cyan-300 font-mono">
              {radiusMeters >= 1000 ? `${(radiusMeters / 1000).toFixed(1)} km` : `${radiusMeters} m`}
            </span>
          </div>

          {/* Pílulas de Raio */}
          <div className="grid grid-cols-3 gap-1">
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChangeRadius(opt.value)}
                className={`py-1 text-xs rounded-lg font-medium transition ${
                  radiusMeters === opt.value
                    ? 'bg-cyan-600 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Botão de Execução / Resincronização */}
          <button
            onClick={onExecuteSearch}
            disabled={isSearching}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition transform active:scale-95 text-xs sm:text-sm"
          >
            {isSearching ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin text-white" />
                <span>Sincronizando Área...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Atualizar Varredura</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Barra de Status e Sincronização em Tempo Real */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 text-slate-300">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/70 text-emerald-300 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              Sincronizado: {synchronizedCount} empresas no raio de{' '}
              {radiusMeters >= 1000 ? `${(radiusMeters / 1000).toFixed(1)} km` : `${radiusMeters} m`} para CNAE {selectedCnae.codigo}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-slate-400">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => onToggleOnlyActive(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span className={onlyActive ? 'text-slate-200 font-medium' : 'text-slate-400'}>
              Apenas ATIVAS
            </span>
          </label>

          <div className="flex items-center gap-1.5">
            <span>Porte:</span>
            {['TODOS', 'ME', 'EPP', 'MEI', 'DEMAIS'].map((p) => (
              <button
                key={p}
                onClick={() => onChangePorte(p)}
                className={`px-2 py-0.5 rounded text-[11px] transition ${
                  selectedPorte === p
                    ? 'bg-slate-700 text-blue-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
