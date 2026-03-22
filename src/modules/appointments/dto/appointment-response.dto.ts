import { AppointmentStatus } from '../entities/appointment.entity';

export class AppointmentResponseDto {
  id: string;
  businessId: string;
  businessName: string;
  clientId: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  servicePrice: number;
  date: Date;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  clientPhone?: string;
  notes?: string;
  businessNotes?: string;
  createdAt: Date;

  constructor(partial: Partial<AppointmentResponseDto>) {
    Object.assign(this, partial);
  }
}
