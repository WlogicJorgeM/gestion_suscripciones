import { Inject, Injectable } from '@nestjs/common';
import { SubscriptionRepositoryPort, SUBSCRIPTION_REPOSITORY } from '@domain/ports/subscription-repository.port';
import { PlanRepositoryPort, PLAN_REPOSITORY } from '@domain/ports/plan-repository.port';
import { UserRepositoryPort, USER_REPOSITORY } from '@domain/ports/user-repository.port';
import { SubscriptionEntity } from '@domain/entities/subscription.entity';
import { SubscriptionStatus } from '@domain/enums/subscription-status.enum';

export interface CreateSubscriptionInput {
  userId: string;
  planId: string;
}

@Injectable()
export class CreateSubscriptionUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY) private readonly subscriptionRepo: SubscriptionRepositoryPort,
    @Inject(PLAN_REPOSITORY) private readonly planRepo: PlanRepositoryPort,
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(input: CreateSubscriptionInput): Promise<SubscriptionEntity> {
    const user = await this.userRepo.findById(input.userId);
    if (!user) {
      throw new Error(`User with id ${input.userId} not found`);
    }

    const plan = await this.planRepo.findById(input.planId);
    if (!plan) {
      throw new Error(`Plan with id ${input.planId} not found`);
    }

    const existingSubs = await this.subscriptionRepo.findByUserId(input.userId);
    const hasActive = existingSubs.some((s) => s.status === SubscriptionStatus.ACTIVE);
    if (hasActive) {
      throw new Error('User already has an active subscription');
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    return this.subscriptionRepo.create({
      userId: input.userId,
      planId: input.planId,
      status: SubscriptionStatus.ACTIVE,
      startDate,
      endDate,
    });
  }
}
