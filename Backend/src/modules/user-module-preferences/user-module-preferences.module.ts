import { Module } from '@nestjs/common';
import { UserModulePreferencesController } from './user-module-preferences.controller';
import { UserModulePreferencesService } from './user-module-preferences.service';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserModulePreferencesController],
  providers: [UserModulePreferencesService],
  exports: [UserModulePreferencesService],
})
export class UserModulePreferencesModule {}
