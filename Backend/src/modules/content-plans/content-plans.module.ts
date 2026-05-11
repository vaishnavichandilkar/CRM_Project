import { Module } from '@nestjs/common';
import { ContentPlansService } from './content-plans.service';
import { ContentPlansController } from './content-plans.controller';

@Module({
  controllers: [ContentPlansController],
  providers: [ContentPlansService],
  exports: [ContentPlansService],
})
export class ContentPlansModule {}
