import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast-service';
import { TOAST_DEFAULT_DURATION } from '../models/toast/toast.model';

/**
 * Pruebas del servicio de toasts.
 *
 * Cubren lo que el instructivo pide: los valores por defecto, los atajos por
 * variante, el temporizador de autocierre, el cierre manual y la ejecución del
 * callback posterior al toast.
 */
describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    service.clear();
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('crea un toast con tipo y duración por defecto', () => {
    service.show({ message: 'Guardado' });

    const [toast] = service.toasts();
    expect(toast.message).toBe('Guardado');
    expect(toast.type).toBe('info');
    expect(toast.duration).toBe(TOAST_DEFAULT_DURATION);
  });

  it('expone un atajo por cada variante semántica', () => {
    service.success('A');
    service.error('B');
    service.warning('C');
    service.info('D');

    expect(service.toasts().map((toast) => toast.type)).toEqual([
      'success',
      'error',
      'warning',
      'info',
    ]);
  });

  it('devuelve un id y permite cerrar el toast manualmente', () => {
    const id = service.show({ message: 'Manual' });

    service.dismiss(id);

    expect(service.toasts()).toHaveLength(0);
  });

  it('cierra el toast cuando vence su duración', () => {
    vi.useFakeTimers();

    service.show({ message: 'Auto', duration: 1000 });
    vi.advanceTimersByTime(1000);

    expect(service.toasts()).toHaveLength(0);
  });

  it('mantiene visible un toast con duración 0', () => {
    vi.useFakeTimers();

    service.show({ message: 'Persistente', duration: 0 });
    vi.advanceTimersByTime(10_000);

    expect(service.toasts()).toHaveLength(1);
  });

  it('ejecuta el callback cuando el temporizador cierra el toast', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    service.show({ message: 'Auto', duration: 1000, onClose });
    vi.advanceTimersByTime(1000);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ejecuta el callback al cerrar manualmente', () => {
    const onClose = vi.fn();
    const id = service.show({ message: 'Manual', onClose });

    service.dismiss(id);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('no ejecuta el callback dos veces si se cierra repetidamente', () => {
    const onClose = vi.fn();
    const id = service.show({ message: 'Manual', duration: 0, onClose });

    service.dismiss(id);
    service.dismiss(id);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cierra todos los toasts con clear', () => {
    service.success('A');
    service.error('B');

    service.clear();

    expect(service.toasts()).toHaveLength(0);
  });
});
