# O que falta para funcionar

## 1. Conectar o **frontend do CRM** ao Supabase

O CRM (React em `frontend/`) hoje só usa Supabase se existir `.env` com as variáveis. Sem isso, roda em **modo demonstração** e a aba **Alertas** só mostra “Conecte o Supabase”.

**Faça:**

1. Na pasta **`frontend/`**, crie o arquivo **`.env`** (pode copiar de `frontend/.env.example`).
2. Preencha com o **mesmo projeto** Supabase que você usa no marketplace-monitor:

```env
VITE_SUPABASE_URL=https://mxpdhkqarqctopxpnuxs.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_I9U7yAMZ9VBSB7-XFkwyDw_7iXwN8Du
```

3. Reinicie o servidor do frontend (`npm run dev` na raiz ou em `frontend/`).

Assim o CRM deixa de usar mock e passa a usar Supabase (login e dados). A aba Alertas (Watchlists, Oportunidades, Notificações) passa a ler/gravar nas tabelas do marketplace.

---

## 2. Migration do marketplace no Supabase

As tabelas do marketplace precisam existir no projeto.

**Faça:**

1. Abra o **Supabase** → seu projeto → **SQL Editor**.
2. Abra o arquivo **`supabase/migrations/003_marketplace_monitor.sql`** (na raiz do projeto).
3. Copie todo o conteúdo, cole no SQL Editor e execute (**Run**).

Isso cria: `marketplace_watchlists`, `marketplace_listings`, `marketplace_matches`, `marketplace_alerts`, `marketplace_scrape_runs`.

---

## 3. Login no CRM com usuário Supabase

Para ver e usar Watchlists / Oportunidades / Alertas, o usuário precisa estar logado **via Supabase** (não em modo demonstração).

**Faça:**

1. Com o `.env` do frontend preenchido (passo 1), acesse o CRM (ex.: `http://localhost:5174`).
2. Na tela de login, use um usuário que exista no **Supabase Auth** (ex.: o que você criou: `rafael@sistemaxi.com` / `1234567`).
3. Depois do login, abra **Alertas** e use as abas Watchlists, Oportunidades e Notificações.

---

## 4. (Opcional) Ter dados em Oportunidades e Notificações

Essas abas mostram dados quando o **scraper** já rodou e gravou em `marketplace_listings`, `marketplace_matches` e `marketplace_alerts`.

**Faça:**

1. Na aba **Alertas** → **Watchlists**, crie pelo menos uma watchlist (ex.: nome “iPhone”, termo “iPhone”) e deixe **Ativa**.
2. Chame o scraper do **marketplace-monitor** (Next.js). Com o app rodando (ex.: `http://localhost:3001`):

   - Se você **não** definiu `CRON_SECRET` no `marketplace-monitor/.env.local`:
     ```bash
     curl "http://localhost:3001/api/cron/scrape"
     ```
   - Se definiu `CRON_SECRET`:
     ```bash
     curl "http://localhost:3001/api/cron/scrape?secret=SEU_CRON_SECRET"
     ```

3. Atualize a página do CRM e confira as abas **Oportunidades** e **Notificações** (o scraper em modo mock gera dados de exemplo).

---

## Checklist rápido

| # | O que fazer | Onde |
|---|-------------|------|
| 1 | Criar `frontend/.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (mesmo projeto) | pasta `frontend/` |
| 2 | Executar `003_marketplace_monitor.sql` no Supabase | Dashboard Supabase → SQL Editor |
| 3 | Reiniciar o frontend e fazer login com usuário Supabase no CRM | navegador |
| 4 | (Opcional) Criar watchlist e chamar `/api/cron/scrape` do marketplace-monitor | aba Alertas + curl ou navegador |

Depois disso, o CRM funciona com Supabase e a aba **Alertas** (as três opções) passa a funcionar de ponta a ponta.
