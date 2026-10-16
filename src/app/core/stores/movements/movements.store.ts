import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { Movement } from "../../models/movements/movement.model";
import { computed, inject } from "@angular/core";
import { MovementsApiService } from "../../api/movements/movements-api.service";
import { ToastService } from "../../services/toast-service";
import { firstValueFrom } from "rxjs/internal/firstValueFrom";
import { MovementMapper } from "../../models/movements/movement.mapper";
import { ErrorUtils } from "../../utils/error-handler.util";
import { AddMovementRequest } from "../../../features/movements/models/add-movement-request.model";



// Cantidad de movimientos que expone la vista de resumen (dashboard).
export const LATEST_MOVEMENTS_LIMIT = 5;

// 1. Definimos la interfaz del estado de la tienda de movimientos
export interface MovementState {
    movements: Movement[] | null;
    isLoading: boolean;
    error: string | null;
    successMessage: string | null;
}

// 2. Estado inicial
const initialState: MovementState = {
    movements: null,
    isLoading: false,
    error: null,
    successMessage: null,
};

export const MovementsStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),

    withComputed(
        (store) => ({

            movementsList: computed(() => store.movements() ?? []),

            // Últimos movimientos para la vista de resumen: orden cronológico
            // inverso (la API envía fechas ISO YYYY-MM-DD, que ordenan
            // lexicográficamente igual que cronológicamente) y recorte al
            // límite de la vista.
            latestMovements: computed(() => [...(store.movements() ?? [])]
                .sort((first, second) => second.date.localeCompare(first.date))
                .slice(0, LATEST_MOVEMENTS_LIMIT)),

            // Permite distinguir "sin movimientos" de una lista vacía por filtro.
            hasMovements: computed(() => (store.movements() ?? []).length > 0),
        })
    ),

    withMethods(
        (
            store,
            movementsService = inject(MovementsApiService),
            toastService = inject(ToastService)
        ) => {

            // Declaramos getMovements de forma independiente para poder llamarlo donde queramos
            const getMovements = async (): Promise<void> => {
                patchState(store, { isLoading: true, error: null });

                try {
                    const response = await firstValueFrom(movementsService.getMovements());
                    const movementsDomain = MovementMapper.toModel(response.data);
                    patchState(store, { movements: movementsDomain, isLoading: false });
                } catch (err) {
                    const errorMessage = ErrorUtils.getErrorMessage(err);
                    patchState(store, { error: errorMessage, isLoading: false });
                    toastService.error(errorMessage, { duration: 5000 });
                }
            };

            return {
                getMovements,

                async addMovement(request: AddMovementRequest): Promise<void> {

                    patchState(store, { isLoading: true, error: null, successMessage: null });

                    try {
                        const response = await firstValueFrom(movementsService.addMovement(request));

                        
                        await getMovements();

                        patchState(store, {
                            isLoading: false,
                            successMessage: response.message
                        });

                        toastService.success(response.message, { duration: 4000 });

                    } catch (err) {
                        const errorMessage = ErrorUtils.getErrorMessage(err);
                        patchState(store, { error: errorMessage, isLoading: false });
                        toastService.error(errorMessage, { duration: 5000 });
                    }
                }
            };
        }
    )
)