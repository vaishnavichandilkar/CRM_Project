import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Region } from '@prisma/client';

export class CreateVetDocDto {
  @ApiProperty({ example: 'Dr. Smith', description: 'The name of the doctor' })
  @IsString()
  @IsNotEmpty()
  doctorName: string;

  @ApiProperty({ example: 'Cattle', description: 'Specialty of the doctor' })
  @IsString()
  @IsNotEmpty()
  specialty: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number' })
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
