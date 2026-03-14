/**
 * Cria um usuário no Supabase Auth (execução única).
 * Uso: node scripts/create-user.js
 * Configure EMAIL e PASSWORD no script ou via env.
 */
const path = require('path');
const fs = require('fs');

// Carrega .env.local
const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    process.env[key] = val;
  });
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.EMAIL || 'rafael@sistemaxi.com';
const password = process.env.PASSWORD || '1234567';

if (!url || !serviceKey) {
  console.error('Falta NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env.local');
  process.exit(1);
}

async function main() {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    if (error.message.includes('already been registered')) {
      console.log('Usuário já existe:', email);
      return;
    }
    console.error('Erro:', error.message);
    process.exit(1);
  }
  console.log('Usuário criado:', data.user?.email);
}

main();
