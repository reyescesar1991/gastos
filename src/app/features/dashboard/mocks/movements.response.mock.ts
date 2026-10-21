import { ApiSuccessResponse } from "../../../core/models/api/api-success.model";
import { MovementDto } from "../../../core/models/movements/movement-dto.model";


export const MOVEMENTS_MOCK : ApiSuccessResponse<MovementDto[]> = {

    statusCode: 200,
    message: 'Movimientos obtenidos con éxito',
    data: [
        {
            id: "1",
            description: 'Compra de productos',
            amount: 50.00,
            date: '2023-07-01',
            type: 'income',
            paymentMethodId: 1,
            category: 'Compras',
            currency: 'USD'
        },
        {
            id: "2",
            description: 'Pago de servicios',
            amount: 100.00,
            date: '2023-07-05',
            type: 'expense',
            paymentMethodId: 2,
            category: 'Servicios',
            currency: 'USD'
        }
    ]
}