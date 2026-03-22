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
import { BusinessHoursService } from './business-hours.service';
import { CreateBusinessHoursDto } from './dto/create-business-hours.dto';
import { UpdateBusinessHoursDto } from './dto/update-business-hours.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('business-hours')
@UseGuards(JwtAuthGuard)
export class BusinessHoursController {
  constructor(private readonly businessHoursService: BusinessHoursService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() createDto: CreateBusinessHoursDto) {
    return this.businessHoursService.create(user.id, createDto);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.businessHoursService.findAllByBusiness(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.businessHoursService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateDto: UpdateBusinessHoursDto,
  ) {
    return this.businessHoursService.update(id, user.id, updateDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.businessHoursService.remove(id, user.id);
  }
}
