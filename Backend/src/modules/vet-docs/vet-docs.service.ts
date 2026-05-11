import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateVetDocDto } from './dto/create-vet-doc.dto';
import { UpdateVetDocDto } from './dto/update-vet-doc.dto';

@Injectable()
export class VetDocsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVetDocDto) {
    return this.prisma.vetDoc.create({
      data: dto,
    });
  }

  async findAll(search?: string) {
    return this.prisma.vetDoc.findMany({
      where: search
        ? {
            OR: [
              { doctorName: { contains: search, mode: 'insensitive' } },
              { specialty: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const vetDoc = await this.prisma.vetDoc.findUnique({
      where: { id },
    });

    if (!vetDoc) {
      throw new NotFoundException(`Vet doc with ID ${id} not found`);
    }

    return vetDoc;
  }

  async update(id: number, dto: UpdateVetDocDto) {
    await this.findOne(id);
    return this.prisma.vetDoc.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.vetDoc.delete({
      where: { id },
    });
  }
}
