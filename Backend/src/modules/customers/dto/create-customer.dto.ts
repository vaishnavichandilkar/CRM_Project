import { IsString, IsNotEmpty, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Region, CustomerType } from '@prisma/client';

export class CreateCustomerDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ enum: Region })
  @IsEnum(Region)
  @IsNotEmpty()
  region: Region;

  @ApiProperty({ enum: CustomerType })
  @IsEnum(CustomerType)
  @IsNotEmpty()
  type: CustomerType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;
}
