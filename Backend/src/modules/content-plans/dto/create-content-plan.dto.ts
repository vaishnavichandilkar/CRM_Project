import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Platform } from '@prisma/client';

export class CreateContentPlanDto {
  @ApiProperty({ example: 'Q2 Campaign', description: 'The title of the marketing campaign' })
  @IsString()
  @IsNotEmpty()
  campaignTitle: string;

  @ApiProperty({ 
    example: 'Facebook', 
    enum: Platform, 
    description: 'The social media platform', 
    required: false,
    nullable: true 
  })
  @IsEnum(Platform)
  @IsOptional()
  platform?: Platform;

  @ApiProperty({ example: '2026-04-01T00:00:00Z', description: 'Campaign start date' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-06-30T00:00:00Z', description: 'Campaign end date' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
