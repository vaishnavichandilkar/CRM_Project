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
    const rawDto = dto as any;
    const { assignedToId, customerId, productId, ...leadData } = dto;
    const initialStatus = dto.status || LeadStatus.OPEN;

    let finalCustomerId = customerId;

    if (!finalCustomerId && (dto.customerName || dto.email || dto.mobileNumber || rawDto.phone || dto.customerData?.name || dto.customerData?.email || dto.customerData?.phone || dto.customerData?.mobileNumber)) {
      
      const custType = (dto.customerData?.type || dto.customerType || rawDto.type || 'Retail').toLowerCase();
      const isDealer = custType.includes('dealer') || custType.includes('wholesale');
      const targetSlug = isDealer ? 'dealers' : 'customers';

      const customerConfig = await this.prisma.masterConfig.findUnique({
        where: { slug: targetSlug },
      });

      if (customerConfig) {
        const existingCustomers = await this.prisma.masterData.findMany({
          where: { masterConfigId: customerConfig.id },
        });

        const emailToCheck = dto.email?.trim() || dto.customerData?.email?.trim();
        const phoneToCheck = dto.mobileNumber?.trim() || dto.customerData?.phone?.trim() || rawDto.phone?.trim() || dto.customerData?.mobileNumber?.trim();
        const nameToCheck = dto.customerName?.trim() || dto.customerData?.name?.trim();

        const matchedCustomer = existingCustomers.find((c: any) => {
          const cData = c.data as any;
          if (!cData) return false;

          const emailMatch = emailToCheck && cData.email && cData.email.toLowerCase() === emailToCheck.toLowerCase();
          const nameMatch = nameToCheck && cData.name && cData.name.toLowerCase() === nameToCheck.toLowerCase();

          // A match is only valid if:
          // 1. The name matches exactly (case-insensitive) OR
          // 2. The email matches exactly (case-insensitive) AND nameToCheck is either missing or matches
          if (nameMatch) return true;
          if (emailMatch && (!nameToCheck || !cData.name || cData.name.toLowerCase() === nameToCheck.toLowerCase())) return true;

          return false;
        });

        if (matchedCustomer) {
          finalCustomerId = matchedCustomer.id;
        } else if (nameToCheck) {
          const newCustomerData: any = {
            name: nameToCheck,
            email: emailToCheck || '',
            phone: phoneToCheck || '',
            region: dto.customerData?.region || rawDto.region || 'North',
            type: dto.customerData?.type || dto.customerType || rawDto.type || 'Retail',
            address: dto.address || dto.customerData?.address || '',
          };

          if (dto.customerData && typeof dto.customerData === 'object') {
            for (const key of Object.keys(dto.customerData)) {
              if (newCustomerData[key] === undefined) {
                newCustomerData[key] = dto.customerData[key];
              }
            }
          }

          if (isDealer) {
            newCustomerData.contactPerson = nameToCheck; // fallback
          }

          if (!newCustomerData.customerCode && !isDealer) {
            const currentCustomerRecordsCount = await this.prisma.masterData.count({
              where: { masterConfigId: customerConfig.id }
            });
            newCustomerData.customerCode = `CUST${String(currentCustomerRecordsCount + 1).padStart(3, '0')}`;
          }

          const createdCustomer = await this.prisma.masterData.create({
            data: {
              masterConfigId: customerConfig.id,
              data: newCustomerData,
            },
          });

          finalCustomerId = createdCustomer.id;

          // Synchronize to static Customer table
          try {
            const rawRegion = (newCustomerData.region || 'North').toUpperCase();
            const validRegion = ['NORTH', 'SOUTH', 'EAST', 'WEST'].includes(rawRegion) ? rawRegion : 'NORTH';
            
            const rawType = (newCustomerData.type || 'Retail').toUpperCase();
            const validCustomerType = ['RETAIL', 'WHOLESALE'].includes(rawType) ? rawType : 'RETAIL';

            if (isDealer) {
              await this.prisma.dealer.create({
                data: {
                  name: newCustomerData.name,
                  contactPerson: newCustomerData.contactPerson || newCustomerData.name,
                  phone: newCustomerData.phone || '',
                  region: validRegion as any,
                }
              });
            } else {
              const uniqueEmail = newCustomerData.email && newCustomerData.email.trim() !== '' 
                ? newCustomerData.email.trim().toLowerCase() 
                : `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}@example.com`;

              const existingStatic = await this.prisma.customer.findUnique({
                where: { email: uniqueEmail }
              });

              if (!existingStatic) {
                await this.prisma.customer.create({
                  data: {
                    name: newCustomerData.name,
                    email: uniqueEmail,
                    phone: newCustomerData.phone || '',
                    region: validRegion as any,
                    type: validCustomerType as any,
                    address: newCustomerData.address || '',
                  }
                });
              }
            }
          } catch (err) {
            console.error("Failed to sync to static Customer model:", err);
          }
        }
      }
    }

    let finalProductId = productId;
    if (finalProductId) {
      const exists = await this.prisma.masterData.findUnique({ where: { id: finalProductId } });
      if (!exists) {
        finalProductId = undefined;
      }
    }

    let finalAssignedToId = assignedToId;
    if (finalAssignedToId) {
      const exists = await this.prisma.user.findUnique({ where: { id: finalAssignedToId } });
      if (!exists) {
        finalAssignedToId = undefined;
      }
    }

    if (finalCustomerId) {
      const exists = await this.prisma.masterData.findUnique({ where: { id: finalCustomerId } });
      if (!exists) {
        finalCustomerId = undefined;
      }
    }

    const count = await this.prisma.lead.count();
    const leadNumber = `LD-${String(count + 1).padStart(4, '0')}`;

    return this.prisma.lead.create({
      data: {
        ...leadData,
        leadNumber,
        status: initialStatus,
        customer: finalCustomerId ? { connect: { id: finalCustomerId } } : undefined,
        product: finalProductId ? { connect: { id: finalProductId } } : undefined,
        assignedTo: finalAssignedToId ? { connect: { id: finalAssignedToId } } : undefined,
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

    const rawDto = dto as any;
    let finalCustomerId = customerId;

    if (!finalCustomerId && (dto.customerName || dto.email || dto.mobileNumber || dto.phone || dto.customerData?.name || dto.customerData?.email || dto.customerData?.phone || dto.customerData?.mobileNumber)) {
      
      const custType = (dto.customerData?.type || dto.customerType || rawDto.type || 'Retail').toLowerCase();
      const isDealer = custType.includes('dealer') || custType.includes('wholesale');
      const targetSlug = isDealer ? 'dealers' : 'customers';

      const customerConfig = await this.prisma.masterConfig.findUnique({
        where: { slug: targetSlug },
      });

      if (customerConfig) {
        const existingCustomers = await this.prisma.masterData.findMany({
          where: { masterConfigId: customerConfig.id },
        });

        const emailToCheck = dto.email?.trim() || dto.customerData?.email?.trim();
        const phoneToCheck = dto.mobileNumber?.trim() || dto.customerData?.phone?.trim() || rawDto.phone?.trim() || dto.customerData?.mobileNumber?.trim();
        const nameToCheck = dto.customerName?.trim() || dto.customerData?.name?.trim();

        const matchedCustomer = existingCustomers.find((c: any) => {
          const cData = c.data as any;
          if (!cData) return false;

          const emailMatch = emailToCheck && cData.email && cData.email.toLowerCase() === emailToCheck.toLowerCase();
          const nameMatch = nameToCheck && cData.name && cData.name.toLowerCase() === nameToCheck.toLowerCase();

          // A match is only valid if:
          // 1. The name matches exactly (case-insensitive) OR
          // 2. The email matches exactly (case-insensitive) AND nameToCheck is either missing or matches
          if (nameMatch) return true;
          if (emailMatch && (!nameToCheck || !cData.name || cData.name.toLowerCase() === nameToCheck.toLowerCase())) return true;

          return false;
        });

        if (matchedCustomer) {
          finalCustomerId = matchedCustomer.id;
        } else if (nameToCheck) {
          const newCustomerData: any = {
            name: nameToCheck,
            email: emailToCheck || '',
            phone: phoneToCheck || '',
            region: dto.customerData?.region || rawDto.region || 'North',
            type: dto.customerData?.type || dto.customerType || rawDto.type || 'Retail',
            address: dto.address || dto.customerData?.address || '',
          };

          if (dto.customerData && typeof dto.customerData === 'object') {
            for (const key of Object.keys(dto.customerData)) {
              if (newCustomerData[key] === undefined) {
                newCustomerData[key] = dto.customerData[key];
              }
            }
          }

          if (isDealer) {
            newCustomerData.contactPerson = nameToCheck; // fallback
          }

          if (!newCustomerData.customerCode && !isDealer) {
            const currentCustomerRecordsCount = await this.prisma.masterData.count({
              where: { masterConfigId: customerConfig.id }
            });
            newCustomerData.customerCode = `CUST${String(currentCustomerRecordsCount + 1).padStart(3, '0')}`;
          }

          const createdCustomer = await this.prisma.masterData.create({
            data: {
              masterConfigId: customerConfig.id,
              data: newCustomerData,
            },
          });

          finalCustomerId = createdCustomer.id;

          // Synchronize to static Customer table
          try {
            const rawRegion = (newCustomerData.region || 'North').toUpperCase();
            const validRegion = ['NORTH', 'SOUTH', 'EAST', 'WEST'].includes(rawRegion) ? rawRegion : 'NORTH';
            
            const rawType = (newCustomerData.type || 'Retail').toUpperCase();
            const validCustomerType = ['RETAIL', 'WHOLESALE'].includes(rawType) ? rawType : 'RETAIL';

            if (isDealer) {
              await this.prisma.dealer.create({
                data: {
                  name: newCustomerData.name,
                  contactPerson: newCustomerData.contactPerson || newCustomerData.name,
                  phone: newCustomerData.phone || '',
                  region: validRegion as any,
                }
              });
            } else {
              const uniqueEmail = newCustomerData.email && newCustomerData.email.trim() !== '' 
                ? newCustomerData.email.trim().toLowerCase() 
                : `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}@example.com`;

              const existingStatic = await this.prisma.customer.findUnique({
                where: { email: uniqueEmail }
              });

              if (!existingStatic) {
                await this.prisma.customer.create({
                  data: {
                    name: newCustomerData.name,
                    email: uniqueEmail,
                    phone: newCustomerData.phone || '',
                    region: validRegion as any,
                    type: validCustomerType as any,
                    address: newCustomerData.address || '',
                  }
                });
              }
            }
          } catch (err) {
            console.error("Failed to sync to static Customer model:", err);
          }
        }
      }
    }

    const filteredLeadData: any = {};
    const allowedLeadKeys = [
      'leadNumber',
      'source',
      'notes',
      'customerName',
      'mobileNumber',
      'alternateMobile',
      'email',
      'gstNumber',
      'companyName',
      'address',
      'city',
      'state',
      'country',
      'pincode',
      'customerType',
      'contactPerson',
      'productName',
      'productCode',
      'category',
      'brand',
      'unit',
      'price',
      'tax',
      'stockQuantity',
      'description',
      'customerData',
      'productData',
      'leadData',
      'isConverted',
    ];
    for (const key of allowedLeadKeys) {
      if (leadData[key] !== undefined) {
        filteredLeadData[key] = leadData[key];
      }
    }

    let finalProductId = productId;
    if (finalProductId) {
      const exists = await this.prisma.masterData.findUnique({ where: { id: finalProductId } });
      if (!exists) {
        finalProductId = undefined;
      }
    }

    let finalAssignedToId = assignedToId;
    if (finalAssignedToId) {
      const exists = await this.prisma.user.findUnique({ where: { id: finalAssignedToId } });
      if (!exists) {
        finalAssignedToId = undefined;
      }
    }

    if (finalCustomerId) {
      const exists = await this.prisma.masterData.findUnique({ where: { id: finalCustomerId } });
      if (!exists) {
        finalCustomerId = undefined;
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedLead = await tx.lead.update({
        where: { id: leadId },
        data: {
          ...filteredLeadData,
          status: newStatus,
          isConverted: newStatus === LeadStatus.WON ? true : lead.isConverted,
          customer: finalCustomerId ? { connect: { id: finalCustomerId } } : finalCustomerId === null ? { disconnect: true } : undefined,
          product: finalProductId ? { connect: { id: finalProductId } } : finalProductId === null ? { disconnect: true } : undefined,
          assignedTo: finalAssignedToId ? { connect: { id: finalAssignedToId } } : finalAssignedToId === null ? { disconnect: true } : undefined,
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

    const todayFollowupsGroup = await this.prisma.leadFollowup.groupBy({
      by: ['leadId'],
      where: {
        OR: [
          { callDate: { gte: startOfToday, lte: endOfToday } },
          { nextFollowupDate: { gte: startOfToday, lte: endOfToday } }
        ]
      },
    });
    const todayFollowups = todayFollowupsGroup.length;

    const upcomingFollowupsGroup = await this.prisma.leadFollowup.groupBy({
      by: ['leadId'],
      where: {
        callDate: {
          gt: endOfToday,
        },
        status: 'PENDING',
      },
    });
    const upcomingFollowups = upcomingFollowupsGroup.length;

    const missedFollowupsGroup = await this.prisma.leadFollowup.groupBy({
      by: ['leadId'],
      where: {
        callDate: {
          lt: startOfToday,
        },
        status: 'PENDING',
      },
    });
    const missedFollowups = missedFollowupsGroup.length;

    const completedFollowupsGroup = await this.prisma.leadFollowup.groupBy({
      by: ['leadId'],
      where: {
        status: 'COMPLETED',
      },
    });
    const completedFollowups = completedFollowupsGroup.length;

    const convertedSales = await this.prisma.lead.count({ where: { isConverted: true } });

    const totalFollowupsGroup = await this.prisma.leadFollowup.groupBy({
      by: ['leadId'],
    });
    const totalFollowups = totalFollowupsGroup.length;

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
      totalFollowups,
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

  async getTodayNotifications() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Roll forward overdue followups (Schedule for next day automatically)
    const overdueFollowups = await this.prisma.leadFollowup.findMany({
      where: {
        nextFollowupDate: { lt: startOfToday },
      },
    });

    if (overdueFollowups.length > 0) {
      // Only roll forward if it's the LATEST followup for that lead
      const allForLeads = await this.prisma.leadFollowup.findMany({
        where: { leadId: { in: overdueFollowups.map(f => f.leadId) } },
        orderBy: { createdAt: 'asc' }
      });
      
      const latestFollowupsMap = new Map();
      for (const f of allForLeads) {
        latestFollowupsMap.set(f.leadId, f);
      }

      const idsToUpdate = [];
      for (const f of overdueFollowups) {
        if (latestFollowupsMap.get(f.leadId)?.id === f.id) {
          idsToUpdate.push(f.id);
        }
      }

      if (idsToUpdate.length > 0) {
        await this.prisma.leadFollowup.updateMany({
          where: { id: { in: idsToUpdate } },
          data: { nextFollowupDate: startOfToday }
        });
      }
    }

    const followups = await this.prisma.leadFollowup.findMany({
      where: {
        OR: [
          { callDate: { gte: startOfToday, lte: endOfToday } },
          { nextFollowupDate: { gte: startOfToday, lte: endOfToday } }
        ]
      },
      include: {
        lead: {
          select: { id: true, customerName: true, status: true }
        }
      },
      orderBy: { callTime: 'asc' }
    });

    // Deduplicate by leadId to avoid spamming multiple notifications for the same lead today
    const uniqueFollowups = Array.from(new Map(followups.map(item => [item.leadId, item])).values());

    return uniqueFollowups.map(f => ({
      id: f.id,
      leadId: f.leadId,
      title: `${f.callType} Scheduled`,
      customerName: f.lead?.customerName || 'Unknown Lead',
      time: f.callTime,
      date: f.callDate || f.nextFollowupDate,
      message: f.conversation || 'Scheduled Follow-up',
    }));
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
        followups: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
