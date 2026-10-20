
import { MovementType } from "./movement.model";

export interface MovementDto {

    id: string,
    amount: number,
    description: string,
    date: string,
    type: MovementType,
    paymentMethodId?: number,
    category: string,
    currency: string
}