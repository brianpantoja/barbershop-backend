import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Appointment,
  AppointmentStatus,
} from '../appointments/entities/appointment.entity';
import { EmailService } from './email.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    private emailService: EmailService,
    private usersService: UsersService,
  ) {}

  async sendReminders() {
    // Buscar citas para mañana que estén confirmadas
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Resetear horas a 0 para comparar solo fecha
    tomorrow.setHours(0, 0, 0, 0);

    // Crear fecha para el día después de mañana (límite)
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const appointments = await this.appointmentsRepository.find({
      where: {
        date: tomorrow, // TypeORM acepta Date aquí
        status: AppointmentStatus.CONFIRMED,
      },
      relations: ['client', 'service', 'business'],
    });

    this.logger.log(
      `Enviando recordatorios para ${appointments.length} citas de mañana`,
    );

    for (const apt of appointments) {
      try {
        // Validar que el cliente existe
        if (!apt.client) {
          this.logger.error(`Cliente no encontrado para cita ${apt.id}`);
          continue;
        }

        const dateStr = apt.date.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        await this.emailService.sendReminder(
          apt.client.email,
          apt.client.name,
          apt.service?.name || 'Servicio',
          dateStr,
          apt.startTime,
        );
      } catch (error) {
        this.logger.error(
          `Error sending reminder to ${apt.client?.email}:`,
          error,
        );
      }
    }
  }
}
