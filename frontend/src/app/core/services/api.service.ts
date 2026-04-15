import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Plan, Subscription, Invoice, Report, User, BillingRate, BillingSimulation } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'http://localhost:3000/api';

  constructor(private readonly http: HttpClient) {}

  // Users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/auth/users`);
  }

  // Plans
  getPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.baseUrl}/plans`);
  }

  getPlanById(id: string): Observable<Plan> {
    return this.http.get<Plan>(`${this.baseUrl}/plans/${id}`);
  }

  createPlan(plan: Omit<Plan, 'id'>): Observable<Plan> {
    return this.http.post<Plan>(`${this.baseUrl}/plans`, plan);
  }

  updatePlan(id: string, data: Partial<Plan>): Observable<Plan> {
    return this.http.put<Plan>(`${this.baseUrl}/plans/${id}`, data);
  }

  deletePlan(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/plans/${id}`);
  }

  // Subscriptions (Admin)
  getSubscriptions(status?: string): Observable<Subscription[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Subscription[]>(`${this.baseUrl}/subscriptions`, { params });
  }

  getSubscriptionById(id: string): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.baseUrl}/subscriptions/${id}`);
  }

  createSubscription(userId: string, planId: string): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.baseUrl}/subscriptions`, { userId, planId });
  }

  updateSubscriptionStatus(id: string, status: string): Observable<Subscription> {
    return this.http.put<Subscription>(`${this.baseUrl}/subscriptions/${id}/status`, { status });
  }

  // Subscriptions (Client)
  getMySubscriptions(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.baseUrl}/subscriptions/me/current`);
  }

  getUserSubscriptions(userId: string): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.baseUrl}/subscriptions/user/${userId}`);
  }

  // Billing
  processPayment(subscriptionId: string): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.baseUrl}/subscriptions/payment`, { subscriptionId });
  }

  checkExpirations(): Observable<{ expiredSubscriptions: number; overdueInvoices: number }> {
    return this.http.post<{ expiredSubscriptions: number; overdueInvoices: number }>(`${this.baseUrl}/billing/check-expirations`, {});
  }

  getBillingRates(): Observable<BillingRate[]> {
    return this.http.get<BillingRate[]>(`${this.baseUrl}/billing/rates`);
  }

  simulateBilling(planId: string): Observable<BillingSimulation> {
    return this.http.get<BillingSimulation>(`${this.baseUrl}/billing/simulate/${planId}`);
  }

  // Invoices
  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.baseUrl}/invoices`);
  }

  getInvoicesBySubscription(subscriptionId: string): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.baseUrl}/invoices/subscription/${subscriptionId}`);
  }

  markInvoicePaid(invoiceId: string): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.baseUrl}/invoices/${invoiceId}/pay`, {});
  }

  markInvoiceOverdue(invoiceId: string): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.baseUrl}/invoices/${invoiceId}/overdue`, {});
  }

  // Reports
  getReport(startDate?: string, endDate?: string): Observable<Report> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<Report>(`${this.baseUrl}/reports`, { params });
  }
}
