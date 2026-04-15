import { Inject, Injectable } from '@nestjs/common';
import { SubscriptionRepositoryPort, SUBSCRIPTION_REPOSITORY } from '@domain/ports/subscription-repository.port';
import { InvoiceRepositoryPort, INVOICE_REPOSITORY } from '@domain/ports/invoice-repository.port';
import { SubscriptionStatus } from '@domain/enums/subscription-status.enum';
import { InvoiceStatus } from '@domain/enums/invoice-status.enum';

export interface ExpirationCheckResult {
  expiredSubscriptions: number;
  overdueInvoices: number;
  checkedAt: Date;
}

/**
 * Caso de uso: Verificar vencimientos de suscripciones y facturas.
 * - Marca como EXPIRED las suscripciones cuya endDate ya pasó.
 * - Marca como OVERDUE las facturas PENDING cuya dueDate ya pasó.
 */
@Injectable()
export class CheckExpirationsUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY) private readonly subscriptionRepo: SubscriptionRepositoryPort,
    @Inject(INVOICE_REPOSITORY) private readonly invoiceRepo: InvoiceRepositoryPort,
  ) {}

  async execute(): Promise<ExpirationCheckResult> {
    const now = new Date();
    let expiredSubscriptions = 0;
    let overdueInvoices = 0;

    // 1. Verificar suscripciones activas que ya vencieron
    const activeSubscriptions = await this.subscriptionRepo.findByStatus(SubscriptionStatus.ACTIVE);
    for (const sub of activeSubscriptions) {
      if (sub.endDate <= now) {
        await this.subscriptionRepo.updateStatus(sub.id, SubscriptionStatus.EXPIRED);
        expiredSubscriptions++;
      }
    }

    // 2. Verificar facturas pendientes que ya vencieron
    const allInvoices = await this.invoiceRepo.findAll();
    for (const inv of allInvoices) {
      if (inv.status === InvoiceStatus.PENDING && inv.dueDate <= now) {
        await this.invoiceRepo.updateStatus(inv.id, InvoiceStatus.OVERDUE);
        overdueInvoices++;
      }
    }

    return { expiredSubscriptions, overdueInvoices, checkedAt: now };
  }
}
