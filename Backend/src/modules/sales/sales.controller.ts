import { Controller, Get, Post, Patch, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto, SaleStatusEnum } from './dto/create-sale.dto';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  getSalesData(@Query('purchaseCount') purchaseCount?: '1' | 'gt1') {
    return this.salesService.getSalesData(purchaseCount);
  }

  @Get('form-metadata')
  getSalesMetadata() {
    return this.salesService.getSalesMetadata();
  }

  @Get('pipeline-flow')
  getPipelineStats() {
    return this.salesService.getPipelineStats();
  }

  @Post()
  createSale(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.createSale(createSaleDto);
  }

  @Patch(':id/status')
  updateSaleStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: SaleStatusEnum,
  ) {
    return this.salesService.updateSaleStatus(id, status);
  }
}
