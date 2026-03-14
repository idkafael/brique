import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { dismiss } from '@/services/alert-service';

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
    await dismiss(id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao dispensar' }, { status: 500 });
  }
}
