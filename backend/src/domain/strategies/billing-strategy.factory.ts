import { PlanType } from '../enums/plan-type.enum';
import { BillingStrategy } from './billing-strategy.interface';
import { BronzeStrategy } from './bronze.strategy';
import { SilverStrategy } from './silver.strategy';
import { GoldStrategy } from './gold.strategy';

/** Factory Pattern: Instancia la estrategia de cobro correcta según el tipo de plan */
export class BillingStrategyFactory {
  private static readonly strategies: Record<PlanType, () => BillingStrategy> = {
    [PlanType.BRONZE]: () => new BronzeStrategy(),
    [PlanType.SILVER]: () => new SilverStrategy(),
    [PlanType.GOLD]: () => new GoldStrategy(),
  };

  static create(planType: PlanType): BillingStrategy {
    const factory = BillingStrategyFactory.strategies[planType];
    if (!factory) {
      throw new Error(`No billing strategy found for plan type: ${planType}`);
    }
    return factory();
  }
}
