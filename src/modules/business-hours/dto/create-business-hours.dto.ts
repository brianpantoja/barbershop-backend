import {
  IsEnum,
  IsString,
  Matches,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { WeekDay } from '../entities/business-hours.entity';

export class CreateBusinessHoursDto {
  @IsEnum(WeekDay)
  dayOfWeek: WeekDay;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'openTime debe estar en formato HH:MM (24 horas)',
  })
  openTime: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'closeTime debe estar en formato HH:MM (24 horas)',
  })
  closeTime: string;

  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;
}
