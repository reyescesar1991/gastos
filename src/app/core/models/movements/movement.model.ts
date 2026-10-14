

export interface Movement{

    id: string,
    amount: number,
    description: string,
    date: string,
    type: 'income' | 'outcome',
    category: string,
    currency: string
}