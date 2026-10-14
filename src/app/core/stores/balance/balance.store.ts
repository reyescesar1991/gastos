import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { Balance } from "../../models/balance/balance.model";
import { computed, inject } from "@angular/core";
import { BalanceApiService } from "../../api/balance/balance-api.service";
import { ToastService } from "../../services/toast-service";
import { firstValueFrom } from "rxjs";
import { BalanceMapper } from "../../models/balance/balance.mapper";
import { ErrorUtils } from "../../utils/error-handler.util";
import { UpdateBalanceRequest } from "../../models/balance/update-balance.request";


// 1. Definimos la interfaz del estado del balance
export interface BalanceState {
    balance: Balance | null;
    isLoading: boolean;
    error: string | null;
    successMessage: string | null;
}

// 2. Estado inicial
const initialState: BalanceState = {
    balance: null,
    isLoading: false,
    error: null,
    successMessage: null,
};

export const BalanceStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),

    withComputed(
        (store) => ({
            availableBalance: computed(() => store.balance()?.available ?? 0),
            totalBalance: computed(() => store.balance()?.balanceTotal ?? 0),
            income: computed(() => store.balance()?.income ?? 0),
            outcome: computed(() => store.balance()?.outcome ?? 0),

            // Distingue "sin registros" de un valor en cero, para que la vista
            // pueda mostrar una etiqueta de valor nulo.
            hasBalance: computed(() => store.balance() !== null),

            // Moneda de los importes; el backend la envía junto al balance.
            currency: computed(() => store.balance()?.currency ?? 'USD'),
        })
    ),

    withMethods(

        (store, balanceService = inject(BalanceApiService), toastService = inject(ToastService)) => ({

            async getBalance(): Promise<void> {

                patchState(store, { isLoading: true, error: null });

                try{

                    const response = await firstValueFrom(balanceService.getBalance());

                    const balanceDomain: Balance = BalanceMapper.toBalance(response.data);

                    patchState(store, { balance: balanceDomain, isLoading: false });

                }
                catch (err){

                    const errorMessage = ErrorUtils.getErrorMessage(err);

                    patchState(store, { error: errorMessage, isLoading: false });

                    toastService.error(errorMessage, { duration: 5000 });
                }
            },

            async updateBalance(request: UpdateBalanceRequest): Promise<void> {

                patchState(store, { isLoading: true, error: null });

                try{

                    const response = await firstValueFrom(balanceService.updateBalance(request));

                    const balanceDomain: Balance = BalanceMapper.toBalance(response.data);

                    patchState(store, { balance: balanceDomain, isLoading: false, successMessage: response.message });

                    toastService.success(response.message, { duration: 5000 });

                }
                catch (err){

                    const errorMessage = ErrorUtils.getErrorMessage(err);

                    patchState(store, { error: errorMessage, isLoading: false });

                    toastService.error(errorMessage, { duration: 5000 });
                }
            },
        })
    )
)