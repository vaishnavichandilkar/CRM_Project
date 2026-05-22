import { Controller, Post, Get, Patch, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateCallDto } from './dto/create-call.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LeadStatus } from '@prisma/client';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  createLead(@Request() req, @Body() dto: CreateLeadDto) {
    return this.leadsService.createLead(req.user.id, dto);
  }

  @Patch(':id')
  updateLead(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() dto: any,
  ) {
    return this.leadsService.updateLead(id, req.user.id, dto);
  }

  @Get()
  listLeads() {
    return this.leadsService.listLeads();
  }

  @Get('dashboard/stats')
  getDashboardStats() {
    return this.leadsService.getDashboardStats();
  }

  @Get('dashboard/notifications')
  getTodayNotifications() {
    return this.leadsService.getTodayNotifications();
  }

  @Get('stats')
  getStats() {
    return this.leadsService.getStats();
  }

  @Get(':id')
  getLead(@Param('id', ParseIntPipe) id: number) {
    return this.leadsService.getLeadWithActivities(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body('status') status: LeadStatus,
    @Body('remarks') remarks?: string,
  ) {
    return this.leadsService.updateLeadStatus(id, req.user.id, status, remarks);
  }

  @Post(':id/followups')
  createFollowup(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() dto: any,
  ) {
    return this.leadsService.createFollowup(id, { ...dto, changedById: req.user.id });
  }

  @Get(':id/followups')
  listFollowups(@Param('id', ParseIntPipe) id: number) {
    return this.leadsService.listFollowups(id);
  }

  @Post('tasks')
  createTask(@Body() dto: CreateTaskDto) {
    return this.leadsService.createTask(dto);
  }

  @Post('calls')
  createCall(@Request() req, @Body() dto: CreateCallDto) {
    return this.leadsService.createCall(req.user.id, dto);
  }
}
