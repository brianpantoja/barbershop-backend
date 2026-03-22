import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Service } from '../../services/entities/service.entity';

export enum AppointmentStatus {
  PENDING = 'pending', // Pendiente de confirmación
  CONFIRMED = 'confirmed', // Confirmada por el negocio
  CANCELLED = 'cancelled', // Cancelada por cliente o negocio
  COMPLETED = 'completed', // Realizada
  NO_SHOW = 'no_show', // Cliente no asistió
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  businessId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'businessId' })
  business: User;

  @Column()
  clientId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'clientId' })
  client: User;

  @Column()
  serviceId: string;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column()
  clientName: string;

  @Column({ nullable: true })
  clientPhone: string;

  @Column({ nullable: true, type: 'text' })
  notes: string; // Notas adicionales

  @Column({ nullable: true, type: 'text' })
  businessNotes: string; // Notas internas del negocio

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
