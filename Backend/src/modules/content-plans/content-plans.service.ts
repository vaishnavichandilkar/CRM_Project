import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateContentPlanDto } from './dto/create-content-plan.dto';
import { UpdateContentPlanDto } from './dto/update-content-plan.dto';

@Injectable()
export class ContentPlansService {
  constructor(private prisma: PrismaService) {}

  private validateDates(start: string | Date, end: string | Date) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (endDate < startDate) {
      throw new BadRequestException('End date cannot be earlier than start date');
    }
  }

  async create(dto: CreateContentPlanDto) {
    this.validateDates(dto.startDate, dto.endDate);

    return this.prisma.contentPlan.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    });
  }

  async findAll(search?: string) {
    return this.prisma.contentPlan.findMany({
      where: search
        ? {
            OR: [
              { campaignTitle: { contains: search, mode: 'insensitive' } },
              {
                platform: {
                  in: Object.values(require('@prisma/client').Platform).filter((p: string) =>
                    p.toLowerCase().includes(search.toLowerCase())
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
    const plan = await this.prisma.contentPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException(`Content plan with ID ${id} not found`);
    }

    return plan;
  }

  async update(id: number, dto: UpdateContentPlanDto) {
    const existing = await this.findOne(id);

    // If both dates are being updated, or just one, we check against the combined set
    const start = dto.startDate || existing.startDate;
    const end = dto.endDate || existing.endDate;
    this.validateDates(start, end);

    return this.prisma.contentPlan.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate && { endDate: new Date(dto.endDate) }),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.contentPlan.delete({
      where: { id },
    });
  }
}
