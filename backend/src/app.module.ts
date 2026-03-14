import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { BriquesModule } from './briques/briques.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { Brique } from './entities/brique.entity';
import { BriqueImage } from './entities/brique-image.entity';

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
