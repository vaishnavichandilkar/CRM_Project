import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Product A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'SKU-001' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 'Category 1' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 299 })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsOptional()
  stock?: number;

  @ApiProperty({ example: 'Product description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Active', required: false })
  @IsString()
  @IsOptional()
  status?: string;
}
