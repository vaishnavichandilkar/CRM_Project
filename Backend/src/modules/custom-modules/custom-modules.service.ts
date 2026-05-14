import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateCustomModuleDto } from './dto/create-custom-module.dto';

@Injectable()
export class CustomModulesService {
  constructor(private prisma: PrismaService) {}

  async createModule(userId: number, dto: CreateCustomModuleDto) {
    return this.prisma.customModule.create({
      data: {
        name: dto.name,
        icon: dto.icon,
        description: dto.description,
        allowView: dto.allowView ?? true,
        allowEdit: dto.allowEdit ?? true,
        allowDelete: dto.allowDelete ?? true,
        userId: userId,
        fields: {
          create: dto.fields.map(field => ({
            name: field.name,
            dataType: field.dataType,
            validationRules: field.validationRules || {},
          })),
        },
      },
      include: {
        fields: true,
      },
    });
  }

  async listModules(userId: number) {
    return this.prisma.customModule.findMany({
      where: { userId },
      include: { fields: true },
    });
  }

  async insertData(moduleId: number, data: any) {
    const module = await this.prisma.customModule.findUnique({
      where: { id: moduleId },
      include: { fields: true },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    return this.prisma.customModuleData.create({
      data: {
        customModuleId: moduleId,
        data: data,
      },
    });
  }

  async getModuleData(moduleId: number) {
    return this.prisma.customModuleData.findMany({
      where: { customModuleId: moduleId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteData(dataId: number) {
    return this.prisma.customModuleData.delete({
      where: { id: dataId },
    });
  }

  async updateData(dataId: number, data: any) {
    return this.prisma.customModuleData.update({
      where: { id: dataId },
      data: { data },
    });
  }

  async deleteModule(moduleId: number) {
    // Delete data, fields, and module
    return this.prisma.$transaction([
      this.prisma.customModuleData.deleteMany({ where: { customModuleId: moduleId } }),
      this.prisma.customField.deleteMany({ where: { customModuleId: moduleId } }),
      this.prisma.customModule.delete({ where: { id: moduleId } }),
    ]);
  }

  async updateModule(moduleId: number, dto: CreateCustomModuleDto) {
    // For simplicity, we recreate fields to avoid complex syncing
    return this.prisma.$transaction([
      this.prisma.customField.deleteMany({ where: { customModuleId: moduleId } }),
      this.prisma.customModule.update({
        where: { id: moduleId },
        data: {
          name: dto.name,
          icon: dto.icon,
          description: dto.description,
          allowView: dto.allowView ?? true,
          allowEdit: dto.allowEdit ?? true,
          allowDelete: dto.allowDelete ?? true,
          fields: {
            create: dto.fields.map(field => ({
              name: field.name,
              dataType: field.dataType,
              validationRules: field.validationRules || {},
            })),
          },
        },
      }),
    ]);
  }
}
