import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Region } from '@prisma/client';

export class CreateDealerDto {
  @ApiProperty({ example: 'ABC Distributors', description: 'The name of the dealer' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'John Doe', description: 'Primary contact person' })
  @IsString()
  @IsNotEmpty()
  contactPerson: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number of the dealer' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ 
    example: 'North', 
    enum: Region, 
    description: 'Geographical region', 
    required: false,
    nullable: true 
  })
  @IsEnum(Region)
  @IsOptional()
  region?: Region;
}
