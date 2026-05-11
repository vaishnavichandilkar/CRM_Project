import { Module } from '@nestjs/common';
import { PromotionDesignsService } from './promotion-designs.service';
import { PromotionDesignsController } from './promotion-designs.controller';

@Module({
  controllers: [PromotionDesignsController],
  providers: [PromotionDesignsService],
  exports: [PromotionDesignsService],
})
export class PromotionDesignsModule {}
