import { BillingResult, BillingStrategy } from './billing-strategy.interface';

/** Bronze: Sin descuento, IVA 19% */
export class BronzeStrategy implements BillingStrategy {
  readonly strategyName = 'BRONZE';

  private static readonly TAX_RATE = 0.19;
  private static readonly DISCOUNT_RATE = 0;

  calculate(basePrice: number): BillingResult {
    const discount = basePrice * BronzeStrategy.DISCOUNT_RATE;
    const amount = basePrice - discount;
    const tax = amount * BronzeStrategy.TAX_RATE;
    const total = amount + tax;

    return {
      amount: this.round(amount),
      tax: this.round(tax),
      total: this.round(total),
      discount: this.round(discount),
      description: `Plan Bronze - Sin descuento, IVA ${BronzeStrategy.TAX_RATE * 100}%`,
    };
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
