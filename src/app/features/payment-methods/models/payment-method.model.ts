
export type PaymentMethodCurrency = 'EUR' | 'USD' | 'USDT' | 'VES';

export type PaymentMethodType = 'card' | 'account' | 'binance';

export interface PaymentMethodModel {
    id: number;
    name: string;
    type: PaymentMethodType;
    description?: string;
    number?: string;
    currency: PaymentMethodCurrency
}