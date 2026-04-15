import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { StatusBadgeComponent } from '../../shared/lib/status-badge/status-badge.component';
import { CopCurrencyPipe } from '../../shared/lib/currency.pipe';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Subscription, Plan, Invoice } from '../../core/models/interfaces';

@Component({
  selector: 'app-client-portal',
  standalone: true,
  imports: [
    CommonModule, TableModule, ButtonModule, TagModule,
    ProgressSpinnerModule, ToastModule,
    StatusBadgeComponent, CopCurrencyPipe,
  ],
  providers: [MessageService],
  templateUrl: './client-portal.component.html',
  styleUrl: './client-portal.component.scss',
})
export class ClientPortalComponent implements OnInit {
  loading = signal(true);
  loadingInvoices = signal(false);
  payingId = signal<string | null>(null);
  subscriptions = signal<Subscription[]>([]);
  invoices = signal<Invoice[]>([]);
  currentPlan = signal<Plan | null>(null);

  activeSub = computed(() =>
    this.subscriptions().find((s) => s.status === 'ACTIVE') ?? null,
  );

  isActive = computed(() => this.activeSub() !== null);

  constructor(
    private readonly api: ApiService,
    readonly auth: AuthService,
    private readonly msg: MessageService,
  ) {}

  ngOnInit(): void {
    this.api.getMySubscriptions().subscribe({
      next: (subs) => {
        this.subscriptions.set(subs);
        this.loading.set(false);
        const active = subs.find((s) => s.status === 'ACTIVE');
        if (active) {
          this.api.getPlanById(active.planId).subscribe({
            next: (plan) => this.currentPlan.set(plan),
          });
          this.loadInvoices(active.id);
        }
      },
      error: () => this.loading.set(false),
    });
  }

  loadInvoices(subId: string): void {
    this.loadingInvoices.set(true);
    this.api.getInvoicesBySubscription(subId).subscribe({
      next: (inv) => {
        this.invoices.set(inv);
        this.loadingInvoices.set(false);
      },
      error: () => this.loadingInvoices.set(false),
    });
  }

  onPayInvoice(invoiceId: string): void {
    this.payingId.set(invoiceId);
    this.api.markInvoicePaid(invoiceId).subscribe({
      next: () => {
        this.payingId.set(null);
        this.msg.add({
          severity: 'success',
          summary: 'Pago registrado',
          detail: 'Tu factura ha sido pagada exitosamente',
          life: 4000,
        });
        const sub = this.activeSub();
        if (sub) {
          this.loadInvoices(sub.id);
        }
      },
      error: (err) => {
        this.payingId.set(null);
        this.msg.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message ?? 'No se pudo procesar el pago',
          life: 5000,
        });
      },
    });
  }
}
