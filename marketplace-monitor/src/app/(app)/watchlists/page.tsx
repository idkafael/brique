import Link from 'next/link';
import { auth } from '@/auth';
import { getWatchlists } from '@/services/watchlist-service';

export default async function WatchlistsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const watchlists = await getWatchlists(session.user.id);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Watchlists</h2>
        <Link
          href="/watchlists/nova"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Nova watchlist
        </Link>
      </div>

      {watchlists.length === 0 ? (
        <p className="text-gray-400">Nenhuma watchlist. Crie uma para começar.</p>
      ) : (
        <div className="rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-900/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Nome</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Termo</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Preço</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Local</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Ativa</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {watchlists.map((w) => (
                <tr key={w.id} className="border-b border-gray-800 hover:bg-gray-900/30">
                  <td className="py-3 px-4 text-white font-medium">{w.name}</td>
                  <td className="py-3 px-4 text-gray-300">{w.searchTerm}</td>
                  <td className="py-3 px-4 text-gray-300">
                    {w.minPrice != null || w.maxPrice != null
                      ? `${w.minPrice ?? '—'} - ${w.maxPrice ?? '—'}`
                      : '—'}
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {[w.city, w.state].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex rounded px-2 py-0.5 text-xs ${
                        w.isActive ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {w.isActive ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/watchlists/${w.id}/editar`}
                      className="text-sm text-blue-400 hover:underline mr-3"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
