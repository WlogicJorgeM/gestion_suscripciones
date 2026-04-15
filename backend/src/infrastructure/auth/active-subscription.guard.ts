import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from '@nestjs/common';
import { SubscriptionRepositoryPort, SUBSCRIPTION_REPOSITORY } from '@domain/ports/subscription-repository.port';
import { SubscriptionStatus } from '@domain/enums/subscription-status.enum';
import { Role } from '@domain/enums/role.enum';
import { JwtUser } from './jwt.strategy';

/**
 * Guard que bloquea el acceso si el usuario CLIENT no tiene suscripción activa.
 * Los ADMIN siempre tienen acceso.
 */
@Injectable()
export class ActiveSubscriptionGuard implements CanActivate {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY) private readonly subscriptionRepo: SubscriptionRepositoryPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user: JwtUser }>();
    const user = request.user;

    // Admins siempre tienen acceso
    if (user.role === Role.ADMIN) {
      return true;
    }

    const subscriptions = await this.subscriptionRepo.findByUserId(user.id);
    const hasActive = subscriptions.some((s) => s.status === SubscriptionStatus.ACTIVE);

    if (!hasActive) {
      throw new ForbiddenException(
        'Your subscription is expired or inactive. Please renew to access this feature.',
      );
    }

    return true;
  }
}
