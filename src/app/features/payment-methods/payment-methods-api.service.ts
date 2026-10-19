import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { ApiSuccessResponse } from "../../core/models/api/api-success.model";
import { PaymentMethodDto } from "./models/payment-method.dto";
import { of } from "rxjs/internal/observable/of";
import { delay } from "rxjs/internal/operators/delay";
import { PAYMENT_METHODS_USER_MOCK } from "./mocks/payment-methods.response.mock";
import { AddPaymentMethodRequest } from "./models/add-payment-method-request.model";

@Injectable({ providedIn: 'root' })
export class PaymentMethodsApiService {

    private readonly httpClient = inject(HttpClient);
    private readonly useMock: boolean = true;


    getPaymentMethods() : Observable<ApiSuccessResponse<PaymentMethodDto[]>> {
        if(this.useMock){
            return of(PAYMENT_METHODS_USER_MOCK).pipe(delay(500));
        }
        return this.httpClient.get<ApiSuccessResponse<PaymentMethodDto[]>>('/payment-methods');
    }

    addPaymentMethod(addPaymentMethodRequest: AddPaymentMethodRequest) : Observable<ApiSuccessResponse<void>> {
        if(this.useMock){
            return of({statusCode: 200, message: 'Metodo de pago creado con éxito', data: undefined}).pipe(delay(500));
        }
        return this.httpClient.post<ApiSuccessResponse<void>>('/payment-methods', addPaymentMethodRequest);
    }
}