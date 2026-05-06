import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async findPermissions() {
    return this.prisma.permission.findMany();
  }

  async updatePermissions(roleId: number, dto: UpdateRolePermissionsDto) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    let finalPermissionIds: number[] = [];

    // 1. If IDs are provided, use them
    if (dto.permissionIds) {
      finalPermissionIds = dto.permissionIds;
    } 
    // 2. If Names are provided, resolve them to IDs
    else if (dto.permissionNames) {
      const permissions = await this.prisma.permission.findMany({
        where: { name: { in: dto.permissionNames } },
      });

      if (permissions.length !== dto.permissionNames.length) {
        const foundNames = permissions.map(p => p.name);
        const missingNames = dto.permissionNames.filter(name => !foundNames.includes(name));
        throw new BadRequestException(`Permissions not found: ${missingNames.join(', ')}`);
      }

      finalPermissionIds = permissions.map(p => p.id);
    } else {
      throw new BadRequestException('Either permissionIds or permissionNames must be provided');
    }

    // Use a transaction to update permissions
    return this.prisma.$transaction(async (tx) => {
      // Delete existing
      await tx.rolePermission.deleteMany({
        where: { roleId },
      });

      // Add new
      if (finalPermissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: finalPermissionIds.map((permId) => ({
            roleId,
            permissionId: permId,
          })),
        });
      }

      return tx.role.findUnique({
        where: { id: roleId },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    });
  }
}
