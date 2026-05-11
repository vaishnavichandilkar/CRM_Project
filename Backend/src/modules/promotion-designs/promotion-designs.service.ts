import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreatePromotionDesignDto } from './dto/create-promotion-design.dto';
import { UpdatePromotionDesignDto } from './dto/update-promotion-design.dto';

@Injectable()
export class PromotionDesignsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePromotionDesignDto) {
    return this.prisma.promotionDesign.create({
      data: {
        ...dto,
        status: dto.status || 'DRAFT',
      },
    });
  }

  async findAll(search?: string) {
    return this.prisma.promotionDesign.findMany({
      where: search
        ? {
            OR: [
              { designTitle: { contains: search, mode: 'insensitive' } },
              {
                type: {
                  in: Object.values(require('@prisma/client').DesignType).filter((t: string) =>
                    t.toLowerCase().includes(search.toLowerCase())
                  ) as any,
                },
              },
              {
                status: {
                  in: Object.values(require('@prisma/client').DesignStatus).filter((s: string) =>
                    s.toLowerCase().includes(search.toLowerCase())
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
    const design = await this.prisma.promotionDesign.findUnique({
      where: { id },
    });

    if (!design) {
      throw new NotFoundException(`Promotion design with ID ${id} not found`);
    }

    return design;
  }

  async update(id: number, dto: UpdatePromotionDesignDto) {
    await this.findOne(id);
    return this.prisma.promotionDesign.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.promotionDesign.delete({
      where: { id },
    });
  }
}
