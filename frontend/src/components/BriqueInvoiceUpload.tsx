import { useState } from 'react';
import { supabase } from '../lib/supabase';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { isMockMode } from '../lib/mockMode';

const BUCKET = 'brique-images';

interface BriqueInvoiceUploadProps {
  briqueId: string;
  currentInvoiceUrl: string | null;
  onUploaded?: () => void;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function BriqueInvoiceUpload({ briqueId, currentInvoiceUrl, onUploaded }: BriqueInvoiceUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setError('');
    setUploading(true);
    try {
      if (isMockMode) {
        const dataUrl = await readFileAsDataUrl(file);
        await api.patch(`/briques/${briqueId}`, { invoiceUrl: dataUrl });
        onUploaded?.();
        e.target.value = '';
        return;
      }
      const ext = file.name.split('.').pop() || 'pdf';
      const path = `invoices/${user.id}/${briqueId}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (uploadErr) {
        setError(uploadErr.message);
        return;
      }
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
      await api.patch(`/briques/${briqueId}`, { invoiceUrl: urlData.publicUrl });
      onUploaded?.();
      e.target.value = '';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar');
    } finally {
      setUploading(false);
    }
  };

  const labelStyle = { fontFamily: 'var(--font-body)', color: 'var(--text-muted)' };

  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={labelStyle}>
        Nota fiscal (PDF ou imagem)
      </label>
      {currentInvoiceUrl && (
        <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
          Nota anexada.{' '}
          <a
            href={currentInvoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: 'var(--brand-400)' }}
          >
            Abrir arquivo
          </a>
        </p>
      )}
      <div className="flex items-center gap-3">
        <label
          className="rounded-lg border border-dashed px-4 py-3 text-sm cursor-pointer transition-colors"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface-100)',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-body)',
          }}
        >
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={handleFile}
            disabled={uploading}
            className="hidden"
          />
          {uploading ? 'Enviando...' : currentInvoiceUrl ? 'Substituir nota fiscal' : 'Selecionar arquivo'}
        </label>
      </div>
      {error && (
        <p className="text-sm mt-2" style={{ color: 'var(--danger-500)', fontFamily: 'var(--font-body)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
