import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDashboardStats } from '@/services/dashboard-service';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  try {
    const stats = await getDashboardStats(session.user.id);
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({ error: 'Erro ao carregar dashboard' }, { status: 500 });
  }
}
