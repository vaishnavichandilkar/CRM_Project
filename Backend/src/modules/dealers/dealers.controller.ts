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
import { DealersService } from './dealers.service';
import { CreateDealerDto } from './dto/create-dealer.dto';
import { UpdateDealerDto } from './dto/update-dealer.dto';

@ApiTags('Dealers')
@ApiBearerAuth()
@Controller('dealers')
export class DealersController {
  constructor(private readonly dealersService: DealersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new dealer' })
  create(@Body() createDealerDto: CreateDealerDto) {
    return this.dealersService.create(createDealerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all dealers' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by Name, Contact Person, or Phone' })
  findAll(@Query('search') search?: string) {
    return this.dealersService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch a single dealer' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dealersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a dealer' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDealerDto: UpdateDealerDto,
  ) {
    return this.dealersService.update(id, updateDealerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a dealer' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dealersService.remove(id);
  }
}
