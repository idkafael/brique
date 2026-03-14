# CRM Brique

CRM web para controle de briques: compra, revenda, acompanhamento de status e dashboard financeiro/comercial.

## Stack

- **Backend:** NestJS + TypeORM + PostgreSQL (Supabase) + Auth JWT (Supabase)
- **Frontend:** React (Vite) + Tailwind CSS + Supabase Auth + Recharts
- **Banco e Auth/Storage:** Supabase (PostgreSQL, Auth, Storage)

## Modo demonstração (sem banco)

Se você **não** configurar `VITE_SUPABASE_URL` no frontend (ou definir `VITE_MOCK=true`), o app roda em **modo demonstração**: não usa backend nem Supabase. Login com qualquer e-mail/senha (ex.: rafael@sistemaxi.com / 123456), dashboard e briques com dados em memória. Ideal para ver o front “tinindo” sem configurar nada.

## Pré-requisitos (para usar com banco)

1. Criar um projeto no [Supabase](https://supabase.com).
2. Executar o SQL em `supabase/migrations/001_initial_schema.sql` no SQL Editor do Supabase.
3. Criar o bucket `brique-images` no Storage e configurar as políticas (ver `supabase/README.md`).
4. Anotar: **Project URL**, **anon key**, **JWT Secret** (Settings > API), **Connection string** do Postgres (Settings > Database).

## Backend

```bash
cd backend
cp .env.example .env
# Editar .env com SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_JWT_SECRET, DATABASE_URL
npm install --legacy-peer-deps
npm run start:dev
```

O backend sobe em `http://localhost:3000`.

## Frontend

```bash
cd frontend
cp .env.example .env
# Editar .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

O frontend sobe em **`http://localhost:5174`** e usa proxy para `/api` → backend.

**Importante:** use sempre **http://localhost:5174** para abrir o app. Se abrir **http://localhost:3000** (backend), você verá só a página da API; rotas como `/dashboard` ou `/login` não existem no backend e darão 404.

Para subir os dois de uma vez (na raiz do projeto): `npm run dev`.

## Deploy na Vercel

O frontend pode ser implantado na Vercel; o backend deve rodar em outro serviço (Railway, Render, etc.). Passo a passo e variáveis de ambiente: **[DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md)**.

## Usuário de teste

- **E-mail:** `rafael@sistemaxi.com`  
- **Senha:** `123456`

Na tela de login, use o botão **"Criar usuário de teste"** uma vez (com o backend rodando e `SUPABASE_SERVICE_ROLE_KEY` no `.env` do backend) para criar esse usuário no Supabase. Depois faça login com os dados acima.

## Funcionalidades

- **Login** com Supabase Auth (email/senha).
- **Dashboard** com filtro de período, cards de métricas (briques à venda, valor em negociação, fechadas no período, valor fechado, briques paradas), gráfico de evolução, funil por status e contatos mais ativos.
- **CRUD de briques**: listagem com filtros (status, origem), formulário com título, valor compra/venda, status, origem, telefone, rede social, observação.
- **Upload de imagens** no Supabase Storage por brique; preview no formulário de edição.
- **Destaque** de briques paradas há mais de 7 dias na listagem.

## Referência visual

A interface segue o estilo da referência em `refer/dash.png`: tema escuro (#121212, #1C1C1E), cards com bordas arredondadas, tipografia e gráficos no mesmo padrão.
