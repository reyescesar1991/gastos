import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { delay, Observable, of } from "rxjs";
import { DUMMy_LOGIN_CREDENTIALS_RESPONSE } from "./mocks/auth/loginCredentialsResponse.mock";
import { LoginCredentialsRequest, LoginCredentialsResponse } from "./models/login-credentials.model";
import { RegisterUserRequest } from "./models/register-request.model";
import { ApiSuccessResponse } from "../../core/models/api/api-success.model";
import { ForgotPasswordRequest } from "./models/forgot-password.model";


export class AuthApiService {

    private readonly httpClient = inject(HttpClient);
    private readonly useMock: boolean = true;



    login(credentials: LoginCredentialsRequest): Observable<ApiSuccessResponse<LoginCredentialsResponse>> {
        if (this.useMock) {
            return of(DUMMy_LOGIN_CREDENTIALS_RESPONSE).pipe(delay(600));
        }

        return this.httpClient.post<ApiSuccessResponse<LoginCredentialsResponse>>('/auth/login', credentials);
    }


    register(request: RegisterUserRequest): Observable<ApiSuccessResponse<LoginCredentialsResponse>> {
        
        if (this.useMock) {
            return of(DUMMy_LOGIN_CREDENTIALS_RESPONSE).pipe(delay(600));
        }
            return this.httpClient.post<ApiSuccessResponse<LoginCredentialsResponse>>('/auth/register', request);

    }

    forgotPassword(request : ForgotPasswordRequest): Observable<ApiSuccessResponse<void>> {
        
        if(this.useMock){
            return of ({statusCode: 200, message: 'Correo de recuperación enviado', data: undefined}).pipe(delay(600));
        }
        return this.httpClient.post<ApiSuccessResponse<void>>('/auth/forgot-password', request);
    }

}
