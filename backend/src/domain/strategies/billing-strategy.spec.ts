import { BronzeStrategy } from './bronze.strategy';
import { SilverStrategy } from './silver.strategy';
import { GoldStrategy } from './gold.strategy';
import { BillingStrategyFactory } from './billing-strategy.factory';
import { PlanType } from '../enums/plan-type.enum';
import { BillingStrategy } from './billing-strategy.interface';

describe('Billing Strategies', () => {
  const BASE_PRICE = 100000; // $100,000 COP

  describe('BronzeStrategy', () => {
    let strategy: BillingStrategy;

    beforeEach(() => {
      strategy = new BronzeStrategy();
    });

    it('should have strategy name BRONZE', () => {
      expect(strategy.strategyName).toBe('BRONZE');
    });

    it('should apply 0% discount', () => {
      const result = strategy.calculate(BASE_PRICE);
      expect(result.discount).toBe(0);
    });

    it('should calculate 19% tax on full amount', () => {
      const result = strategy.calculate(BASE_PRICE);
      expect(result.amount).toBe(100000);
      expect(result.tax).toBe(19000);
      expect(result.total).toBe(119000);
    });

    it('should handle zero price', () => {
      const result = strategy.calculate(0);
      expect(result.amount).toBe(0);
      expect(result.tax).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  describe('SilverStrategy', () => {
    let strategy: BillingStrategy;

    beforeEach(() => {
      strategy = new SilverStrategy();
    });

    it('should have strategy name SILVER', () => {
      expect(strategy.strategyName).toBe('SILVER');
    });

    it('should apply 10% discount', () => {
      const result = strategy.calculate(BASE_PRICE);
      expect(result.discount).toBe(10000);
    });

    it('should calculate 19% tax after discount', () => {
      const result = strategy.calculate(BASE_PRICE);
      expect(result.amount).toBe(90000);
      expect(result.tax).toBe(17100);
      expect(result.total).toBe(107100);
    });
  });

  describe('GoldStrategy', () => {
    let strategy: BillingStrategy;

    beforeEach(() => {
      strategy = new GoldStrategy();
    });

    it('should have strategy name GOLD', () => {
      expect(strategy.strategyName).toBe('GOLD');
    });

    it('should apply 25% discount', () => {
      const result = strategy.calculate(BASE_PRICE);
      expect(result.discount).toBe(25000);
    });

    it('should calculate 19% tax after discount', () => {
      const result = strategy.calculate(BASE_PRICE);
      expect(result.amount).toBe(75000);
      expect(result.tax).toBe(14250);
      expect(result.total).toBe(89250);
    });
  });

  describe('BillingStrategyFactory', () => {
    it('should create BronzeStrategy for BRONZE plan', () => {
      const strategy = BillingStrategyFactory.create(PlanType.BRONZE);
      expect(strategy.strategyName).toBe('BRONZE');
    });

    it('should create SilverStrategy for SILVER plan', () => {
      const strategy = BillingStrategyFactory.create(PlanType.SILVER);
      expect(strategy.strategyName).toBe('SILVER');
    });

    it('should create GoldStrategy for GOLD plan', () => {
      const strategy = BillingStrategyFactory.create(PlanType.GOLD);
      expect(strategy.strategyName).toBe('GOLD');
    });

    it('should throw error for invalid plan type', () => {
      expect(() => BillingStrategyFactory.create('INVALID' as PlanType)).toThrow(
        'No billing strategy found for plan type: INVALID',
      );
    });

    it('should produce different totals for same base price across strategies', () => {
      const bronze = BillingStrategyFactory.create(PlanType.BRONZE).calculate(BASE_PRICE);
      const silver = BillingStrategyFactory.create(PlanType.SILVER).calculate(BASE_PRICE);
      const gold = BillingStrategyFactory.create(PlanType.GOLD).calculate(BASE_PRICE);

      expect(bronze.total).toBeGreaterThan(silver.total);
      expect(silver.total).toBeGreaterThan(gold.total);
    });

    it('should ensure all results have positive or zero values', () => {
      [PlanType.BRONZE, PlanType.SILVER, PlanType.GOLD].forEach((type) => {
        const result = BillingStrategyFactory.create(type).calculate(BASE_PRICE);
        expect(result.amount).toBeGreaterThanOrEqual(0);
        expect(result.tax).toBeGreaterThanOrEqual(0);
        expect(result.total).toBeGreaterThanOrEqual(0);
        expect(result.discount).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
