import { SubscriptionStatus } from '../enums/subscription-status.enum';

export class SubscriptionEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly planId: string,
    public readonly status: SubscriptionStatus,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(props: {
    id: string;
    userId: string;
    planId: string;
    status?: SubscriptionStatus;
    startDate?: Date;
    endDate: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }): SubscriptionEntity {
    return new SubscriptionEntity(
      props.id,
      props.userId,
      props.planId,
      props.status ?? SubscriptionStatus.ACTIVE,
      props.startDate ?? new Date(),
      props.endDate,
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date(),
    );
  }

  get isActive(): boolean {
    return this.status === SubscriptionStatus.ACTIVE && this.endDate > new Date();
  }

  get isExpired(): boolean {
    return this.status === SubscriptionStatus.EXPIRED || this.endDate <= new Date();
  }
}
