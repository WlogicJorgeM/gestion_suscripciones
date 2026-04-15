import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { CheckExpirationsUseCase } from '@application/use-cases/check-expirations.use-case';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.enableCors({ origin: 'http://localhost:4200', credentials: true });

  const port = process.env['PORT'] ?? 3000;
  await app.listen(port);
  console.log(`🚀 Davivienda API running on http://localhost:${port}/api`);

  // Auto-check expirations on startup and every 60 minutes
  const checkExpirations = app.get(CheckExpirationsUseCase);
  const runCheck = async () => {
    try {
      const result = await checkExpirations.execute();
      if (result.expiredSubscriptions > 0 || result.overdueInvoices > 0) {
        console.log(`⏰ Auto-check: ${result.expiredSubscriptions} suscripciones expiradas, ${result.overdueInvoices} facturas vencidas`);
      }
    } catch (err) {
      console.error('Auto-check error:', err);
    }
  };

  await runCheck();
  setInterval(runCheck, 60 * 60 * 1000); // cada hora
}

bootstrap();
