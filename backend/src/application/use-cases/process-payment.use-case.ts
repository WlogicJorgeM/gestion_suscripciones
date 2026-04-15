import { Inject, Injectable } from '@nestjs/common';
import { SubscriptionRepositoryPort, SUBSCRIPTION_REPOSITORY } from '@domain/ports/subscription-repository.port';
import { PlanRepositoryPort, PLAN_REPOSITORY } from '@domain/ports/plan-repository.port';
import { InvoiceRepositoryPort, INVOICE_REPOSITORY } from '@domain/ports/invoice-repository.port';
import { InvoiceStatus } from '@domain/enums/invoice-status.enum';
import { PlanType } from '@domain/enums/plan-type.enum';
import { BillingStrategyFactory } from '@domain/strategies/billing-strategy.factory';

export interface ProcessPaymentInput {
  subscriptionId: string;
}

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY) private readonly subscriptionRepo: SubscriptionRepositoryPort,
    @Inject(PLAN_REPOSITORY) private readonly planRepo: PlanRepositoryPort,
    @Inject(INVOICE_REPOSITORY) private readonly invoiceRepo: InvoiceRepositoryPort,
  ) {}

  async execute(input: ProcessPaymentInput) {
    const subscription = await this.subscriptionRepo.findById(input.subscriptionId);
    if (!subscription) {
      throw new Error(`Subscription with id ${input.subscriptionId} not found`);
    }

    if (subscription.isExpired) {
      throw new Error('Cannot process payment for an expired subscription');
    }

    const plan = await this.planRepo.findById(subscription.planId);
    if (!plan) {
      throw new Error(`Plan with id ${subscription.planId} not found`);
    }

    // Factory + Strategy: calcula automáticamente según el plan
    const strategy = BillingStrategyFactory.create(plan.type as PlanType);
    const billing = strategy.calculate(plan.price);

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Crea factura PENDING (prefactura) — solo suma a ingresos cuando se pague
    return this.invoiceRepo.create({
      subscriptionId: subscription.id,
      basePrice: plan.price,
      discount: billing.discount,
      amount: billing.amount,
      tax: billing.tax,
      total: billing.total,
      status: InvoiceStatus.PENDING,
      dueDate,
      paidAt: null,
    });
  }
}
