import { IsObject, IsNotEmpty } from 'class-validator';

export class InsertModuleDataDto {
  @IsObject()
  @IsNotEmpty()
  data: any;
}
