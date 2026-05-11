import { Module } from '@nestjs/common';
import { SHGService } from './shg.service';
import { SHGController } from './shg.controller';

@Module({
  controllers: [SHGController],
  providers: [SHGService],
  exports: [SHGService],
})
export class SHGModule {}
