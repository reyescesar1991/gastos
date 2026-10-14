import { computed, inject } from "@angular/core";
import { Router } from "@angular/router";
import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { User } from "../../models/user/user.model";
import { ErrorUtils } from "../../utils/error-handler.util";
import { firstValueFrom } from "rxjs";
import { LoginCredentialsRequest } from "../../../features/auth/models/login-credentials.model";
import { UserMapper } from "../../models/user/user.mapper";
import { AuthApiService } from "../../../features/auth/auth-api.service";
import { RegisterUserRequest } from "../../../features/auth/models/register-request.model";
import { ForgotPasswordRequest } from "../../../features/auth/models/forgot-password.model";
import { ToastService } from "../../services/toast-service";
import { DEFAULT_THEME, THEME_STORAGE_KEY, THEMES, ResolvedTheme, Theme } from "../../models/theme/theme.model";
import { prefersDarkScheme } from "../../utils/media-query.util";

// 1. Definimos la interfaz del estado de sesión
export interface SessionState {
    user: User | null;
    token: string | null;
    theme: Theme;
    isLoading: boolean;
    error: string | null;
    successMessage: string | null;
}

// 2. Estado inicial
const initialState: SessionState = {
    user: null,
    token: null,
    theme: DEFAULT_THEME,
    isLoading: false,
    error: null,
    successMessage: null,
};

export const SessionStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),

    // Selectores computados (se recalculan solos cuando cambia el estado)
    withComputed(
        (store) => ({
            isLoggedIn: computed(() => !!store.token() && !!store.user()),
            nameUser: computed(() => store.user()?.name ?? 'Anónimo'),

            // Tema efectivo a aplicar: cuando el usuario delega en el sistema,
            // se resuelve con la media query del sistema operativo.
            resolvedTheme: computed<ResolvedTheme>(() => {
                const theme = store.theme();

                return theme === 'system'
                    ? (prefersDarkScheme() ? 'dark' : 'light')
                    : theme;
            }),
        })
    ),

    // Métodos y acciones para modificar el estado
    withMethods(
        (store, authApi = inject(AuthApiService), router = inject(Router), toastService = inject(ToastService)) => ({

            /**
     * Accion principal de Login que orquesta la API y el estado
     */
            async login(credentials: LoginCredentialsRequest): Promise<void> {
                patchState(store, { isLoading: true, error: null });

                try {
                    // 1. Consumimos el observable como promesa limpia
                    const response = await firstValueFrom(authApi.login(credentials));

                    // 2. Mapeamos el DTO de la respuesta al modelo de Dominio
                    const userDomain = UserMapper.toDomain(response.data.profile);

                    // Guardamos el usuario en localStorage para persistencia
                    localStorage.setItem('auth_user', JSON.stringify(userDomain));

                    // 3. Actualizamos el estado global en una sola mutación atómica
                    patchState(store, {
                        user: userDomain,
                        token: response.data.token,
                        isLoading: false,
                        error: null,
                    });

                    // Guardamos el token en localStorage para persistencia
                    localStorage.setItem('auth_token', response.data.token);

                    // 4. Redirigimos al usuario
                    router.navigate(['/dashboard']);
                } catch (err) {
                    // 5. En caso de fallo, capturamos el mensaje tipado
                    const messageError = ErrorUtils.getErrorMessage(err);

                    patchState(store, {
                        error: messageError,
                        isLoading: false,
                    });

                    // 6. Mostramos el toast
                    toastService.error(messageError, { duration: 5000 });
                }
            },

            async register(request: RegisterUserRequest): Promise<void> {

                patchState(store, { isLoading: true, error: null });

                try {

                    const response = await firstValueFrom(authApi.register(request));

                    const userDomain = UserMapper.toDomain(response.data.profile);

                    patchState(store, {
                        user: userDomain,
                        token: response.data.token,
                        isLoading: false,
                        error: null,
                    });

                    // Guardamos el token en sessionStorage para persistencia temporal
                    localStorage.setItem('auth_token', response.data.token);

                    toastService.success(response.message, { duration: 5000 });

                    router.navigate(['dashboard']);

                }
                catch (err) {

                    const messageError = ErrorUtils.getErrorMessage(err);

                    patchState(store, {
                        error: messageError,
                        isLoading: false,
                    });

                    toastService.error(messageError, { duration: 5000 });
                }
            },

            async forgotPassword(request: ForgotPasswordRequest): Promise<void> {

                patchState(store, { isLoading: true, error: null, successMessage: null });

                try {

                    const response = await firstValueFrom(authApi.forgotPassword(request));

                    patchState(store, {
                        isLoading: false,
                        error: null,
                        successMessage: response.message,
                    });

                    toastService.success(response.message, { duration: 5000 });

                    router.navigate(['/login']);

                } catch (err) {

                    const messageError = ErrorUtils.getErrorMessage(err);

                    patchState(store, {
                        error: messageError,
                        isLoading: false,
                    });

                    toastService.error(messageError, { duration: 5000 });
                }
            },

            /**
   * Restaura la sesión desde el localStorage al iniciar la app
   */
            initSession(): void {
                // El tema se restaura siempre, haya sesión o no: la pantalla de
                // login tambien debe respetar la preferencia guardada.
                const theme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;

                if (theme !== null && THEMES.includes(theme)) {
                    patchState(store, { theme });
                }

                const token = localStorage.getItem('auth_token');
                const userJson = localStorage.getItem('auth_user');

                if (token && userJson) {
                    try {
                        const user = JSON.parse(userJson);
                        patchState(store, { token, user });
                    } catch {
                        // Si el JSON está corrupto, limpiamos por seguridad
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('auth_user');
                    }
                }
            },

            logout(): void {
                // Limpiamos el localStorage al salir
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');

                // Solo se resetea el estado de sesión: el tema es una
                // preferencia del dispositivo, no de la sesión, así que sobrevive
                // al cierre de sesión.
                patchState(store, {
                    user: null,
                    token: null,
                    isLoading: false,
                    error: null,
                    successMessage: null,
                });

                router.navigate(['/auth/login']);
            },

            /**
             * Cambia el tema de la app y lo persiste en el dispositivo.
             *
             * @param theme Preferencia elegida por el usuario.
             */
            setTheme(theme: Theme): void {
                localStorage.setItem(THEME_STORAGE_KEY, theme);
                patchState(store, { theme });
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