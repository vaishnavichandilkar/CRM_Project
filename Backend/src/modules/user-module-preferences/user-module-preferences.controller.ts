import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserModulePreferencesService } from './user-module-preferences.service';
import { SavePreferencesDto } from './dto/save-preferences.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('user-module-preferences')
@ApiBearerAuth()
@Controller('user-module-preferences')
export class UserModulePreferencesController {
  constructor(private readonly service: UserModulePreferencesService) {}

  @Post()
  @ApiOperation({ summary: 'Save user module preferences' })
  @ApiResponse({ status: 201, description: 'Preferences saved successfully.' })
  async save(@Req() req: any, @Body() dto: SavePreferencesDto) {
    console.log('Received save request. User:', req.user?.id);
    if (!req.user) {
      console.error('No user found in request!');
    }
    return this.service.savePreferences(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user module preferences' })
  @ApiResponse({ status: 200, description: 'Preferences retrieved successfully.' })
  async get(@Req() req: any) {
    return this.service.getPreferences(req.user.id);
  }
}
