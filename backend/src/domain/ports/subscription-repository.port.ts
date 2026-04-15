import { SubscriptionEntity } from '../entities/subscription.entity';
import { SubscriptionStatus } from '../enums/subscription-status.enum';

/** Puerto: Contrato para el repositorio de suscripciones */
export interface SubscriptionRepositoryPort {
  findById(id: string): Promise<SubscriptionEntity | null>;
  findByUserId(userId: string): Promise<SubscriptionEntity[]>;
  findAll(): Promise<SubscriptionEntity[]>;
  findByStatus(status: SubscriptionStatus): Promise<SubscriptionEntity[]>;
  create(subscription: {
    userId: string;
    planId: string;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date;
  }): Promise<SubscriptionEntity>;
  updateStatus(id: string, status: SubscriptionStatus): Promise<SubscriptionEntity>;
  countByStatus(status: SubscriptionStatus): Promise<number>;
}

export const SUBSCRIPTION_REPOSITORY = Symbol('SUBSCRIPTION_REPOSITORY');
