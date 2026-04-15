import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@domain/enums/role.enum';
import { CreateSubscriptionUseCase } from '@application/use-cases/create-subscription.use-case';
import { ProcessPaymentUseCase } from '@application/use-cases/process-payment.use-case';
import { SubscriptionRepositoryPort, SUBSCRIPTION_REPOSITORY } from '@domain/ports/subscription-repository.port';
import { SubscriptionStatus } from '@domain/enums/subscription-status.enum';
import { CreateSubscriptionDto, ProcessPaymentDto } from '../dtos/subscription.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtUser } from '../auth/jwt.strategy';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionController {
  constructor(
    private readonly createSubscription: CreateSubscriptionUseCase,
    private readonly processPayment: ProcessPaymentUseCase,
    @Inject(SUBSCRIPTION_REPOSITORY) private readonly subscriptionRepo: SubscriptionRepositoryPort,
  ) {}

  @Get()
  @Roles(Role.ADMIN)
  async findAll(@Query('status') status?: SubscriptionStatus) {
    if (status) return this.subscriptionRepo.findByStatus(status);
    return this.subscriptionRepo.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.subscriptionRepo.findById(id);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.subscriptionRepo.findByUserId(userId);
  }

  @Get('me/current')
  async mySubscriptions(@CurrentUser() user: JwtUser) {
    return this.subscriptionRepo.findByUserId(user.id);
  }

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateSubscriptionDto) {
    return this.createSubscription.execute(dto);
  }

  @Post('payment')
  async payment(@Body() dto: ProcessPaymentDto) {
    return this.processPayment.execute(dto);
  }

  /** ADMIN: cambiar estado de suscripción */
  @Put(':id/status')
  @Roles(Role.ADMIN)
  async updateStatus(@Param('id') id: string, @Body('status') status: SubscriptionStatus) {
    return this.subscriptionRepo.updateStatus(id, status);
  }
}
