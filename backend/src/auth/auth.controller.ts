import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User, RequestUser } from './user.decorator';

const TEST_USER_EMAIL = 'rafael@sistemaxi.com';
const TEST_USER_PASSWORD = '123456';

@Controller('auth')
export class AuthController {
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@User() user: RequestUser) {
    return { userId: user.userId, email: user.email };
  }

  /**
   * Cria o usuário de teste (apenas desenvolvimento).
   * Chamar uma vez: POST /auth/seed-test-user
   */
  @Post('seed-test-user')
  async seedTestUser() {
    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return { ok: false, error: 'SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios' };
    }
    const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data, error } = await supabase.auth.admin.createUser({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      email_confirm: true,
    });
    if (error) {
      if (error.message?.includes('already been registered')) {
        return { ok: true, message: 'Usuário de teste já existe. Use: ' + TEST_USER_EMAIL + ' / ' + TEST_USER_PASSWORD };
      }
      return { ok: false, error: error.message };
    }
    return { ok: true, message: 'Usuário de teste criado. Login: ' + TEST_USER_EMAIL + ' / ' + TEST_USER_PASSWORD };
  }
}
