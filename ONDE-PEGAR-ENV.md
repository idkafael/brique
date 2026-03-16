# Onde pegar cada variável de ambiente

Todas as variáveis abaixo vêm do **mesmo projeto** no Supabase, exceto onde indicado.

---

## No Supabase Dashboard

Acesse: **https://supabase.com/dashboard** → selecione seu projeto (ex.: `mxpdhkqarqctopxpnuxs`).

### 1. **Settings → API**

Menu lateral: **Project Settings** (ícone de engrenagem) → **API**.

| Variável | Onde pegar no Supabase |
|----------|------------------------|
| **Project URL** | Na seção **Project URL**. Ex.: `https://mxpdhkqarqctopxpnuxs.supabase.co` → use como `SUPABASE_URL`, `VITE_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL` |
| **anon public** | Na seção **Project API keys**, linha **anon** **public**. Clique em "Reveal" para copiar. → use como `SUPABASE_ANON_KEY`, `VITE_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **service_role** | Na mesma seção **Project API keys**, linha **service_role**. Clique em "Reveal". **Não exponha no frontend.** → use como `SUPABASE_SERVICE_ROLE_KEY` (só backend e marketplace-monitor) |

### 2. **JWT Secret** (só para o backend NestJS)

Menu: **Project Settings** → **API** → role até **JWT Settings**.

| Variável | Onde pegar |
|----------|------------|
| **JWT Secret** | Em **JWT Settings**, campo **JWT Secret**. Copie o valor. → use como `SUPABASE_JWT_SECRET` no backend. |

---

## Connection string do Postgres (backend NestJS)

Menu: **Project Settings** → **Database**.

Na seção **Connection string** escolha **URI** e copie. A senha é a que você definiu para o usuário `postgres` ao criar o projeto (ou a que está em **Database password** nessa mesma tela).

| Variável | Onde pegar |
|----------|------------|
| **DATABASE_URL** | **Settings → Database** → **Connection string** → **URI**. Formato: `postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres`. Substitua `[YOUR-PASSWORD]` pela senha do banco. |

---

## Variáveis que você inventa (não vêm do Supabase)

| Variável | Onde pegar |
|----------|------------|
| **AUTH_SECRET** | Você cria: uma string aleatória de **pelo menos 32 caracteres**. Usado pelo Auth.js no marketplace-monitor. Ex.: `openssl rand -base64 32` no terminal. |
| **CRON_SECRET** | Opcional. Você cria: uma string secreta para proteger a rota `/api/cron/scrape` do marketplace-monitor. Só precisa se for chamar o cron por URL. |
| **PORT** | Opcional. Número da porta do backend (padrão 3000). |

---

## Resumo por arquivo .env

### `frontend/.env` (CRM React)

| Variável | Onde pegar |
|----------|------------|
| `VITE_SUPABASE_URL` | Supabase → **Settings → API** → **Project URL** |
| `VITE_SUPABASE_ANON_KEY` | Supabase → **Settings → API** → **Project API keys** → **anon** **public** |

---

### `backend/.env` (NestJS)

| Variável | Onde pegar |
|----------|------------|
| `SUPABASE_URL` | Supabase → **Settings → API** → **Project URL** |
| `SUPABASE_ANON_KEY` | Supabase → **Settings → API** → **anon** **public** |
| `SUPABASE_JWT_SECRET` | Supabase → **Settings → API** → **JWT Settings** → **JWT Secret** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → **Settings → API** → **service_role** |
| `DATABASE_URL` | Supabase → **Settings → Database** → **Connection string (URI)** (trocar a senha no lugar certo) |
| `PORT` | Opcional; ex.: `3000` |

---

### `marketplace-monitor/.env.local` (Next.js)

| Variável | Onde pegar |
|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → **Settings → API** → **Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → **Settings → API** → **anon** **public** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → **Settings → API** → **service_role** |
| `AUTH_SECRET` | Você gera (≥ 32 caracteres; ex.: `openssl rand -base64 32`) |
| `CRON_SECRET` | Opcional; você inventa (para proteger `/api/cron/scrape`) |

---

## Caminho rápido no Supabase

1. **Settings** (engrenagem) → **API**  
   → Project URL, anon, service_role  
2. **Settings** → **API** → rolar até **JWT Settings**  
   → JWT Secret  
3. **Settings** → **Database**  
   → Connection string URI (e senha do postgres)

Com isso você consegue preencher todos os `.env` que o projeto usa.

---

## Se o dashboard mostrar "Não autorizado" (401) mesmo após login

O backend valida o JWT do Supabase com **SUPABASE_JWT_SECRET**. Se esse valor estiver errado, todo token é rejeitado.

1. No Supabase: **Project Settings** → **API** → role até **JWT Settings**.
2. Copie o **JWT Secret** (não é a anon key nem a service_role key).
3. No `backend/.env`, defina exatamente: `SUPABASE_JWT_SECRET=<valor copiado>`.
4. Reinicie o backend (`npm run dev` na raiz ou `npm run start:dev` na pasta backend).
5. No frontend, clique em **Sair**, entre de novo e teste o dashboard.
