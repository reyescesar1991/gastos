import { computed, inject } from "@angular/core";
import { Router } from "@angular/router";
import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { User } from "../models/user/user.model";

// 1. Definimos la interfaz del estado de sesión
export interface SessionState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// 2. Estado inicial
const initialState: SessionState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

export const SessionStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),

    // Selectores computados (se recalculan solos cuando cambia el estado)
    withComputed(
        (store) => ({
            isLoggedIn: computed(() => !!store.token() && !!store.user()),
            nameUser: computed(() => store.user()?.name ?? 'Anónimo'),
        })
    ),

    // Métodos y acciones para modificar el estado
    withMethods(
        (store, router = inject(Router)) => ({

            successfulLogin(user : User, token : string) : void {
                patchState(store, {

                    user,
                    token,
                    isLoading: false,
                    error: null,
                });

                router.navigate(['/dashboard']);
            },

            logout() : void {
                patchState(store, initialState);

                router.navigate(['/login']);
            },

            setError(error: string) : void {
                patchState(store, {
                    error,
                    isLoading: false,
                });
            },

            setLoading(isLoading: boolean) : void {
                patchState(store, {
                    isLoading,
                });
            }
        })
    )
)