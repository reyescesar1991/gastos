

export interface AddMovementForm {

    amount: number
    description: string
    date: Date,
    type: 'income' | 'expense'
    category?: string
    currency: 'EUR' | 'USD' | 'USDT' | 'VES'
}