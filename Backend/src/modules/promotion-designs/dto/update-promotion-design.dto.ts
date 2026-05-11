import { PartialType } from '@nestjs/swagger';
import { CreatePromotionDesignDto } from './create-promotion-design.dto';

export class UpdatePromotionDesignDto extends PartialType(CreatePromotionDesignDto) {}
