import { Inject, Injectable } from '@nestjs/common';
import { SubscriptionRepositoryPort, SUBSCRIPTION_REPOSITORY } from '@domain/ports/subscription-repository.port';
import { InvoiceRepositoryPort, INVOICE_REPOSITORY } from '@domain/ports/invoice-repository.port';
import { SubscriptionStatus } from '@domain/enums/subscription-status.enum';

export interface ReportOutput {
  totalActiveSubscriptions: number;
  totalExpiredSubscriptions: number;
  totalCancelledSubscriptions: number;
  totalRevenue: number;
  periodRevenue: number;
  periodStart: Date;
  periodEnd: Date;
  generatedAt: Date;
}

@Injectable()
export class GenerateReportUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY) private readonly subscriptionRepo: SubscriptionRepositoryPort,
    @Inject(INVOICE_REPOSITORY) private readonly invoiceRepo: InvoiceRepositoryPort,
  ) {}

  async execute(periodStart?: Date, periodEnd?: Date): Promise<ReportOutput> {
    const now = new Date();
    const start = periodStart ?? new Date(now.getFullYear(), now.getMonth(), 1);
    const end = periodEnd ?? now;

    const [activeCount, expiredCount, cancelledCount, totalRevenue, periodRevenue] =
      await Promise.all([
        this.subscriptionRepo.countByStatus(SubscriptionStatus.ACTIVE),
        this.subscriptionRepo.countByStatus(SubscriptionStatus.EXPIRED),
        this.subscriptionRepo.countByStatus(SubscriptionStatus.CANCELLED),
        this.invoiceRepo.getTotalRevenue(),
        this.invoiceRepo.getRevenueByPeriod(start, end),
      ]);

    return {
      totalActiveSubscriptions: activeCount,
      totalExpiredSubscriptions: expiredCount,
      totalCancelledSubscriptions: cancelledCount,
      totalRevenue,
      periodRevenue,
      periodStart: start,
      periodEnd: end,
      generatedAt: now,
    };
  }
}
