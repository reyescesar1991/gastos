import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { delay, Observable, of } from "rxjs";
import { ApiSuccessResponse } from "../../models/api/api-success.model";
import { BalanceDto } from "../../models/balance/balance-dto.model";
import { BALANCE_MOCK, UPDATE_BALANCE_MOCK } from "../../../features/dashboard/mocks/balance-response.mock";
import { UpdateBalanceRequest } from "../../models/balance/update-balance.request";

/**
 * API de balance. Con `useMock` en true devuelve la data dummy del feature
 * dashboard; al apagarlo consume `/balance` del backend real.
 */
@Injectable({ providedIn: 'root' })
export class BalanceApiService {

    private readonly httpClient = inject(HttpClient);
    private readonly useMock: boolean = true;

    getBalance(): Observable<ApiSuccessResponse<BalanceDto>> {
        if (this.useMock) {
            return of(BALANCE_MOCK).pipe(delay(500));
        }

        // Si usas Supabase o tu API intermedia
        return this.httpClient.get<ApiSuccessResponse<BalanceDto>>('/balance');
    }

    updateBalance(request : UpdateBalanceRequest) : Observable<ApiSuccessResponse<BalanceDto>> {
        if (this.useMock) {
            return of(UPDATE_BALANCE_MOCK).pipe(delay(500));
        }

        return this.httpClient.put<ApiSuccessResponse<BalanceDto>>('/update-balance', request);
    }
}