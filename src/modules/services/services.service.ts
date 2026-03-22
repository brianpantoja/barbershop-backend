import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
  ) {}

  async create(
    businessId: string,
    createServiceDto: CreateServiceDto,
  ): Promise<Service> {
    const service = this.servicesRepository.create({
      ...createServiceDto,
      businessId,
    });
    return this.servicesRepository.save(service);
  }

  async findAllByBusiness(businessId: string): Promise<Service[]> {
    return this.servicesRepository.find({
      where: { businessId, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.servicesRepository.findOne({
      where: { id },
      relations: ['business'],
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async update(
    id: string,
    businessId: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    const service = await this.findOne(id);

    if (service.businessId !== businessId) {
      throw new ForbiddenException('You can only update your own services');
    }

    Object.assign(service, updateServiceDto);
    return this.servicesRepository.save(service);
  }

  async remove(id: string, businessId: string): Promise<void> {
    const service = await this.findOne(id);

    if (service.businessId !== businessId) {
      throw new ForbiddenException('You can only delete your own services');
    }

    service.isActive = false;
    await this.servicesRepository.save(service);
  }
}
