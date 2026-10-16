import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ConfirmDialogData } from '../../models/dialog/confirm-dialog.model';
import { ConfirmDialogService } from './confirm-dialog.service';

/**
 * Pruebas del diálogo de confirmación.
 *
 * El CDK monta el contenido en un overlay colgado de `document.body`, fuera del
 * fixture, así que las consultas se hacen contra el documento y el render se
 * fuerza con `ApplicationRef`. Del comportamiento del modal (foco, trap,
 * `Escape`, velo) se encarga el CDK: acá se cubre lo propio —el contenido según
 * el tipo de dato y el resultado que recibe quien pregunta—, y el foco se
 * verifica en el navegador, donde hay layout real para calcularlo.
 */
describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;

  /** Texto de un elemento del overlay, ya normalizado. */
  function text(selector: string): string {
    return document.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  }

  /** Pulsa un botón del overlay. */
  function click(selector: string): void {
    (document.querySelector(selector) as HTMLButtonElement).click();
  }

  /** Dispara `Escape` desde dentro del diálogo. */
  function clickEscape(): void {
    const target = document.querySelector('.confirm__button--confirm') as HTMLElement;

    target.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }),
    );
  }

  /** Aplica los cambios pendientes del overlay. */
  async function settle(): Promise<void> {
    TestBed.inject(ApplicationRef).tick();
    await TestBed.inject(ApplicationRef).whenStable();
  }

  /** Abre el diálogo y devuelve la promesa de su resultado. */
  async function open(data: ConfirmDialogData): Promise<{ result: Promise<boolean> }> {
    const result = service.ask(data);

    await settle();

    return { result };
  }

  async function settleAndAwait(result: Promise<boolean>): Promise<boolean> {
    await settle();

    return result;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();

    service = TestBed.inject(ConfirmDialogService);
  });

  afterEach(() => {
    TestBed.inject(ApplicationRef).tick();
  });

  it('pinta un mensaje cuando el contenido es de tipo mensaje', async () => {
    const { result } = await open({
      title: 'Movimiento registrado',
      confirmLabel: 'Registrar otro',
      cancelLabel: 'Ir al resumen',
      content: { kind: 'message', message: '¿Quieres registrar otro movimiento?' },
    });

    expect(text('.confirm__title')).toBe('Movimiento registrado');
    expect(text('.confirm__message')).toBe('¿Quieres registrar otro movimiento?');
    expect(document.querySelector('.facts')).toBeNull();
    expect(text('.confirm__button--confirm')).toBe('Registrar otro');
    expect(text('.confirm__button--cancel')).toBe('Ir al resumen');

    click('.confirm__button--cancel');
    await settleAndAwait(result);
  });

  it('pinta el resumen campo-valor cuando el contenido es de tipo facts', async () => {
    const { result } = await open({
      title: 'Confirmar movimiento',
      confirmLabel: 'Guardar',
      cancelLabel: 'Volver',
      content: {
        kind: 'facts',
        message: 'Revisa los valores antes de guardarlo.',
        facts: [
          { label: 'Tipo', value: 'Gasto', tone: 'expense' },
          { label: 'Importe', value: 'US$ 1,00', mono: true },
          { label: 'Categoría', value: 'Sin categoría' },
        ],
      },
    });

    expect(text('.confirm__message')).toBe('Revisa los valores antes de guardarlo.');

    const terms = [...document.querySelectorAll('.facts__term')].map((term) => term.textContent?.trim());
    const values = [...document.querySelectorAll('.facts__value')].map((value) =>
      value.textContent?.trim(),
    );

    expect(terms).toEqual(['Tipo', 'Importe', 'Categoría']);
    expect(values).toEqual(['Gasto', 'US$ 1,00', 'Sin categoría']);

    // El semáforo y la tipografía monoespaciada viajan en el dato.
    const importe = document.querySelector('.facts__value[data-fact="Importe"]');
    const tipo = document.querySelector('.facts__value[data-fact="Tipo"]');

    expect(importe?.classList.contains('facts__value--mono')).toBe(true);
    expect(tipo?.getAttribute('data-tone')).toBe('expense');

    click('.confirm__button--cancel');
    await settleAndAwait(result);
  });

  it('resuelve true solo con la acción principal', async () => {
    const { result } = await open({
      title: 'Confirmar movimiento',
      content: { kind: 'message', message: '¿Guardar?' },
    });

    click('.confirm__button--confirm');

    await expect(settleAndAwait(result)).resolves.toBe(true);
    expect(document.querySelector('.confirm__title')).toBeNull();
  });

  it('resuelve false con la acción secundaria', async () => {
    const { result } = await open({
      title: 'Confirmar movimiento',
      content: { kind: 'message', message: '¿Guardar?' },
    });

    click('.confirm__button--cancel');

    await expect(settleAndAwait(result)).resolves.toBe(false);
  });

  it('resuelve false al cerrar con Escape', async () => {
    const { result } = await open({
      title: 'Confirmar movimiento',
      content: { kind: 'message', message: '¿Guardar?' },
    });

    // El CDK escucha el `keydown` en `body` y solo atiende los eventos que
    // ocurren dentro del overlay, así que se dispara desde el propio diálogo
    // (en el navegador sería la tecla sobre el elemento enfocado).
    clickEscape();

    await expect(settleAndAwait(result)).resolves.toBe(false);
    expect(document.querySelector('.confirm__title')).toBeNull();
  });

  it('usa las etiquetas por defecto cuando no se indican', async () => {
    const { result } = await open({
      title: 'Confirmar',
      content: { kind: 'message', message: '¿Seguir?' },
    });

    expect(text('.confirm__button--confirm')).toBe('Confirmar');
    expect(text('.confirm__button--cancel')).toBe('Cancelar');

    click('.confirm__button--cancel');
    await settleAndAwait(result);
  });
});
