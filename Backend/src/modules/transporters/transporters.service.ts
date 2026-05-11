import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateTransporterDto } from './dto/create-transporter.dto';
import { UpdateTransporterDto } from './dto/update-transporter.dto';

@Injectable()
export class TransportersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTransporterDto) {
    return this.prisma.transporter.create({
      data: dto,
    });
  }

  async findAll(search?: string) {
    return this.prisma.transporter.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { contactPerson: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
              {
                // Note: VehicleType is an enum, so we check if search matches enum strings
                // This is a common way to support enum search in Prisma
                vehicleType: {
                  in: Object.values(require('@prisma/client').VehicleType).filter((v: string) =>
                    v.toLowerCase().includes(search.toLowerCase())
                  ) as any,
                },
              },
            ],
          }
        : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const transporter = await this.prisma.transporter.findUnique({
      where: { id },
    });

    if (!transporter) {
      throw new NotFoundException(`Transporter with ID ${id} not found`);
    }

    return transporter;
  }

  async update(id: number, dto: UpdateTransporterDto) {
    await this.findOne(id);
    return this.prisma.transporter.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.transporter.delete({
      where: { id },
    });
  }
}
