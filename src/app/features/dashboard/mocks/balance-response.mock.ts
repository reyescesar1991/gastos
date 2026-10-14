import { ApiSuccessResponse } from "../../../core/models/api/api-success.model";
import { BalanceDto } from "../../../core/models/balance/balance-dto.model";


export const BALANCE_MOCK: ApiSuccessResponse<BalanceDto> = {
    statusCode: 200,
    message: 'Balance obtenido con éxito',
    data: {
        balance_total: 1500.50,
        available: 1200.00,
        currency: 'USD',
        income: 3000.00,
        outcome: 1500.50
    }
}

export const UPDATE_BALANCE_MOCK: ApiSuccessResponse<BalanceDto> = {
    statusCode: 200,
    message: 'Balance actualizado con éxito',
    data: {
        balance_total: 1700.50,
        available: 1200.00,
        currency: 'USD',
        income: 3200.00,
        outcome: 1500.50
    }
}