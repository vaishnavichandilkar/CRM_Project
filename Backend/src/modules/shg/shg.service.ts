import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateSelfHelpGroupDto } from './dto/create-shg.dto';
import { UpdateSelfHelpGroupDto } from './dto/update-shg.dto';

@Injectable()
export class SHGService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSelfHelpGroupDto) {
    return this.prisma.sHG.create({
      data: dto,
    });
  }

  async findAll(search?: string) {
    return this.prisma.sHG.findMany({
      where: search
        ? {
            OR: [
              { groupName: { contains: search, mode: 'insensitive' } },
              { leaderName: { contains: search, mode: 'insensitive' } },
              { activity: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const group = await this.prisma.sHG.findUnique({
      where: { id },
    });

    if (!group) {
      throw new NotFoundException(`SHG with ID ${id} not found`);
    }

    return group;
  }

  async update(id: number, dto: UpdateSelfHelpGroupDto) {
    await this.findOne(id);
    return this.prisma.sHG.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.sHG.delete({
      where: { id },
    });
  }
}
