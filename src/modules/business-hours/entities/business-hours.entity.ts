import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/user.entity';

export enum WeekDay {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 0,
}

@Entity('business_hours')
@Unique(['businessId', 'dayOfWeek']) // Un negocio no puede tener dos horarios para el mismo día
export class BusinessHours {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  businessId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'businessId' })
  business: User;

  @Column({
    type: 'enum',
    enum: WeekDay,
  })
  dayOfWeek: WeekDay;

  @Column({ type: 'time' })
  openTime: string; // Formato: '09:00'

  @Column({ type: 'time' })
  closeTime: string; // Formato: '18:00'

  @Column({ default: true })
  isOpen: boolean; // Para manejar días cerrados (festivos, etc.)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
