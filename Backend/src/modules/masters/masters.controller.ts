import { Controller, Get, Post, Body, Param, Query, Put, Delete, UseGuards } from '@nestjs/common';
import { MastersService } from './masters.service';

@Controller('masters')
export class MastersController {
  constructor(private readonly mastersService: MastersService) {}

  @Get('configs')
  getAllConfigs() {
    return this.mastersService.getAllConfigs();
  }

  @Get('config/:slug')
  getConfig(@Param('slug') slug: string) {
    return this.mastersService.getConfigBySlug(slug);
  }

  @Post('config')
  createConfig(@Body() body: { name: string; slug: string; config: any }) {
    return this.mastersService.createConfig(body.name, body.slug, body.config);
  }

  @Put('config/:slug')
  updateConfig(@Param('slug') slug: string, @Body() body: { name: string; config: any }) {
    return this.mastersService.updateConfig(slug, body.name, body.config);
  }

  @Delete('config/:slug')
  deleteConfig(@Param('slug') slug: string) {
    return this.mastersService.deleteConfig(slug);
  }


  @Get('records/:slug')
  getRecords(
    @Param('slug') slug: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.mastersService.getRecords(
      slug,
      search,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Post('record/:slug')
  createRecord(@Param('slug') slug: string, @Body() data: any) {
    return this.mastersService.createRecord(slug, data);
  }

  @Put('record/:id')
  updateRecord(@Param('id') id: string, @Body() data: any) {
    return this.mastersService.updateRecord(parseInt(id), data);
  }

  @Delete('record/:id')
  deleteRecord(@Param('id') id: string) {
    return this.mastersService.deleteRecord(parseInt(id));
  }
}
