import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { BriquesModule } from './briques/briques.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { Brique } from './entities/brique.entity';
import { BriqueImage } from './entities/brique-image.entity';

function logDatabaseUrlForDebug() {
  try {
    const raw = process.env.DATABASE_URL;
    if (!raw) {
      // eslint-disable-next-line no-console
      console.log('[DB DEBUG] DATABASE_URL is not set');
      return;
    }
    const u = new URL(raw);
    // eslint-disable-next-line no-console
    console.log('[DB DEBUG] Parsed DATABASE_URL', {
      protocol: u.protocol,
      hostname: u.hostname,
      port: u.port,
      pathname: u.pathname,
      username: u.username,
      hasPassword: Boolean(u.password),
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('[DB DEBUG] Error parsing DATABASE_URL', (e as Error).message);
  }
}

logDatabaseUrlForDebug();

@Module({
  controllers: [AppController],
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Brique, BriqueImage],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    BriquesModule,
    DashboardModule,
  ],
})
export class AppModule {}
