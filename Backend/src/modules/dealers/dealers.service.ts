import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateDealerDto } from './dto/create-dealer.dto';
import { UpdateDealerDto } from './dto/update-dealer.dto';

@Injectable()
export class DealersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDealerDto) {
    return this.prisma.dealer.create({
      data: dto,
    });
  }

  async findAll(search?: string) {
    return this.prisma.dealer.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { contactPerson: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const dealer = await this.prisma.dealer.findUnique({
      where: { id },
    });

    if (!dealer) {
      throw new NotFoundException(`Dealer with ID ${id} not found`);
    }

    return dealer;
  }

  async update(id: number, dto: UpdateDealerDto) {
    await this.findOne(id);

    return this.prisma.dealer.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.dealer.delete({
      where: { id },
    });
  }
}
