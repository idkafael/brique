# Deploy na Vercel

O **frontend** (React/Vite) e o **backend** (NestJS) podem ser implantados na Vercel: o frontend como site estático e o backend como um **segundo projeto** na Vercel (serverless). Assim tudo fica na Vercel, sem precisar de Railway/Render.

---

## 1. Deploy do frontend na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login (GitHub/GitLab/Bitbucket).
2. **Import** o repositório do projeto.
3. Nas configurações do projeto na Vercel:
   - **Root Directory:** `frontend`  
     (assim a Vercel usa a pasta `frontend` como raiz do deploy)
   - **Build Command:** `npm run build` (padrão)
   - **Output Directory:** `dist` (padrão para Vite)
   - **Install Command:** `npm install` (padrão)
4. **Environment Variables** (em Settings → Environment Variables ou no passo de import):
   - `VITE_SUPABASE_URL` — URL do projeto Supabase (ex.: `https://xxx.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY` — Chave anon/public do Supabase
   - `VITE_API_URL` — URL base do backend em produção  
     Se o backend estiver na Vercel (projeto 2), use a URL do projeto backend (ex.: `https://crm-brique-api.vercel.app`).  
     Sem essa variável, o frontend tenta usar `/api` (proxy local), o que não existe na Vercel.
5. Faça o deploy. O app ficará em `https://seu-projeto.vercel.app`.

O arquivo `frontend/vercel.json` já está configurado para SPA (todas as rotas caem em `index.html`).

---

## 2. Deploy do backend na Vercel (recomendado: tudo na Vercel)

O backend NestJS está preparado para rodar como **serverless** na Vercel (via `backend/api/index.ts` e `backend/vercel.json`).

1. Na Vercel, crie **outro projeto** a partir do **mesmo repositório**.
2. Nas configurações desse segundo projeto:
   - **Root Directory:** `backend`  
     (assim a Vercel usa a pasta `backend` como raiz do deploy)
   - **Build Command:** `npm run build` (padrão)
   - Não é necessário definir Output Directory; as rotas são atendidas pela função em `api/`.
3. **Environment Variables** (as mesmas do backend em produção):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_JWT_SECRET`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL` (connection string do Postgres do Supabase)
4. Faça o deploy. A API ficará em algo como `https://crm-brique-api.vercel.app` (ou o nome que você der ao projeto).
5. No **projeto do frontend**, defina `VITE_API_URL` = URL desse projeto backend (ex.: `https://crm-brique-api.vercel.app`).

**Observação:** cold start pode deixar a primeira requisição após um tempo de inatividade um pouco mais lenta. Conexão com Postgres (Supabase) costuma funcionar bem em serverless.

---

## 3. Deploy do backend em outro serviço (alternativa)

Se preferir não usar o backend na Vercel, use um destes:

- **Railway:** [railway.app](https://railway.app) — conecte o repo, defina a **root** como `backend`, configure as env e faça deploy.
- **Render:** [render.com](https://render.com) — crie um **Web Service**, repo com root `backend`, build `npm install && npm run build`, start `npm run start:prod` (ou `node dist/main`).
- **Fly.io:** [fly.io](https://fly.io) — crie um `Dockerfile` para o backend ou use o buildpack Node.

### Variáveis de ambiente do backend (produção)

Defina no painel do serviço (Vercel ou outro):

| Variável | Descrição |
|----------|-----------|
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_ANON_KEY` | Chave anon do Supabase |
| `SUPABASE_JWT_SECRET` | JWT Secret (Legacy) do Supabase (Settings → API → JWT) |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service_role do Supabase |
| `DATABASE_URL` | Connection string do Postgres (Supabase: Settings → Database) |
| `PORT` | Porta (só em hosts tradicionais; na Vercel não é necessária) |

No backend, o `.env` em desenvolvimento é carregado com `dotenv` no `main.ts`; em produção o host injeta as variáveis.

### CORS

O backend já usa `app.enableCors({ origin: true, credentials: true })`. Em produção você pode restringir para o domínio do frontend, por exemplo:

```ts
app.enableCors({
  origin: ['https://seu-projeto.vercel.app'],
  credentials: true,
});
```

(Se quiser, isso pode ser controlado por uma variável de ambiente como `FRONTEND_URL`.)

---

## 4. Resumo do fluxo (tudo na Vercel)

1. **Projeto 1 (frontend):** Root = `frontend`, env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` = URL do projeto 2.
2. **Projeto 2 (backend):** Root = `backend`, env: `SUPABASE_*`, `DATABASE_URL`.
3. Migrations do Supabase já aplicadas (incluindo `003_marketplace_monitor.sql` se usar Alertas/Marketplace).

Assim, o app (projeto 1) chama a API (projeto 2) pela URL em `VITE_API_URL` e o Supabase (Auth + DB + Storage) segue igual ao desenvolvimento.
