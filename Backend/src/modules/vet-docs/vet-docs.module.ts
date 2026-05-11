import { Module } from '@nestjs/common';
import { VetDocsService } from './vet-docs.service';
import { VetDocsController } from './vet-docs.controller';

@Module({
  controllers: [VetDocsController],
  providers: [VetDocsService],
  exports: [VetDocsService],
})
export class VetDocsModule {}
