/**
 * Função serverless da Vercel que expõe o backend NestJS.
 * Usa o AppFactory já existente no backend.
 * Aguarda appPromise antes de atender requests (evita 404 por Nest ainda não inicializado).
 */

const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_JWT_SECRET', 'DATABASE_URL'] as const;
const missing = requiredEnvVars.filter((k) => !process.env[k]);

let appPromise: Promise<unknown> | null = null;
let expressApp: any = null;
let fallbackApp: any = null;

if (missing.length === 0) {
  const { AppFactory } = require('../backend/dist/src/app-factory');
  const created = AppFactory.create();
  appPromise = created.appPromise;
  expressApp = created.expressApp;
  appPromise
    .then(() => {
      console.log('[API] Nest app ready');
    })
    .catch((err: unknown) => {
      console.error('[API] Nest app failed', err);
    });
} else {
  fallbackApp = (_req: unknown, res: any) => {
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
  const before = req?.url || '/';
  const after = before.replace(/^\/api(?=\/|$)/, '') || '/';

  req.url = after;

  console.log('[API DEBUG] incoming request', {
    method: req?.method,
    beforeUrl: before,
    afterUrl: req?.url,
    originalUrl: req?.originalUrl,
  });

  if (appPromise && expressApp) {
    appPromise
      .then(() => {
        expressApp(req, res);
      })
      .catch((err: unknown) => {
        console.error('[API] app not ready', err);
        res
          .status(503)
          .setHeader('Content-Type', 'text/plain; charset=utf-8')
          .send('Backend initializing or error.');
      });
  } else {
    fallbackApp(req, res);
  }
};

export default handler;
