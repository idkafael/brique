# Marketplace Monitor – Módulo CRM

Módulo de monitoramento de oportunidades do Facebook Marketplace para o CRM. Next.js (App Router), TypeScript, Tailwind, Supabase e Auth.js.

## Estrutura de pastas

```
marketplace-monitor/
├── src/
│   ├── app/
│   │   ├── (app)/                    # Rotas autenticadas (layout compartilhado)
│   │   │   ├── dashboard/
│   │   │   ├── watchlists/           # Listagem, nova, [id]/editar
│   │   │   ├── oportunidades/
│   │   │   └── alertas/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── watchlists/
│   │   │   ├── alerts/
│   │   │   ├── dashboard/
│   │   │   ├── opportunities/
│   │   │   └── cron/scrape/          # Execução periódica do scraper
│   │   ├── login/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── auth.ts                       # Auth.js (Credentials + Supabase)
│   ├── middleware.ts                 # Proteção de rotas
│   ├── lib/supabase/                 # Cliente Supabase (server + client)
│   ├── repositories/                # Acesso a dados (watchlists, listings, matches, alerts, scrape_runs)
│   ├── services/                     # Lógica de negócio (watchlist, dashboard, alert, opportunities)
│   ├── scraper/                      # Módulo scraper (normalize, dedupe, match, run, mock-adapter)
│   └── types/                        # Tipos e database
├── package.json
└── README.md
```

## Pré-requisitos

- Node 18+
- Conta Supabase (projeto criado)
- Usuários em `auth.users` (Supabase Auth) para login

## Configuração

### 1. Variáveis de ambiente

Crie `marketplace-monitor/.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Auth.js
AUTH_SECRET=uma-string-aleatoria-longa-min-32-chars

# Opcional: proteção do cron (execução periódica)
CRON_SECRET=outro-secret-se-usar-cron-externo
```

O servidor usa `SUPABASE_SERVICE_ROLE_KEY` para acessar o Supabase (RLS bypass). A autorização é feita na aplicação via `user_id` da sessão Auth.js.

### 2. Banco de dados (Supabase)

Execute a migration do módulo no SQL Editor do Supabase:

- Arquivo: `../supabase/migrations/003_marketplace_monitor.sql` (na raiz do monorepo: `supabase/migrations/003_marketplace_monitor.sql`).

Ela cria:

- `marketplace_watchlists`
- `marketplace_listings`
- `marketplace_matches`
- `marketplace_alerts`
- `marketplace_scrape_runs`

com RLS e índices.

### 3. Auth (login)

O login usa Auth.js com provider **Credentials**, que valida email/senha no **Supabase Auth**. Os usuários precisam existir em Supabase (Auth > Users). Crie um usuário de teste pelo dashboard do Supabase ou via API.

## Instalação e execução

```bash
cd marketplace-monitor
npm install
npm run dev
```

Acesse: `http://localhost:3001`. Faça login com um usuário Supabase Auth.

## Execução periódica do scraper (sem Redis)

O scraper roda por watchlist ativa: busca anúncios (mock ou adapter real), normaliza, deduplica, persiste listings e gera matches + alertas quando há correspondência.

### Opção A – Chamada manual (GET)

Proteção por `CRON_SECRET` (header ou query):

```bash
curl -H "Authorization: Bearer SEU_CRON_SECRET" "http://localhost:3001/api/cron/scrape"
# ou
curl "http://localhost:3001/api/cron/scrape?secret=SEU_CRON_SECRET"
```

### Opção B – Vercel Cron

Em `vercel.json`:

```json
{
  "crons": [{ "path": "/api/cron/scrape", "schedule": "0 * * * *" }]
}
```

Defina `CRON_SECRET` nas variáveis de ambiente do Vercel e valide no handler (já implementado).

### Opção C – Cron job / GitHub Actions

Agende um GET para `https://seu-dominio.com/api/cron/scrape` com `Authorization: Bearer SEU_CRON_SECRET` na frequência desejada.

## Integração com o CRM principal

- O módulo é uma app Next.js separada (porta 3001). Para integrar ao CRM existente (ex.: React Vite na raiz):
  - **Subdomínio ou path reverso:** exponha o Next.js em algo como `https://crm.seudominio.com/marketplace` ou `https://marketplace.seudominio.com`.
  - **Link no menu:** adicione no layout do CRM um link para a URL do Marketplace Monitor.
- **Converter em brique:** a tela de oportunidades tem o botão “Converter em brique (em breve)”. Para implementar, crie uma API no backend do CRM (ou no Next.js) que receba o `listing_id` (e dados necessários) e crie um registro na tabela `briques` do CRM, redirecionando depois para o fluxo de briques.

## Scraper real (Facebook Marketplace)

A pasta `src/scraper/` está preparada para trocar o **mock adapter** por um adapter real:

- `src/scraper/types.ts` – interface `ScraperAdapter` e `RawListing`.
- `src/scraper/mock-adapter.ts` – implementação mock (retorno fixo).
- `src/scraper/run.ts` – orquestra: busca → normalizar → dedupe → upsert listing → match → alert.

Para produção:

1. Implemente um adapter que chame a fonte desejada (ex.: API interna de scraping ou serviço que consulte o Marketplace).
2. Em `src/app/api/cron/scrape/route.ts`, substitua `mockAdapter` pelo novo adapter.
3. Mantenha a mesma interface (`search(watchlist)` retornando `RawListing[]`) e a lógica de normalize/dedupe/match/alert permanece igual.

## Resumo das telas

| Rota | Descrição |
|------|-----------|
| `/login` | Login (email/senha via Supabase Auth) |
| `/dashboard` | Métricas: watchlists ativas, anúncios, matches, alertas não lidos; top cidades/termos; evolução diária |
| `/watchlists` | Lista de watchlists; link “Nova watchlist” |
| `/watchlists/nova` | Formulário de criação |
| `/watchlists/[id]/editar` | Formulário de edição |
| `/oportunidades` | Lista de matches (produto, preço, localização, URL, watchlist, ações: abrir anúncio, marcar visto) |
| `/alertas` | Lista de alertas (título, mensagem, preço, localização, URL; marcar lido / dispensar) |

Alertas não exibem imagem; exibem apenas nome do produto, preço, localização e URL do anúncio.
