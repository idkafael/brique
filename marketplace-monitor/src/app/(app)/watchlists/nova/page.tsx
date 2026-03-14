import Link from 'next/link';
import { WatchlistForm } from './form';

export default function NovaWatchlistPage() {
  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/watchlists" className="text-gray-400 hover:text-white text-sm">
          ← Voltar
        </Link>
        <h2 className="text-xl font-semibold text-white">Nova watchlist</h2>
      </div>
      <WatchlistForm />
    </>
  );
}
