import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastContainer } from './toast-container';
import { ToastService } from '../../../core/services/toast-service';

/**
 * Pruebas del contenedor de toasts.
 *
 * Verifican lo observable en el DOM: que la lista vacía no pinte nada, que el
 * mensaje y la variante se reflejen, que el botón cierre el toast y que la barra
 * del temporizador solo aparezca cuando el toast tiene duración.
 */
describe('ToastContainer', () => {
  let fixture: ComponentFixture<ToastContainer>;
  let service: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ToastContainer] }).compileComponents();

    fixture = TestBed.createComponent(ToastContainer);
    service = TestBed.inject(ToastService);
    await fixture.whenStable();
  });

  afterEach(() => {
    service.clear();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('no renderiza toasts cuando la lista está vacía', () => {
    expect(fixture.nativeElement.querySelector('.toast')).toBeNull();
  });

  it('renderiza el mensaje y la variante del toast', async () => {
    service.success('Cuenta creada');
    await fixture.whenStable();

    const toast = fixture.nativeElement.querySelector('.toast') as HTMLElement;
    const message = toast.querySelector('.toast__message') as HTMLElement;

    expect(toast.classList.contains('toast--success')).toBe(true);
    expect(message.textContent?.trim()).toBe('Cuenta creada');
  });

  it('cierra el toast al pulsar el botón de cierre', async () => {
    service.info('Con cierre');
    await fixture.whenStable();

    const close = fixture.nativeElement.querySelector('.toast__close') as HTMLButtonElement;
    close.click();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.toast')).toBeNull();
  });

  it('muestra la barra del temporizador solo cuando hay duración', async () => {
    service.info('Con timer', { duration: 3000 });
    service.info('Sin timer', { duration: 0 });
    await fixture.whenStable();

    const timers = fixture.nativeElement.querySelectorAll('.toast__timer') as NodeListOf<HTMLElement>;

    expect(timers).toHaveLength(1);
    expect(timers[0].style.getPropertyValue('--toast-duration')).toBe('3000ms');
  });

  it('aplica el icono de la variante como SVG', async () => {
    service.error('Fallo');
    await fixture.whenStable();

    const toast = fixture.nativeElement.querySelector('.toast') as HTMLElement;

    expect(toast.querySelector('.toast__icon svg')).not.toBeNull();
  });
});
