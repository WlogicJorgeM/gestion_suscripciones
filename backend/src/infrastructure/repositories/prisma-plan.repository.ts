import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PlanRepositoryPort } from '@domain/ports/plan-repository.port';
import { PlanEntity } from '@domain/entities/plan.entity';
import { PlanType } from '@domain/enums/plan-type.enum';

@Injectable()
export class PrismaPlanRepository implements PlanRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<PlanEntity | null> {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    return plan ? this.toEntity(plan) : null;
  }

  async findByType(type: PlanType): Promise<PlanEntity | null> {
    const plan = await this.prisma.plan.findFirst({ where: { type } });
    return plan ? this.toEntity(plan) : null;
  }

  async findAll(): Promise<PlanEntity[]> {
    const plans = await this.prisma.plan.findMany({ orderBy: { price: 'asc' } });
    return plans.map((p) => this.toEntity(p));
  }

  async create(data: Omit<PlanEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<PlanEntity> {
    const plan = await this.prisma.plan.create({
      data: {
        name: data.name,
        type: data.type,
        price: data.price,
        description: data.description,
        features: data.features,
        durationDays: data.durationDays,
      },
    });
    return this.toEntity(plan);
  }

  async update(id: string, data: Partial<PlanEntity>): Promise<PlanEntity> {
    const plan = await this.prisma.plan.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.description && { description: data.description }),
        ...(data.features && { features: data.features }),
        ...(data.durationDays !== undefined && { durationDays: data.durationDays }),
      },
    });
    return this.toEntity(plan);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.plan.delete({ where: { id } });
  }

  private toEntity(raw: { id: string; name: string; type: string; price: unknown; description: string; features: string[]; durationDays: number; createdAt: Date; updatedAt: Date }): PlanEntity {
    return PlanEntity.create({
      id: raw.id,
      name: raw.name,
      type: raw.type as PlanType,
      price: Number(raw.price),
      description: raw.description,
      features: raw.features,
      durationDays: raw.durationDays,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
