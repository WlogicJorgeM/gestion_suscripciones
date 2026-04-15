import { Controller, Post, Get, Param, UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@domain/enums/role.enum';
import { CheckExpirationsUseCase } from '@application/use-cases/check-expirations.use-case';
import { PlanRepositoryPort, PLAN_REPOSITORY } from '@domain/ports/plan-repository.port';
import { PlanType } from '@domain/enums/plan-type.enum';
import { BillingStrategyFactory } from '@domain/strategies/billing-strategy.factory';

@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
  constructor(
    private readonly checkExpirations: CheckExpirationsUseCase,
    @Inject(PLAN_REPOSITORY) private readonly planRepo: PlanRepositoryPort,
  ) {}

  /** ADMIN: Ejecutar motor de facturación — verifica vencimientos */
  @Post('check-expirations')
  @Roles(Role.ADMIN)
  async runExpirationCheck() {
    return this.checkExpirations.execute();
  }

  /** Simular facturación de un plan — muestra desglose sin crear factura */
  @Get('simulate/:planId')
  async simulateBilling(@Param('planId') planId: string) {
    const plan = await this.planRepo.findById(planId);
    if (!plan) {
      throw new Error(`Plan with id ${planId} not found`);
    }

    const strategy = BillingStrategyFactory.create(plan.type as PlanType);
    const billing = strategy.calculate(plan.price);

    return {
      plan: { id: plan.id, name: plan.name, type: plan.type, basePrice: plan.price },
      billing: {
        basePrice: plan.price,
        discountRate: billing.discount / plan.price,
        discountAmount: billing.discount,
        subtotal: billing.amount,
        taxRate: 0.19,
        taxAmount: billing.tax,
        total: billing.total,
        description: billing.description,
        strategy: strategy.strategyName,
      },
    };
  }

  /** Obtener desglose de facturación para todos los planes */
  @Get('rates')
  async getAllRates() {
    const plans = await this.planRepo.findAll();
    return plans.map((plan) => {
      const strategy = BillingStrategyFactory.create(plan.type as PlanType);
      const billing = strategy.calculate(plan.price);
      return {
        planId: plan.id,
        planName: plan.name,
        planType: plan.type,
        basePrice: plan.price,
        discount: billing.discount,
        subtotal: billing.amount,
        tax: billing.tax,
        total: billing.total,
        description: billing.description,
      };
    });
  }
}
