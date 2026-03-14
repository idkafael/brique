import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isLoginPage = nextUrl.pathname === '/login';
      if (isLoginPage) return true;
      return isLoggedIn;
    },
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const { data, error } = await supabase.auth.signInWithPassword({
          email: String(credentials.email),
          password: String(credentials.password),
        });
        if (error || !data.user) return null;
        const name = data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? data.user.email?.split('@')[0] ?? null;
        return {
          id: data.user.id,
          email: data.user.email ?? '',
          name,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string | null;
      }
      return session;
    },
  },
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  trustHost: true,
});

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name?: string | null;
  }
  interface Session {
    user: { id: string; email: string; name?: string | null };
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string;
    email?: string;
    name?: string | null;
  }
}
