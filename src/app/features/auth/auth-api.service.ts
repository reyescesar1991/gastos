import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, delay, map, Observable, of, tap, throwError } from "rxjs";
import { DUMMy_LOGIN_CREDENTIALS_RESPONSE } from "./mocks/loginCredentialsResponse.mock";
import { SessionStore } from "../../core/stores/session.store";
import { UserMapper } from "../../core/models/user/user.mapper";
import { LoginCredentialsResponse } from "./models/login-credentials.model";
import { ErrorUtils } from "../../core/utils/error-handler.util";


export class AuthApiService {

    private readonly httpClient = inject(HttpClient);
    private readonly sessionStore = inject(SessionStore);
    private readonly useMock: boolean = true;



    login(email: string, password: string): Observable<void> {
    // 1. Notificamos al Store que la petición inició
    this.sessionStore.setLoading(true);

    if (this.useMock) {
      return of(DUMMy_LOGIN_CREDENTIALS_RESPONSE).pipe(
        delay(600),
        tap((response) => {
          const userDomain = UserMapper.toDomain(response.profile);
          this.sessionStore.successfulLogin(userDomain, response.token);
        }),
        map(() => void 0),
        catchError((err) => {

            const messageError = ErrorUtils.getErrorMessage(err);
          // 2. Si ocurre un error simulado o de red, notificamos al Store
          this.sessionStore.setError(messageError);
          return throwError(() => err);
        })
      );
    }

    return this.httpClient
      .post<LoginCredentialsResponse>('/auth/login', { email, password })
      .pipe(
        tap((response) => {
          const userDomain = UserMapper.toDomain(response.profile);
          this.sessionStore.successfulLogin(userDomain, response.token);
        }),
        map(() => void 0),
        catchError((err) => {
          // 2. Capturamos el error HTTP real y actualizamos el Store
          const messageError = ErrorUtils.getErrorMessage(err);
          this.sessionStore.setError(messageError);
          return throwError(() => err);
        })
      );
  }


    register(username: string, email: string, password: string): Observable<any> {
        return this.httpClient.post('/auth/register', { username, email, password });
    }

    forgotPassword(email: string) {
        return this.httpClient.post('/auth/forgot-password', { email });
    }

}
