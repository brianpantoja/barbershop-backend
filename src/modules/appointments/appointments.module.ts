import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { AvailabilityService } from './availability.service';
import { Appointment } from './entities/appointment.entity';
import { ServicesModule } from '../services/services.module';
import { BusinessHoursModule } from '../business-hours/business-hours.module';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment]),
    ServicesModule,
    BusinessHoursModule,
    UsersModule,
    EmailModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AvailabilityService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
