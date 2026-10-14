import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Balance } from '../../../../core/models/balance/balance.model';
import { BalanceSummary } from './balance-summary';

/** Pruebas del resumen de balance: semáforo con datos y etiqueta nula sin ellos. */
describe('BalanceSummary', () => {
  let fixture: ComponentFixture<BalanceSummary>;

  const balance: Balance = {
    balanceTotal: 1500.5,
    available: 1200,
    currency: 'USD',
    income: 3000,
    outcome: 1500.5,
  };

  /** Texto de la celda indicada. */
  function value(modifier: string): string {
    const cell = fixture.nativeElement.querySelector(
      `.summary__cell--${modifier} .summary__value`,
    );

    return (cell as HTMLElement).textContent?.trim() ?? '';
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BalanceSummary] }).compileComponents();

    fixture = TestBed.createComponent(BalanceSummary);
  });

  it('usa la etiqueta de valor nulo cuando no hay balance', () => {
    fixture.detectChanges();

    expect(value('income')).toBe('—');
    expect(value('outcome')).toBe('—');
    expect(value('available')).toBe('—');
    expect(fixture.nativeElement.querySelectorAll('.summary__cell--empty').length).toBe(3);
    expect(fixture.nativeElement.querySelector('.summary__empty')).toBeTruthy();
  });

  it('pinta las tres celdas semaforizadas con los valores del balance', () => {
    fixture.componentRef.setInput('balance', balance);
    fixture.detectChanges();

    expect(value('income')).toMatch(/3[.,]000/);
    expect(value('outcome')).toMatch(/1[.,]500/);
    expect(value('available')).toMatch(/1[.,]200/);
    expect(fixture.nativeElement.querySelectorAll('.summary__cell--empty').length).toBe(0);
    expect(fixture.nativeElement.querySelector('.summary__empty')).toBeNull();
  });
});
