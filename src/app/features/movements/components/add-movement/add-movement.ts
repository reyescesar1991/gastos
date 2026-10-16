import { Component, signal } from '@angular/core';
import { form, FormField, maxLength, validateStandardSchema } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { AddMovementForm } from '../../models/add-movement-form.model';
import { addMovementSchema, DESCRIPTION_MAX_LENGTH } from '../../schemas/movements.schemas';

@Component({
  imports: [FormField, RouterLink],
  selector: 'app-add-movement',
  styleUrl: './add-movement.scss',
  templateUrl: './add-movement.html',
})
export class AddMovement {

  protected readonly credentials = signal<AddMovementForm>({ amount: 0, description: '', date: new Date(), type: 'expense', category: '', currency: 'USD' });

  protected readonly loginForm = form(this.credentials, (path) => {

    maxLength(path.description, DESCRIPTION_MAX_LENGTH);

    validateStandardSchema(path, addMovementSchema);
  });
}
