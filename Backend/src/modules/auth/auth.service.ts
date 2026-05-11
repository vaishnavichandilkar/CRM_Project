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
        status: 'ACTIVE',
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
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is inactive. Please contact admin.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      // Check if user is trying to use ANY pending requested password
      const pendingRequests = await this.prisma.passwordResetRequest.findMany({
        where: {
          userId: user.id,
          status: 'PENDING',
        },
      });

      for (const req of pendingRequests) {
        const isPendingMatch = await bcrypt.compare(dto.password, req.requestedPassword);
        if (isPendingMatch) {
          throw new UnauthorizedException('Your password reset request is pending admin approval. Please use your old password or wait for approval.');
        }
      }

      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const payload = { sub: user.id, email: user.email, role: user.role.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
    };
  }

  async requestPasswordReset(dto: { email: string; proposedPassword?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new ConflictException('User not found with this email');
    }

    // Hash the proposed password before storing
    if (!dto.proposedPassword) {
      throw new ConflictException('Proposed password is required');
    }
    
    const hashedProposed = await bcrypt.hash(dto.proposedPassword, 10);

    return this.prisma.passwordResetRequest.create({
      data: {
        userId: user.id,
        email: dto.email,
        requestedPassword: hashedProposed,
        status: 'PENDING',
      },
    });
  }

  async approveResetRequest(requestId: string) {
    const request = await this.prisma.passwordResetRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!request) {
      throw new ConflictException('Reset request not found');
    }

    if (request.status !== 'PENDING') {
      throw new ConflictException(`Request is already ${request.status}`);
    }

    // Update user password
    await this.prisma.user.update({
      where: { id: request.userId },
      data: { password: request.requestedPassword },
    });

    // Update request status
    return this.prisma.passwordResetRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    });
  }

  async rejectResetRequest(requestId: string) {
    const request = await this.prisma.passwordResetRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new ConflictException('Reset request not found');
    }

    if (request.status !== 'PENDING') {
      throw new ConflictException(`Request is already ${request.status}`);
    }

    return this.prisma.passwordResetRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
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
      orderBy: { requestedAt: 'desc' },
    });
  }
}


