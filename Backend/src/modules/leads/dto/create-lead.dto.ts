import { IsString, IsEmail, IsOptional, IsEnum, IsInt, IsNumber } from 'class-validator';
import { LeadSource, LeadStatus } from '@prisma/client';

export class CreateLeadDto {
  @IsString()
  @IsOptional()
  leadNumber?: string;

  @IsInt()
  @IsOptional()
  customerId?: number;

  @IsInt()
  @IsOptional()
  productId?: number;

  @IsEnum(LeadSource)
  @IsOptional()
  source?: LeadSource;

  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsInt()
  @IsOptional()
  assignedToId?: number;

  @IsString()
  @IsOptional()
  callStatus?: string;

  // Customer details
  @IsString()
  @IsOptional()
  customerName?: string;

  @IsString()
  @IsOptional()
  mobileNumber?: string;

  @IsString()
  @IsOptional()
  alternateMobile?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  gstNumber?: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  pincode?: string;

  @IsString()
  @IsOptional()
  customerType?: string;

  @IsString()
  @IsOptional()
  contactPerson?: string;

  // Product details
  @IsString()
  @IsOptional()
  productName?: string;

  @IsString()
  @IsOptional()
  productCode?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  tax?: number;

  @IsInt()
  @IsOptional()
  stockQuantity?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  customerData?: any;

  @IsOptional()
  productData?: any;

  @IsOptional()
  leadData?: any;
}
