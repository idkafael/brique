import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getWatchlists, createWatchlist } from '@/services/watchlist-service';
import type { WatchlistInsert } from '@/types';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  try {
    const list = await getWatchlists(session.user.id);
    return NextResponse.json(list);
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao listar watchlists' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  try {
    const body = (await request.json()) as WatchlistInsert;
    const created = await createWatchlist(session.user.id, body);
    return NextResponse.json(created);
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao criar watchlist' }, { status: 500 });
  }
}
