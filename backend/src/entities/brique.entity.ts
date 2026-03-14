import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BriqueImage } from './brique-image.entity';

export enum BriqueStatus {
  A_VENDA = 'à venda',
  VENDIDO = 'vendido',
}

@Entity('briques')
export class Brique {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column()
  title: string;

  @Column({ name: 'purchase_value', type: 'decimal', precision: 12, scale: 2 })
  purchaseValue: number;

  @Column({ name: 'sale_value', type: 'decimal', precision: 12, scale: 2 })
  saleValue: number;

  @Column({
    type: 'enum',
    enum: BriqueStatus,
    enumName: 'brique_status',
  })
  status: BriqueStatus;

  @Column({ nullable: true })
  origin: string | null;

  @Column({ nullable: true })
  phone: string | null;

  @Column({ name: 'social_media', nullable: true })
  socialMedia: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'entry_date', type: 'date' })
  entryDate: Date;

  @Column({ name: 'exit_date', type: 'date', nullable: true })
  exitDate: Date | null;

  @Column({ name: 'invoice_url', type: 'text', nullable: true })
  invoiceUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => BriqueImage, (img) => img.brique)
  @JoinColumn()
  images: BriqueImage[];
}
