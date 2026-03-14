import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User, RequestUser } from '../auth/user.decorator';
import { DashboardService, PeriodType } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats(
    @User() user: RequestUser,
    @Query('period') period: string = '7d',
  ) {
    const validPeriod: PeriodType = ['hoje', 'ontem', '7d', '30d', 'total'].includes(period)
      ? (period as PeriodType)
      : '7d';
    return this.dashboardService.getStats(user.userId, validPeriod);
  }
}
