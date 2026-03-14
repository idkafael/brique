import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { isMockMode } from '../lib/mockMode';

const TEST_EMAIL = 'rafael@sistemaxi.com';
const TEST_PASSWORD = '123456'; // mesma senha que o backend usa ao criar usuário de teste

export default function Login() {
  const [email, setEmail] = useState(TEST_EMAIL);
  const [password, setPassword] = useState(TEST_PASSWORD);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');
  const [seedLoading, setSeedLoading] = useState(false);
  const navigate = useNavigate();
  const { loginMockUser } = useAuth();

  const handleSeedTestUser = async () => {
    setSeedMessage('');
    setSeedLoading(true);
    try {
      const res = await fetch('/api/auth/seed-test-user', { method: 'POST' });
      const data = await res.json();
      setSeedMessage(data.ok ? data.message || 'Usuário criado.' : data.error || 'Erro ao criar usuário.');
    } catch {
      setSeedMessage('Erro ao conectar no servidor. Backend está rodando?');
    } finally {
      setSeedLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isMockMode && loginMockUser) {
        loginMockUser(email);
        navigate('/dashboard', { replace: true });
        return;
      }
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) {
        setError(err.message);
        return;
      }
      navigate('/dashboard', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--surface-base)' }}
    >
      <div className="w-full max-w-md">
        <div
          className="rounded-lg border p-8"
          style={{
            background: 'var(--surface-200)',
            borderColor: 'var(--border)',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <h1
            className="text-2xl font-bold text-center mb-2"
            style={{ fontFamily: 'var(--font-header)', color: 'var(--text)' }}
          >
            CRM Brique
          </h1>
          <p
            className="text-sm text-center mb-8"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}
          >
            {isMockMode ? 'Modo demonstração (sem banco)' : 'Acesse sua conta'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[var(--brand-500)] focus:border-[var(--brand-500)]"
                style={{
                  background: 'var(--surface-100)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-body)',
                }}
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[var(--brand-500)] focus:border-[var(--brand-500)]"
                style={{
                  background: 'var(--surface-100)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-body)',
                }}
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="text-sm" style={{ color: 'var(--danger-500)', fontFamily: 'var(--font-body)' }}>
                {error}
              </p>
            )}
            {!isMockMode && seedMessage && (
              <p
                className="text-sm"
                style={{
                  color: seedMessage.startsWith('Erro') ? 'var(--danger-500)' : 'var(--success-500)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {seedMessage}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-3 font-semibold transition-colors disabled:opacity-50"
              style={{
                background: 'var(--brand-500)',
                color: 'var(--text)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
            {!isMockMode && (
              <button
                type="button"
                onClick={handleSeedTestUser}
                disabled={seedLoading}
                className="w-full mt-3 rounded-lg border py-2 text-sm transition-colors disabled:opacity-50"
                style={{
                  background: 'var(--surface-100)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {seedLoading ? 'Criando usuário...' : 'Criar usuário de teste (rafael@sistemaxi.com)'}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
