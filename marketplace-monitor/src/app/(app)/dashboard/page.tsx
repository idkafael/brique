import { auth } from '@/auth';
import { getDashboardStats } from '@/services/dashboard-service';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const stats = await getDashboardStats(session.user.id);

  return (
    <>
      <h2 className="text-xl font-semibold text-white mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
          <p className="text-sm text-gray-400">Watchlists ativas</p>
          <p className="text-2xl font-bold text-white">{stats.activeWatchlists}</p>
        </div>
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
          <p className="text-sm text-gray-400">Anúncios capturados</p>
          <p className="text-2xl font-bold text-white">{stats.totalListings}</p>
        </div>
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
          <p className="text-sm text-gray-400">Matches</p>
          <p className="text-2xl font-bold text-white">{stats.totalMatches}</p>
        </div>
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
          <p className="text-sm text-gray-400">Alertas não lidos</p>
          <p className="text-2xl font-bold text-white">{stats.unreadAlerts}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Top cidades</h3>
          {stats.topCities.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum dado ainda.</p>
          ) : (
            <ul className="space-y-2">
              {stats.topCities.map(({ city, count }) => (
                <li key={city} className="flex justify-between text-sm">
                  <span className="text-gray-300">{city}</span>
                  <span className="text-white">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Top termos monitorados</h3>
          {stats.topTerms.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum dado ainda.</p>
          ) : (
            <ul className="space-y-2">
              {stats.topTerms.map(({ searchTerm, count }) => (
                <li key={searchTerm} className="flex justify-between text-sm">
                  <span className="text-gray-300 truncate mr-2">{searchTerm}</span>
                  <span className="text-white">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-gray-700 bg-gray-900 p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Evolução diária de matches (últimos 7 dias)</h3>
        {stats.matchesByDay.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum match no período.</p>
        ) : (
          <ul className="space-y-2">
            {stats.matchesByDay.map(({ date, count }) => (
              <li key={date} className="flex justify-between text-sm">
                <span className="text-gray-300">{date}</span>
                <span className="text-white">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
