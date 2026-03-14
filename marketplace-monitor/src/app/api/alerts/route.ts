import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAlertsWithListings } from '@/services/alert-service';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const onlyUnread = searchParams.get('unread') === '1';
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
  try {
    const list = await getAlertsWithListings(session.user.id, { onlyUnread, limit });
    return NextResponse.json(list);
  } catch {
    return NextResponse.json({ error: 'Erro ao listar alertas' }, { status: 500 });
  }
}
