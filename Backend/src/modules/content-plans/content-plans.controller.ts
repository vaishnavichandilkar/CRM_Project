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
import { ContentPlansService } from './content-plans.service';
import { CreateContentPlanDto } from './dto/create-content-plan.dto';
import { UpdateContentPlanDto } from './dto/update-content-plan.dto';

@ApiTags('Content Plans')
@ApiBearerAuth()
@Controller('content-plans')
export class ContentPlansController {
  constructor(private readonly contentPlansService: ContentPlansService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new content plan' })
  create(@Body() createContentPlanDto: CreateContentPlanDto) {
    return this.contentPlansService.create(createContentPlanDto);
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all content plans' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by Campaign Title or Platform' })
  findAll(@Query('search') search?: string) {
    return this.contentPlansService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch a single content plan' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contentPlansService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update content plan details' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContentPlanDto: UpdateContentPlanDto,
  ) {
    return this.contentPlansService.update(id, updateContentPlanDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a content plan' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contentPlansService.remove(id);
  }
}
