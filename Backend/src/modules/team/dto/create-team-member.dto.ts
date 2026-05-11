import { IsString, IsNotEmpty, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Region } from '@prisma/client';

export class CreateTeamMemberDto {
  @ApiProperty({ example: 'Sarah Wilson' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'sarah@crm.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Sales Rep' })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ enum: Region })
  @IsEnum(Region)
  @IsNotEmpty()
  region: Region;
}
