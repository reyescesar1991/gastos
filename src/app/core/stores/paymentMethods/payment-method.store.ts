import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { PaymentMethodModel } from "../../../features/payment-methods/models/payment-method.model";
import { computed, inject } from "@angular/core";
import { PaymentMethodsApiService } from "../../../features/payment-methods/payment-methods-api.service";
import { ToastService } from "../../services/toast-service";
import { firstValueFrom } from "rxjs/internal/firstValueFrom";
import { PaymentMethodMapper } from "../../../features/payment-methods/models/payment-method.mapper";
import { ErrorUtils } from "../../utils/error-handler.util";
import { PaymentMethodRequest } from "../../../features/payment-methods/models/add-payment-method-request.model";


export interface PaymentMethodState {
    paymentMethods: PaymentMethodModel[] | null;
    isLoading: boolean;
    error: string | null;
    successMessage: string | null;
}

// 2. Estado inicial
const initialState: PaymentMethodState = {
    paymentMethods: null,
    isLoading: false,
    error: null,
    successMessage: null,
};

export const PaymentMethodsStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),

    withComputed(
        (store) => ({
            paymentMethodsList: computed(() => store.paymentMethods() ?? []),

            hasPaymentMethods: computed(() => (store.paymentMethods() ?? []).length > 0),
        })
    ),

    withMethods(

        (
            store, 
            paymentMethodsService = inject(PaymentMethodsApiService), 
            toastService = inject(ToastService)
        
        ) => {

            const getPaymentMethods = async (): Promise<void> => {
                
                patchState(store, { isLoading: true, error: null });
    
                try {
                    const response = await firstValueFrom(paymentMethodsService.getPaymentMethods());
                    const paymentMethodsDomain = PaymentMethodMapper.toModels(response.data);
                    patchState(store, { paymentMethods: paymentMethodsDomain, isLoading: false });
                } catch (err) {
                    const errorMessage = ErrorUtils.getErrorMessage(err);
                    patchState(store, { error: errorMessage, isLoading: false });
                    toastService.error(errorMessage, { duration: 5000 });
                }
            };

            return { 
                getPaymentMethods, 

                async addPaymentMethod(request : PaymentMethodRequest) : Promise<boolean> {
                    
                    patchState(store, { isLoading: true, error: null, successMessage: null });
    
                    try {
                        const response = await firstValueFrom(paymentMethodsService.addPaymentMethod(request));
    
                        await getPaymentMethods();
    
                        patchState(store, {
                            isLoading: false,
                            successMessage: response.message
                        });
    
                        toastService.success(response.message, { duration: 4000 });

                        return true;
    
                    } catch (err) {
                        const errorMessage = ErrorUtils.getErrorMessage(err);
                        patchState(store, { error: errorMessage, isLoading: false });
                        toastService.error(errorMessage, { duration: 5000 });
                        return false;
                    }
                },

                async updatePaymentMethod(request : Partial<PaymentMethodRequest>) : Promise<boolean> {
                    
                    patchState(store, { isLoading: true, error: null, successMessage: null });
    
                    try {
                        const response = await firstValueFrom(paymentMethodsService.updatePaymentMethod(request));
    
                        await getPaymentMethods();
    
                        patchState(store, {
                            isLoading: false,
                            successMessage: response.message
                        });
    
                        toastService.success(response.message, { duration: 4000 });

                        return true;
    
                    } catch (err) {
                        const errorMessage = ErrorUtils.getErrorMessage(err);
                        patchState(store, { error: errorMessage, isLoading: false });
                        toastService.error(errorMessage, { duration: 5000 });
                        return false;
                    }
                },

                async deletePaymentMethod(paymentMethodId : number) : Promise<boolean> {
                    
                    patchState(store, { isLoading: true, error: null, successMessage: null });
    
                    try {
                        const response = await firstValueFrom(paymentMethodsService.deletePaymentMethod(paymentMethodId));
    
                        await getPaymentMethods();
    
                        patchState(store, {
                            isLoading: false,
                            successMessage: response.message
                        });
    
                        toastService.success(response.message, { duration: 4000 });

                        return true;
    
                    } catch (err) {
                        const errorMessage = ErrorUtils.getErrorMessage(err);
                        patchState(store, { error: errorMessage, isLoading: false });
                        toastService.error(errorMessage, { duration: 5000 });
                        return false;
                    }
                },
                

                resetFeedback(): void {
                    patchState(store, { error: null, successMessage: null });
                }
            };
        }
    )
)