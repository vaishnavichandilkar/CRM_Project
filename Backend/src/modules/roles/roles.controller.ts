import { Body, Controller, Get, Param, Patch, ParseIntPipe } from '@nestjs/common';
import { RolesService } from './roles.service';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('roles & permissions')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'List all roles and their permissions' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('permissions')
  @ApiOperation({ summary: 'List all available permissions' })
  findPermissions() {
    return this.rolesService.findPermissions();
  }

  @Patch(':id/permissions')
  @Roles('Admin')
  @ApiOperation({ summary: 'Update permissions for a role' })
  @ApiResponse({ status: 200, description: 'Permissions updated successfully.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  updatePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    return this.rolesService.updatePermissions(id, dto);
  }
}
