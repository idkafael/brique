import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const OBJETIVO_10K = 10000;
const FATURAMENTO_EXEMPLO = 688.79;
const PERCENTUAL_EXEMPLO = 7;

/** Formata a data para exibição (sempre usa a data atual do sistema – atualiza ao abrir/recarregar a página). */
function formatDate(d: Date) {
  const months = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
  return `${d.getDate()} DE ${months[d.getMonth()]} DE ${d.getFullYear()}`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(value);
}

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const displayName =
    user?.name?.trim() ||
    (user?.email ? user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1).toLowerCase() : null) ||
    'Usuário';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const percentual = PERCENTUAL_EXEMPLO;
  const valor = FATURAMENTO_EXEMPLO;

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-base)' }}>
      <header
        className="px-6 py-4 border-b"
        style={{
          background: 'var(--surface-base)',
          borderColor: 'var(--border)',
          fontFamily: 'var(--font-body)',
        }}
      >
        <div className="relative flex items-center justify-between max-w-7xl mx-auto gap-6">
          {/* Card Faturamento – igual à referência: fundo azul escuro, círculo azul claro, barra azul */}
          <Link
            to="/dashboard"
            className="flex items-center gap-4 shrink-0"
            style={{
              background: 'var(--surface-200)',
              border: '1px solid var(--border)',
              borderRadius: '9999px',
              padding: '10px 20px 10px 10px',
            }}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold shrink-0"
              style={{
                background: 'var(--brand-400)',
                color: '#fff',
              }}
            >
              R$
            </span>
            <div className="min-w-0 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium uppercase tracking-wide text-sm" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>
                  Faturamento
                </span>
                <span className="font-medium text-sm" style={{ fontFamily: 'var(--font-body)', color: 'var(--brand-400)' }}>
                  {percentual}%
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: 'var(--surface-300)', width: '140px' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${percentual}%`,
                    background: 'var(--brand-400)',
                    minWidth: percentual > 0 ? '4px' : 0,
                  }}
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-base" style={{ fontFamily: 'var(--font-body)', color: 'var(--text)' }}>
                  {formatMoney(valor)}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 400 }}>
                  {' '}/ 10k
                </span>
              </div>
            </div>
          </Link>

          {/* Centro: saudação + data + nav – centralizado no meio do header */}
          <div className="absolute left-1/2 top-1/2 flex flex-col items-center justify-center text-center -translate-x-1/2 -translate-y-1/2">
            <p style={{ fontSize: '20px', fontFamily: 'var(--font-header)', fontWeight: 500, color: 'var(--text-secondary)' }}>
              {getGreeting()},{' '}
              <span style={{ color: 'var(--brand-400)' }}>{displayName}</span>
            </p>
            <p
              className="uppercase tracking-wide text-sm font-normal"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
            >
              {formatDate(new Date())}
            </p>
            <nav className="flex items-center justify-center gap-4 mt-2">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `text-sm font-medium hover:text-white ${isActive ? 'text-white' : 'text-muted'}`
                }
                style={{ fontFamily: 'var(--font-header)' }}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/briques"
                className={({ isActive }) =>
                  `text-sm font-medium hover:text-white ${isActive ? 'text-white' : 'text-muted'}`
                }
                style={{ fontFamily: 'var(--font-header)' }}
              >
                Briques
              </NavLink>
              <NavLink
                to="/alertas"
                className={({ isActive }) =>
                  `text-sm font-medium hover:text-white ${isActive ? 'text-white' : 'text-muted'}`
                }
                style={{ fontFamily: 'var(--font-header)' }}
              >
                Alertas
              </NavLink>
            </nav>
          </div>

          {/* Direita: ícones em card – SharkBot: surface-200, border, 8px */}
          <div
            className="flex items-center rounded-lg px-4 py-3 border shrink-0"
            style={{ background: 'var(--surface-200)', borderColor: 'var(--border)', borderRadius: '8px' }}
          >
            <button
              type="button"
              onClick={handleSignOut}
              className="text-xs font-medium transition-colors hover:opacity-90"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6" style={{ fontFamily: 'var(--font-body)' }}>
        <Outlet />
      </main>
    </div>
  );
}
