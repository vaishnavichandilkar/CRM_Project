import { Controller, Get, Post, Body, Put, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Team')
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new team member' })
  create(@Body() createTeamMemberDto: CreateTeamMemberDto) {
    return this.teamService.create(createTeamMemberDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all team members' })
  findAll(@Query('search') search?: string) {
    return this.teamService.findAll(search);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a team member' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTeamMemberDto: UpdateTeamMemberDto) {
    return this.teamService.update(id, updateTeamMemberDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a team member' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teamService.remove(id);
  }
}
