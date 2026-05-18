import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateCallDto } from './dto/create-call.dto';
import { LeadStatus, TaskStatus, CallType } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async createLead(userId: number, dto: CreateLeadDto) {
    const { assignedToId, customerId, productId, ...leadData } = dto;
    const initialStatus = dto.status || LeadStatus.OPEN;

    const count = await this.prisma.lead.count();
    const leadNumber = `LD-${String(count + 1).padStart(4, '0')}`;

    return this.prisma.lead.create({
      data: {
        ...leadData,
        leadNumber,
        status: initialStatus,
        customer: customerId ? { connect: { id: customerId } } : undefined,
        product: productId ? { connect: { id: productId } } : undefined,
        assignedTo: assignedToId ? { connect: { id: assignedToId } } : undefined,
        history: {
          create: {
            oldStatus: initialStatus,
            newStatus: initialStatus,
            changedById: userId,
            remarks: 'Lead created',
          }
        }
      },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        customer: true,
        product: true,
      }
    });
  }

  async updateLead(leadId: number, userId: number, dto: any) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    const { assignedToId, customerId, productId, status, ...leadData } = dto;
    const oldStatus = lead.status;
    const newStatus = status || oldStatus;

    return this.prisma.$transaction(async (tx) => {
      const updatedLead = await tx.lead.update({
        where: { id: leadId },
        data: {
          ...leadData,
          status: newStatus,
          isConverted: newStatus === LeadStatus.WON ? true : lead.isConverted,
          customer: customerId ? { connect: { id: customerId } } : customerId === null ? { disconnect: true } : undefined,
          product: productId ? { connect: { id: productId } } : productId === null ? { disconnect: true } : undefined,
          assignedTo: assignedToId ? { connect: { id: assignedToId } } : assignedToId === null ? { disconnect: true } : undefined,
        },
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
          customer: true,
          product: true,
        }
      });

      if (oldStatus !== newStatus) {
        await tx.leadHistory.create({
          data: {
            leadId,
            oldStatus,
            newStatus,
            changedById: userId,
            remarks: dto.remarks || `Status changed from ${oldStatus} to ${newStatus}`,
          }
        });
      }

      return updatedLead;
    });
  }

  async updateLeadStatus(leadId: number, userId: number, newStatus: LeadStatus, remarks?: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    const oldStatus = lead.status;
    
    return this.prisma.$transaction(async (tx) => {
      const updatedLead = await tx.lead.update({
        where: { id: leadId },
        data: { 
          status: newStatus,
          isConverted: newStatus === LeadStatus.WON ? true : lead.isConverted,
        },
      });

      await tx.leadHistory.create({
        data: {
          leadId,
          oldStatus,
          newStatus,
          changedById: userId,
          remarks: remarks || `Status changed from ${oldStatus} to ${newStatus}`,
        }
      });

      return updatedLead;
    });
  }

  async getLeadWithActivities(leadId: number) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        tasks: { orderBy: { dueDate: 'asc' } },
        calls: { orderBy: { startTime: 'desc' } },
        followups: { orderBy: { callDate: 'desc' } },
        history: { 
          include: { 
            changedBy: { select: { firstName: true, lastName: true } } 
          }, 
          orderBy: { timestamp: 'desc' } 
        },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        customer: true,
        product: true,
      }
    });

    if (!lead) throw new NotFoundException('Lead not found');

    // Calculate Last Conversation
    const lastFollowup = lead.followups[0];
    const lastCall = lead.calls[0];
    const lastCompletedTask = lead.tasks
      .filter(t => t.status === TaskStatus.COMPLETED)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0];

    let lastConversation = 'No previous conversation';
    if (lastFollowup) {
      lastConversation = lastFollowup.conversation;
    } else if (lastCall) {
      lastConversation = lastCall.notes;
    } else if (lastCompletedTask) {
      lastConversation = lastCompletedTask.description;
    }

    return {
      ...lead,
      lastConversation,
      upcomingTasks: lead.tasks.filter(t => t.status !== TaskStatus.COMPLETED),
    };
  }

  async getStats() {
    const counts = await this.prisma.lead.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const stats = {
      [LeadStatus.OPEN]: 0,
      [LeadStatus.IN_PROGRESS]: 0,
      [LeadStatus.WON]: 0,
      [LeadStatus.LOST]: 0,
    };

    counts.forEach(c => {
      stats[c.status] = c._count._all;
    });

    return {
      Open: stats[LeadStatus.OPEN],
      'In Progress': stats[LeadStatus.IN_PROGRESS],
      Won: stats[LeadStatus.WON],
      Lost: stats[LeadStatus.LOST],
    };
  }

  async getDashboardStats() {
    const totalLeads = await this.prisma.lead.count();
    const openLeads = await this.prisma.lead.count({ where: { status: LeadStatus.OPEN } });
    const inProgressLeads = await this.prisma.lead.count({ where: { status: LeadStatus.IN_PROGRESS } });
    const wonLeads = await this.prisma.lead.count({ where: { status: LeadStatus.WON } });
    const lostLeads = await this.prisma.lead.count({ where: { status: LeadStatus.LOST } });

    // Today's Follow-ups
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayFollowups = await this.prisma.leadFollowup.count({
      where: {
        callDate: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });

    const upcomingFollowups = await this.prisma.leadFollowup.count({
      where: {
        callDate: {
          gt: endOfToday,
        },
        status: 'PENDING',
      },
    });

    const missedFollowups = await this.prisma.leadFollowup.count({
      where: {
        callDate: {
          lt: startOfToday,
        },
        status: 'PENDING',
      },
    });

    const completedFollowups = await this.prisma.leadFollowup.count({
      where: {
        status: 'COMPLETED',
      },
    });

    const convertedSales = await this.prisma.lead.count({ where: { isConverted: true } });

    return {
      totalLeads,
      openLeads,
      inProgressLeads,
      wonLeads,
      lostLeads,
      todayFollowups,
      convertedSales,
      upcomingFollowups,
      missedFollowups,
      completedFollowups,
    };
  }

  async createFollowup(leadId: number, dto: any) {
    const { callDate, callTime, callType, conversation, nextFollowupDate, assignedEmployee } = dto;
    
    const followup = await this.prisma.leadFollowup.create({
      data: {
        leadId,
        callDate: new Date(callDate),
        callTime,
        callType,
        conversation,
        nextFollowupDate: nextFollowupDate ? new Date(nextFollowupDate) : null,
        assignedEmployee,
        status: 'COMPLETED',
      }
    });

    await this.prisma.leadHistory.create({
      data: {
        leadId,
        oldStatus: LeadStatus.IN_PROGRESS,
        newStatus: LeadStatus.IN_PROGRESS,
        changedById: dto.changedById || 1,
        remarks: `Follow-up Logged: ${callType} - ${conversation.substring(0, 60)}...${nextFollowupDate ? ' Next follow-up on ' + nextFollowupDate : ''}`,
      }
    });

    // Auto-update lead status to IN_PROGRESS if OPEN
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (lead && lead.status === LeadStatus.OPEN) {
      await this.prisma.lead.update({
        where: { id: leadId },
        data: { status: LeadStatus.IN_PROGRESS }
      });
      await this.prisma.leadHistory.create({
        data: {
          leadId,
          oldStatus: LeadStatus.OPEN,
          newStatus: LeadStatus.IN_PROGRESS,
          changedById: dto.changedById || 1,
          remarks: 'Status automatically changed to In Progress upon follow-up schedule',
        }
      });
    }

    return followup;
  }

  async listFollowups(leadId: number) {
    return this.prisma.leadFollowup.findMany({
      where: { leadId },
      orderBy: { callDate: 'desc' },
    });
  }

  async createCall(userId: number, dto: CreateCallDto) {
    const startTime = new Date(dto.startTime);
    const duration = dto.duration || 1800; // default 30 mins
    const endTime = new Date(startTime.getTime() + duration * 1000);

    const overlap = await this.prisma.call.findFirst({
      where: {
        ownerId: userId,
        startTime: {
          gte: startTime,
          lt: endTime,
        }
      }
    });

    if (overlap) {
      throw new ConflictException('You already have a call scheduled during this time');
    }

    const { leadId, ...callData } = dto;

    return this.prisma.call.create({
      data: {
        ...callData,
        lead: { connect: { id: leadId } },
        owner: { connect: { id: userId } },
      }
    });
  }

  async createTask(dto: CreateTaskDto) {
    const { leadId, ...taskData } = dto;
    return this.prisma.task.create({
      data: {
        ...taskData,
        lead: { connect: { id: leadId } },
      }
    });
  }

  async listLeads() {
    return this.prisma.lead.findMany({
      include: {
        assignedTo: { select: { firstName: true, lastName: true } },
        customer: true,
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
