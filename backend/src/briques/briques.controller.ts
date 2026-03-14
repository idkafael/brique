import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BriqueStatus } from '../entities/brique.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User, RequestUser } from '../auth/user.decorator';
import { BriquesService, BriqueFilter } from './briques.service';
import { CreateBriqueDto } from './dto/create-brique.dto';
import { UpdateBriqueDto } from './dto/update-brique.dto';

@Controller('briques')
@UseGuards(JwtAuthGuard)
export class BriquesController {
  constructor(private readonly briquesService: BriquesService) {}

  @Post()
  create(@User() user: RequestUser, @Body() dto: CreateBriqueDto) {
    return this.briquesService.create(user.userId, dto);
  }

  @Get()
  findAll(
    @User() user: RequestUser,
    @Query('status') status?: BriqueStatus,
    @Query('origin') origin?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filter: BriqueFilter = {};
    if (status) filter.status = status;
    if (origin) filter.origin = origin;
    if (dateFrom) filter.dateFrom = new Date(dateFrom);
    if (dateTo) filter.dateTo = new Date(dateTo);
    return this.briquesService.findAll(user.userId, filter);
  }

  @Get(':id')
  findOne(@User() user: RequestUser, @Param('id') id: string) {
    return this.briquesService.findOne(id, user.userId);
  }

  @Patch(':id')
  update(
    @User() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateBriqueDto,
  ) {
    return this.briquesService.update(id, user.userId, dto);
  }

  @Delete(':id')
  remove(@User() user: RequestUser, @Param('id') id: string) {
    return this.briquesService.remove(id, user.userId);
  }

  @Post(':id/images')
  addImage(
    @User() user: RequestUser,
    @Param('id') id: string,
    @Body('imageUrl') imageUrl: string,
  ) {
    return this.briquesService.addImage(id, user.userId, imageUrl);
  }

  @Delete(':id/images/:imageId')
  removeImage(
    @User() user: RequestUser,
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    return this.briquesService.removeImage(id, imageId, user.userId);
  }
}
