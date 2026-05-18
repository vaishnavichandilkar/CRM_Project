import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    // Check if the SKU already exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { sku: dto.sku },
    });

    if (existingProduct) {
      throw new ConflictException('Product with this SKU already exists');
    }

    // Business Logic: If stockQuantity is 0, automatically set status to 'Out of Stock'
    const status = dto.stockQuantity === 0 ? ProductStatus.OUT_OF_STOCK : ProductStatus.ACTIVE;

    return this.prisma.product.create({
      data: {
        ...dto,
        status,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(search?: string) {
    return this.prisma.product.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDropdown() {
    const records = await this.prisma.masterData.findMany({
      where: {
        masterConfig: {
          slug: 'products',
        },
      },
      select: {
        id: true,
        data: true,
      },
    });

    return records.map((r) => {
      const data = r.data as any;
      return {
        id: r.id,
        sku: data.sku || `PRD${String(r.id).padStart(3, '0')}`,
        name: data.name || '',
      };
    });
  }

  async findOne(id: number) {
    const record = await this.prisma.masterData.findFirst({
      where: {
        id,
        masterConfig: {
          slug: 'products',
        },
      },
    });

    if (record) {
      return {
        id: record.id,
        ...(record.data as object),
      };
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    const currentProduct = (await this.findOne(id)) as any;

    // SKU conflict check if SKU is being updated
    if (dto.sku && dto.sku !== currentProduct.sku) {
      const existingProduct = await this.prisma.product.findUnique({
        where: { sku: dto.sku },
      });

      if (existingProduct) {
        throw new ConflictException('Product with this SKU already exists');
      }
    }

    // Business Logic: Automatically update status if stock is updated
    let status = currentProduct.status;
    if (dto.stockQuantity !== undefined) {
      status = dto.stockQuantity === 0 ? ProductStatus.OUT_OF_STOCK : ProductStatus.ACTIVE;
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
        status,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.delete({
      where: { id },
    });
  }

  // Helper for Categories dropdown
  async findAllCategories() {
    return this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
