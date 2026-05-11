import { Controller, Get, Post, Param, ParseIntPipe, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Roles } from './decorators/roles.decorator';

@ApiTags('password-requests')
@ApiBearerAuth()
@Controller('auth/password-requests')
export class PasswordRequestsController {
  constructor(private authService: AuthService) {}

  @Get('pending')
  @Roles('Admin') // Based on common project naming, or use 'Admin'
  @ApiOperation({ summary: 'Get all pending password reset requests (Admin only)' })
  getPending() {
    return this.authService.getPendingRequests();
  }

  @Post(':id/approve')
  @Roles('Admin')
  @ApiOperation({ summary: 'Approve a password reset request (Admin only)' })
  approve(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const adminId = req.user.id;
    return this.authService.approveResetRequest(id, adminId);
  }
}
