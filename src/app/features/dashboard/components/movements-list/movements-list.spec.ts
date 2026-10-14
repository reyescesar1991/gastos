import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Movement } from '../../../../core/models/movements/movement.model';
import { MovementsList } from './movements-list';

/** Host de prueba: aporta los inputs del componente presentacional. */
@Component({
  imports: [MovementsList],
  selector: 'app-movements-host',
  template: `<app-movements-list
    [movements]="movements()"
    [hasMovements]="hasMovements()"
    [isLoading]="isLoading()"
  />`,
})
class MovementsHost {
  readonly movements = signal<readonly Movement[]>([]);
  readonly hasMovements = signal(false);
  readonly isLoading = signal(false);
}

/**
 * Pruebas de la lista de movimientos.
 *
 * Cubren sus tres estados (cargando, sin movimientos y con filas) y que cada
 * fila exponga los atributos del instructivo con el semáforo por tipo.
 */
describe('MovementsList', () => {
  let fixture: ComponentFixture<MovementsHost>;

  const movements: Movement[] = [
    {
      id: '2',
      amount: 100,
      description: 'Pago de servicios',
      date: '2023-07-05',
      type: 'outcome',
      category: 'Servicios',
      currency: 'USD',
    },
    {
      id: '1',
      amount: 50,
      description: 'Compra de productos',
      date: '2023-07-01',
      type: 'income',
      category: 'Compras',
      currency: 'USD',
    },
  ];

  /** Estado de carga. */
  function status(): HTMLElement {
    return fixture.nativeElement.querySelector('.movements__status') as HTMLElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MovementsHost] }).compileComponents();

    fixture = TestBed.createComponent(MovementsHost);
  });

  it('muestra el estado de carga', () => {
    fixture.componentInstance.isLoading.set(true);
    fixture.detectChanges();

    expect(status().textContent).toContain('Cargando movimientos');
    expect(fixture.nativeElement.querySelector('.movements__list')).toBeNull();
  });

  it('avisa cuando el usuario no registró movimientos', () => {
    fixture.detectChanges();

    expect(status().textContent).toContain('Aún no registras movimientos');
  });

  it('pinta cada movimiento con sus atributos y el semáforo por tipo', () => {
    fixture.componentInstance.movements.set(movements);
    fixture.componentInstance.hasMovements.set(true);
    fixture.detectChanges();

    const rows = Array.from(fixture.nativeElement.querySelectorAll('.movement')) as HTMLElement[];

    expect(rows.length).toBe(2);
    expect(rows[0].getAttribute('data-type')).toBe('outcome');
    expect(rows[0].querySelector('.movement__description')?.textContent).toBe('Pago de servicios');
    expect(rows[0].querySelector('.movement__type')?.textContent).toBe('Egreso');
    expect(rows[0].querySelector('.movement__currency')?.textContent).toBe('USD');
    expect((rows[0].querySelector('.movement__amount') as HTMLElement).textContent).toContain('100');
    expect((rows[0].querySelector('.movement__date') as HTMLElement).textContent).toMatch(
      /(^|\D)0?5(\D|$)/,
    );

    expect(rows[1].getAttribute('data-type')).toBe('income');
    expect(rows[1].querySelector('.movement__type')?.textContent).toBe('Ingreso');
  });
});
