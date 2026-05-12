import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class MastersService {
  constructor(private prisma: PrismaService) {}

  async getAllConfigs() {
    return this.prisma.masterConfig.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getConfigBySlug(slug: string) {
    const config = await this.prisma.masterConfig.findUnique({
      where: { slug },
    });

    if (!config) {
      throw new NotFoundException(`Master type "${slug}" not found`);
    }

    return config;
  }

  async createConfig(name: string, slug: string, config: any) {
    return this.prisma.masterConfig.create({
      data: {
        name,
        slug,
        config,
      },
    });
  }

  async updateConfig(slug: string, name: string, config: any) {
    return this.prisma.masterConfig.update({
      where: { slug },
      data: { name, config },
    });
  }

  async deleteConfig(slug: string) {
    return this.prisma.masterConfig.delete({
      where: { slug },
    });
  }


  async getRecords(slug: string, search?: string, page = 1, limit = 10) {
    const masterConfig = await this.getConfigBySlug(slug);

    const where: any = {
      masterConfigId: masterConfig.id,
    };

    // Simple search implementation for JSONB (PostgreSQL)
    if (search) {
      // Note: This is a basic search. For more advanced search, you might need raw queries or specialized JSONB operators.
      // Here we assume search filters records where any value matches the search string.
      // This is simplified for the purpose of the task.
      where.data = {
        path: [],
        string_contains: search,
      };
      // Prisma's JSON filtering is limited. For production, raw SQL is often better for JSONB search.
    }

    const [records, total] = await Promise.all([
      this.prisma.masterData.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.masterData.count({ where }),
    ]);

    return {
      records: records.map(r => ({
        id: r.id,
        ...(r.data as object),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      total,
      page,
      limit,
    };
  }

  async createRecord(slug: string, data: any) {
    const masterConfig = await this.getConfigBySlug(slug);
    
    // Validation & Sanitization
    const sanitizedData = this.validateAndSanitizeData(data, masterConfig.config as any[]);

    return this.prisma.masterData.create({
      data: {
        masterConfigId: masterConfig.id,
        data: sanitizedData,
      },
    });
  }

  async updateRecord(id: number, data: any) {
    const record = await this.prisma.masterData.findUnique({
      where: { id },
      include: { masterConfig: true },
    });

    if (!record) {
      throw new NotFoundException('Record not found');
    }

    // Validation & Sanitization
    const sanitizedData = this.validateAndSanitizeData(data, record.masterConfig.config as any[]);

    return this.prisma.masterData.update({
      where: { id },
      data: { data: sanitizedData },
    });
  }

  async deleteRecord(id: number) {
    return this.prisma.masterData.delete({
      where: { id },
    });
  }

  private validateAndSanitizeData(data: any, config: any[]) {
    const sanitized = { ...data };
    for (const field of config) {
      let value = data[field.key];

      // Required check
      if (field.validationRules?.required && (value === undefined || value === null || value === '')) {
        throw new BadRequestException(`${field.label} is required`);
      }

      // Type conversion & validation
      if (value !== undefined && value !== null && value !== '') {
        if (field.dataType === 'number') {
          const numValue = Number(value);
          if (isNaN(numValue)) {
            throw new BadRequestException(`${field.label} must be a number`);
          }
          sanitized[field.key] = numValue; // Convert string to number for JSONB
        }
      }
    }
    return sanitized;
  }

}
