import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { BusinessHoursService } from '../business-hours/business-hours.service';
import { ServicesService } from '../services/services.service';
import { WeekDay } from '../business-hours/entities/business-hours.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    private businessHoursService: BusinessHoursService,
    private servicesService: ServicesService,
  ) {}

  async checkAvailability(
    businessId: string,
    serviceId: string,
    date: string, // Recibimos string
    startTime: string,
  ): Promise<boolean> {
    // 1. Obtener el servicio
    const service = await this.servicesService.findOne(serviceId);

    // 2. Calcular hora de fin
    const endTime = this.calculateEndTime(startTime, service.duration);

    // 3. Verificar horario de atención
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay() as WeekDay;

    const businessHours = await this.businessHoursService.findByDay(
      businessId,
      dayOfWeek,
    );

    if (!businessHours || !businessHours.isOpen) {
      return false;
    }

    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);
    const openMinutes = this.timeToMinutes(businessHours.openTime);
    const closeMinutes = this.timeToMinutes(businessHours.closeTime);

    if (startMinutes < openMinutes || endMinutes > closeMinutes) {
      return false;
    }

    // 4. Verificar citas superpuestas - Convertir string a Date para TypeORM
    const appointments = await this.appointmentsRepository.find({
      where: {
        businessId,
        date: new Date(date), // Convertir a Date para TypeORM
        status: Not(AppointmentStatus.CANCELLED),
      },
    });

    for (const apt of appointments) {
      if (this.isOverlapping(apt.startTime, apt.endTime, startTime, endTime)) {
        return false;
      }
    }

    return true;
  }

  async getAvailableSlots(
    businessId: string,
    serviceId: string,
    date: string, // Recibimos string
  ): Promise<string[]> {
    const service = await this.servicesService.findOne(serviceId);
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay() as WeekDay;

    const businessHours = await this.businessHoursService.findByDay(
      businessId,
      dayOfWeek,
    );

    if (!businessHours || !businessHours.isOpen) {
      return [];
    }

    // Generar todos los slots
    const allSlots = this.generateTimeSlots(
      businessHours.openTime,
      businessHours.closeTime,
      service.duration,
    );

    // Obtener citas existentes - Convertir string a Date para TypeORM
    const appointments = await this.appointmentsRepository.find({
      where: {
        businessId,
        date: new Date(date), // Convertir a Date para TypeORM
        status: Not(AppointmentStatus.CANCELLED),
      },
    });

    // Filtrar slots ocupados
    return allSlots.filter(
      (slot) =>
        !appointments.some((apt) =>
          this.isOverlapping(
            apt.startTime,
            apt.endTime,
            slot,
            this.calculateEndTime(slot, service.duration),
          ),
        ),
    );
  }

  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  private isOverlapping(
    start1: string,
    end1: string,
    start2: string,
    end2: string,
  ): boolean {
    const start1Minutes = this.timeToMinutes(start1);
    const end1Minutes = this.timeToMinutes(end1);
    const start2Minutes = this.timeToMinutes(start2);
    const end2Minutes = this.timeToMinutes(end2);

    return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private generateTimeSlots(
    openTime: string,
    closeTime: string,
    durationMinutes: number,
    slotInterval: number = 30,
  ): string[] {
    const slots: string[] = [];
    const [openHour, openMin] = openTime.split(':').map(Number);
    const [closeHour, closeMin] = closeTime.split(':').map(Number);

    let currentMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    while (currentMinutes + durationMinutes <= closeMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const mins = currentMinutes % 60;
      slots.push(
        `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`,
      );
      currentMinutes += slotInterval;
    }

    return slots;
  }
}
