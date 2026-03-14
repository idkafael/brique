import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brique } from '../entities/brique.entity';
import { BriqueImage } from '../entities/brique-image.entity';
import { BriquesController } from './briques.controller';
import { BriquesService } from './briques.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Brique, BriqueImage]),
  ],
  controllers: [BriquesController],
  providers: [BriquesService],
  exports: [BriquesService],
})
export class BriquesModule {}
