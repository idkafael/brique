import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brique } from '../entities/brique.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Brique])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
