import { IsArray, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRolePermissionsDto {
  @ApiProperty({ example: [1, 2], type: [Number], required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds?: number[];

  @ApiProperty({ example: ['leads', 'sales'], type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionNames?: string[];
}
