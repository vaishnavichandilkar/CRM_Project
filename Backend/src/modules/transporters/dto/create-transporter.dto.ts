import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VehicleType, Region } from '@prisma/client';

export class CreateTransporterDto {
  @ApiProperty({ example: 'Fast Logistics', description: 'The name of the transporter' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Mike Transport', description: 'Primary contact person' })
  @IsString()
  @IsNotEmpty()
  contactPerson: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ 
    example: 'Truck', 
    enum: VehicleType, 
    description: 'Type of vehicle used', 
    required: false,
    nullable: true 
  })
  @IsEnum(VehicleType)
  @IsOptional()
  vehicleType?: VehicleType;

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
