import type { Brique, BriqueStatus } from '../types/brique';

const MOCK_USER_ID = 'mock-user-1';

function genId() {
  return crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
const toDateStr = (d: Date) => d.toISOString().slice(0, 10);

export const mockBriques: Brique[] = [
  {
    id: genId(),
    userId: MOCK_USER_ID,
    title: 'iPhone 14 Pro 128GB',
    purchaseValue: 4500,
    saleValue: 5200,
    status: 'à venda',
    origin: 'Instagram',
    phone: '11999991111',
    socialMedia: '@vendedor',
    notes: 'Caixa original, pouco uso.',
    entryDate: toDateStr(daysAgo(2)),
    exitDate: null,
    invoiceUrl: null,
    createdAt: daysAgo(2).toISOString(),
    updatedAt: daysAgo(1).toISOString(),
  },
  {
    id: genId(),
    userId: MOCK_USER_ID,
    title: 'Notebook Dell i5',
    purchaseValue: 2200,
    saleValue: 2800,
    status: 'vendido',
    origin: 'WhatsApp',
    phone: '11988882222',
    socialMedia: null,
    notes: null,
    entryDate: toDateStr(daysAgo(15)),
    exitDate: toDateStr(daysAgo(5)),
    invoiceUrl: null,
    createdAt: daysAgo(15).toISOString(),
    updatedAt: daysAgo(5).toISOString(),
  },
  {
    id: genId(),
    userId: MOCK_USER_ID,
    title: 'PlayStation 5',
    purchaseValue: 3500,
    saleValue: 4200,
    status: 'à venda',
    origin: 'OLX',
    phone: null,
    socialMedia: null,
    notes: 'Com 2 controles.',
    entryDate: toDateStr(daysAgo(12)),
    exitDate: null,
    invoiceUrl: null,
    createdAt: daysAgo(12).toISOString(),
    updatedAt: daysAgo(12).toISOString(),
  },
  {
    id: genId(),
    userId: MOCK_USER_ID,
    title: 'Geladeira Brastemp',
    purchaseValue: 1800,
    saleValue: 2200,
    status: 'vendido',
    origin: 'Indicação',
    phone: '11977773333',
    socialMedia: null,
    notes: null,
    entryDate: toDateStr(daysAgo(25)),
    exitDate: toDateStr(daysAgo(20)),
    invoiceUrl: null,
    createdAt: daysAgo(25).toISOString(),
    updatedAt: daysAgo(20).toISOString(),
  },
  {
    id: genId(),
    userId: MOCK_USER_ID,
    title: 'Sofá 3 lugares',
    purchaseValue: 1200,
    saleValue: 1600,
    status: 'à venda',
    origin: 'Marketplace',
    phone: '11966664444',
    socialMedia: null,
    notes: 'Tecido cinza, bom estado.',
    entryDate: toDateStr(daysAgo(10)),
    exitDate: null,
    invoiceUrl: null,
    createdAt: daysAgo(10).toISOString(),
    updatedAt: daysAgo(10).toISOString(),
  },
];

const store = { briques: [...mockBriques] };

export function getMockBriques(filter?: { status?: BriqueStatus; origin?: string }): Brique[] {
  let list = [...store.briques];
  if (filter?.status) list = list.filter((b) => b.status === filter.status);
  if (filter?.origin) list = list.filter((b) => b.origin === filter.origin);
  return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getMockBriqueById(id: string): Brique | undefined {
  return store.briques.find((b) => b.id === id);
}

export function addMockBrique(data: Omit<Brique, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Brique {
  const b: Brique = {
    ...data,
    entryDate: data.entryDate ?? toDateStr(new Date()),
    exitDate: data.exitDate ?? null,
    invoiceUrl: data.invoiceUrl ?? null,
    id: genId(),
    userId: MOCK_USER_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.briques.push(b);
  return b;
}

export function updateMockBrique(id: string, data: Partial<Brique>): Brique | undefined {
  const i = store.briques.findIndex((b) => b.id === id);
  if (i === -1) return undefined;
  store.briques[i] = { ...store.briques[i], ...data, updatedAt: new Date().toISOString() };
  return store.briques[i];
}

export function deleteMockBrique(id: string): boolean {
  const i = store.briques.findIndex((b) => b.id === id);
  if (i === -1) return false;
  store.briques.splice(i, 1);
  return true;
}

export interface DashboardStats {
  totalAbertas: number;
  totalFechadasNoPeriodo: number;
  valorEmNegociacao: number;
  valorFechadoNoPeriodo: number;
  liquidoNoPeriodo: number;
  briquesParadas: number;
  briquesTotaisNoPeriodo: number;
  funilPorStatus: { status: string; count: number; valor: number }[];
  evolucao: { label: string; valor: number; quantidade: number }[];
  contatosMaisAtivos: { phone: string; count: number }[];
}

export function getMockDashboardStats(period: string): DashboardStats {
  const list = store.briques;
  const aVenda = list.filter((b) => b.status === 'à venda');
  const vendidas = list.filter((b) => b.status === 'vendido');

  const totalAbertas = aVenda.length;
  const valorEmNegociacao = aVenda.reduce((s, b) => s + Number(b.saleValue), 0);

  const periodDays = period === 'hoje' ? 1 : period === 'ontem' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 30;
  const from = daysAgo(periodDays);
  const vendidasNoPeriodo = vendidas.filter((b) => new Date(b.updatedAt) >= from);
  const totalFechadasNoPeriodo = vendidasNoPeriodo.length;
  const valorFechadoNoPeriodo = vendidasNoPeriodo.reduce((s, b) => s + Number(b.saleValue), 0);
  const liquidoNoPeriodo = vendidasNoPeriodo.reduce(
    (s, b) => s + (Number(b.saleValue) - Number(b.purchaseValue)),
    0
  );

  const limiteParado = daysAgo(7);
  const briquesParadas = aVenda.filter((b) => new Date(b.updatedAt) < limiteParado).length;

  const range = getMockPeriodRange(period);
  const briquesTotaisNoPeriodo = range
    ? list.filter((b) => {
        const ut = new Date(b.updatedAt).getTime();
        return ut >= range.from.getTime() && ut <= range.to.getTime();
      }).length
    : list.length;

  const funilPorStatus = [
    { status: 'à venda', count: aVenda.length, valor: valorEmNegociacao },
    { status: 'vendido', count: vendidas.length, valor: vendidas.reduce((s, b) => s + Number(b.saleValue), 0) },
  ];

  const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const evolucao = Array.from({ length: Math.min(periodDays, 7) }, (_, i) => {
    const d = daysAgo(6 - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const vendidasNoDia = vendidas.filter(
      (b) => new Date(b.updatedAt) >= d && new Date(b.updatedAt) < next
    );
    return {
      label: labels[d.getDay()],
      valor: vendidasNoDia.reduce((s, b) => s + Number(b.saleValue), 0),
      quantidade: vendidasNoDia.length,
    };
  });

  const phoneCount = new Map<string, number>();
  list.forEach((b) => {
    if (b.phone) phoneCount.set(b.phone, (phoneCount.get(b.phone) || 0) + 1);
  });
  const contatosMaisAtivos = Array.from(phoneCount.entries())
    .map(([phone, count]) => ({ phone, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalAbertas,
    totalFechadasNoPeriodo,
    valorEmNegociacao,
    valorFechadoNoPeriodo,
    liquidoNoPeriodo,
    briquesParadas,
    briquesTotaisNoPeriodo,
    funilPorStatus,
    evolucao,
    contatosMaisAtivos,
  };
}

function getMockPeriodRange(period: string): { from: Date; to: Date } | null {
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);
  if (period === 'hoje') return { from, to };
  if (period === 'ontem') {
    from.setDate(from.getDate() - 1);
    to.setDate(to.getDate() - 1);
    to.setHours(23, 59, 59, 999);
    return { from, to };
  }
  if (period === '7d') {
    from.setDate(from.getDate() - 6);
    return { from, to };
  }
  if (period === '30d') {
    from.setDate(from.getDate() - 29);
    return { from, to };
  }
  return null;
}
