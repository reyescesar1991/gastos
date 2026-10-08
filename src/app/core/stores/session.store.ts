import { computed, inject } from "@angular/core";
import { Router } from "@angular/router";
import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { User } from "../models/user/user.model";
import { ErrorUtils } from "../utils/error-handler.util";
import { firstValueFrom } from "rxjs";
import { LoginCredentialsRequest } from "../../features/auth/models/login-credentials.model";
import { UserMapper } from "../models/user/user.mapper";
import { AuthApiService } from "../../features/auth/auth-api.service";

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
        (store, authApi = inject(AuthApiService), router = inject(Router)) => ({

            /**
     * Accion principal de Login que orquesta la API y el estado
     */
            async login(credentials: LoginCredentialsRequest): Promise<void> {
                patchState(store, { isLoading: true, error: null });

                try {
                    // 1. Consumimos el observable como promesa limpia
                    const response = await firstValueFrom(authApi.login(credentials));

                    // 2. Mapeamos el DTO de la respuesta al modelo de Dominio
                    const userDomain = UserMapper.toDomain(response.profile);

                    // 3. Actualizamos el estado global en una sola mutación atómica
                    patchState(store, {
                        user: userDomain,
                        token: response.token,
                        isLoading: false,
                        error: null,
                    });

                    // 4. Redirigimos al usuario
                    router.navigate(['/dashboard']);
                } catch (err) {
                    // 5. En caso de fallo, capturamos el mensaje tipado
                    const messageError = ErrorUtils.getErrorMessage(err);

                    patchState(store, {
                        error: messageError,
                        isLoading: false,
                    });
                }
            },

            logout(): void {
                patchState(store, initialState);

                router.navigate(['/login']);
            },

            setError(error: string): void {
                patchState(store, {
                    error,
                    isLoading: false,
                });
            },

            setLoading(isLoading: boolean): void {
                patchState(store, {
                    isLoading,
                });
            }
        })
    )
)