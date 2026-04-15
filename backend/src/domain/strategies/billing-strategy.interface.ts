/** Port: Interfaz de estrategia de facturación (Strategy Pattern) */
export interface BillingResult {
  amount: number;
  tax: number;
  total: number;
  discount: number;
  description: string;
}

export interface BillingStrategy {
  /** Calcula el monto de facturación según el precio base del plan */
  calculate(basePrice: number): BillingResult;

  /** Nombre identificador de la estrategia */
  readonly strategyName: string;
}
