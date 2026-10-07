import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { SessionStore } from "../stores/session.store";


export const authInterceptor: HttpInterceptorFn = (req, next) => {

    const sessionStore = inject(SessionStore);
    const token = sessionStore.token();

    if(token){

        const authReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
        return next(authReq);
    }

    return next(req);
}