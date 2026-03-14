import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { BriqueStatus } from '../../entities/brique.entity';

export class CreateBriqueDto {
  @IsString()
  title: string;

  @IsNumber()
  @Min(0)
  purchaseValue: number;

  @IsNumber()
  @Min(0)
  saleValue: number;

  @IsEnum(BriqueStatus)
  status: BriqueStatus;

  @IsDateString()
  entryDate: string;

  @IsOptional()
  @IsDateString()
  exitDate?: string;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  socialMedia?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  invoiceUrl?: string;
}
