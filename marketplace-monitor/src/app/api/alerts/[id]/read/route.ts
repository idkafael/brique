import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { markRead } from '@/services/alert-service';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  const { id } = await params;
  try {
    await markRead(id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao marcar como lido' }, { status: 500 });
  }
}
