import { MovementDto } from "./movement-dto.model"
import { Movement } from "./movement.model"


export class MovementMapper {

    public static toDto(movement: Movement[]): MovementDto[] {

        const movementDto: MovementDto[] = [];
        
        for (const movementItem of movement) {
            
            movementDto.push({
                id: movementItem.id,
                amount: movementItem.amount,
                description: movementItem.description,
                date: movementItem.date,
                type: movementItem.type,
                category: movementItem.category,
                currency: movementItem.currency
            })
        }

        return movementDto;
    }

    public static toModel(movementDto: MovementDto[]): Movement[] {
        
        const movement: Movement[] = [];
        
        for (const movementItem of movementDto) {
            
            movement.push({
                id: movementItem.id,
                amount: movementItem.amount,
                description: movementItem.description,
                date: movementItem.date,
                type: movementItem.type,
                category: movementItem.category,
                currency: movementItem.currency
            })
        }

        return movement;
    }
}