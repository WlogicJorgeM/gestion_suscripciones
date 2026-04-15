export type UserRole = 'ADMIN' | 'CLIENT';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Plan {
  id: string;
  name: string;
  type: 'BRONZE' | 'SILVER' | 'GOLD';
  price: number;
  description: string;
  features: string[];
  durationDays: number;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  startDate: string;
  endDate: string;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  basePrice: number;
  discount: number;
  amount: number;
  tax: number;
  total: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  dueDate: string;
  paidAt: string | null;
}

export interface Report {
  totalActiveSubscriptions: number;
  totalExpiredSubscriptions: number;
  totalCancelledSubscriptions: number;
  totalRevenue: number;
  periodRevenue: number;
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
}

export interface BillingRate {
  planId: string;
  planName: string;
  planType: 'BRONZE' | 'SILVER' | 'GOLD';
  basePrice: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
  description: string;
}

export interface BillingSimulation {
  plan: { id: string; name: string; type: string; basePrice: number };
  billing: {
    basePrice: number;
    discountRate: number;
    discountAmount: number;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    description: string;
    strategy: string;
  };
}
