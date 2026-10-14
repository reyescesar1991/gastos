

export interface UpdateBalance {

    income: number,
    currency: string
}

export type UpdateBalanceRequest = Partial<UpdateBalance>;