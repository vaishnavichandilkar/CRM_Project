import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateSaleDto, SaleStatusEnum } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async getSalesData(purchaseCount?: '1' | 'gt1') {
    const where: any = {};
    if (purchaseCount === '1') {
      where.purchaseCount = 1;
    } else if (purchaseCount === 'gt1') {
      where.purchaseCount = { gt: 1 };
    }

    const sales = await this.prisma.sale.findMany({
      where,
      include: {
        customer: true,
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sales.map(s => ({
      ...s,
      customer: {
        id: s.customer?.id,
        name: (s.customer?.data as any)?.name || 'Unnamed Customer',
      },
      product: {
        id: s.product?.id,
        name: (s.product?.data as any)?.name || 'Unnamed Product',
      },
    }));
  }

  async getSalesMetadata() {
    // Fetch customers
    const customersRecords = await this.prisma.masterData.findMany({
      where: { masterConfig: { slug: 'customers' } },
    });
    const customers = customersRecords.map(r => ({
      id: r.id,
      name: (r.data as any)?.name || `Customer #${r.id}`,
    }));

    // Fetch products
    const productsRecords = await this.prisma.masterData.findMany({
      where: { masterConfig: { slug: 'products' } },
    });
    const products = productsRecords.map(r => ({
      id: r.id,
      name: (r.data as any)?.name || `Product #${r.id}`,
    }));

    return { customers, products };
  }

  async getPipelineStats() {
    const stats = await this.prisma.sale.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const pipelineStats = {
      Lead: 0,
      Opportunity: 0,
      Sale: 0,
      Invoice: 0,
    };

    stats.forEach(s => {
      if (s.status) {
        pipelineStats[s.status] = s._count.id;
      }
    });

    return pipelineStats;
  }

  async createSale(dto: CreateSaleDto) {
    return this.prisma.sale.create({
      data: {
        amount: dto.amount,
        status: dto.status || SaleStatusEnum.Sale,
        customerId: dto.customerId,
        productId: dto.productId,
        purchaseCount: dto.purchaseCount || 1,
      },
      include: {
        customer: true,
        product: true,
      },
    });
  }

  async updateSaleStatus(id: number, status: SaleStatusEnum) {
    const sale = await this.prisma.sale.findUnique({ where: { id } });
    if (!sale) throw new NotFoundException('Sale not found');

    return this.prisma.sale.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        product: true,
      },
    });
  }
}
