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
import { TransportersService } from './transporters.service';
import { CreateTransporterDto } from './dto/create-transporter.dto';
import { UpdateTransporterDto } from './dto/update-transporter.dto';

@ApiTags('Transporters')
@ApiBearerAuth()
@Controller('transporters')
export class TransportersController {
  constructor(private readonly transportersService: TransportersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transporter' })
  create(@Body() createTransporterDto: CreateTransporterDto) {
    return this.transportersService.create(createTransporterDto);
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all transporters' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by Name, Contact Person, Phone, or Vehicle Type' })
  findAll(@Query('search') search?: string) {
    return this.transportersService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch a single transporter' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transportersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a transporter' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransporterDto: UpdateTransporterDto,
  ) {
    return this.transportersService.update(id, updateTransporterDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a transporter' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.transportersService.remove(id);
  }
}
