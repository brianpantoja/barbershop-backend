import { Controller, Post, UseGuards } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('email')
export class ReminderController {
  constructor(private reminderService: ReminderService) {}

  @Post('send-reminders')
  @UseGuards(JwtAuthGuard)
  async sendReminders() {
    await this.reminderService.sendReminders();
    return { message: 'Recordatorios enviados' };
  }
}
