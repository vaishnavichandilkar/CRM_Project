import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  private splitName(fullName: string) {
    const parts = fullName.trim().split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || '';
    return { firstName, lastName };
  }

  async create(dto: CreateTeamMemberDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const role = await this.prisma.role.findUnique({
      where: { name: dto.role },
    });

    if (!role) {
      throw new NotFoundException(`Role ${dto.role} not found`);
    }

    const { firstName, lastName } = this.splitName(dto.fullName);
    const defaultPassword = await bcrypt.hash('team123', 10);

    return this.prisma.user.create({
      data: {
        firstName,
        lastName,
        email: dto.email,
        password: defaultPassword,
        roleId: role.id,
        region: dto.region,
      },
      include: { role: true },
    });
  }

  async findAll(search?: string) {
    return this.prisma.user.findMany({
      where: {
        role: {
          name: { in: ['Sales Rep', 'Manager'] },
        },
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: number, dto: UpdateTeamMemberDto) {
    const data: any = {};
    
    if (dto.fullName) {
      const { firstName, lastName } = this.splitName(dto.fullName);
      data.firstName = firstName;
      data.lastName = lastName;
    }
    
    if (dto.email) data.email = dto.email;
    if (dto.region) data.region = dto.region;
    
    if (dto.role) {
      const role = await this.prisma.role.findUnique({
        where: { name: dto.role },
      });
      if (!role) throw new NotFoundException(`Role ${dto.role} not found`);
      data.roleId = role.id;
    }

    return this.prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
