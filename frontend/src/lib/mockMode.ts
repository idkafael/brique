export const isMockMode =
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_MOCK === 'true' ||
  import.meta.env.VITE_MOCK === '1';
