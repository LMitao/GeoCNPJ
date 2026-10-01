import { CNAEItem } from '../types';

export const CNAES_CATALOG: CNAEItem[] = [
  // Comércio & Varejo
  {
    codigo: '4711-3/02',
    codigoRaw: '4711302',
    descricao: 'Comércio varejista de mercadorias em geral, com predominância de produtos alimentícios - supermercados',
    categoria: 'Comércio & Varejo',
    palavrasChave: ['supermercado', 'mercado', 'alimentos', 'mercearia', 'varejo', 'compras']
  },
  {
    codigo: '4712-1/00',
    codigoRaw: '4712100',
    descricao: 'Comércio varejista de mercadorias em geral, com predominância de produtos alimentícios - minimercados, mercearias e armazéns',
    categoria: 'Comércio & Varejo',
    palavrasChave: ['minimercado', 'mercearia', 'armazém', 'conveniência', 'empório']
  },
  {
    codigo: '4771-7/01',
    codigoRaw: '4771701',
    descricao: 'Comércio varejista de produtos farmacêuticos, sem manipulação de fórmulas',
    categoria: 'Comércio & Varejo',
    palavrasChave: ['farmácia', 'drogaria', 'medicamentos', 'remédios', 'saúde', 'perfumaria']
  },
  {
    codigo: '4781-0/00',
    codigoRaw: '4781000',
    descricao: 'Comércio varejista de artigos do vestuário e acessórios',
    categoria: 'Comércio & Varejo',
    palavrasChave: ['roupas', 'vestuário', 'moda', 'loja de roupa', 'boutique', 'acessórios']
  },
  {
    codigo: '4744-0/99',
    codigoRaw: '4744099',
    descricao: 'Comércio varejista de materiais de construção em geral',
    categoria: 'Comércio & Varejo',
    palavrasChave: ['material de construção', 'ferragens', 'tintas', 'reforma', 'cimento']
  },
  {
    codigo: '4751-2/01',
    codigoRaw: '4751201',
    descricao: 'Comércio varejista especializado de equipamentos e suprimentos de informática',
    categoria: 'Comércio & Varejo',
    palavrasChave: ['informática', 'computador', 'tecnologia', 'hardware', 'eletrônicos']
  },
  {
    codigo: '4530-7/03',
    codigoRaw: '4530703',
    descricao: 'Comércio a varejo de peças e acessórios novos para veículos automotores',
    categoria: 'Comércio & Varejo',
    palavrasChave: ['auto peças', 'peças automotivas', 'veículos', 'acessórios carro']
  },

  // Alimentação & Restaurantes
  {
    codigo: '5611-2/01',
    codigoRaw: '5611201',
    descricao: 'Restaurantes e similares',
    categoria: 'Alimentação & Gastronomia',
    palavrasChave: ['restaurante', 'comida', 'gastronomia', 'almoço', 'jantar', 'buffet', 'bistrô']
  },
  {
    codigo: '5611-2/03',
    codigoRaw: '5611203',
    descricao: 'Lanchonetes, casas de chá, de sucos e similares',
    categoria: 'Alimentação & Gastronomia',
    palavrasChave: ['lanchonete', 'hambúrguer', 'lanche', 'sucos', 'café', 'fast food']
  },
  {
    codigo: '5611-2/04',
    codigoRaw: '5611204',
    descricao: 'Bares e outros estabelecimentos especializados em servir bebidas, sem entretenimento',
    categoria: 'Alimentação & Gastronomia',
    palavrasChave: ['bar', 'boteco', 'bebidas', 'cervejaria', 'pub']
  },
  {
    codigo: '1091-1/02',
    codigoRaw: '1091102',
    descricao: 'Fabricação de produtos de padaria e confeitaria com predominância de produção própria',
    categoria: 'Alimentação & Gastronomia',
    palavrasChave: ['padaria', 'panificadora', 'confeitaria', 'pães', 'bolos', 'doces']
  },
  {
    codigo: '5620-1/01',
    codigoRaw: '5620101',
    descricao: 'Fornecimento de alimentos preparados preponderantemente para empresas',
    categoria: 'Alimentação & Gastronomia',
    palavrasChave: ['refeições coletivas', 'catering', 'marmitaria', 'marmitas corporativas']
  },

  // Tecnologia & Informação
  {
    codigo: '6201-5/01',
    codigoRaw: '6201501',
    descricao: 'Desenvolvimento de programas de computador sob encomenda',
    categoria: 'Tecnologia & Informação',
    palavrasChave: ['software', 'programação', 'sistemas', 'app', 'aplicativos', 'tecnologia', 'dev']
  },
  {
    codigo: '6202-3/00',
    codigoRaw: '6202300',
    descricao: 'Desenvolvimento e licenciamento de programas de computador customizáveis',
    categoria: 'Tecnologia & Informação',
    palavrasChave: ['saas', 'software house', 'licenciamento', 'erp', 'crm', 'startup']
  },
  {
    codigo: '6204-0/00',
    codigoRaw: '6204000',
    descricao: 'Consultoria em tecnologia da informação',
    categoria: 'Tecnologia & Informação',
    palavrasChave: ['consultoria ti', 'assessoria técnica', 'segurança da informação', 'cloud']
  },
  {
    codigo: '6209-1/00',
    codigoRaw: '6209100',
    descricao: 'Suporte técnico, manutenção e outros serviços em tecnologia da informação',
    categoria: 'Tecnologia & Informação',
    palavrasChave: ['suporte ti', 'manutenção computadores', 'helpdesk', 'redes']
  },
  {
    codigo: '6311-9/00',
    codigoRaw: '6311900',
    descricao: 'Tratamento de dados, provedores de serviços de aplicação e serviços de hospedagem na internet',
    categoria: 'Tecnologia & Informação',
    palavrasChave: ['hospedagem web', 'datacenter', 'processamento de dados', 'nuvem']
  },

  // Saúde & Bem-Estar
  {
    codigo: '8630-5/03',
    codigoRaw: '8630503',
    descricao: 'Atividade médica ambulatorial restrita a consultas',
    categoria: 'Saúde & Medicina',
    palavrasChave: ['clínica médica', 'consultório', 'médico', 'consulta médica', 'especialidades']
  },
  {
    codigo: '8630-5/04',
    codigoRaw: '8630504',
    descricao: 'Atividade odontológica',
    categoria: 'Saúde & Medicina',
    palavrasChave: ['dentista', 'odontologia', 'clínica odontológica', 'ortodontia', 'implantes']
  },
  {
    codigo: '8640-2/02',
    codigoRaw: '8640202',
    descricao: 'Laboratórios de anatomia patológica e citológica e laboratórios clínicos',
    categoria: 'Saúde & Medicina',
    palavrasChave: ['laboratório', 'exames de sangue', 'análises clínicas', 'diagnóstico']
  },
  {
    codigo: '8650-0/04',
    codigoRaw: '8650004',
    descricao: 'Atividades de fisioterapia',
    categoria: 'Saúde & Medicina',
    palavrasChave: ['fisioterapia', 'reabilitação', 'fisioterapeuta', 'pilates clínico']
  },
  {
    codigo: '8610-1/01',
    codigoRaw: '8610101',
    descricao: 'Atividades de atendimento hospitalar, exceto pronto-socorro e para assistência a urgências',
    categoria: 'Saúde & Medicina',
    palavrasChave: ['hospital', 'internação', 'complexo hospitalar', 'leitos']
  },

  // Construção Civil & Engenharia
  {
    codigo: '4120-4/00',
    codigoRaw: '4120400',
    descricao: 'Construção de edifícios',
    categoria: 'Construção Civil & Engenharia',
    palavrasChave: ['construtora', 'edifícios', 'obras', 'construção', 'incorporadora', 'prédio']
  },
  {
    codigo: '4321-5/00',
    codigoRaw: '4321500',
    descricao: 'Instalação e manutenção elétrica',
    categoria: 'Construção Civil & Engenharia',
    palavrasChave: ['eletricista', 'instalações elétricas', 'manutenção elétrica', 'energia solar']
  },
  {
    codigo: '4322-3/01',
    codigoRaw: '4322301',
    descricao: 'Instalações hidráulicas, sanitárias e de gás',
    categoria: 'Construção Civil & Engenharia',
    palavrasChave: ['encanador', 'hidráulica', 'instalações de gás', 'saneamento']
  },
  {
    codigo: '7112-0/00',
    codigoRaw: '7112000',
    descricao: 'Serviços de engenharia',
    categoria: 'Construção Civil & Engenharia',
    palavrasChave: ['engenharia', 'engenheiro civil', 'projetos estruturais', 'laudos técnicos']
  },
  {
    codigo: '7111-1/00',
    codigoRaw: '7111100',
    descricao: 'Serviços de arquitetura',
    categoria: 'Construção Civil & Engenharia',
    palavrasChave: ['arquitetura', 'arquiteto', 'design de interiores', 'urbanismo', 'projetos']
  },

  // Automotivo & Oficinas
  {
    codigo: '4520-0/01',
    codigoRaw: '4520001',
    descricao: 'Serviços de manutenção e reparação mecânica de veículos automotores',
    categoria: 'Automotivo & Transportes',
    palavrasChave: ['oficina mecânica', 'mecânico', 'revisão carro', 'motor', 'suspensão', 'freios']
  },
  {
    codigo: '4520-0/02',
    codigoRaw: '4520002',
    descricao: 'Serviços de lanternagem ou funilaria e pintura de veículos automotores',
    categoria: 'Automotivo & Transportes',
    palavrasChave: ['funilaria', 'pintura automotiva', 'lanternagem', 'martelinho de ouro']
  },
  {
    codigo: '4520-0/05',
    codigoRaw: '4520005',
    descricao: 'Serviços de lavagem, lubrificação e polimento de veículos automotores',
    categoria: 'Automotivo & Transportes',
    palavrasChave: ['lava rápido', 'estética automotiva', 'polimento', 'lavagem a seco']
  },

  // Logística & Transporte
  {
    codigo: '4930-2/02',
    codigoRaw: '4930202',
    descricao: 'Transporte rodoviário de carga, exceto produtos perigosos e mudanças, intermunicipal, interestadual e internacional',
    categoria: 'Logística & Transporte',
    palavrasChave: ['transportadora', 'frete', 'cargas', 'caminhão', 'logística de frete']
  },
  {
    codigo: '5320-2/02',
    codigoRaw: '5320202',
    descricao: 'Serviços de entrega rápida',
    categoria: 'Logística & Transporte',
    palavrasChave: ['motoboy', 'delivery', 'entregas rápidas', 'courier', 'express']
  },
  {
    codigo: '5211-7/99',
    codigoRaw: '5211799',
    descricao: 'Depósitos de mercadorias para terceiros, exceto armazéns gerais e guarda-móveis',
    categoria: 'Logística & Transporte',
    palavrasChave: ['armazenagem', 'depósito', 'centro de distribuição', 'estoque terceirizado']
  },

  // Jurídico, Contábil & Gestão
  {
    codigo: '6920-6/01',
    codigoRaw: '6920601',
    descricao: 'Atividades de contabilidade',
    categoria: 'Serviços Corporativos & Financeiros',
    palavrasChave: ['contabilidade', 'contador', 'escritório contábil', 'abertura de empresa', 'folha de pagamento']
  },
  {
    codigo: '6911-7/01',
    codigoRaw: '6911701',
    descricao: 'Serviços advocatícios',
    categoria: 'Serviços Corporativos & Financeiros',
    palavrasChave: ['advocacia', 'advogado', 'escritório de advocacia', 'assessoria jurídica']
  },
  {
    codigo: '7020-4/00',
    codigoRaw: '7020400',
    descricao: 'Atividades de consultoria em gestão empresarial, exceto consultoria técnica específica',
    categoria: 'Serviços Corporativos & Financeiros',
    palavrasChave: ['consultoria empresarial', 'gestão de negócios', 'planejamento financeiro', 'b2b']
  },

  // Beleza & Estética
  {
    codigo: '9602-5/01',
    codigoRaw: '9602501',
    descricao: 'Cabeleireiros, manicure e pedicure',
    categoria: 'Beleza & Cuidados Pessoais',
    palavrasChave: ['salão de beleza', 'cabeleireiro', 'barbearia', 'manicure', 'estética']
  },
  {
    codigo: '9602-5/02',
    codigoRaw: '9602502',
    descricao: 'Atividades de estética e outros serviços de cuidados com a beleza',
    categoria: 'Beleza & Cuidados Pessoais',
    palavrasChave: ['clínica de estética', 'harmonização', 'depilação', 'drenagem', 'spa']
  },

  // Imobiliário
  {
    codigo: '6821-8/01',
    codigoRaw: '6821801',
    descricao: 'Corretagem na compra e venda e avaliação de imóveis',
    categoria: 'Mercado Imobiliário',
    palavrasChave: ['imobiliária', 'corretor de imóveis', 'venda de imóveis', 'aluguel', 'avaliação']
  },
  {
    codigo: '6822-6/00',
    codigoRaw: '6822600',
    descricao: 'Gestão e administração da propriedade imobiliária',
    categoria: 'Mercado Imobiliário',
    palavrasChave: ['administradora de condomínios', 'locação de imóveis', 'gestão predial']
  },

  // Educação & Treinamento
  {
    codigo: '8599-6/04',
    codigoRaw: '8599604',
    descricao: 'Treinamento em desenvolvimento profissional e gerencial',
    categoria: 'Educação & Treinamento',
    palavrasChave: ['treinamento', 'cursos livres', 'capacitação corporativa', 'workshops']
  },
  {
    codigo: '8593-7/00',
    codigoRaw: '8593700',
    descricao: 'Ensino de idiomas',
    categoria: 'Educação & Treinamento',
    palavrasChave: ['escola de inglês', 'idiomas', 'espanhol', 'línguas estrangeiras']
  }
];

export const CATEGORIAS_CNAE = Array.from(
  new Set(CNAES_CATALOG.map((c) => c.categoria))
);

export function findCNAEByTerm(term: string): CNAEItem[] {
  if (!term || term.trim() === '') return CNAES_CATALOG;
  const cleanTerm = term.toLowerCase().trim();
  const digitsOnly = term.replace(/\D/g, '');

  return CNAES_CATALOG.filter((c) => {
    if (digitsOnly && c.codigoRaw.includes(digitsOnly)) return true;
    if (c.codigo.toLowerCase().includes(cleanTerm)) return true;
    if (c.descricao.toLowerCase().includes(cleanTerm)) return true;
    if (c.categoria.toLowerCase().includes(cleanTerm)) return true;
    return c.palavrasChave.some((kw) => kw.includes(cleanTerm));
  });
}
