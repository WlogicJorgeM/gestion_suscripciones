import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SubscriptionRepositoryPort } from '@domain/ports/subscription-repository.port';
import { SubscriptionEntity } from '@domain/entities/subscription.entity';
import { SubscriptionStatus } from '@domain/enums/subscription-status.enum';

@Injectable()
export class PrismaSubscriptionRepository implements SubscriptionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<SubscriptionEntity | null> {
    const sub = await this.prisma.subscription.findUnique({ where: { id } });
    return sub ? this.toEntity(sub) : null;
  }

  async findByUserId(userId: string): Promise<SubscriptionEntity[]> {
    const subs = await this.prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return subs.map((s) => this.toEntity(s));
  }

  async findAll(): Promise<SubscriptionEntity[]> {
    const subs = await this.prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return subs.map((s) => this.toEntity(s));
  }

  async findByStatus(status: SubscriptionStatus): Promise<SubscriptionEntity[]> {
    const subs = await this.prisma.subscription.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });
    return subs.map((s) => this.toEntity(s));
  }

  async create(data: { userId: string; planId: string; status: SubscriptionStatus; startDate: Date; endDate: Date }): Promise<SubscriptionEntity> {
    const sub = await this.prisma.subscription.create({
      data: {
        userId: data.userId,
        planId: data.planId,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });
    return this.toEntity(sub);
  }

  async updateStatus(id: string, status: SubscriptionStatus): Promise<SubscriptionEntity> {
    const sub = await this.prisma.subscription.update({
      where: { id },
      data: { status },
    });
    return this.toEntity(sub);
  }

  async countByStatus(status: SubscriptionStatus): Promise<number> {
    return this.prisma.subscription.count({ where: { status } });
  }

  private toEntity(raw: { id: string; userId: string; planId: string; status: string; startDate: Date; endDate: Date; createdAt: Date; updatedAt: Date }): SubscriptionEntity {
    return SubscriptionEntity.create({
      id: raw.id,
      userId: raw.userId,
      planId: raw.planId,
      status: raw.status as SubscriptionStatus,
      startDate: raw.startDate,
      endDate: raw.endDate,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
