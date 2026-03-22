import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessHours, WeekDay } from './entities/business-hours.entity';
import { CreateBusinessHoursDto } from './dto/create-business-hours.dto';
import { UpdateBusinessHoursDto } from './dto/update-business-hours.dto';
import { BusinessHoursResponseDto } from './dto/business-hours-response.dto';

const DAY_NAMES = {
  [WeekDay.MONDAY]: 'Lunes',
  [WeekDay.TUESDAY]: 'Martes',
  [WeekDay.WEDNESDAY]: 'Miércoles',
  [WeekDay.THURSDAY]: 'Jueves',
  [WeekDay.FRIDAY]: 'Viernes',
  [WeekDay.SATURDAY]: 'Sábado',
  [WeekDay.SUNDAY]: 'Domingo',
};

@Injectable()
export class BusinessHoursService {
  constructor(
    @InjectRepository(BusinessHours)
    private businessHoursRepository: Repository<BusinessHours>,
  ) {}

  async create(
    businessId: string,
    createDto: CreateBusinessHoursDto,
  ): Promise<BusinessHoursResponseDto> {
    // Validar que la hora de cierre sea después de la apertura
    if (createDto.closeTime <= createDto.openTime) {
      throw new BadRequestException('closeTime debe ser mayor que openTime');
    }

    // Verificar si ya existe un horario para ese día
    const existing = await this.businessHoursRepository.findOne({
      where: { businessId, dayOfWeek: createDto.dayOfWeek },
    });

    if (existing) {
      throw new BadRequestException(
        'Ya existe un horario configurado para este día',
      );
    }

    const businessHours = this.businessHoursRepository.create({
      ...createDto,
      businessId,
      isOpen: createDto.isOpen ?? true,
    });

    const saved = await this.businessHoursRepository.save(businessHours);
    return this.mapToResponseDto(saved);
  }

  async findAllByBusiness(
    businessId: string,
  ): Promise<BusinessHoursResponseDto[]> {
    const hours = await this.businessHoursRepository.find({
      where: { businessId },
      order: { dayOfWeek: 'ASC' },
    });

    return hours.map((h) => this.mapToResponseDto(h));
  }

  async findOne(
    id: string,
    businessId: string,
  ): Promise<BusinessHoursResponseDto> {
    const businessHours = await this.businessHoursRepository.findOne({
      where: { id, businessId },
    });

    if (!businessHours) {
      throw new NotFoundException('Horario no encontrado');
    }

    return this.mapToResponseDto(businessHours);
  }

  async update(
    id: string,
    businessId: string,
    updateDto: UpdateBusinessHoursDto,
  ): Promise<BusinessHoursResponseDto> {
    const businessHours = await this.businessHoursRepository.findOne({
      where: { id, businessId },
    });

    if (!businessHours) {
      throw new NotFoundException('Horario no encontrado');
    }

    // Validar horas si vienen ambas
    if (updateDto.openTime && updateDto.closeTime) {
      if (updateDto.closeTime <= updateDto.openTime) {
        throw new BadRequestException('closeTime debe ser mayor que openTime');
      }
    } else if (updateDto.openTime && !updateDto.closeTime) {
      if (updateDto.openTime >= businessHours.closeTime) {
        throw new BadRequestException(
          'openTime debe ser menor que el closeTime actual',
        );
      }
    } else if (!updateDto.openTime && updateDto.closeTime) {
      if (updateDto.closeTime <= businessHours.openTime) {
        throw new BadRequestException(
          'closeTime debe ser mayor que el openTime actual',
        );
      }
    }

    Object.assign(businessHours, updateDto);
    const updated = await this.businessHoursRepository.save(businessHours);
    return this.mapToResponseDto(updated);
  }

  async remove(id: string, businessId: string): Promise<void> {
    const result = await this.businessHoursRepository.delete({
      id,
      businessId,
    });
    if (result.affected === 0) {
      throw new NotFoundException('Horario no encontrado');
    }
  }

  // Método público para obtener horario por día (útil para citas)
  async findByDay(
    businessId: string,
    dayOfWeek: WeekDay,
  ): Promise<BusinessHours | null> {
    return this.businessHoursRepository.findOne({
      where: { businessId, dayOfWeek, isOpen: true },
    });
  }

  private mapToResponseDto(hours: BusinessHours): BusinessHoursResponseDto {
    return new BusinessHoursResponseDto({
      id: hours.id,
      dayOfWeek: hours.dayOfWeek,
      dayName: DAY_NAMES[hours.dayOfWeek],
      openTime: hours.openTime,
      closeTime: hours.closeTime,
      isOpen: hours.isOpen,
    });
  }
}
