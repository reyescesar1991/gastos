

export interface AddMovementRequest {
    amount: number;
    description: string;
    date: string;
    type: 'income' | 'expense';
    category?: string;
    currency: 'EUR' | 'USD' | 'USDT' | 'VES';
}