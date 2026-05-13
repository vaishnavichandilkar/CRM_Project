import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { SavePreferencesDto } from './dto/save-preferences.dto';

@Injectable()
export class UserModulePreferencesService {
  constructor(private prisma: PrismaService) {}

  async savePreferences(userId: number, dto: SavePreferencesDto) {
    console.log(`Saving preferences for user ${userId}:`, dto.selectedModules);
    try {
      const result = await this.prisma.userModulePreference.upsert({
        where: { userId },
        update: {
          selectedModules: dto.selectedModules,
        },
        create: {
          userId,
          selectedModules: dto.selectedModules,
        },
      });
      console.log(`Successfully saved preferences for user ${userId}`);
      return result;
    } catch (error) {
      console.error(`Error saving preferences for user ${userId}:`, error);
      throw error;
    }
  }

  async getPreferences(userId: number) {
    return this.prisma.userModulePreference.findUnique({
      where: { userId },
    });
  }
}
