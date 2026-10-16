import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { ApiSuccessResponse } from "../../models/api/api-success.model";
import { MovementDto } from "../../models/movements/movement-dto.model";
import { Observable } from "rxjs/internal/Observable";
import { MOVEMENTS_MOCK } from "../../../features/dashboard/mocks/movements.response.mock";
import { of } from "rxjs/internal/observable/of";
import { delay } from "rxjs/internal/operators/delay";
import { AddMovementRequest } from "../../../features/movements/models/add-movement-request.model";


/**
 * API de movimientos. Con `useMock` en true devuelve la data dummy del feature
 * dashboard; al apagarlo consume `/movements` del backend real.
 */
@Injectable({ providedIn: 'root' })
export class MovementsApiService {

    private readonly httpClient = inject(HttpClient);
    private readonly useMock: boolean = true;

    getMovements() : Observable<ApiSuccessResponse<MovementDto[]>> {
        if(this.useMock){
            return of(MOVEMENTS_MOCK).pipe(delay(500));
        }
        return this.httpClient.get<ApiSuccessResponse<MovementDto[]>>('/movements');
    }

    addMovement(movement : AddMovementRequest) : Observable<ApiSuccessResponse<void>> {

        if(this.useMock){
            return of({statusCode: 200, message: 'Movimiento creado con éxito', data: undefined}).pipe(delay(500));
        }
        return this.httpClient.post<ApiSuccessResponse<void>>('/movements', movement);
    }
}