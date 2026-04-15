import { InvoiceStatus } from '../enums/invoice-status.enum';

export class InvoiceEntity {
  constructor(
    public readonly id: string,
    public readonly subscriptionId: string,
    public readonly basePrice: number,
    public readonly discount: number,
    public readonly amount: number,
    public readonly tax: number,
    public readonly total: number,
    public readonly status: InvoiceStatus,
    public readonly dueDate: Date,
    public readonly paidAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(props: {
    id: string;
    subscriptionId: string;
    basePrice?: number;
    discount?: number;
    amount: number;
    tax: number;
    total: number;
    status?: InvoiceStatus;
    dueDate: Date;
    paidAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): InvoiceEntity {
    return new InvoiceEntity(
      props.id, props.subscriptionId,
      props.basePrice ?? 0, props.discount ?? 0,
      props.amount, props.tax, props.total,
      props.status ?? InvoiceStatus.PENDING,
      props.dueDate, props.paidAt ?? null,
      props.createdAt ?? new Date(), props.updatedAt ?? new Date(),
    );
  }

  get isPaid(): boolean { return this.status === InvoiceStatus.PAID; }
  get isOverdue(): boolean { return this.status === InvoiceStatus.OVERDUE; }
  get isPending(): boolean { return this.status === InvoiceStatus.PENDING; }
}
