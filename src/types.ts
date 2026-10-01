export interface CNAEItem {
  codigo: string;       // Format: '4711-3/02'
  codigoRaw: string;    // Format: '4711302'
  descricao: string;
  categoria: string;
  palavrasChave: string[];
}

export interface SocioQSA {
  nome: string;
  qualificacao: string;
  faixaEtaria?: string;
  dataEntrada?: string;
}

export interface EnderecoEmpresa {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
}

export interface EmpresaCNPJ {
  cnpj: string;            // Formatado: 00.000.000/0001-00
  cnpjRaw: string;         // Apenas digitos
  razaoSocial: string;
  nomeFantasia: string;
  situacaoCadastral: 'ATIVA' | 'SUSPENSA' | 'INAPTA' | 'BAIXADA';
  dataSituacaoCadastral: string;
  dataAbertura: string;
  cnaePrincipal: {
    codigo: string;
    descricao: string;
  };
  cnaesSecundarios: Array<{
    codigo: string;
    descricao: string;
  }>;
  porte: 'ME' | 'EPP' | 'DEMAIS' | 'MEI';
  naturezaJuridica: string;
  capitalSocial: number;
  opcaoSimples: boolean;
  opcaoMei: boolean;
  telefone: string;
  email: string;
  endereco: EnderecoEmpresa;
  location: {
    lat: number;
    lng: number;
  };
  distanciaMetros?: number;
  distanciaKm?: number;
  qsa: SocioQSA[];
  origemFonte?: 'RECEITA_FEDERAL' | 'CATALOGO_LOCAL' | 'GEO_PROSPECCAO';
  urlComprovanteReceita?: string;
}

export interface SearchQueryLog {
  id: string;
  timestamp: number;
  lat: number;
  lng: number;
  labelLocal: string;
  raioMetros: number;
  cnaeCodigo: string;
  cnaeDescricao: string;
  totalEncontrados: number;
  filtrosAtivos: {
    apenasAtivas: boolean;
    porte?: string;
  };
}

export interface MapCircleProps {
  center: { lat: number; lng: number };
  radius: number;
}
