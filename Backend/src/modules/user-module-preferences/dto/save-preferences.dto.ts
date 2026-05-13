import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SavePreferencesDto {
  @ApiProperty({
    description: 'List of selected module keys',
    example: ['dashboard', 'sales', 'customers'],
  })
  @IsArray()
  @IsString({ each: true })
  selectedModules: string[];
}
