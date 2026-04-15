import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, Min } from 'class-validator';
import { PlanType } from '@domain/enums/plan-type.enum';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(PlanType)
  type!: PlanType;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsArray()
  @IsString({ each: true })
  features!: string[];

  @IsNumber()
  @Min(1)
  durationDays!: number;
}
