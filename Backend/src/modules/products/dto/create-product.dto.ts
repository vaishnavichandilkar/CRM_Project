import { IsString, IsNotEmpty, IsNumber, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Mouse', description: 'The name of the product' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'WM-001', description: 'Unique SKU for the product' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 1, description: 'ID of the category' })
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty({ example: 29.99, description: 'Price of the product' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @ApiProperty({ example: 100, description: 'Current stock quantity' })
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  stockQuantity: number;

  @ApiProperty({ example: 'A high-quality wireless mouse', description: 'Product description', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
