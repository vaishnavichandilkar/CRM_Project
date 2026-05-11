import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DesignType, DesignStatus } from '@prisma/client';

export class CreatePromotionDesignDto {
  @ApiProperty({ example: 'Summer Sale Banner', description: 'The title of the design asset' })
  @IsString()
  @IsNotEmpty()
  designTitle: string;

  @ApiProperty({ 
    example: 'Banner', 
    enum: DesignType, 
    description: 'The type of design asset', 
    required: false,
    nullable: true 
  })
  @IsEnum(DesignType)
  @IsOptional()
  type?: DesignType;

  @ApiProperty({ 
    example: 'Draft', 
    enum: DesignStatus, 
    description: 'The current status of the design', 
    required: false,
    default: 'Draft'
  })
  @IsEnum(DesignStatus)
  @IsOptional()
  status?: DesignStatus;
}
