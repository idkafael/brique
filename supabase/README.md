# Supabase – CRM Brique

## 1. Criar projeto

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto.
2. Anote:
   - **Project URL** (Settings > API)
   - **anon public** key
   - **service_role** key (para uso apenas no backend, nunca no frontend)
   - **Connection string** do PostgreSQL (Settings > Database > Connection string > URI)

## 2. Executar migrações

1. No dashboard do Supabase, vá em **SQL Editor**.
2. Execute o conteúdo de `migrations/001_initial_schema.sql`.
3. Execute o conteúdo de `migrations/002_brique_dates_invoice.sql` (data de entrada/saída e nota fiscal).
4. Confirme que as tabelas `profiles`, `briques` e `brique_images` foram criadas e que RLS está ativo.

## 3. Storage – bucket brique-images

1. Vá em **Storage** no menu lateral.
2. Crie um novo bucket: nome `brique-images`, **público** se quiser URLs públicas (ou privado e use signed URLs).
3. Em **Policies** do bucket, adicione:

**Policy: usuário autenticado pode fazer upload em sua pasta**
- Name: `Users can upload in own folder`
- Allowed operation: INSERT
- Target roles: authenticated
- Policy: `(bucket_id = 'brique-images') AND (auth.uid()::text = (storage.foldername(name))[1])`

**Policy: usuário pode ler arquivos da própria pasta**
- Name: `Users can read own files`
- Allowed operation: SELECT
- Policy: `(bucket_id = 'brique-images') AND (auth.uid()::text = (storage.foldername(name))[1])`

**Policy: usuário pode deletar arquivos da própria pasta**
- Name: `Users can delete own files`
- Allowed operation: DELETE
- Policy: `(bucket_id = 'brique-images') AND (auth.uid()::text = (storage.foldername(name))[1])`

O path recomendado ao fazer upload é: `{userId}/{briqueId}/{filename}`.

## 4. Variáveis de ambiente

Use o `.env.example` na raiz do backend e do frontend como referência para `SUPABASE_URL`, `SUPABASE_ANON_KEY` e, no backend, `DATABASE_URL` (connection string do Postgres) e `SUPABASE_SERVICE_ROLE_KEY` se precisar de operações server-side com permissão elevada.
