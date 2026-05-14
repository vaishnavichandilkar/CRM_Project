import { IsString, IsOptional, IsArray, ValidateNested, IsNotEmpty, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCustomFieldDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['string', 'number', 'date', 'boolean'])
  dataType: string;

  @IsOptional()
  validationRules?: any;
}

export class CreateCustomModuleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  icon: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  allowView?: boolean;

  @IsBoolean()
  @IsOptional()
  allowEdit?: boolean;

  @IsBoolean()
  @IsOptional()
  allowDelete?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCustomFieldDto)
  fields: CreateCustomFieldDto[];
}
