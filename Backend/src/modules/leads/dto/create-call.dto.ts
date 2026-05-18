import { IsEnum, IsDateString, IsInt, IsOptional, IsString } from 'class-validator';
import { CallType } from '@prisma/client';

export class CreateCallDto {
  @IsEnum(CallType)
  callType: CallType;

  @IsDateString()
  startTime: string;

  @IsInt()
  @IsOptional()
  duration?: number; // in seconds

  @IsString()
  @IsOptional()
  voiceRecordingUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsInt()
  leadId: number;
}
