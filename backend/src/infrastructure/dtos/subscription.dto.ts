import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsUUID()
  @IsNotEmpty()
  planId!: string;
}

export class ProcessPaymentDto {
  @IsUUID()
  @IsNotEmpty()
  subscriptionId!: string;
}
