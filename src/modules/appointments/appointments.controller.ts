import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/user.entity';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() createDto: CreateAppointmentDto) {
    if (user.role !== UserRole.CLIENT) {
      throw new ForbiddenException('Solo los clientes pueden crear citas');
    }
    return this.appointmentsService.create(user.id, createDto);
  }

  @Get('business')
  findAllByBusiness(
    @CurrentUser() user: User,
    @Query('date') date?: string,
    @Query('status') status?: string,
  ) {
    if (user.role !== UserRole.BUSINESS) {
      throw new ForbiddenException('Solo los negocios pueden ver sus citas');
    }
    const dateObj = date ? new Date(date) : undefined;
    return this.appointmentsService.findAllByBusiness(
      user.id,
      dateObj,
      status as any,
    );
  }

  @Get('client')
  findAllByClient(@CurrentUser() user: User) {
    if (user.role !== UserRole.CLIENT) {
      throw new ForbiddenException('Solo los clientes pueden ver sus citas');
    }
    return this.appointmentsService.findAllByClient(user.id);
  }

  @Get('availability')
  async checkAvailability(@Query() query: CheckAvailabilityDto) {
    if (query.startTime) {
      const isAvailable = await this.appointmentsService.checkSpecificTime(
        query.businessId,
        query.serviceId,
        query.date,
        query.startTime,
      );
      return { available: isAvailable };
    }

    const slots = await this.appointmentsService.getAvailableSlots(
      query.businessId,
      query.serviceId,
      query.date,
    );
    return { availableSlots: slots };
  }

  @Get(':id')
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.appointmentsService.findOne(
      id,
      user.id,
      user.role === UserRole.BUSINESS,
    );
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateDto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentsService.updateStatus(
      id,
      user.id,
      user.role === UserRole.BUSINESS,
      updateDto,
    );
  }
}
