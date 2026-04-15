import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ToolbarModule } from 'primeng/toolbar';
import { DividerModule } from 'primeng/divider';
import { TabViewModule } from 'primeng/tabview';
import { PanelModule } from 'primeng/panel';
import { FieldsetModule } from 'primeng/fieldset';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { MenuModule } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { KpiCardComponent } from '../../shared/lib/kpi-card/kpi-card.component';
import { StatusBadgeComponent } from '../../shared/lib/status-badge/status-badge.component';
import { CopCurrencyPipe } from '../../shared/lib/currency.pipe';
import { ApiService } from '../../core/services/api.service';
import { Report, Subscription, Plan, User, Invoice, BillingRate } from '../../core/models/interfaces';

export interface SubscriptionRow {
  id: string; userName: string; userEmail: string;
  planName: string; planType: string; status: string;
  startDate: string; endDate: string; userId: string; planId: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ChartModule, CardModule, TableModule,
    ButtonModule, InputTextModule, DropdownModule, DialogModule,
    ToastModule, TooltipModule, ToolbarModule, DividerModule,
    TabViewModule, PanelModule, FieldsetModule, BadgeModule, AvatarModule, TagModule, MenuModule,
    KpiCardComponent, StatusBadgeComponent, CopCurrencyPipe,
  ],
  providers: [MessageService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  report = signal<Report | null>(null);
  subscriptionRows = signal<SubscriptionRow[]>([]);
  loadingSubs = signal(true);
  checkingExpirations = signal(false);
  assigning = signal(false);
  pendingBilling = signal(0);
  invoices = signal<Invoice[]>([]);
  billingRates = signal<BillingRate[]>([]);
  searchTerm = '';
  filterStatus = '';
  showAssignDialog = false;
  assignUserId = '';
  assignPlanId = '';
  showChangePlanDialog = false;
  changePlanSubId = '';
  changePlanUserId = '';
  changePlanUserName = '';
  changePlanCurrentName = '';
  changePlanNewId = '';
  users = signal<User[]>([]);
  plans = signal<Plan[]>([]);

  statusOptions = [
    { label: 'Activo', value: 'ACTIVE' },
    { label: 'Vencido', value: 'EXPIRED' },
    { label: 'Cancelado', value: 'CANCELLED' },
  ];

  chartOpts = { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom' as const, labels: { padding: 16, usePointStyle: true } } } };
  barOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } }, x: { grid: { display: false } } } };
  chartData = signal({ labels: ['Activos','Vencidos','Cancelados'], datasets: [{ data: [0,0,0], backgroundColor: ['#22C55E','#ED1C24','#F59E0B'], hoverOffset: 8 }] });
  barData = signal({ labels: ['Activos','Vencidos','Cancelados'], datasets: [{ label: 'Suscripciones', data: [0,0,0], backgroundColor: ['#22C55E','#ED1C24','#F59E0B'], borderRadius: 6 }] });

  userOptions = computed(() => this.users().filter(u => u.role === 'CLIENT').map(u => ({ label: `${u.fullName} (${u.email})`, value: u.id })));
  planOptions = computed(() => this.plans().map(p => ({ label: `${p.name} - ${new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0}).format(p.price)}`, value: p.id })));
  filteredRows = computed(() => {
    let rows = this.subscriptionRows();
    if (this.searchTerm) { const t = this.searchTerm.toLowerCase(); rows = rows.filter(r => r.userName.toLowerCase().includes(t) || r.userEmail.toLowerCase().includes(t)); }
    return rows;
  });

  paidCount = computed(() => this.invoices().filter(i => i.status === 'PAID').length);
  pendingCount = computed(() => this.invoices().filter(i => i.status === 'PENDING').length);
  overdueCount = computed(() => this.invoices().filter(i => i.status === 'OVERDUE').length);

  constructor(private readonly api: ApiService, private readonly msg: MessageService) {}

  ngOnInit(): void {
    this.api.getPlans().subscribe({ next: p => this.plans.set(p) });
    this.api.getUsers().subscribe({ next: u => { this.users.set(u); this.loadSubscriptions(); }, error: () => this.loadSubscriptions() });
    this.loadReport(); this.loadInvoices();
    this.api.getBillingRates().subscribe({ next: r => this.billingRates.set(r), error: () => {} });
  }

  loadReport(): void {
    this.api.getReport().subscribe({ next: d => {
      this.report.set(d);
      const c = [d.totalActiveSubscriptions, d.totalExpiredSubscriptions, d.totalCancelledSubscriptions];
      this.chartData.set({ labels: ['Activos','Vencidos','Cancelados'], datasets: [{ data: c, backgroundColor: ['#22C55E','#ED1C24','#F59E0B'], hoverOffset: 8 }] });
      this.barData.set({ labels: ['Activos','Vencidos','Cancelados'], datasets: [{ label: 'Suscripciones', data: c, backgroundColor: ['#22C55E','#ED1C24','#F59E0B'], borderRadius: 6 }] });
    }});
  }

  loadInvoices(): void {
    this.api.getInvoices().subscribe({ next: inv => {
      this.invoices.set(inv);
      this.pendingBilling.set(inv.filter(i => i.status === 'PENDING').reduce((s,i) => s + i.total, 0));
    }});
  }

  loadSubscriptions(): void {
    this.loadingSubs.set(true);
    this.api.getSubscriptions(this.filterStatus || undefined).subscribe({ next: s => this.mapRows(s), error: () => this.loadingSubs.set(false) });
  }

  private mapRows(subs: Subscription[]): void {
    const pm = new Map(this.plans().map(p => [p.id, p]));
    const um = new Map(this.users().map(u => [u.id, u]));
    this.subscriptionRows.set(subs.map(s => {
      const u = um.get(s.userId); const p = pm.get(s.planId);
      return { id: s.id, userId: s.userId, planId: s.planId, userName: u?.fullName ?? s.userId.slice(0,8), userEmail: u?.email ?? '', planName: p?.name ?? '', planType: p?.type ?? 'BRONZE', status: s.status, startDate: s.startDate, endDate: s.endDate };
    }));
    this.loadingSubs.set(false);
  }

  onCheckExpirations(): void {
    this.checkingExpirations.set(true);
    this.api.checkExpirations().subscribe({ next: r => { this.msg.add({ severity:'info', summary:'Vencimientos', detail:`${r.expiredSubscriptions} expiradas, ${r.overdueInvoices} facturas vencidas`, life: 4000 }); this.checkingExpirations.set(false); this.loadSubscriptions(); this.loadReport(); this.loadInvoices(); }, error: () => this.checkingExpirations.set(false) });
  }
  onProcessPayment(id: string): void { this.api.processPayment(id).subscribe({ next: () => { this.msg.add({ severity:'success', summary:'Prefactura generada', life: 3000 }); this.loadInvoices(); } }); }
  onMarkPaid(id: string): void { this.api.markInvoicePaid(id).subscribe({ next: () => { this.msg.add({ severity:'success', summary:'Factura pagada — sumada a ingresos', life: 3000 }); this.loadInvoices(); this.loadReport(); } }); }
  onMarkOverdue(id: string): void { this.api.markInvoiceOverdue(id).subscribe({ next: () => { this.msg.add({ severity:'warn', summary:'Factura marcada como vencida', life: 3000 }); this.loadInvoices(); } }); }
  onChangeStatus(id: string, status: string): void { this.api.updateSubscriptionStatus(id, status).subscribe({ next: () => { this.msg.add({ severity:'success', summary:'Estado actualizado', life: 3000 }); this.loadSubscriptions(); this.loadReport(); } }); }
  onAssignPlan(): void {
    if (!this.assignUserId || !this.assignPlanId) return;
    this.assigning.set(true);
    this.api.createSubscription(this.assignUserId, this.assignPlanId).subscribe({
      next: () => { this.msg.add({ severity:'success', summary:'Plan asignado', life: 3000 }); this.assigning.set(false); this.showAssignDialog = false; this.assignUserId = ''; this.assignPlanId = ''; this.loadSubscriptions(); this.loadReport(); },
      error: err => { this.msg.add({ severity:'error', summary:'Error', detail: err.error?.message ?? 'No se pudo asignar', life: 5000 }); this.assigning.set(false); },
    });
  }

  // Menú contextual compartido — un solo p-menu para toda la tabla
  subMenuItems: MenuItem[] = [];
  invMenuItems: MenuItem[] = [];

  openSubMenu(event: Event, row: SubscriptionRow, menu: { toggle: (e: Event) => void }): void {
    this.subMenuItems = this.buildSubActions(row);
    menu.toggle(event);
  }

  openInvMenu(event: Event, inv: Invoice, menu: { toggle: (e: Event) => void }): void {
    this.invMenuItems = this.buildInvActions(inv);
    menu.toggle(event);
  }

  openChangePlan(row: SubscriptionRow): void {
    this.changePlanSubId = row.id;
    this.changePlanUserId = row.userId;
    this.changePlanUserName = row.userName;
    this.changePlanCurrentName = row.planName;
    this.changePlanNewId = '';
    this.showChangePlanDialog = true;
  }

  onChangePlan(): void {
    if (!this.changePlanNewId || !this.changePlanUserId) return;
    this.assigning.set(true);
    // Cancelar suscripción actual y crear nueva
    this.api.updateSubscriptionStatus(this.changePlanSubId, 'CANCELLED').subscribe({
      next: () => {
        this.api.createSubscription(this.changePlanUserId, this.changePlanNewId).subscribe({
          next: () => {
            this.msg.add({ severity: 'success', summary: 'Plan cambiado', detail: `${this.changePlanUserName} ahora tiene un nuevo plan`, life: 4000 });
            this.assigning.set(false);
            this.showChangePlanDialog = false;
            this.loadSubscriptions();
            this.loadReport();
          },
          error: (err) => {
            this.msg.add({ severity: 'error', summary: 'Error', detail: err.error?.message ?? 'No se pudo cambiar el plan', life: 5000 });
            this.assigning.set(false);
          },
        });
      },
    });
  }

  private buildSubActions(row: SubscriptionRow): MenuItem[] {
    const items: MenuItem[] = [];
    if (row.status === 'ACTIVE') {
      items.push({ label: 'Cambiar Plan', icon: 'pi pi-sync', command: () => this.openChangePlan(row) });
      items.push({ label: 'Generar Prefactura', icon: 'pi pi-file', command: () => this.onProcessPayment(row.id) });
      items.push({ separator: true });
      items.push({ label: 'Suspender', icon: 'pi pi-ban', command: () => this.onChangeStatus(row.id, 'EXPIRED') });
    }
    if (row.status === 'EXPIRED') {
      items.push({ label: 'Reactivar', icon: 'pi pi-replay', command: () => this.onChangeStatus(row.id, 'ACTIVE') });
    }
    if (row.status !== 'CANCELLED') {
      items.push({ separator: true });
      items.push({ label: 'Cancelar Suscripción', icon: 'pi pi-times', command: () => this.onChangeStatus(row.id, 'CANCELLED') });
    }
    return items;
  }

  private buildInvActions(inv: Invoice): MenuItem[] {
    const items: MenuItem[] = [];
    if (inv.status === 'PENDING' || inv.status === 'OVERDUE') {
      items.push({ label: 'Registrar Pago', icon: 'pi pi-dollar', command: () => this.onMarkPaid(inv.id) });
    }
    if (inv.status === 'PENDING') {
      items.push({ label: 'Marcar Vencida', icon: 'pi pi-exclamation-triangle', command: () => this.onMarkOverdue(inv.id) });
    }
    return items;
  }
}
