import { NextResponse } from 'next/server';

/**
 * Endpoint de cron desativado: o preenchimento das tabelas de marketplace
 * será feito futuramente via API externa, não mais via scraper interno.
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Scraper desativado. Use a API de marketplace planejada para popular os dados.' },
    { status: 501 }
  );
}
