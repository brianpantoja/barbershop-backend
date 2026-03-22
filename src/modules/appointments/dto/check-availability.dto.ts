import {
  IsUUID,
  IsDateString,
  IsString,
  Matches,
  IsOptional,
} from 'class-validator';

export class CheckAvailabilityDto {
  @IsUUID()
  businessId: string;

  @IsDateString()
  date: Date;

  @IsUUID()
  serviceId: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime debe estar en formato HH:MM (24 horas)',
  })
  startTime: string;
}
