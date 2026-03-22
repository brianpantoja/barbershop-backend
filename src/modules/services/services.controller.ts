import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // endpoint público para obtener servicios de un negocio sin necesidad de estar logeado
  @Get('public/:businessId')
  async findAllPublic(@Param('businessId') businessId: string) {
    return this.servicesService.findAllByBusiness(businessId);
  }

  //
  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: User,
    @Body() createServiceDto: CreateServiceDto,
  ) {
    return this.servicesService.create(user.id, createServiceDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAllByBusiness(@CurrentUser() user: User) {
    return this.servicesService.findAllByBusiness(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.servicesService.update(id, user.id, updateServiceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.servicesService.remove(id, user.id);
  }
}
