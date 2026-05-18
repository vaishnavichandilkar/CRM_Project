import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCustomerDto) {
    const existing = await this.prisma.customer.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Customer with this email already exists');
    }

    return this.prisma.customer.create({
      data: dto,
    });
  }

  async findAll(search?: string) {
    return this.prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDropdown() {
    const records = await this.prisma.masterData.findMany({
      where: {
        masterConfig: {
          slug: 'customers',
        },
      },
      select: {
        id: true,
        data: true,
      },
    });

    return records.map((r) => {
      const data = r.data as any;
      return {
        id: r.id,
        customerCode: data.customerCode || `CUST${String(r.id).padStart(3, '0')}`,
        name: data.name || '',
        phone: data.phone || '',
      };
    });
  }

  async findOne(id: number) {
    const record = await this.prisma.masterData.findFirst({
      where: {
        id,
        masterConfig: {
          slug: 'customers',
        },
      },
    });

    if (record) {
      return {
        id: record.id,
        ...(record.data as object),
      };
    }

    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(id: number, dto: UpdateCustomerDto) {
    await this.findOne(id);
    
    if (dto.email) {
      const existing = await this.prisma.customer.findUnique({
        where: { email: dto.email },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Email already in use by another customer');
      }
    }

    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.customer.delete({
      where: { id },
    });
  }
}
