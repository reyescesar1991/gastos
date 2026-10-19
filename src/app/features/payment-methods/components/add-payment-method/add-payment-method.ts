import { Component, inject, signal } from '@angular/core';
import { PaymentMethodsStore } from '../../../../core/stores/paymentMethods/payment-method.store';
import { Router } from '@angular/router';
import { AddPaymentMethodForm, createInitialAddPaymentMethodForm } from '../../models/add-payment-method-form.model';
import { form, submit, validateStandardSchema } from '@angular/forms/signals';
import { paymentMethodSchema } from '../../schemas/payment-methods.schemas';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { PaymentMethodMapper } from '../../models/payment-method.mapper';
import { DialogFact } from '../../../../shared/models/dialog/confirm-dialog.model';
import { AddPaymentMethodRequest } from '../../models/add-payment-method-request.model';

@Component({
  imports: [],
  selector: 'app-add-payment-method',
  styleUrl: './add-payment-method.scss',
  templateUrl: './add-payment-method.html',
})
export class AddPaymentMethod {

  protected readonly paymentMethodsStore = inject(PaymentMethodsStore);

  private readonly router = inject(Router);

  protected paymentMethodModel = signal<AddPaymentMethodForm>(createInitialAddPaymentMethodForm());

  protected paymentMethodForm = form(this.paymentMethodModel, (path) => {


    validateStandardSchema(path, paymentMethodSchema);
  });

  private readonly confirmDialog = inject(ConfirmDialogService);


  protected onSubmit(event: Event) : void {
  
    event.preventDefault();
    void submit(this.paymentMethodForm, { action: async () => this.confirmAndSave() });
  }


  private async confirmAndSave(): Promise<void> {

    const request = PaymentMethodMapper.toRequest(this.paymentMethodModel());

    const confirmed = await this.confirmDialog.ask({
      title: 'Confirmar pago',
      confirmLabel: 'Guardar',
      cancelLabel: 'Volver',
      content: {
        kind: 'facts',
        message: 'Revisa los valores antes de guardarlo.',
        facts: this.factsOf(request),
      },
    });

    if (!confirmed) {
      return;
    }

    const saved = await this.paymentMethodsStore.addPaymentMethod(request);

    if (!saved) {
      return;
    }

    const another = await this.confirmDialog.ask(
      {
        title: 'Metodo de pago registrado',
        confirmLabel: 'Registrar otro',
        cancelLabel: 'Ir al resumen',
        content: { kind: 'message', message: '¿Quieres registrar otro metodo de pago?' },
      },
      // El foco vuelve al primer campo para poder encadenar otro sin el ratón.
      { restoreFocus: '#description' },
    );

    if (another) {
      this.onClear();
      return;
    }

    void this.router.navigate(['/dashboard']);
  }

  private factsOf(request: AddPaymentMethodRequest): DialogFact[] {
    return [
      { label: 'Tipo de metodo de pago', value: request.type },
      { label: 'Numero de metodo de pago', value: request.number ?? 'N/A', mono: true },
      { label: 'Descripcion', value: request.description ?? 'N/A' },
      { label: 'Moneda', value: request.currency },
      { label: 'Nombre de metodo de pago', value: request.name },
    ];
  }


  protected onClear(): void {
    this.paymentMethodModel.set(createInitialAddPaymentMethodForm());
    this.paymentMethodForm().reset();
    this.paymentMethodsStore.resetFeedback();
  }
}
