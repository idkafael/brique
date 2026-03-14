import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Brique } from './brique.entity';

@Entity('brique_images')
export class BriqueImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'brique_id', type: 'uuid' })
  briqueId: string;

  @Column({ name: 'image_url' })
  imageUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Brique, (b) => b.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brique_id' })
  brique: Brique;
}
