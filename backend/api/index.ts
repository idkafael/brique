/**
 * Handler para deploy do backend na Vercel (serverless).
 * Exporta a instância Express do NestJS para atender todas as rotas.
 */
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_JWT_SECRET', 'DATABASE_URL'];
const missing = requiredEnvVars.filter((k) => !process.env[k]);

let app: any;
if (missing.length === 0) {
  const { AppFactory } = require('../app-factory');
  app = AppFactory.create().expressApp;
} else {
  app = (_req: unknown, res: { status: (n: number) => { send: (s: string) => void }; setHeader: (k: string, v: string) => void }) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(503).send(`Backend: faltam variáveis na Vercel: ${missing.join(', ')}. Defina em Settings → Environment Variables: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_JWT_SECRET, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL.`);
  };
}

export default app;
