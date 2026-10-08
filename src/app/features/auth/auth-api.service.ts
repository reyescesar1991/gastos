import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { delay, Observable, of } from "rxjs";
import { DUMMy_LOGIN_CREDENTIALS_RESPONSE } from "./mocks/loginCredentialsResponse.mock";
import { SessionStore } from "../../core/stores/session.store";
import { LoginCredentialsRequest, LoginCredentialsResponse } from "./models/login-credentials.model";
import { RegisterUserRequest } from "./models/register-request.model";
import { ApiSuccessResponse } from "../../core/models/api/api-success.model";


export class AuthApiService {

    private readonly httpClient = inject(HttpClient);
    private readonly useMock: boolean = true;



    login(credentials: LoginCredentialsRequest): Observable<ApiSuccessResponse<LoginCredentialsResponse>> {
        if (this.useMock) {
            return of(DUMMy_LOGIN_CREDENTIALS_RESPONSE).pipe(delay(600));
        }

        return this.httpClient.post<ApiSuccessResponse<LoginCredentialsResponse>>('/auth/login', credentials);
    }


    register(request: RegisterUserRequest): Observable<any> {
        
        if (this.useMock) {
            return of(DUMMy_LOGIN_CREDENTIALS_RESPONSE).pipe(delay(600));
        }
            return this.httpClient.post('/auth/register', request);

    }

    forgotPassword(email: string) {
        return this.httpClient.post('/auth/forgot-password', { email });
    }

}
