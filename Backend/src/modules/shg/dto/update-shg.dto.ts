import { PartialType } from '@nestjs/swagger';
import { CreateSelfHelpGroupDto } from './create-shg.dto';

export class UpdateSelfHelpGroupDto extends PartialType(CreateSelfHelpGroupDto) {}
