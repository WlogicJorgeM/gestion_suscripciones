import { BillingResult, BillingStrategy } from './billing-strategy.interface';

/** Gold: 25% descuento, IVA 19% */
export class GoldStrategy implements BillingStrategy {
  readonly strategyName = 'GOLD';

  private static readonly TAX_RATE = 0.19;
  private static readonly DISCOUNT_RATE = 0.25;

  calculate(basePrice: number): BillingResult {
    const discount = basePrice * GoldStrategy.DISCOUNT_RATE;
    const amount = basePrice - discount;
    const tax = amount * GoldStrategy.TAX_RATE;
    const total = amount + tax;

    return {
      amount: this.round(amount),
      tax: this.round(tax),
      total: this.round(total),
      discount: this.round(discount),
      description: `Plan Gold - ${GoldStrategy.DISCOUNT_RATE * 100}% descuento, IVA ${GoldStrategy.TAX_RATE * 100}%`,
    };
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
