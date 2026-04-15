import { Controller, Get, Put, Param, UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@domain/enums/role.enum';
import { InvoiceRepositoryPort, INVOICE_REPOSITORY } from '@domain/ports/invoice-repository.port';
import { InvoiceStatus } from '@domain/enums/invoice-status.enum';

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoiceController {
  constructor(@Inject(INVOICE_REPOSITORY) private readonly invoiceRepo: InvoiceRepositoryPort) {}

  /** ADMIN: ver todas las facturas */
  @Get()
  @Roles(Role.ADMIN)
  async findAll() {
    return this.invoiceRepo.findAll();
  }

  /** Ver factura por ID — cualquier usuario autenticado */
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.invoiceRepo.findById(id);
  }

  /** Ver facturas de una suscripción — cualquier usuario autenticado */
  @Get('subscription/:subscriptionId')
  async findBySubscription(@Param('subscriptionId') subscriptionId: string) {
    return this.invoiceRepo.findBySubscriptionId(subscriptionId);
  }

  /** Marcar factura como pagada — ADMIN o CLIENT pueden pagar */
  @Put(':id/pay')
  async markAsPaid(@Param('id') id: string) {
    return this.invoiceRepo.updateStatus(id, InvoiceStatus.PAID, new Date());
  }

  /** Marcar factura como vencida — solo ADMIN */
  @Put(':id/overdue')
  @Roles(Role.ADMIN)
  async markAsOverdue(@Param('id') id: string) {
    return this.invoiceRepo.updateStatus(id, InvoiceStatus.OVERDUE);
  }
}
