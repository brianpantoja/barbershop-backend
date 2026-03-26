import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { AvailabilityService } from './availability.service';
import { ServicesService } from '../services/services.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    private availabilityService: AvailabilityService,
    private servicesService: ServicesService,
    private usersService: UsersService,
    private emailService: EmailService,
  ) {}

  async create(
    clientId: string,
    createDto: CreateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    // 1. Obtener el servicio
    const service = await this.servicesService.findOne(createDto.serviceId);

    // 2. Verificar disponibilidad - convertir Date a string YYYY-MM-DD
    const dateStr = this.formatDateToString(createDto.date);
    const isAvailable = await this.availabilityService.checkAvailability(
      service.businessId,
      service.id,
      dateStr,
      createDto.startTime,
    );

    if (!isAvailable) {
      throw new BadRequestException(
        'El horario seleccionado no está disponible',
      );
    }

    // 3. Calcular hora de fin
    const endTime = this.calculateEndTime(
      createDto.startTime,
      service.duration,
    );

    // 4. Crear la cita
    const appointment = this.appointmentsRepository.create({
      ...createDto,
      businessId: service.businessId,
      clientId,
      endTime,
      status: AppointmentStatus.PENDING,
    });

    const saved = await this.appointmentsRepository.save(appointment);
    try {
      // Obtener datos del cliente y negocio
      const client = await this.usersService.findById(clientId);
      const business = await this.usersService.findById(service.businessId);

      // Validar que existan antes de usar
      if (!client) {
        console.error('Cliente no encontrado:', clientId);
        return this.mapToResponseDto(saved);
      }

      if (!business) {
        console.error('Negocio no encontrado:', service.businessId);
        return this.mapToResponseDto(saved);
      }

      const dateStr = new Date(createDto.date).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Email al cliente
      await this.emailService.sendBookingConfirmation(
        client.email,
        client.name,
        service.name,
        dateStr,
        createDto.startTime,
      );

      // Email al negocio
      await this.emailService.sendBusinessNotification(
        business.email,
        business.businessName || business.name,
        client.name,
        service.name,
        dateStr,
        createDto.startTime,
      );
    } catch (error) {
      // No interrumpir el flujo si falla el email
      console.error('Error sending email notifications:', error);
    }

    return this.mapToResponseDto(saved);
  }

  async findAllByBusiness(
    businessId: string,
    date?: Date,
    status?: AppointmentStatus,
  ): Promise<AppointmentResponseDto[]> {
    const where: any = { businessId };

    if (date) {
      where.date = date;
    }

    if (status) {
      where.status = status;
    }

    const appointments = await this.appointmentsRepository.find({
      where,
      relations: ['client', 'service'],
      order: { date: 'DESC', startTime: 'ASC' },
    });

    return appointments.map((apt) => this.mapToResponseDto(apt));
  }

  async findAllByClient(clientId: string): Promise<AppointmentResponseDto[]> {
    const appointments = await this.appointmentsRepository.find({
      where: { clientId },
      relations: ['business', 'service'],
      order: { date: 'DESC', startTime: 'ASC' },
    });

    return appointments.map((apt) => this.mapToResponseDto(apt));
  }

  async findOne(
    id: string,
    userId: string,
    isBusiness: boolean,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['business', 'client', 'service'],
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    if (isBusiness && appointment.businessId !== userId) {
      throw new ForbiddenException('No tienes permiso para ver esta cita');
    } else if (!isBusiness && appointment.clientId !== userId) {
      throw new ForbiddenException('No tienes permiso para ver esta cita');
    }

    return this.mapToResponseDto(appointment);
  }

  async updateStatus(
    id: string,
    userId: string,
    isBusiness: boolean,
    updateDto: UpdateAppointmentStatusDto,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['business', 'client', 'service'],
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    if (isBusiness && appointment.businessId !== userId) {
      throw new ForbiddenException('No puedes modificar esta cita');
    } else if (!isBusiness && appointment.clientId !== userId) {
      throw new ForbiddenException('No puedes modificar esta cita');
    }

    // Validar cancelación con 2 horas de anticipación (solo para clientes)
    if (updateDto.status === AppointmentStatus.CANCELLED && !isBusiness) {
      const now = new Date();

      const [hours, minutes] = appointment.startTime.split(':').map(Number);

      // Convertir Date a string YYYY-MM-DD para hacer split
      const dateStr = this.formatDateToString(appointment.date);
      const [year, month, day] = dateStr.split('-').map(Number);

      // Crear fecha de la cita en hora local
      const appointmentDate = new Date(year, month - 1, day, hours, minutes, 0);

      const diffMs = appointmentDate.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 2) {
        throw new BadRequestException(
          'Solo puedes cancelar con al menos 2 horas de anticipación',
        );
      }
    }

    appointment.status = updateDto.status;
    if (updateDto.businessNotes) {
      appointment.businessNotes = updateDto.businessNotes;
    }

    const updated = await this.appointmentsRepository.save(appointment);
    return this.mapToResponseDto(updated);
  }

  async getAvailableSlots(
    businessId: string,
    serviceId: string,
    date: Date,
  ): Promise<string[]> {
    const dateStr = this.formatDateToString(date);
    return this.availabilityService.getAvailableSlots(
      businessId,
      serviceId,
      dateStr,
    );
  }

  async checkSpecificTime(
    businessId: string,
    serviceId: string,
    date: Date,
    startTime: string,
  ): Promise<boolean> {
    const dateStr = this.formatDateToString(date);
    return this.availabilityService.checkAvailability(
      businessId,
      serviceId,
      dateStr,
      startTime,
    );
  }

  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  private formatDateToString(date: Date | string): string {
    if (typeof date === 'string') {
      return date;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private mapToResponseDto(appointment: Appointment): AppointmentResponseDto {
    return new AppointmentResponseDto({
      id: appointment.id,
      businessId: appointment.businessId,
      businessName:
        appointment.business?.businessName || appointment.business?.name || '',
      clientId: appointment.clientId,
      clientName: appointment.clientName,
      serviceId: appointment.serviceId,
      serviceName: appointment.service?.name || '',
      serviceDuration: appointment.service?.duration || 0,
      servicePrice: appointment.service?.price || 0,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
      clientPhone: appointment.clientPhone,
      notes: appointment.notes,
      businessNotes: appointment.businessNotes,
      createdAt: appointment.createdAt,
    });
  }
}
