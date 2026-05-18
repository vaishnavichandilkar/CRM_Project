import { IsString, IsDateString, IsEnum, IsOptional, IsInt } from 'class-validator';
import { TaskPriority, TaskStatus } from '@prisma/client';

export class CreateTaskDto {
  @IsString()
  subject: string;

  @IsDateString()
  dueDate: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  leadId: number;
}
