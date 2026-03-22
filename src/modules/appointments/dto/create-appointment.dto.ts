import {
  IsUUID,
  IsDateString,
  IsString,
  Matches,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  serviceId: string;

  @IsDateString()
  date: Date;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime debe estar en formato HH:MM (24 horas)',
  })
  startTime: string;

  @IsString()
  clientName: string;

  @IsOptional()
  @IsPhoneNumber()
  clientPhone?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
