import { BillingResult, BillingStrategy } from './billing-strategy.interface';

/** Silver: 10% descuento, IVA 19% */
export class SilverStrategy implements BillingStrategy {
  readonly strategyName = 'SILVER';

  private static readonly TAX_RATE = 0.19;
  private static readonly DISCOUNT_RATE = 0.10;

  calculate(basePrice: number): BillingResult {
    const discount = basePrice * SilverStrategy.DISCOUNT_RATE;
    const amount = basePrice - discount;
    const tax = amount * SilverStrategy.TAX_RATE;
    const total = amount + tax;

    return {
      amount: this.round(amount),
      tax: this.round(tax),
      total: this.round(total),
      discount: this.round(discount),
      description: `Plan Silver - ${SilverStrategy.DISCOUNT_RATE * 100}% descuento, IVA ${SilverStrategy.TAX_RATE * 100}%`,
    };
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
