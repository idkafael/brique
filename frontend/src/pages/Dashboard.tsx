import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../lib/api';
import PeriodFilter from '../components/Dashboard/PeriodFilter';
import type { Period } from '../components/Dashboard/PeriodFilter';
import MetricCard from '../components/Dashboard/MetricCard';
import ChartCard from '../components/Dashboard/ChartCard';

interface DashboardStats {
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

function formatMoney(n: number) {
  const value = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const ICON_DOLAR = (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0-9v1m0 8v-1" />
  </svg>
);

const ICON_CHART = (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
  </svg>
);

const ICON_BOX = (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const COLORS = ['var(--chart-1)', 'var(--chart-3)', 'var(--success-500)'];

const EMPTY_STATS: DashboardStats = {
  totalAbertas: 0,
  totalFechadasNoPeriodo: 0,
  valorEmNegociacao: 0,
  valorFechadoNoPeriodo: 0,
  liquidoNoPeriodo: 0,
  briquesParadas: 0,
  briquesTotaisNoPeriodo: 0,
  funilPorStatus: [],
  evolucao: [],
  contatosMaisAtivos: [],
};

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>('7d');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setLoading(true);
    api
      .get<DashboardStats>('/dashboard/stats', { params: { period } })
      .then((res) => {
        setStats(res.data);
        setError(null);
      })
      .catch((err) => {
        setStats(EMPTY_STATS);
        const status = err?.response?.status;
        const msg = err?.response?.data?.message;
        if (status === 401 || msg === 'Unauthorized') {
          setError('Sessão expirada ou não autorizado. Faça login novamente.');
        } else {
          setError(msg || 'Não foi possível carregar o dashboard. Verifique se o backend está rodando na porta 3000.');
        }
      })
      .finally(() => setLoading(false));
  }, [period]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Carregando...</p>
      </div>
    );
  }

  if (error) {
    const isAuthError = error.includes('autorizado') || error.includes('login novamente');
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p style={{ color: 'var(--danger-500)', fontFamily: 'var(--font-body)' }}>{error}</p>
        {isAuthError ? (
          <Link
            to="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium"
            style={{ background: 'var(--brand-500)', color: 'var(--text)' }}
          >
            Fazer login novamente
          </Link>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: '0.875rem' }}>
            Na raiz do projeto execute: <code className="bg-black/20 px-2 py-1 rounded">npm run dev</code>
          </p>
        )}
      </div>
    );
  }

  const data = stats ?? EMPTY_STATS;

  return (
    <div className="space-y-6">
      <PeriodFilter value={period} onChange={setPeriod} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Briques à venda"
          value={data.totalAbertas}
          subtitle="em negociação"
          icon={ICON_BOX}
          iconColor="blue"
        />
        <MetricCard
          title="Valor em negociação"
          value={formatMoney(data.valorEmNegociacao)}
          subtitle="pendente"
          icon={ICON_DOLAR}
          iconColor="blue"
        />
        <MetricCard
          title="Faturamento"
          value={formatMoney(data.valorFechadoNoPeriodo)}
          subtitle={period === '7d' ? 'últimos 7 dias' : period === '30d' ? 'último mês' : period === 'hoje' ? 'hoje' : period === 'ontem' ? 'ontem' : 'total'}
          icon={ICON_DOLAR}
          iconColor="blue"
        />
        <div className="md:col-span-2">
          <MetricCard
            title="Seu desempenho"
            value=""
            subtitle={period === '7d' ? 'ÚLTIMOS 7 DIAS' : period === '30d' ? 'ÚLTIMOS 30 DIAS' : 'PERÍODO'}
            icon={ICON_CHART}
            iconColor="blue"
          >
            <div className="h-[180px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.evolucao ?? []} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" stroke="var(--chart-text)" fontSize={11} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--surface-200)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    labelStyle={{ color: 'var(--text)' }}
                    formatter={(value: number) => [formatMoney(value), 'Receita']}
                    labelFormatter={(label) => label}
                  />
                  <Area type="monotone" dataKey="valor" stroke="var(--chart-3)" fillOpacity={1} fill="url(#colorValor)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </MetricCard>
        </div>
        <MetricCard
          title="Líquido"
          value={formatMoney(data.liquidoNoPeriodo)}
          subtitle="saldo no período"
          icon={ICON_DOLAR}
          iconColor="blue"
          valueStyle={{
            color: data.liquidoNoPeriodo >= 0 ? 'var(--success-500)' : 'var(--danger-500)',
          }}
          cardStyle={{
            boxShadow:
              data.liquidoNoPeriodo > 0
                ? '0 0 24px rgba(34, 197, 94, 0.35)'
                : data.liquidoNoPeriodo < 0
                  ? '0 0 24px rgba(239, 68, 68, 0.35)'
                  : undefined,
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Fechadas no período"
          value={data.totalFechadasNoPeriodo}
          subtitle="briques vendidas"
          icon={ICON_BOX}
          iconColor="blue"
        />
        <MetricCard
          title="Valor fechado no período"
          value={formatMoney(data.valorFechadoNoPeriodo)}
          subtitle="valor líquido"
          icon={ICON_DOLAR}
          iconColor="blue"
        />
        <MetricCard
          title="Briques totais"
          value={data.briquesTotaisNoPeriodo}
          subtitle={
            period === 'hoje' ? 'hoje' :
            period === 'ontem' ? 'ontem' :
            period === '7d' ? 'últimos 7 dias' :
            period === '30d' ? 'último mês' :
            'total'
          }
          icon={ICON_BOX}
          iconColor="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Funil por status" subtitle="À venda x Vendido">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.funilPorStatus ?? []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {(data.funilPorStatus ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--surface-200)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  formatter={(value: number, name: string, props: { payload?: { valor: number } }) => [
                    `${value}${props.payload ? ` (${formatMoney(props.payload.valor)})` : ''}`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Contatos mais ativos" subtitle="Por quantidade de briques">
          <div className="h-[220px]">
            {(data.contatosMaisAtivos ?? []).length === 0 ? (
              <p className="text-sm flex items-center h-full" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                Nenhum contato com briques ainda.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.contatosMaisAtivos ?? []} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <XAxis type="number" stroke="var(--chart-text)" fontSize={11} />
                  <YAxis type="category" dataKey="phone" stroke="var(--chart-text)" fontSize={11} width={100} tickFormatter={(v) => v || '(sem telefone)'} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--surface-200)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="count" fill="var(--chart-3)" radius={[0, 4, 4, 0]} name="Briques" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
