import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Find default role (Sales Rep)
    let role = await this.prisma.role.findUnique({
      where: { name: 'Sales Rep' },
    });

    // If roles aren't seeded yet, create a temporary one so signup doesn't fail
    if (!role) {
      role = await this.prisma.role.create({
        data: { name: 'Sales Rep', description: 'Default sales representative role' },
      });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        password: hashedPassword,
        roleId: role.id,
      },
    });

    const userResponse = { ...user };
    delete (userResponse as any).password;
    return userResponse;
  }

  async signin(dto: SigninDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { 
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        } 
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async requestPasswordReset(dto: { email: string; proposedPassword?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new ConflictException('User not found');
    }

    // Hash the proposed password before storing
    let hashedProposed = null;
    if (dto.proposedPassword) {
      hashedProposed = await bcrypt.hash(dto.proposedPassword, 10);
    }

    return this.prisma.passwordResetRequest.create({
      data: {
        userId: user.id,
        proposedPassword: hashedProposed,
        status: 'PENDING',
      },
    });
  }

  async resetPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ConflictException('User not found');
    }

    const request = await this.prisma.passwordResetRequest.findFirst({
      where: {
        userId: user.id,
        status: 'APPROVED',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!request) {
      throw new UnauthorizedException('Password reset request not approved by admin');
    }

    if (!request.proposedPassword) {
      throw new ConflictException('No proposed password found in the request');
    }

    // Apply the proposed password
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: request.proposedPassword },
    });

    // Mark as completed
    await this.prisma.passwordResetRequest.update({
      where: { id: request.id },
      data: { status: 'COMPLETED' },
    });

    return { message: 'Password has been reset successfully' };
  }

  async approveResetRequest(requestId: number, adminId: number) {
    return this.prisma.passwordResetRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        adminId: adminId,
      },
    });
  }

  async getPendingRequests() {
    return this.prisma.passwordResetRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}


