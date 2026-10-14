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
            category: 'Compras',
            currency: 'USD'
        },
        {
            id: "2",
            description: 'Pago de servicios',
            amount: 100.00,
            date: '2023-07-05',
            type: 'outcome',
            category: 'Servicios',
            currency: 'USD'
        }
    ]
}