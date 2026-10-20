export interface AddMovementRequest {
  amount: number;
  description: string;
  date: string;
  type: 'income' | 'expense';
  category?: string;
  currency: 'EUR' | 'USD' | 'USDT' | 'VES';
  /** Método de pago asociado: el campo es opcional en el formulario. */
  paymentMethodId?: number;
}
