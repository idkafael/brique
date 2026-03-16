/**
 * Função serverless da Vercel que expõe o backend NestJS.
 * Usa o AppFactory já existente no backend.
 */

const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_JWT_SECRET', 'DATABASE_URL'] as const;
const missing = requiredEnvVars.filter((k) => !process.env[k]);

let app: any;

if (missing.length === 0) {
  const { AppFactory } = require('../backend/dist/src/app-factory');
  app = AppFactory.create().expressApp;
} else {
  app = (_req: unknown, res: any) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res
      .status(503)
      .send(
        `Backend: faltam variáveis na Vercel: ${missing.join(
          ', '
        )}. Defina em Settings → Environment Variables: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_JWT_SECRET, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL.`
      );
  };
}

const handler = (req: any, res: any) => {
  console.log('[API DEBUG] incoming request', {
    method: req?.method,
    url: req?.url,
    originalUrl: req?.originalUrl,
  });

  return app(req, res);
};

export default handler;
