import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';

type SeverityType = 'success' | 'danger' | 'warning' | 'info' | undefined;

const STATUS_CONFIG: Record<string, { label: string; severity: SeverityType }> = {
  ACTIVE: { label: 'Activo', severity: 'success' },
  EXPIRED: { label: 'Vencido', severity: 'danger' },
  CANCELLED: { label: 'Cancelado', severity: 'warning' },
  PENDING: { label: 'Pendiente', severity: 'warning' },
  PAID: { label: 'Pagada', severity: 'success' },
  OVERDUE: { label: 'Vencida', severity: 'danger' },
  BRONZE: { label: 'Bronce', severity: 'warning' },
  SILVER: { label: 'Silver', severity: 'info' },
  GOLD: { label: 'Gold', severity: 'success' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule, TagModule],
  templateUrl: './status-badge.component.html',
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: string;

  get label(): string {
    return STATUS_CONFIG[this.status]?.label ?? this.status;
  }

  get severity(): SeverityType {
    return STATUS_CONFIG[this.status]?.severity;
  }
}
