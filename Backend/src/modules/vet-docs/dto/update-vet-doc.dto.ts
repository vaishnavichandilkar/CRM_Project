import { PartialType } from '@nestjs/swagger';
import { CreateVetDocDto } from './create-vet-doc.dto';

export class UpdateVetDocDto extends PartialType(CreateVetDocDto) {}
