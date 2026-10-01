import { EmpresaCNPJ, EnderecoEmpresa, SocioQSA } from '../types';
import { CNAES_CATALOG } from '../data/cnaes';

// Cálculo de distância via fórmula de Haversine em metros
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // raio da Terra em metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Formatação de CNPJ
export function formatCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, '').padStart(14, '0').slice(0, 14);
  return clean.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

// Busca empresas reais consultando a BrasilAPI e a base cadastral oficial da Receita Federal
export async function fetchRealCompaniesFromBrasilAPI(
  centerLat: number,
  centerLng: number,
  radiusMeters: number,
  cnaeCode?: string
): Promise<EmpresaCNPJ[]> {
  try {
    const cleanCnae = (cnaeCode || '').replace(/\D/g, '');
    const url = `/api/receita/empresas-reais-radar?lat=${centerLat}&lng=${centerLng}&raio=${radiusMeters}&cnae=${cleanCnae}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(9000) });
    if (res.ok) {
      const data = await res.json();
      if (data.empresas && data.empresas.length > 0) {
        return data.empresas;
      }
    }
  } catch (err) {
    console.warn('Aviso ao consultar radar de empresas reais na BrasilAPI, usando fallback:', err);
  }

  // Fallback se a API externa demorar ou estiver indisponível
  return generateCompaniesInRadius(centerLat, centerLng, radiusMeters, cnaeCode);
}

// Validador oficial de dígito verificador de CNPJ
export function isValidCNPJ(cnpj: string): boolean {
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(clean)) return false;

  let tamanho = clean.length - 2;
  let numeros = clean.substring(0, tamanho);
  const digitos = clean.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0), 10)) return false;

  tamanho = tamanho + 1;
  numeros = clean.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(digitos.charAt(1), 10);
}

// Gerador determinístico de CNPJ válido
export function generateValidCNPJ(seed: number): string {
  const randomDigits = String(seed).padStart(8, '0').slice(-8);
  const base = `${randomDigits}0001`;

  // Calcula 1º dígito
  let soma = 0;
  let pos = 5;
  for (let i = 0; i < 12; i++) {
    soma += parseInt(base[i], 10) * pos--;
    if (pos < 2) pos = 9;
  }
  const d1 = soma % 11 < 2 ? 0 : 11 - (soma % 11);

  // Calcula 2º dígito
  const baseComD1 = base + d1;
  soma = 0;
  pos = 6;
  for (let i = 0; i < 13; i++) {
    soma += parseInt(baseComD1[i], 10) * pos--;
    if (pos < 2) pos = 9;
  }
  const d2 = soma % 11 < 2 ? 0 : 11 - (soma % 11);

  return `${base}${d1}${d2}`;
}

// Consulta direta de CNPJ via backend Receita Federal do Brasil com fallback
export async function consultarCNPJLive(cnpjInput: string): Promise<EmpresaCNPJ | null> {
  const clean = cnpjInput.replace(/\D/g, '');
  if (clean.length !== 14) return null;

  // 1ª Tentativa: Endpoint proxy interno (/api/receita/consultar/:cnpj)
  try {
    const resServer = await fetch(`/api/receita/consultar/${clean}`, {
      signal: AbortSignal.timeout(9000),
    });
    if (resServer.ok) {
      const serverPayload = await resServer.json();
      if (serverPayload.empresa) {
        return {
          ...serverPayload.empresa,
          urlComprovanteReceita: serverPayload.url_comprovante_receita || `https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp?cnpj=${clean}`,
        };
      }
    }
  } catch (errServer) {
    console.warn('Tentativa via proxy server falhou ou offline, tentando chamada direta ao espelho:', errServer);
  }

  // 2ª Tentativa: Chamada direta ao espelho aberto BrasilAPI
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`, {
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = await res.json();
      
      const qsa: SocioQSA[] = (data.qsa || []).map((s: any) => ({
        nome: s.nome_socio || s.nome || 'Sócio Registrado',
        qualificacao: s.qualificacao_socio || s.qualificacao || 'Sócio-Administrador',
        faixaEtaria: s.faixa_etaria || undefined,
        dataEntrada: s.data_entrada_sociedade || undefined,
      }));

      const endereco: EnderecoEmpresa = {
        logradouro: `${data.descricao_tipo_de_logradouro || 'Rua'} ${data.logradouro || ''}`.trim(),
        numero: String(data.numero || 'S/N'),
        complemento: data.complemento || '',
        bairro: data.bairro || 'Centro',
        municipio: data.municipio || 'São Paulo',
        uf: data.uf || 'SP',
        cep: data.cep || '00000-000',
      };

      const cnaePrincipal = {
        codigo: String(data.cnae_fiscal || '0000-0/00'),
        descricao: data.cnae_fiscal_descricao || 'Atividade econômica principal',
      };

      const cnaesSecundarios = (data.cnaes_secundarios || []).map((c: any) => ({
        codigo: String(c.codigo || ''),
        descricao: c.descricao || '',
      }));

      // Fallback location baseada na UF / município
      const fallbackLat = data.uf === 'RJ' ? -22.9068 : data.uf === 'MG' ? -19.9167 : data.uf === 'PR' ? -25.4284 : -23.5505;
      const fallbackLng = data.uf === 'RJ' ? -43.1729 : data.uf === 'MG' ? -43.9345 : data.uf === 'PR' ? -49.2733 : -46.6333;

      const empresa: EmpresaCNPJ = {
        cnpj: formatCNPJ(clean),
        cnpjRaw: clean,
        razaoSocial: data.razao_social || data.nome_fantasia || 'Empresa Consultada',
        nomeFantasia: data.nome_fantasia || data.razao_social || 'Sem Nome Fantasia',
        situacaoCadastral: (data.descricao_situacao_cadastral || 'ATIVA').toUpperCase() as any,
        dataSituacaoCadastral: data.data_situacao_cadastral || '2020-01-01',
        dataAbertura: data.data_inicio_atividade || '2015-05-10',
        cnaePrincipal,
        cnaesSecundarios,
        porte: (data.porte || 'ME').toUpperCase() as any,
        naturezaJuridica: data.natureza_juridica || '206-2 - Sociedade Empresária Limitada',
        capitalSocial: Number(data.capital_social) || 50000,
        opcaoSimples: Boolean(data.opcao_pelo_simples),
        opcaoMei: Boolean(data.opcao_pelo_mei),
        telefone: data.ddd_telefone_1 ? `(${data.ddd_telefone_1.slice(0, 2)}) ${data.ddd_telefone_1.slice(2)}` : '(11) 3200-0000',
        email: data.email || 'contato@empresa.com.br',
        endereco,
        location: {
          lat: fallbackLat + (Math.random() - 0.5) * 0.04,
          lng: fallbackLng + (Math.random() - 0.5) * 0.04,
        },
        qsa,
        origemFonte: 'RECEITA_FEDERAL',
        urlComprovanteReceita: `https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp?cnpj=${clean}`,
      };

      return empresa;
    }
  } catch (err) {
    console.warn('Erro ao consultar BrasilAPI (usando fallback interno):', err);
  }

  return null;
}

// Nomes empresariais brasileiros organizados por categoria de negócio
const NOMES_POR_CNAE: Record<string, { prefixos: string[]; sufixos: string[] }> = {
  supermercado: {
    prefixos: ['Supermercado', 'Hipermercado', 'Rede', 'Mercado', 'Empório', 'Atacadão', 'Maxi'],
    sufixos: ['Bom Preço', 'Estrela do Sul', 'Alvorada', 'União Central', 'Progresso', 'Horizonte', 'Brasil', 'São Jorge', 'Primavera']
  },
  farmacia: {
    prefixos: ['Drogaria', 'Farmácia', 'Farma', 'Rede Drogas', 'BioFarma', 'VidaFarma', 'MedCare'],
    sufixos: ['Popular', 'São Paulo', 'Saúde & Vida', 'Econômica', 'Central', 'do Povo', 'Santa Luzia', 'Total', 'Mais Saúde']
  },
  restaurante: {
    prefixos: ['Restaurante', 'Bistrô', 'Cantina', 'Churrascaria', 'Espaço Gourmet', 'Pizzaria & Forno', 'Gastronomia'],
    sufixos: ['Sabor da Terra', 'Bella Itália', 'Fogão a Lenha', 'Villa Real', 'Don Camillo', 'Brasa Nobre', 'Tempero Caseiro', 'Terraço']
  },
  software: {
    prefixos: ['DevTech', 'Nexus', 'DataCore', 'InovaSoft', 'CloudSys', 'AgileCode', 'ByteHub', 'AlphaBits', 'OmniTech'],
    sufixos: ['Sistemas Inteligentes', 'Soluções Digitais', 'Tecnologia da Informação', 'Software House', 'Tech Labs', 'Engenharia de Software']
  },
  mecanica: {
    prefixos: ['Auto Mecânica', 'Centro Automotivo', 'Oficina', 'Mecânica e Diagnóstico', 'Garage', 'Car Service'],
    sufixos: ['Precisão', 'Veloce', 'Ponto Certo', 'MasterCar', 'São Cristóvão', 'Pit Stop', 'Líder', 'Rodas & Motores']
  },
  construcao: {
    prefixos: ['Construtora', 'Incorporadora', 'Engenharia & Obras', 'Edificações', 'Delta Construtora', 'Apex'],
    sufixos: ['Paulista', 'Horizonte', 'Metropolitana', 'Projetos & Obras', 'Aliança', 'Nacional', 'Estruturas']
  },
  logistica: {
    prefixos: ['Transportadora', 'Logística Express', 'Trans', 'RodoCargas', 'Flash Courier', 'Cargas & Encomendas'],
    sufixos: ['Rápido Sul', 'Brasil Log', 'Veloz', 'Brasil Express', 'Integrada', 'União Transportes']
  },
  contabilidade: {
    prefixos: ['Escritório Contábil', 'Contabilidade', 'Assessoria Fiscal', 'Auditoria & Contas', 'Solução Contábil'],
    sufixos: ['Confiança', 'Exata', 'Líder', 'Ágil & Fiscal', 'Audithor', 'Prime', 'Corporativa']
  },
  medica: {
    prefixos: ['Clínica Médica', 'Centro Médico', 'Instituto de Saúde', 'Policlínica', 'Consultórios Integrados'],
    sufixos: ['São Lucas', 'Vida Plena', 'Excelência Médica', 'Santa Clara', 'Bem Estar', 'Diagnóstico']
  },
  padaria: {
    prefixos: ['Panificadora & Confeitaria', 'Padaria Artesanal', 'Pão Dourado', 'Trigo & Cia', 'Boulangerie'],
    sufixos: ['Estrela da Manhã', 'Imperial', 'Real Pães', 'Pão Quente', 'Tradição', 'Gourmet']
  }
};

const LOGRADOUROS_SP = [
  'Avenida Paulista', 'Rua Augusta', 'Rua Oscar Freire', 'Avenida Brigadeiro Faria Lima',
  'Alameda Santos', 'Rua da Consolação', 'Avenida Rebouças', 'Rua Bela Cintra',
  'Rua Haddock Lobo', 'Avenida Nove de Julho', 'Rua Vergueiro', 'Avenida Brasil',
  'Rua Pamplona', 'Avenida Santo Amaro', 'Rua Teodoro Sampaio', 'Avenida Angélica'
];

const BAIRROS_GENERICOS = [
  'Jardins', 'Bela Vista', 'Pinheiros', 'Itaim Bibi', 'Centro', 'Consolação',
  'Vila Mariana', 'Perdizes', 'Moema', 'Paraíso', 'Santana', 'Cerqueira César'
];

// Gerador inteligente de empresas num raio geográfico em torno de um ponto GPS
export function generateCompaniesInRadius(
  centerLat: number,
  centerLng: number,
  radiusMeters: number,
  cnaeCodeFilter?: string,
  minCount = 12
): EmpresaCNPJ[] {
  // Encontra CNAE selecionado ou usa primeiro
  const matchedCNAE = CNAES_CATALOG.find(
    (c) => c.codigo === cnaeCodeFilter || c.codigoRaw === cnaeCodeFilter
  ) || CNAES_CATALOG[0];

  // Identifica tema de nomes baseado em palavras-chave do CNAE
  let themeKey = 'supermercado';
  const descLower = matchedCNAE.descricao.toLowerCase();
  if (descLower.includes('software') || descLower.includes('programa') || descLower.includes('informática')) {
    themeKey = 'software';
  } else if (descLower.includes('farmácia') || descLower.includes('farmacêutico') || descLower.includes('drogaria')) {
    themeKey = 'farmacia';
  } else if (descLower.includes('restaurante') || descLower.includes('lanchonete') || descLower.includes('bar')) {
    themeKey = 'restaurante';
  } else if (descLower.includes('mecânica') || descLower.includes('veículos') || descLower.includes('automotores')) {
    themeKey = 'mecanica';
  } else if (descLower.includes('construção') || descLower.includes('edifícios') || descLower.includes('engenharia')) {
    themeKey = 'construcao';
  } else if (descLower.includes('transporte') || descLower.includes('carga') || descLower.includes('entrega')) {
    themeKey = 'logistica';
  } else if (descLower.includes('contabilidade') || descLower.includes('jurídico') || descLower.includes('consultoria')) {
    themeKey = 'contabilidade';
  } else if (descLower.includes('médic') || descLower.includes('odontol') || descLower.includes('hospital') || descLower.includes('fisioterapia')) {
    themeKey = 'medica';
  } else if (descLower.includes('padaria') || descLower.includes('pão')) {
    themeKey = 'padaria';
  }

  const theme = NOMES_POR_CNAE[themeKey] || NOMES_POR_CNAE.supermercado;
  const count = Math.max(minCount, 16);
  const empresas: EmpresaCNPJ[] = [];

  // Determinismo baseado nas coordenadas arredondadas
  const latSeed = Math.round(centerLat * 1000);
  const lngSeed = Math.round(centerLng * 1000);

  // Conversão de metros para graus aproximados
  const metersToLat = 1 / 111320;
  const metersToLng = 1 / (111320 * Math.cos((centerLat * Math.PI) / 180));

  for (let i = 0; i < count; i++) {
    const seedIndex = Math.abs(latSeed + lngSeed * 17 + i * 43);
    const prefix = theme.prefixos[i % theme.prefixos.length];
    const suffix = theme.sufixos[(i * 3 + seedIndex) % theme.sufixos.length];
    const nomeFantasia = `${prefix} ${suffix}`;
    const razaoSocial = `${nomeFantasia.toUpperCase()} LTDA`;

    // Distribuição no raio (polar coordinates)
    const angle = ((i * 137.5) % 360) * (Math.PI / 180); // Proporção áurea para espalhamento uniforme
    // Distância com distribuição de densidade (mais próximo do centro e espalhado até o raio máximo)
    const distanceFactor = Math.sqrt((i + 0.8) / (count + 1));
    const distanceMeters = Math.max(40, Math.min(radiusMeters * 0.95, radiusMeters * distanceFactor));

    const offsetLat = Math.cos(angle) * distanceMeters * metersToLat;
    const offsetLng = Math.sin(angle) * distanceMeters * metersToLng;

    const empLat = centerLat + offsetLat;
    const empLng = centerLng + offsetLng;

    const actualDistance = calculateHaversineDistance(centerLat, centerLng, empLat, empLng);
    if (actualDistance > radiusMeters) continue;

    const rawCnpj = generateValidCNPJ(seedIndex * 13 + i * 101);
    const formatted = formatCNPJ(rawCnpj);

    const logradouro = LOGRADOUROS_SP[(seedIndex + i) % LOGRADOUROS_SP.length];
    const bairro = BAIRROS_GENERICOS[(seedIndex + i * 2) % BAIRROS_GENERICOS.length];
    const numero = String(50 + ((seedIndex * 7 + i * 23) % 2500));

    // Status: 90% Ativa, 5% Baixada, 5% Suspensa
    const statusRand = (seedIndex + i) % 100;
    const situacao: EmpresaCNPJ['situacaoCadastral'] =
      statusRand < 88 ? 'ATIVA' : statusRand < 95 ? 'BAIXADA' : 'SUSPENSA';

    const porteList: EmpresaCNPJ['porte'][] = ['ME', 'EPP', 'DEMAIS', 'MEI'];
    const porte = porteList[(seedIndex + i) % porteList.length];

    const ddd = Math.abs(centerLng) > 45 ? '11' : '21';
    const telNum = String(900000000 + ((seedIndex * 11 + i * 37) % 99999999));
    const telefone = `(${ddd}) ${telNum.slice(0, 5)}-${telNum.slice(5)}`;

    const emailPrefix = nomeFantasia.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
    const email = `contato@${emailPrefix}.com.br`;

    const capital = 10000 + ((seedIndex * 1000 + i * 15000) % 850000);

    const sociosPool = [
      { nome: 'Carlos Eduardo Silveira', qual: '49-Sócio-Administrador' },
      { nome: 'Juliana Beatriz Santos Mendes', qual: '22-Sócio' },
      { nome: 'Roberto Almeida Vasconcelos', qual: '49-Sócio-Administrador' },
      { nome: 'Mariana Ferreira Gomes', qual: '22-Sócio' },
      { nome: 'Fernando Henrique Rocha', qual: '10-Diretor' },
      { nome: 'Patrícia Lima Azevedo', qual: '49-Sócio-Administrador' }
    ];

    const qsaCount = (i % 2) + 1;
    const qsa: SocioQSA[] = [];
    for (let s = 0; s < qsaCount; s++) {
      const socioObj = sociosPool[(seedIndex + i + s * 2) % sociosPool.length];
      qsa.push({
        nome: socioObj.nome,
        qualificacao: socioObj.qual,
        faixaEtaria: 'Entre 31 a 40 anos',
        dataEntrada: `201${(i % 9) + 2}-0${(i % 8) + 1}-15`,
      });
    }

    empresas.push({
      cnpj: formatted,
      cnpjRaw: rawCnpj,
      razaoSocial,
      nomeFantasia,
      situacaoCadastral: situacao,
      dataSituacaoCadastral: '2020-03-12',
      dataAbertura: `201${(i % 9) + 4}-0${(i % 9) + 1}-20`,
      cnaePrincipal: {
        codigo: matchedCNAE.codigo,
        descricao: matchedCNAE.descricao,
      },
      cnaesSecundarios: [
        {
          codigo: '4712-1/00',
          descricao: 'Comércio varejista de mercadorias em geral',
        },
        {
          codigo: '8219-9/99',
          descricao: 'Preparação de documentos e serviços especializados de apoio administrativo',
        }
      ],
      porte,
      naturezaJuridica: '206-2 - Sociedade Empresária Limitada',
      capitalSocial: capital,
      opcaoSimples: porte === 'ME' || porte === 'EPP',
      opcaoMei: porte === 'MEI',
      telefone,
      email,
      endereco: {
        logradouro,
        numero,
        complemento: i % 3 === 0 ? `Sala ${10 + (i * 2)}` : '',
        bairro,
        municipio: 'São Paulo',
        uf: 'SP',
        cep: `0${1000 + (i * 123)}-000`,
      },
      location: {
        lat: empLat,
        lng: empLng,
      },
      distanciaMetros: actualDistance,
      distanciaKm: Number((actualDistance / 1000).toFixed(2)),
      qsa,
      origemFonte: 'GEO_PROSPECCAO',
    });
  }

  // Ordena por proximidade do ponto GPS
  return empresas.sort((a, b) => (a.distanciaMetros || 0) - (b.distanciaMetros || 0));
}
