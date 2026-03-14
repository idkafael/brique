import Link from 'next/link';
import { auth } from '@/auth';
import { getWatchlist } from '@/services/watchlist-service';
import { notFound } from 'next/navigation';
import { WatchlistForm } from '@/app/(app)/watchlists/nova/form';

export default async function EditarWatchlistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const { id } = await params;
  const w = await getWatchlist(id, session.user.id);
  if (!w) notFound();

  const initial = {
    id: w.id,
    name: w.name,
    searchTerm: w.searchTerm,
    minPrice: w.minPrice,
    maxPrice: w.maxPrice,
    state: w.state,
    city: w.city,
    isActive: w.isActive,
  };

  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/watchlists" className="text-gray-400 hover:text-white text-sm">
          ← Voltar
        </Link>
        <h2 className="text-xl font-semibold text-white">Editar watchlist</h2>
      </div>
      <WatchlistForm initial={initial} />
    </>
  );
}
