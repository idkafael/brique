interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  iconColor?: 'green' | 'blue' | 'purple';
  children?: React.ReactNode;
  /** Estilo extra no container do card (ex.: box-shadow para glow). */
  cardStyle?: React.CSSProperties;
  /** Estilo extra no valor principal (ex.: cor para positivo/negativo). */
  valueStyle?: React.CSSProperties;
}

const iconBg = {
  green: { background: 'var(--gradient-success)', color: 'var(--success-500)' },
  blue: { background: 'var(--gradient-brand-subtle)', color: 'var(--brand-500)' },
  purple: { background: 'rgba(139, 92, 246, 0.2)', color: 'var(--chart-3)' },
};

export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  iconColor = 'blue',
  children,
  cardStyle,
  valueStyle,
}: MetricCardProps) {
  return (
    <div
      className="rounded-lg border p-5"
      style={{
        background: 'var(--surface-200)',
        borderColor: 'var(--border)',
        borderRadius: '8px',
        ...cardStyle,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className="font-medium"
          style={{ fontFamily: 'var(--font-header)', color: 'var(--text-secondary)', fontSize: '16px', fontWeight: 500 }}
        >
          {title}
        </span>
        {icon && (
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={iconBg[iconColor]}
          >
            {icon}
          </span>
        )}
      </div>
      <p
        className="font-bold mb-1"
        style={{
          fontFamily: 'var(--font-header)',
          color: 'var(--text)',
          fontSize: '30px',
          fontWeight: 700,
          ...valueStyle,
        }}
      >
        {value}
      </p>
      {subtitle && (
        <p className="text-sm" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}
