export type Period = 'hoje' | 'ontem' | '7d' | '30d' | 'total';

const LABELS: Record<Period, string> = {
  hoje: 'Hoje',
  ontem: 'Ontem',
  '7d': '7 dias',
  '30d': '30 dias',
  total: 'Total',
};

interface PeriodFilterProps {
  value: Period;
  onChange: (p: Period) => void;
}

export default function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  const periods: Period[] = ['hoje', 'ontem', '7d', '30d', 'total'];

  return (
    <div
      className="flex items-center justify-between rounded-lg border p-4"
      style={{ background: 'var(--surface-200)', borderColor: 'var(--border)', borderRadius: '8px' }}
    >
      <div className="flex items-center gap-2">
        <svg className="h-5 w-5" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span
          className="font-medium uppercase tracking-wide"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '12px' }}
        >
          Período
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {periods.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className="px-4 transition-colors rounded-lg"
            style={{
              height: '44px',
              fontFamily: 'var(--font-body)',
              borderRadius: '8px',
              ...(value === p
                ? { background: 'rgba(0,0,0,0.4)', color: 'var(--text)', fontSize: '13px', fontWeight: 500 }
                : { background: 'transparent', color: 'var(--text-disabled)', fontSize: '12px', fontWeight: 400 }),
            }}
          >
            {LABELS[p]}
          </button>
        ))}
      </div>
    </div>
  );
}
