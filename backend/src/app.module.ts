import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Infrastructure - Database
import { PrismaService } from '@infrastructure/database/prisma.service';

// Infrastructure - Repositories
import { PrismaUserRepository } from '@infrastructure/repositories/prisma-user.repository';
import { PrismaPlanRepository } from '@infrastructure/repositories/prisma-plan.repository';
import { PrismaSubscriptionRepository } from '@infrastructure/repositories/prisma-subscription.repository';
import { PrismaInvoiceRepository } from '@infrastructure/repositories/prisma-invoice.repository';

// Infrastructure - Auth
import { AuthService } from '@infrastructure/auth/auth.service';
import { JwtStrategy } from '@infrastructure/auth/jwt.strategy';
import { RolesGuard } from '@infrastructure/auth/roles.guard';
import { ActiveSubscriptionGuard } from '@infrastructure/auth/active-subscription.guard';

// Infrastructure - Controllers
import { AuthController } from '@infrastructure/controllers/auth.controller';
import { PlanController } from '@infrastructure/controllers/plan.controller';
import { SubscriptionController } from '@infrastructure/controllers/subscription.controller';
import { ReportController } from '@infrastructure/controllers/report.controller';
import { InvoiceController } from '@infrastructure/controllers/invoice.controller';
import { BillingController } from '@infrastructure/controllers/billing.controller';

// Application - Use Cases
import { CreateSubscriptionUseCase } from '@application/use-cases/create-subscription.use-case';
import { ProcessPaymentUseCase } from '@application/use-cases/process-payment.use-case';
import { GenerateReportUseCase } from '@application/use-cases/generate-report.use-case';
import { CheckExpirationsUseCase } from '@application/use-cases/check-expirations.use-case';

// Domain - Port Tokens
import { USER_REPOSITORY } from '@domain/ports/user-repository.port';
import { PLAN_REPOSITORY } from '@domain/ports/plan-repository.port';
import { SUBSCRIPTION_REPOSITORY } from '@domain/ports/subscription-repository.port';
import { INVOICE_REPOSITORY } from '@domain/ports/invoice-repository.port';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env['JWT_SECRET'] ?? 'davivienda-jwt-secret-2024',
      signOptions: { expiresIn: process.env['JWT_EXPIRES_IN'] ?? '24h' },
    }),
  ],
  controllers: [
    AuthController,
    PlanController,
    SubscriptionController,
    ReportController,
    InvoiceController,
    BillingController,
  ],
  providers: [
    // Database
    PrismaService,

    // Ports → Adapters (Hexagonal: inyección de dependencias)
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: PLAN_REPOSITORY, useClass: PrismaPlanRepository },
    { provide: SUBSCRIPTION_REPOSITORY, useClass: PrismaSubscriptionRepository },
    { provide: INVOICE_REPOSITORY, useClass: PrismaInvoiceRepository },

    // Auth & Guards
    AuthService,
    JwtStrategy,
    RolesGuard,
    ActiveSubscriptionGuard,

    // Use Cases
    CreateSubscriptionUseCase,
    ProcessPaymentUseCase,
    GenerateReportUseCase,
    CheckExpirationsUseCase,
  ],
})
export class AppModule {}
