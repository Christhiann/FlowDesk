import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto, UpdateSaleDto } from './dto/sale.dto';

interface SaleStatsRow {
  month: Date;
  count: number | bigint;
  total: number | string | null;
}

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async findStats() {
    const start = new Date();
    start.setMonth(start.getMonth() - 5);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const stats = await this.prisma.$queryRaw<SaleStatsRow[]>
      `
      SELECT
        date_trunc('month', "createdAt") AS month,
        COUNT(*) AS count,
        SUM(amount) AS total
      FROM "sales"
      WHERE "createdAt" >= ${start}
      GROUP BY month
      ORDER BY month ASC
    `;

    const statusSummary = await this.prisma.sale.groupBy({
      by: ['status'],
      _count: { _all: true },
      _sum: { amount: true },
    });

    return {
      monthlyRevenue: stats.map((row: any) => ({
        month: row.month.toISOString().slice(0, 7),
        count: Number(row.count),
        total: Number(row.total || 0),
      })),
      statusSummary: statusSummary.map((item) => ({
        status: item.status,
        count: item._count._all,
        total: item._sum.amount ?? 0,
      })),
    };
  }

  async findAll() {
    return this.prisma.sale.findMany({
      include: {
        customer: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateSaleDto) {
    return this.prisma.sale.create({
      data: {
        ...dto,
        createdById: userId,
      },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async update(id: string, dto: UpdateSaleDto) {
    const sale = await this.prisma.sale.findUnique({ where: { id } });
    if (!sale) {
      throw new NotFoundException('Venda não encontrada');
    }
    return this.prisma.sale.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const sale = await this.prisma.sale.findUnique({ where: { id } });
    if (!sale) {
      throw new NotFoundException('Venda não encontrada');
    }
    await this.prisma.sale.delete({ where: { id } });
    return { message: 'Venda removida com sucesso' };
  }
}
