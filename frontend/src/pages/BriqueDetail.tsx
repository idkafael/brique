import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../lib/api';
import type { Brique } from '../types/brique';

function formatMoney(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

export default function BriqueDetail() {
  const { id } = useParams();
  const [brique, setBrique] = useState<Brique | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get<Brique>(`/briques/${id}`).then((res) => {
      setBrique(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading || !brique) {
    return <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Carregando...</p>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-header)', color: 'var(--text)' }}>{brique.title}</h1>
        <Link
          to={`/briques/${id}/editar`}
          className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          style={{ background: 'var(--brand-500)', color: 'var(--text)', fontFamily: 'var(--font-body)' }}
        >
          Editar
        </Link>
      </div>

      <div
        className="rounded-lg border p-6 space-y-4"
        style={{ background: 'var(--surface-200)', borderColor: 'var(--border)', borderRadius: '8px' }}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Valor de compra</p>
            <p className="font-semibold" style={{ color: 'var(--text)', fontFamily: 'var(--font-header)' }}>{formatMoney(Number(brique.purchaseValue))}</p>
          </div>
          <div>
            <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Valor de venda</p>
            <p className="font-semibold" style={{ color: 'var(--text)', fontFamily: 'var(--font-header)' }}>{formatMoney(Number(brique.saleValue))}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Data de entrada</p>
            <p style={{ color: 'var(--text)', fontFamily: 'var(--font-body)' }}>
              {brique.entryDate ? new Date(brique.entryDate).toLocaleDateString('pt-BR') : '—'}
            </p>
          </div>
          <div>
            <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Data de saída</p>
            <p style={{ color: 'var(--text)', fontFamily: 'var(--font-body)' }}>
              {brique.exitDate ? new Date(brique.exitDate).toLocaleDateString('pt-BR') : '—'}
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Status</p>
          <span
            className="inline-flex rounded-full px-2 py-0.5 text-sm font-medium"
            style={brique.status === 'vendido' ? { background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success-500)' } : { background: 'var(--gradient-brand-subtle)', color: 'var(--brand-500)' }}
          >
            {brique.status}
          </span>
        </div>
        {brique.origin && (
          <div>
            <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Origem</p>
            <p style={{ color: 'var(--text)', fontFamily: 'var(--font-body)' }}>{brique.origin}</p>
          </div>
        )}
        {brique.phone && (
          <div>
            <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Telefone</p>
            <p style={{ color: 'var(--text)', fontFamily: 'var(--font-body)' }}>{brique.phone}</p>
          </div>
        )}
        {brique.socialMedia && (
          <div>
            <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Rede social</p>
            <p style={{ color: 'var(--text)', fontFamily: 'var(--font-body)' }}>{brique.socialMedia}</p>
          </div>
        )}
        {brique.notes && (
          <div>
            <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Observação</p>
            <p className="whitespace-pre-wrap" style={{ color: 'var(--text)', fontFamily: 'var(--font-body)' }}>{brique.notes}</p>
          </div>
        )}
      </div>

      {brique.invoiceUrl && (
        <div>
          <h2 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Nota fiscal</h2>
          <a
            href={brique.invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline"
            style={{ color: 'var(--brand-400)', fontFamily: 'var(--font-body)' }}
          >
            Abrir nota fiscal
          </a>
        </div>
      )}

      {brique.images && brique.images.length > 0 && (
        <div>
          <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Imagens</h2>
          <div className="flex flex-wrap gap-3">
            {brique.images.map((img) => (
              <a
                key={img.id}
                href={img.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-24 h-24 rounded-lg overflow-hidden border"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-200)' }}
              >
                <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
        Criado em {new Date(brique.createdAt).toLocaleString('pt-BR')} · Atualizado em {new Date(brique.updatedAt).toLocaleString('pt-BR')}
      </p>
    </div>
  );
}
