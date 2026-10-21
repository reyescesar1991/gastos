import { CanActivateFn, Router } from "@angular/router";
import { SessionStore } from "../stores/auth/session.store";
import { inject } from "@angular/core";


export const authGuard : CanActivateFn = (route, state) => {

    const session = inject(SessionStore);
    const router = inject(Router);

    if(!session.isLoggedIn()){
        // `/login` no existe como ruta raíz: el login vive bajo `/auth`.
        router.navigate(['/auth/login']);
        return false;
    }

    return true;
}