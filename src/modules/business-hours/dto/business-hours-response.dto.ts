import { WeekDay } from '../entities/business-hours.entity';

export class BusinessHoursResponseDto {
  id: string;
  dayOfWeek: WeekDay;
  dayName: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;

  constructor(partial: Partial<BusinessHoursResponseDto>) {
    Object.assign(this, partial);
  }
}
