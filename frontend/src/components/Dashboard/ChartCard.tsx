interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <div
      className="rounded-lg border p-5"
      style={{ background: 'var(--surface-200)', borderColor: 'var(--border)', borderRadius: '8px' }}
    >
      <div className="mb-4">
        <h3
          className="font-medium"
          style={{ fontFamily: 'var(--font-header)', color: 'var(--text-secondary)', fontSize: '16px', fontWeight: 500 }}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            className="text-xs uppercase tracking-wide mt-1"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}
          >
            {subtitle}
          </p>
        )}
      </div>
      <div className="min-h-[200px]">{children}</div>
    </div>
  );
}
