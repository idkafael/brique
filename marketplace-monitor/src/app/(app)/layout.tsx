import Link from 'next/link';
import { auth } from '@/auth';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 bg-gray-900/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-white">Marketplace Monitor</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{session?.user?.email}</span>
            <Link
              href="/api/auth/signout"
              className="text-sm text-gray-400 hover:text-white"
            >
              Sair
            </Link>
          </div>
        </div>
      </header>
      <nav className="border-b border-gray-800 px-6 py-2 flex gap-6">
        <Link href="/dashboard" className="py-3 text-sm text-gray-400 hover:text-white">
          Dashboard
        </Link>
        <Link href="/watchlists" className="py-3 text-sm text-gray-400 hover:text-white">
          Watchlists
        </Link>
        <Link href="/oportunidades" className="py-3 text-sm text-gray-400 hover:text-white">
          Oportunidades
        </Link>
        <Link href="/alertas" className="py-3 text-sm text-gray-400 hover:text-white">
          Alertas
        </Link>
      </nav>
      <main className="p-6 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}
