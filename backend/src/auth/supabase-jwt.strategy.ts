import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface JwtPayload {
  sub: string;
  email?: string;
  aud?: string;
  role?: string;
}

@Injectable()
export class SupabaseJwtStrategy extends PassportStrategy(Strategy, 'supabase-jwt') {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET;
    if (!supabaseUrl || !supabaseJwtSecret) {
      throw new Error('SUPABASE_URL and SUPABASE_JWT_SECRET must be set');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: supabaseJwtSecret,
    });
    this.supabase = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY || '', {
      auth: { persistSession: false },
    });
  }

  async validate(payload: JwtPayload): Promise<{ userId: string; email?: string }> {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token');
    }
    return { userId: payload.sub, email: payload.email };
  }
}
