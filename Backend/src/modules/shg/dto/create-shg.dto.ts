import { IsString, IsNotEmpty, IsInt, Min, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Region } from '@prisma/client';

export class CreateSelfHelpGroupDto {
  @ApiProperty({ example: 'SHG Group A', description: 'The name of the group' })
  @IsString()
  @IsNotEmpty()
  groupName: string;

  @ApiProperty({ example: 'Mary Leader', description: 'The name of the group leader' })
  @IsString()
  @IsNotEmpty()
  leaderName: string;

  @ApiProperty({ example: 15, description: 'Number of members in the group' })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  numberOfMembers: number;

  @ApiProperty({ example: 'Dairy', description: 'Primary activity of the group' })
  @IsString()
  @IsNotEmpty()
  activity: string;

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
