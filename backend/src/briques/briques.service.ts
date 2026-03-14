import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brique, BriqueStatus } from '../entities/brique.entity';
import { BriqueImage } from '../entities/brique-image.entity';
import { CreateBriqueDto } from './dto/create-brique.dto';
import { UpdateBriqueDto } from './dto/update-brique.dto';

export interface BriqueFilter {
  status?: BriqueStatus;
  origin?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

@Injectable()
export class BriquesService {
  constructor(
    @InjectRepository(Brique)
    private readonly briqueRepo: Repository<Brique>,
    @InjectRepository(BriqueImage)
    private readonly imageRepo: Repository<BriqueImage>,
  ) {}

  async create(userId: string, dto: CreateBriqueDto): Promise<Brique> {
    const entryDate = dto.entryDate ? new Date(dto.entryDate) : new Date();
    const exitDate = dto.exitDate ? new Date(dto.exitDate) : undefined;
    const brique = this.briqueRepo.create({
      ...dto,
      userId,
      entryDate,
      exitDate: exitDate ?? null,
    });
    return this.briqueRepo.save(brique);
  }

  async findAll(userId: string, filter?: BriqueFilter): Promise<Brique[]> {
    const qb = this.briqueRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.images', 'images')
      .where('b.user_id = :userId', { userId })
      .orderBy('b.updated_at', 'DESC');

    if (filter?.status) {
      qb.andWhere('b.status = :status', { status: filter.status });
    }
    if (filter?.origin) {
      qb.andWhere('b.origin = :origin', { origin: filter.origin });
    }
    if (filter?.dateFrom) {
      qb.andWhere('b.created_at >= :dateFrom', { dateFrom: filter.dateFrom });
    }
    if (filter?.dateTo) {
      qb.andWhere('b.created_at <= :dateTo', { dateTo: filter.dateTo });
    }

    return qb.getMany();
  }

  async findOne(id: string, userId: string): Promise<Brique> {
    const brique = await this.briqueRepo.findOne({
      where: { id, userId },
      relations: ['images'],
    });
    if (!brique) throw new NotFoundException('Brique not found');
    return brique;
  }

  async update(id: string, userId: string, dto: UpdateBriqueDto): Promise<Brique> {
    const brique = await this.findOne(id, userId);
    const payload = { ...dto } as Record<string, unknown>;
    if (dto.entryDate !== undefined) payload.entryDate = new Date(dto.entryDate as string);
    if (dto.exitDate !== undefined) payload.exitDate = dto.exitDate ? new Date(dto.exitDate as string) : null;
    Object.assign(brique, payload);
    return this.briqueRepo.save(brique);
  }

  async remove(id: string, userId: string): Promise<void> {
    const brique = await this.findOne(id, userId);
    await this.briqueRepo.remove(brique);
  }

  async addImage(briqueId: string, userId: string, imageUrl: string): Promise<BriqueImage> {
    await this.findOne(briqueId, userId);
    const img = this.imageRepo.create({ briqueId, imageUrl });
    return this.imageRepo.save(img);
  }

  async removeImage(briqueId: string, imageId: string, userId: string): Promise<void> {
    await this.findOne(briqueId, userId);
    const img = await this.imageRepo.findOne({ where: { id: imageId, briqueId } });
    if (!img) throw new NotFoundException('Image not found');
    await this.imageRepo.remove(img);
  }
}
