import { InvoiceEntity } from '../entities/invoice.entity';
import { InvoiceStatus } from '../enums/invoice-status.enum';

export interface CreateInvoiceData {
  subscriptionId: string;
  basePrice: number;
  discount: number;
  amount: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  dueDate: Date;
  paidAt: Date | null;
}

export interface InvoiceRepositoryPort {
  findById(id: string): Promise<InvoiceEntity | null>;
  findBySubscriptionId(subscriptionId: string): Promise<InvoiceEntity[]>;
  findAll(): Promise<InvoiceEntity[]>;
  create(invoice: CreateInvoiceData): Promise<InvoiceEntity>;
  updateStatus(id: string, status: InvoiceStatus, paidAt?: Date): Promise<InvoiceEntity>;
  getTotalRevenue(): Promise<number>;
  getRevenueByPeriod(startDate: Date, endDate: Date): Promise<number>;
}

export const INVOICE_REPOSITORY = Symbol('INVOICE_REPOSITORY');
