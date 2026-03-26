import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
  }

  async sendBookingConfirmation(
    to: string,
    clientName: string,
    serviceName: string,
    date: string,
    time: string,
  ) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.configService.get('EMAIL_FROM') || 'onboarding@resend.dev',
        to: [to],
        subject: '✅ Cita confirmada - miTurno',
        html: this.getBookingConfirmationHtml(
          clientName,
          serviceName,
          date,
          time,
        ),
      });

      if (error) {
        this.logger.error('Error sending email:', error);
        return false;
      }

      this.logger.log('Email sent:', data);
      return true;
    } catch (error) {
      this.logger.error('Error sending email:', error);
      return false;
    }
  }

  async sendReminder(
    to: string,
    clientName: string,
    serviceName: string,
    date: string,
    time: string,
  ) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.configService.get('EMAIL_FROM') || 'onboarding@resend.dev',
        to: [to],
        subject: '⏰ Recordatorio de cita - miTurno',
        html: this.getReminderHtml(clientName, serviceName, date, time),
      });

      if (error) {
        this.logger.error('Error sending reminder:', error);
        return false;
      }

      this.logger.log('Reminder sent:', data);
      return true;
    } catch (error) {
      this.logger.error('Error sending reminder:', error);
      return false;
    }
  }

  async sendBusinessNotification(
    to: string,
    businessName: string,
    clientName: string,
    serviceName: string,
    date: string,
    time: string,
  ) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.configService.get('EMAIL_FROM') || 'onboarding@resend.dev',
        to: [to],
        subject: '📅 Nueva cita reservada - miTurno',
        html: this.getBusinessNotificationHtml(
          businessName,
          clientName,
          serviceName,
          date,
          time,
        ),
      });

      if (error) {
        this.logger.error('Error sending business notification:', error);
        return false;
      }

      this.logger.log('Business notification sent:', data);
      return true;
    } catch (error) {
      this.logger.error('Error sending business notification:', error);
      return false;
    }
  }

  private getBookingConfirmationHtml(
    clientName: string,
    serviceName: string,
    date: string,
    time: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6, #3b82f6); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 20px; background: #f9fafb; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Cita Confirmada</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${clientName}</strong>,</p>
            <p>Tu cita ha sido confirmada exitosamente. Aquí están los detalles:</p>
            <ul>
              <li><strong>Servicio:</strong> ${serviceName}</li>
              <li><strong>Fecha:</strong> ${date}</li>
              <li><strong>Hora:</strong> ${time}</li>
            </ul>
            <p>Por favor, llega 5 minutos antes de tu cita.</p>
            <a href="${process.env.FRONTEND_URL}/dashboard/client/appointments" class="button">Ver mis citas</a>
          </div>
          <div class="footer">
            <p>miTurno - Tu barbería siempre a tu alcance</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getReminderHtml(
    clientName: string,
    serviceName: string,
    date: string,
    time: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 20px; background: #f9fafb; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Recordatorio de cita</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${clientName}</strong>,</p>
            <p>¡Tu cita es mañana! No olvides asistir.</p>
            <ul>
              <li><strong>Servicio:</strong> ${serviceName}</li>
              <li><strong>Fecha:</strong> ${date}</li>
              <li><strong>Hora:</strong> ${time}</li>
            </ul>
            <a href="${process.env.FRONTEND_URL}/dashboard/client/appointments" class="button">Ver detalles</a>
          </div>
          <div class="footer">
            <p>miTurno - Tu barbería siempre a tu alcance</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getBusinessNotificationHtml(
    businessName: string,
    clientName: string,
    serviceName: string,
    date: string,
    time: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6, #3b82f6); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 20px; background: #f9fafb; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Nueva cita reservada</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${businessName}</strong>,</p>
            <p>Se ha registrado una nueva cita:</p>
            <ul>
              <li><strong>Cliente:</strong> ${clientName}</li>
              <li><strong>Servicio:</strong> ${serviceName}</li>
              <li><strong>Fecha:</strong> ${date}</li>
              <li><strong>Hora:</strong> ${time}</li>
            </ul>
            <a href="${process.env.FRONTEND_URL}/dashboard/business/appointments" class="button">Gestionar citas</a>
          </div>
          <div class="footer">
            <p>miTurno - Tu barbería siempre a tu alcance</p>
          </div>
        </div>
      </html>
    `;
  }
}
