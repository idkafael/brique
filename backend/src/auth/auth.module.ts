import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { SupabaseJwtStrategy } from './supabase-jwt.strategy';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'supabase-jwt' })],
  controllers: [AuthController],
  providers: [SupabaseJwtStrategy],
  exports: [],
})
export class AuthModule {}
