import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({ example: 'ABC Supplies', description: 'The name of the supplier' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'John Supplier', description: 'Primary contact person' })
  @IsString()
  @IsNotEmpty()
  contactPerson: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Raw Materials', description: 'Type of products supplied' })
  @IsString()
  @IsNotEmpty()
  productType: string;
}
