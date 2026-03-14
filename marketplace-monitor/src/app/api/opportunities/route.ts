import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getOpportunities } from '@/services/opportunities-service';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  try {
    const list = await getOpportunities(session.user.id);
    return NextResponse.json(list);
  } catch {
    return NextResponse.json({ error: 'Erro ao listar oportunidades' }, { status: 500 });
  }
}
