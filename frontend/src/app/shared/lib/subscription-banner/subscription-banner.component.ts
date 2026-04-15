import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-subscription-banner',
  standalone: true,
  imports: [CommonModule, TagModule, MessageModule, ProgressSpinnerModule, CardModule],
  templateUrl: './subscription-banner.component.html',
})
export class SubscriptionBannerComponent {
  @Input() isActive = false;
  @Input() endDate: string | null = null;
  @Input() loading = false;
}
