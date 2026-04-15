import { PlanType } from '../enums/plan-type.enum';

export class PlanEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: PlanType,
    public readonly price: number,
    public readonly description: string,
    public readonly features: string[],
    public readonly durationDays: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(props: {
    id: string;
    name: string;
    type: PlanType;
    price: number;
    description: string;
    features: string[];
    durationDays: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): PlanEntity {
    return new PlanEntity(
      props.id,
      props.name,
      props.type,
      props.price,
      props.description,
      props.features,
      props.durationDays,
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date(),
    );
  }
}
