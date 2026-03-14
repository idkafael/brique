import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import type { Brique, BriqueImage, BriqueStatus } from '../types/brique';
import { ORIGIN_OPTIONS } from '../types/brique';
import BriqueImageUpload from '../components/BriqueImageUpload';
import BriqueInvoiceUpload from '../components/BriqueInvoiceUpload';

type TabId = 'dados' | 'imagem' | 'nota';

const cardStyle = {
  background: 'var(--surface-200)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
};

const inputClass =
  'w-full rounded-lg border focus:outline-none focus:ring-1 focus:ring-[var(--brand-500)] focus:border-[var(--brand-500)]';
const inputStyle = {
  background: 'var(--surface-100)',
  borderColor: 'var(--border)',
  color: 'var(--text)',
  fontFamily: 'var(--font-body)',
  padding: '10px 12px',
};
const labelStyle = { fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '14px' };

export default function BriqueForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [activeTab, setActiveTab] = useState<TabId>('dados');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<BriqueImage[]>([]);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    purchaseValue: '',
    saleValue: '',
    status: 'à venda' as BriqueStatus,
    origin: '',
    phone: '',
    socialMedia: '',
    notes: '',
    entryDate: new Date().toISOString().slice(0, 10),
    exitDate: '',
  });

  const loadBrique = () => {
    if (!id) return;
    api.get<Brique>(`/briques/${id}`).then((res) => {
      const b = res.data;
      setForm({
        title: b.title,
        purchaseValue: String(b.purchaseValue),
        saleValue: String(b.saleValue),
        status: b.status,
        origin: b.origin || '',
        phone: b.phone || '',
        socialMedia: b.socialMedia || '',
        notes: b.notes || '',
        entryDate: b.entryDate ? b.entryDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
        exitDate: b.exitDate ? b.exitDate.slice(0, 10) : '',
      });
      setImages(b.images || []);
      setInvoiceUrl(b.invoiceUrl || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    loadBrique();
  }, [id]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        purchaseValue: Number(form.purchaseValue) || 0,
        saleValue: Number(form.saleValue) || 0,
        status: form.status,
        origin: form.origin || undefined,
        phone: form.phone || undefined,
        socialMedia: form.socialMedia || undefined,
        notes: form.notes || undefined,
        entryDate: form.entryDate,
        exitDate: form.exitDate || undefined,
      };
      if (isEdit) {
        await api.patch(`/briques/${id}`, payload);
        navigate('/briques', { replace: true });
      } else {
        const res = await api.post<Brique>('/briques', payload);
        navigate(`/briques/${res.data.id}/editar`, { replace: true });
      }
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'dados', label: 'Dados' },
    { id: 'imagem', label: 'Imagem do produto' },
    { id: 'nota', label: 'Nota fiscal' },
  ];

  if (loading) {
    return <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Carregando...</p>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Barra superior – estilo SharkBot fluxos: Voltar | Título | Salvar */}
      <div
        className="flex items-center justify-between flex-wrap gap-4"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        <div className="flex items-center gap-4">
          <Link
            to="/briques"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </Link>
          <h1
            className="text-lg font-semibold"
            style={{ color: 'var(--text)' }}
          >
            {isEdit ? 'Editar brique' : 'Nova brique'}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          style={{
            background: 'var(--surface-100)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          {saving ? 'Salvando...' : 'Salvar configuração'}
        </button>
      </div>

      {/* Abas horizontais – cantos arredondados como SharkBot */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className="rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
            style={{
              fontFamily: 'var(--font-body)',
              ...(activeTab === tab.id
                ? { background: 'var(--surface-200)', color: 'var(--text)', border: '1px solid var(--border)' }
                : { background: 'transparent', color: 'var(--text-muted)' }),
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="space-y-6">
        {activeTab === 'dados' && (
          <div className="p-6 space-y-5" style={cardStyle}>
            <div>
              <h2 className="flex items-center gap-2 text-base font-medium mb-1" style={{ color: 'var(--text)', fontFamily: 'var(--font-header)' }}>
                <span className="text-lg">📋</span>
                Dados da brique
              </h2>
              <p className="text-sm mb-4" style={labelStyle}>
                Preencha as informações do produto.
              </p>
            </div>
            <div>
              <label className="block font-medium mb-2" style={labelStyle}>Título *</label>
              <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required className={inputClass} style={inputStyle} placeholder="Ex.: iPhone 14 Pro" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-2" style={labelStyle}>Valor de compra *</label>
                <input type="number" step="0.01" min="0" value={form.purchaseValue} onChange={(e) => setForm((f) => ({ ...f, purchaseValue: e.target.value }))} required className={inputClass} style={inputStyle} placeholder="0,00" />
              </div>
              <div>
                <label className="block font-medium mb-2" style={labelStyle}>Valor de venda *</label>
                <input type="number" step="0.01" min="0" value={form.saleValue} onChange={(e) => setForm((f) => ({ ...f, saleValue: e.target.value }))} required className={inputClass} style={inputStyle} placeholder="0,00" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-2" style={labelStyle}>Data de entrada *</label>
                <input type="date" value={form.entryDate} onChange={(e) => setForm((f) => ({ ...f, entryDate: e.target.value }))} required className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className="block font-medium mb-2" style={labelStyle}>Data de saída (opcional)</label>
                <input type="date" value={form.exitDate} onChange={(e) => setForm((f) => ({ ...f, exitDate: e.target.value }))} className={inputClass} style={inputStyle} />
              </div>
            </div>
            <div>
              <label className="block font-medium mb-2" style={labelStyle}>Status *</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as BriqueStatus }))} className={inputClass} style={inputStyle}>
                <option value="à venda">À venda</option>
                <option value="vendido">Vendido</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-2" style={labelStyle}>Origem</label>
              <select value={form.origin} onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))} className={inputClass} style={inputStyle}>
                <option value="">Selecione uma origem</option>
                {ORIGIN_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-2" style={labelStyle}>Telefone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inputClass} style={inputStyle} placeholder="(00) 00000-0000" />
              </div>
              <div>
                <label className="block font-medium mb-2" style={labelStyle}>Rede social</label>
                <input type="text" value={form.socialMedia} onChange={(e) => setForm((f) => ({ ...f, socialMedia: e.target.value }))} className={inputClass} style={inputStyle} placeholder="@usuario" />
              </div>
            </div>
            <div>
              <label className="block font-medium mb-2" style={labelStyle}>Observação</label>
              <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} className={inputClass + ' resize-none'} style={inputStyle} placeholder="Anotações sobre o produto..." />
            </div>
          </div>
        )}

        {activeTab === 'imagem' && (
          <div className="p-6" style={cardStyle}>
            <h2 className="flex items-center gap-2 text-base font-medium mb-1" style={{ color: 'var(--text)', fontFamily: 'var(--font-header)' }}>
              <span className="text-lg">🖼️</span>
              Imagem do produto
            </h2>
            <p className="text-sm mb-4" style={labelStyle}>
              Adicione fotos do produto (opcional).
            </p>
            {id ? (
              <>
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    {images.map((img) => (
                      <div key={img.id} className="w-20 h-20 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)', background: 'var(--surface-100)' }}>
                        <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                <BriqueImageUpload briqueId={id} onUploaded={loadBrique} />
              </>
            ) : (
              <p className="text-sm py-4" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                Salve a brique primeiro para adicionar imagens do produto.
              </p>
            )}
          </div>
        )}

        {activeTab === 'nota' && (
          <div className="p-6" style={cardStyle}>
            <h2 className="flex items-center gap-2 text-base font-medium mb-1" style={{ color: 'var(--text)', fontFamily: 'var(--font-header)' }}>
              <span className="text-lg">📄</span>
              Nota fiscal
            </h2>
            <p className="text-sm mb-4" style={labelStyle}>
              Anexe a nota fiscal do produto (opcional).
            </p>
            {id ? (
              <BriqueInvoiceUpload
                briqueId={id}
                currentInvoiceUrl={invoiceUrl}
                onUploaded={loadBrique}
              />
            ) : (
              <p className="text-sm py-4" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                Salve a brique primeiro para anexar a nota fiscal.
              </p>
            )}
          </div>
        )}

        {/* Botões no rodapé (mobile / redundante com o da barra) */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
            style={{ background: 'var(--brand-500)', color: 'var(--text)', fontFamily: 'var(--font-body)' }}
          >
            {saving ? 'Salvando...' : isEdit ? 'Salvar' : 'Salvar e continuar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/briques')}
            className="rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors"
            style={{ background: 'transparent', borderColor: 'var(--border)', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
