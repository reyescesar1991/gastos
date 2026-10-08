import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { delay, Observable, of } from "rxjs";
import { DUMMy_LOGIN_CREDENTIALS_RESPONSE } from "./mocks/loginCredentialsResponse.mock";
import { SessionStore } from "../../core/stores/session.store";
import { LoginCredentialsRequest, LoginCredentialsResponse } from "./models/login-credentials.model";


export class AuthApiService {

    private readonly httpClient = inject(HttpClient);
    private readonly useMock: boolean = true;



    login(credentials: LoginCredentialsRequest): Observable<LoginCredentialsResponse> {
        if (this.useMock) {
            return of(DUMMy_LOGIN_CREDENTIALS_RESPONSE).pipe(delay(600));
        }

        return this.httpClient.post<LoginCredentialsResponse>('/auth/login', credentials);
    }


    register(username: string, email: string, password: string): Observable<any> {
        return this.httpClient.post('/auth/register', { username, email, password });
    }

    forgotPassword(email: string) {
        return this.httpClient.post('/auth/forgot-password', { email });
    }

}
