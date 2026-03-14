import { PartialType } from '@nestjs/mapped-types';
import { CreateBriqueDto } from './create-brique.dto';

export class UpdateBriqueDto extends PartialType(CreateBriqueDto) {}
