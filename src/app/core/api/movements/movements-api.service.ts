import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { ApiSuccessResponse } from "../../models/api/api-success.model";
import { MovementDto } from "../../models/movements/movement-dto.model";
import { Observable } from "rxjs/internal/Observable";
import { MOVEMENTS_MOCK } from "../../../features/dashboard/mocks/movements.response.mock";
import { of } from "rxjs/internal/observable/of";
import { delay } from "rxjs/internal/operators/delay";


export class MovementsApiService {

    private readonly httpClient = inject(HttpClient);
    private readonly useMock: boolean = true;

    getMovements() : Observable<ApiSuccessResponse<MovementDto[]>> {
        if(this.useMock){
            return of(MOVEMENTS_MOCK).pipe(delay(500));
        }
        return this.httpClient.get<ApiSuccessResponse<MovementDto[]>>('/movements');
    }
}