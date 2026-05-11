import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VetDocsService } from './vet-docs.service';
import { CreateVetDocDto } from './dto/create-vet-doc.dto';
import { UpdateVetDocDto } from './dto/update-vet-doc.dto';

@ApiTags('Vet Docs')
@ApiBearerAuth()
@Controller('vet-docs')
export class VetDocsController {
  constructor(private readonly vetDocsService: VetDocsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new veterinary doctor record' })
  create(@Body() createVetDocDto: CreateVetDocDto) {
    return this.vetDocsService.create(createVetDocDto);
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all vet docs' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by Doctor Name, Specialty, or Phone' })
  findAll(@Query('search') search?: string) {
    return this.vetDocsService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch a single vet doc' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vetDocsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update vet doc details' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVetDocDto: UpdateVetDocDto,
  ) {
    return this.vetDocsService.update(id, updateVetDocDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a vet doc' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vetDocsService.remove(id);
  }
}
