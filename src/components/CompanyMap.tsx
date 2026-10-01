/// <reference types="@types/google.maps" />
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  MapMouseEvent,
} from '@vis.gl/react-google-maps';
import { EmpresaCNPJ, CNAEItem } from '../types';
import { 
  Building2, 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Crosshair,
  Layers,
  Maximize2,
  Radio,
  Navigation
} from 'lucide-react';

interface CompanyMapProps {
  apiKey: string;
  center: { lat: number; lng: number };
  radiusMeters: number;
  selectedCnae: CNAEItem;
  companies: EmpresaCNPJ[];
  selectedCompany: EmpresaCNPJ | null;
  isLiveTracking?: boolean;
  onSelectCompany: (company: EmpresaCNPJ) => void;
  onMapClickOrigin: (lat: number, lng: number) => void;
}

// Subcomponente para desenhar o círculo do raio de busca sincronizado
function MapSearchRadiusCircle({
  center,
  radius,
  isLiveTracking,
}: {
  center: { lat: number; lng: number };
  radius: number;
  isLiveTracking?: boolean;
}) {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!circleRef.current) {
      circleRef.current = new google.maps.Circle({
        strokeColor: isLiveTracking ? '#10b981' : '#3b82f6',
        strokeOpacity: 0.85,
        strokeWeight: 2,
        fillColor: isLiveTracking ? '#10b981' : '#2563eb',
        fillOpacity: 0.12,
        map,
        center,
        radius,
        clickable: false,
      });
    } else {
      circleRef.current.setCenter(center);
      circleRef.current.setRadius(radius);
      circleRef.current.setOptions({
        strokeColor: isLiveTracking ? '#10b981' : '#3b82f6',
        fillColor: isLiveTracking ? '#10b981' : '#2563eb',
      });
    }

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
    };
  }, [map, center.lat, center.lng, radius, isLiveTracking]);

  return null;
}

// Subcomponente para auto-ajuste de câmera quando o centro muda
function MapCameraHandler({
  center,
  radiusMeters,
}: {
  center: { lat: number; lng: number };
  radiusMeters: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.panTo(center);

    let targetZoom = 15;
    if (radiusMeters <= 500) targetZoom = 16;
    else if (radiusMeters <= 1000) targetZoom = 15;
    else if (radiusMeters <= 2500) targetZoom = 14;
    else if (radiusMeters <= 5000) targetZoom = 13;
    else if (radiusMeters <= 10000) targetZoom = 12;
    else targetZoom = 11;

    map.setZoom(targetZoom);
  }, [map, center.lat, center.lng, radiusMeters]);

  return null;
}

// Subcomponente de Ações de Sincronização do Viewport
function MapViewportSyncControls({
  center,
  radiusMeters,
  onSyncViewportCenter,
}: {
  center: { lat: number; lng: number };
  radiusMeters: number;
  onSyncViewportCenter: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  const handleSyncCenter = () => {
    if (!map) return;
    const currentCenter = map.getCenter();
    if (currentCenter) {
      onSyncViewportCenter(currentCenter.lat(), currentCenter.lng());
    }
  };

  const handleFitCircleBounds = () => {
    if (!map) return;
    const latDelta = radiusMeters / 111320;
    const lngDelta = radiusMeters / (111320 * Math.cos((center.lat * Math.PI) / 180));
    const bounds = new google.maps.LatLngBounds(
      { lat: center.lat - latDelta, lng: center.lng - lngDelta },
      { lat: center.lat + latDelta, lng: center.lng + lngDelta }
    );
    map.fitBounds(bounds, 40);
  };

  return (
    <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
      <button
        onClick={handleSyncCenter}
        className="bg-slate-900/90 backdrop-blur-md hover:bg-slate-800 border border-blue-500/60 hover:border-blue-400 text-blue-200 hover:text-white px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-1.5 text-xs font-semibold transition"
        title="Reposicionar e sincronizar o radar GPS exatamente no centro visível desta tela"
      >
        <Crosshair className="w-3.5 h-3.5 text-blue-400" />
        <span className="hidden sm:inline">Sincronizar Centro da Tela</span>
        <span className="sm:hidden">Sincronizar</span>
      </button>

      <button
        onClick={handleFitCircleBounds}
        className="bg-slate-900/90 backdrop-blur-md hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white px-3 py-1 rounded-xl shadow-xl flex items-center gap-1.5 text-[11px] font-medium transition"
        title="Enquadrar o raio completo da busca na visualização do mapa"
      >
        <Maximize2 className="w-3 h-3 text-cyan-400" />
        <span>Enquadrar Raio</span>
      </button>
    </div>
  );
}

export const CompanyMap: React.FC<CompanyMapProps> = ({
  apiKey,
  center,
  radiusMeters,
  selectedCnae,
  companies,
  selectedCompany,
  isLiveTracking,
  onSelectCompany,
  onMapClickOrigin,
}) => {
  const [activeInfoWindow, setActiveInfoWindow] = useState<EmpresaCNPJ | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid'>('roadmap');

  useEffect(() => {
    if (selectedCompany) {
      setActiveInfoWindow(selectedCompany);
    }
  }, [selectedCompany]);

  const handleMapClick = useCallback(
    (ev: MapMouseEvent) => {
      if (ev.detail.latLng) {
        onMapClickOrigin(ev.detail.latLng.lat, ev.detail.latLng.lng);
      }
    },
    [onMapClickOrigin]
  );

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      <APIProvider apiKey={apiKey} libraries={['marker', 'geometry']}>
        <Map
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          mapId="DEMO_MAP_ID"
          defaultCenter={center}
          defaultZoom={15}
          mapTypeId={mapType}
          disableDefaultUI={true}
          gestureHandling="greedy"
          onClick={handleMapClick}
          className="w-full h-full min-h-[480px]"
        >
          <MapCameraHandler center={center} radiusMeters={radiusMeters} />
          <MapSearchRadiusCircle center={center} radius={radiusMeters} isLiveTracking={isLiveTracking} />
          <MapViewportSyncControls 
            center={center} 
            radiusMeters={radiusMeters} 
            onSyncViewportCenter={onMapClickOrigin} 
          />

          {/* Marcador do Ponto Central de Varredura GPS (Arrastável) */}
          <AdvancedMarker 
            position={center} 
            title="Ponto Focal GPS (Arraste para mover e sincronizar)"
            draggable={true}
            onDragEnd={(e: any) => {
              if (e.latLng) {
                onMapClickOrigin(e.latLng.lat(), e.latLng.lng());
              }
            }}
          >
            <div className="relative flex items-center justify-center cursor-move group">
              <span className={`absolute w-10 h-10 rounded-full animate-ping ${isLiveTracking ? 'bg-emerald-500/30' : 'bg-blue-500/30'}`}></span>
              <span className={`absolute w-6 h-6 rounded-full animate-pulse ${isLiveTracking ? 'bg-emerald-400/40' : 'bg-cyan-400/40'}`}></span>
              <div className={`w-10 h-10 rounded-full p-1.5 shadow-xl border-2 border-white flex items-center justify-center transform group-hover:scale-110 transition ring-4 ${
                isLiveTracking
                  ? 'bg-gradient-to-tr from-emerald-700 via-teal-600 to-green-400 ring-emerald-500/30'
                  : 'bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-400 ring-blue-500/30'
              }`}>
                {isLiveTracking ? (
                  <Radio className="w-5 h-5 text-white animate-pulse" />
                ) : (
                  <Crosshair className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="absolute -bottom-6 bg-slate-900/95 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap border border-cyan-500/40">
                {isLiveTracking ? 'GPS Ao Vivo' : 'Arraste para Mover'}
              </div>
            </div>
          </AdvancedMarker>

          {/* Marcadores das Empresas CNPJ Sincronizadas na Área */}
          {companies.map((emp) => {
            const isSelected = selectedCompany?.cnpjRaw === emp.cnpjRaw;
            const isAtiva = emp.situacaoCadastral === 'ATIVA';

            return (
              <AdvancedMarker
                key={emp.cnpjRaw}
                position={emp.location}
                title={`${emp.razaoSocial} (${emp.cnpj})`}
                onClick={() => {
                  onSelectCompany(emp);
                  setActiveInfoWindow(emp);
                }}
              >
                <div
                  className={`relative flex items-center justify-center cursor-pointer transition transform ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-10'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 ${
                      isSelected
                        ? 'bg-amber-400 border-white text-slate-950 ring-4 ring-amber-400/30'
                        : isAtiva
                        ? 'bg-emerald-600 border-white text-white'
                        : 'bg-rose-600 border-white text-white'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}

          {/* InfoWindow Informativa ao clicar no Marcador */}
          {activeInfoWindow && (
            <InfoWindow
              position={activeInfoWindow.location}
              onCloseClick={() => setActiveInfoWindow(null)}
            >
              <div className="p-1 max-w-[280px] text-slate-900">
                <div className="flex items-center gap-1.5 mb-1">
                  {activeInfoWindow.situacaoCadastral === 'ATIVA' ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ATIVA
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      {activeInfoWindow.situacaoCadastral}
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-slate-600 font-semibold">
                    {activeInfoWindow.cnpj}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                  {activeInfoWindow.nomeFantasia || activeInfoWindow.razaoSocial}
                </h4>
                <p className="text-[11px] text-slate-600 truncate mt-0.5">
                  {activeInfoWindow.razaoSocial}
                </p>

                <div className="mt-2 text-[10px] text-slate-600 space-y-0.5 border-t border-slate-200 pt-1.5">
                  <div>
                    <span className="font-semibold text-slate-700">CNAE:</span>{' '}
                    <span className="font-mono text-indigo-700">{activeInfoWindow.cnaePrincipal.codigo}</span>
                  </div>
                  <div className="truncate">
                    <span className="font-semibold text-slate-700">Endereço:</span>{' '}
                    {activeInfoWindow.endereco.logradouro}, {activeInfoWindow.endereco.numero} - {activeInfoWindow.endereco.bairro}
                  </div>
                  {activeInfoWindow.distanciaMetros !== undefined && (
                    <div className="text-blue-700 font-semibold">
                      Distância do GPS: {activeInfoWindow.distanciaMetros >= 1000 ? `${(activeInfoWindow.distanciaMetros / 1000).toFixed(2)} km` : `${activeInfoWindow.distanciaMetros} metros`}
                    </div>
                  )}
                </div>

                <div className="mt-2.5 pt-1.5 border-t border-slate-200 flex items-center justify-between">
                  <button
                    onClick={() => onSelectCompany(activeInfoWindow)}
                    className="w-full py-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] rounded flex items-center justify-center gap-1 transition"
                  >
                    <span>Ver Ficha Completa</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Overlay de Controle Flutuante no Topo do Mapa */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-xs text-slate-200">
          <span className={`w-2 h-2 rounded-full ${isLiveTracking ? 'bg-emerald-400 animate-ping' : 'bg-emerald-400'}`}></span>
          <span className="font-medium">
            {companies.length} empresas dentro do raio
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            ({radiusMeters >= 1000 ? `${radiusMeters / 1000}km` : `${radiusMeters}m`})
          </span>
        </div>

        <button
          onClick={() => setMapType(mapType === 'roadmap' ? 'hybrid' : 'roadmap')}
          className="bg-slate-900/90 backdrop-blur-md hover:bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1 text-xs text-slate-200 transition"
          title="Alternar camada Satélite / Mapa"
        >
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">{mapType === 'roadmap' ? 'Satélite' : 'Mapa'}</span>
        </button>
      </div>

      {/* Dica de Interatividade no Rodapé do Mapa */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-10 bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 px-3 py-1.5 rounded-xl shadow flex items-center gap-2">
        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span>
          <strong>Área sincronizada:</strong> Arraste o pino central ou clique no mapa para resincronizar os CNPJs do CNAE {selectedCnae.codigo}.
        </span>
      </div>
    </div>
  );
};
