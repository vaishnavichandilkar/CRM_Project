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
import { SHGService } from './shg.service';
import { CreateSelfHelpGroupDto } from './dto/create-shg.dto';
import { UpdateSelfHelpGroupDto } from './dto/update-shg.dto';

@ApiTags('SHG')
@ApiBearerAuth()
@Controller('shg')
export class SHGController {
  constructor(private readonly shgService: SHGService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Self Help Group record' })
  create(@Body() createSHGDto: CreateSelfHelpGroupDto) {
    return this.shgService.create(createSHGDto);
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all SHGs' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by Group Name, Leader Name, or Activity' })
  findAll(@Query('search') search?: string) {
    return this.shgService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch a single SHG' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shgService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update SHG details' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSHGDto: UpdateSelfHelpGroupDto,
  ) {
    return this.shgService.update(id, updateSHGDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove an SHG' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.shgService.remove(id);
  }
}
