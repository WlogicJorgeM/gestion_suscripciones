import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { InvoiceRepositoryPort, CreateInvoiceData } from '@domain/ports/invoice-repository.port';
import { InvoiceEntity } from '@domain/entities/invoice.entity';
import { InvoiceStatus } from '@domain/enums/invoice-status.enum';

@Injectable()
export class PrismaInvoiceRepository implements InvoiceRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<InvoiceEntity | null> {
    const inv = await this.prisma.invoice.findUnique({ where: { id } });
    return inv ? this.toEntity(inv) : null;
  }

  async findBySubscriptionId(subscriptionId: string): Promise<InvoiceEntity[]> {
    const invoices = await this.prisma.invoice.findMany({ where: { subscriptionId }, orderBy: { createdAt: 'desc' } });
    return invoices.map((i) => this.toEntity(i));
  }

  async findAll(): Promise<InvoiceEntity[]> {
    const invoices = await this.prisma.invoice.findMany({ orderBy: { createdAt: 'desc' } });
    return invoices.map((i) => this.toEntity(i));
  }

  async create(data: CreateInvoiceData): Promise<InvoiceEntity> {
    const inv = await this.prisma.invoice.create({
      data: {
        subscriptionId: data.subscriptionId,
        basePrice: data.basePrice,
        discount: data.discount,
        amount: data.amount,
        tax: data.tax,
        total: data.total,
        status: data.status,
        dueDate: data.dueDate,
        paidAt: data.paidAt,
      },
    });
    return this.toEntity(inv);
  }

  async updateStatus(id: string, status: InvoiceStatus, paidAt?: Date): Promise<InvoiceEntity> {
    const inv = await this.prisma.invoice.update({ where: { id }, data: { status, ...(paidAt && { paidAt }) } });
    return this.toEntity(inv);
  }

  async getTotalRevenue(): Promise<number> {
    const result = await this.prisma.invoice.aggregate({ _sum: { total: true }, where: { status: InvoiceStatus.PAID } });
    return Number(result._sum.total ?? 0);
  }

  async getRevenueByPeriod(startDate: Date, endDate: Date): Promise<number> {
    const result = await this.prisma.invoice.aggregate({ _sum: { total: true }, where: { status: InvoiceStatus.PAID, paidAt: { gte: startDate, lte: endDate } } });
    return Number(result._sum.total ?? 0);
  }

  private toEntity(raw: Record<string, unknown>): InvoiceEntity {
    return InvoiceEntity.create({
      id: raw['id'] as string,
      subscriptionId: raw['subscriptionId'] as string,
      basePrice: Number(raw['basePrice'] ?? 0),
      discount: Number(raw['discount'] ?? 0),
      amount: Number(raw['amount']),
      tax: Number(raw['tax']),
      total: Number(raw['total']),
      status: raw['status'] as InvoiceStatus,
      dueDate: raw['dueDate'] as Date,
      paidAt: raw['paidAt'] as Date | null,
      createdAt: raw['createdAt'] as Date,
      updatedAt: raw['updatedAt'] as Date,
    });
  }
}
