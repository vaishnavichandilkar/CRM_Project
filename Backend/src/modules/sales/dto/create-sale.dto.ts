import { IsNumber, IsOptional, IsEnum, IsInt } from 'class-validator';

export enum SaleStatusEnum {
  Lead = 'Lead',
  Opportunity = 'Opportunity',
  Sale = 'Sale',
  Invoice = 'Invoice',
}

export class CreateSaleDto {
  @IsNumber()
  amount: number;

  @IsEnum(SaleStatusEnum)
  @IsOptional()
  status?: SaleStatusEnum;

  @IsInt()
  customerId: number;

  @IsInt()
  productId: number;

  @IsInt()
  @IsOptional()
  purchaseCount?: number;
}
