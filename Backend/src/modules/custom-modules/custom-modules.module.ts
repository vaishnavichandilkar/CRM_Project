import { Module } from '@nestjs/common';
import { CustomModulesService } from './custom-modules.service';
import { CustomModulesController } from './custom-modules.controller';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CustomModulesController],
  providers: [CustomModulesService],
  exports: [CustomModulesService],
})
export class CustomModulesModule {}
