import { PlanEntity } from '../entities/plan.entity';
import { PlanType } from '../enums/plan-type.enum';

/** Puerto: Contrato para el repositorio de planes */
export interface PlanRepositoryPort {
  findById(id: string): Promise<PlanEntity | null>;
  findByType(type: PlanType): Promise<PlanEntity | null>;
  findAll(): Promise<PlanEntity[]>;
  create(plan: Omit<PlanEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<PlanEntity>;
  update(id: string, data: Partial<PlanEntity>): Promise<PlanEntity>;
  delete(id: string): Promise<void>;
}

export const PLAN_REPOSITORY = Symbol('PLAN_REPOSITORY');
