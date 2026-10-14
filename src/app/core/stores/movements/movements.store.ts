import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { Movement } from "../../models/movements/movement.model";
import { computed, inject } from "@angular/core";
import { MovementsApiService } from "../../api/movements/movements-api.service";
import { ToastService } from "../../services/toast-service";
import { firstValueFrom } from "rxjs/internal/firstValueFrom";
import { MovementMapper } from "../../models/movements/movement.mapper";
import { ErrorUtils } from "../../utils/error-handler.util";



// 1. Definimos la interfaz del estado de la tienda de movimientos
export interface BalanceState {
    movements: Movement[] | null;
    isLoading: boolean;
    error: string | null;
    successMessage: string | null;
}

// 2. Estado inicial
const initialState: BalanceState = {
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
        })
    ),

    withMethods(
        (store, movementsService = inject(MovementsApiService), toastService = inject(ToastService)) => ({

            async getMovements(): Promise<void> {

                patchState(store, { isLoading: true, error: null });

                try{

                    const response = await firstValueFrom(movementsService.getMovements());

                    const movementsDomain = MovementMapper.toModel(response.data);

                    patchState(store, { movements: movementsDomain, isLoading: false });

                }
                catch (err){

                    const errorMessage = ErrorUtils.getErrorMessage(err);

                    patchState(store, { error: errorMessage, isLoading: false });

                    toastService.error(errorMessage, { duration: 5000 });
                }
            
            }
        })
    )
)