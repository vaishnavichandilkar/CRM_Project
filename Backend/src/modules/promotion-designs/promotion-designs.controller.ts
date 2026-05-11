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
import { PromotionDesignsService } from './promotion-designs.service';
import { CreatePromotionDesignDto } from './dto/create-promotion-design.dto';
import { UpdatePromotionDesignDto } from './dto/update-promotion-design.dto';

@ApiTags('Promotion Designs')
@ApiBearerAuth()
@Controller('promotion-designs')
export class PromotionDesignsController {
  constructor(private readonly promotionDesignsService: PromotionDesignsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new promotion design asset' })
  create(@Body() createDto: CreatePromotionDesignDto) {
    return this.promotionDesignsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all promotion designs' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by Design Title, Type, or Status' })
  findAll(@Query('search') search?: string) {
    return this.promotionDesignsService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch a single promotion design' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.promotionDesignsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update promotion design details' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePromotionDesignDto,
  ) {
    return this.promotionDesignsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a promotion design' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.promotionDesignsService.remove(id);
  }
}
