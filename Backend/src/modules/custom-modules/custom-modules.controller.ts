import { Controller, Post, Get, Delete, Patch, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { CustomModulesService } from './custom-modules.service';
import { CreateCustomModuleDto } from './dto/create-custom-module.dto';
import { InsertModuleDataDto } from './dto/insert-module-data.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('custom-modules')
@UseGuards(JwtAuthGuard)
export class CustomModulesController {
  constructor(private readonly customModulesService: CustomModulesService) {}

  @Post()
  createModule(@Request() req, @Body() dto: CreateCustomModuleDto) {
    return this.customModulesService.createModule(req.user.id, dto);
  }

  @Get()
  listModules(@Request() req) {
    return this.customModulesService.listModules(req.user.id);
  }

  @Post(':id/data')
  insertData(@Param('id', ParseIntPipe) id: number, @Body() dto: InsertModuleDataDto) {
    return this.customModulesService.insertData(id, dto.data);
  }

  @Get(':id/data')
  getModuleData(@Param('id', ParseIntPipe) id: number) {
    return this.customModulesService.getModuleData(id);
  }

  @Delete('data/:dataId')
  deleteData(@Param('dataId', ParseIntPipe) dataId: number) {
    return this.customModulesService.deleteData(dataId);
  }

  @Patch('data/:dataId')
  updateData(@Param('dataId', ParseIntPipe) dataId: number, @Body() dto: InsertModuleDataDto) {
    return this.customModulesService.updateData(dataId, dto.data);
  }

  @Patch(':id')
  updateModule(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateCustomModuleDto) {
    return this.customModulesService.updateModule(id, dto);
  }

  @Delete(':id')
  deleteModule(@Param('id', ParseIntPipe) id: number) {
    return this.customModulesService.deleteModule(id);
  }
}
