import { CanActivateFn, Router } from "@angular/router";
import { SessionStore } from "../stores/session.store";
import { inject } from "@angular/core";


export const authGuard : CanActivateFn = (route, state) => {

    const session = inject(SessionStore);
    const router = inject(Router);

    if(!session.isLoggedIn()){
        router.navigate(['/login']);
        return false;
    }

    return true;
}