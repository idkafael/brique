# Guia para começar – Marketplace Monitor

## 1. Instalar e subir o projeto

```bash
cd marketplace-monitor
npm install
npm run dev
```

O app sobe em **http://localhost:3001**.

---

## 2. Configurar variáveis de ambiente

Na pasta `marketplace-monitor`, crie o arquivo **`.env.local`** com:

```env
# Supabase (obrigatório)
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Auth.js (obrigatório) – use uma string aleatória de pelo menos 32 caracteres
AUTH_SECRET=minha-chave-secreta-com-32-chars-ou-mais

# Opcional – só se for usar execução automática do scraper
CRON_SECRET=outro-secret
```

Onde achar no Supabase:

- **URL e chaves:** Dashboard do projeto → **Settings** → **API**  
  - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`  
  - `anon` `public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
  - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

---

## 3. Rodar a migration no Supabase

1. Abra o **Supabase Dashboard** do seu projeto.
2. Vá em **SQL Editor**.
3. Abra o arquivo **`supabase/migrations/003_marketplace_monitor.sql`** (na raiz do repositório, pasta `supabase/migrations`).
4. Copie todo o conteúdo e execute no SQL Editor.

Isso cria as tabelas: `marketplace_watchlists`, `marketplace_listings`, `marketplace_matches`, `marketplace_alerts`, `marketplace_scrape_runs`.

---

## 4. Criar um usuário para login

O login usa **Supabase Auth** (email/senha):

1. No Supabase: **Authentication** → **Users** → **Add user** → **Create new user**.
2. Preencha **Email** e **Password** e crie o usuário.

Use esse mesmo email e senha para entrar no Marketplace Monitor.

---

## 5. Usar o app

1. Acesse **http://localhost:3001**.
2. Na tela de login, informe o **email** e **senha** do usuário criado no Supabase.
3. Depois de logar você verá:
   - **Dashboard** – totais (watchlists ativas, anúncios, matches, alertas não lidos) e gráficos.
   - **Watchlists** – criar e editar listas de monitoramento (termo, preço, estado, cidade).
   - **Oportunidades** – anúncios que bateram com suas watchlists.
   - **Alertas** – notificações de novos matches.

---

## 6. Primeiro fluxo (teste com mock)

1. Vá em **Watchlists** → **Nova watchlist**.
2. Preencha, por exemplo:
   - Nome: `iPhone`
   - Termo de busca: `iPhone`
   - Preço mínimo/máximo e local (opcional).
3. Salve e deixe a watchlist **ativa**.
4. Para simular a coleta, chame o scraper (ele usa dados mock):
   - No navegador ou no terminal:
     ```bash
     curl "http://localhost:3001/api/cron/scrape?secret=SEU_CRON_SECRET"
     ```
   - Se você **não** definiu `CRON_SECRET` no `.env.local`, use:
     ```bash
     curl "http://localhost:3001/api/cron/scrape"
     ```
5. Depois disso, confira **Oportunidades** e **Alertas** – devem aparecer itens de exemplo.

---

## Resumo rápido

| Passo | O que fazer |
|-------|-------------|
| 1 | `cd marketplace-monitor && npm install && npm run dev` |
| 2 | Criar `.env.local` com Supabase + `AUTH_SECRET` |
| 3 | Executar `003_marketplace_monitor.sql` no Supabase |
| 4 | Criar um usuário em Authentication → Users |
| 5 | Acessar http://localhost:3001 e fazer login |
| 6 | Criar uma watchlist e chamar `/api/cron/scrape` para testar |

Se algo falhar, confira se as variáveis do `.env.local` estão corretas e se a migration foi executada sem erros no SQL Editor.
