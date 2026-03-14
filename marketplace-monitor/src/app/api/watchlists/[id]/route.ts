import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getWatchlist, updateWatchlist, deleteWatchlist } from '@/services/watchlist-service';
import type { WatchlistUpdate } from '@/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  const { id } = await params;
  const w = await getWatchlist(id, session.user.id);
  if (!w) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  return NextResponse.json(w);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  const { id } = await params;
  const body = (await request.json()) as WatchlistUpdate;
  try {
    const updated = await updateWatchlist(id, session.user.id, body);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Não encontrado ou erro ao atualizar' }, { status: 404 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  const { id } = await params;
  try {
    await deleteWatchlist(id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Não encontrado ou erro ao excluir' }, { status: 404 });
  }
}
