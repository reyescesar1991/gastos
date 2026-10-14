import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { SessionStore } from './core/stores/auth/session.store';

/**
 * Pruebas del componente raíz.
 *
 * Además del `router-outlet`, verifican que la raíz traduzca el tema de la
 * sesión al atributo `data-theme` de `<html>`, que es lo que activa los tokens
 * del tema en `styles.scss`.
 */
describe('App', () => {
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    localStorage.clear();
    delete document.documentElement.dataset['theme'];

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    fixture = TestBed.createComponent(App);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debe exponer el router-outlet para las rutas hijas', async () => {
    fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });

  it('aplica el tema resuelto al documento y lo actualiza al cambiarlo', async () => {
    const store = TestBed.inject(SessionStore);

    fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(document.documentElement.dataset['theme']).toBe(store.resolvedTheme());

    store.setTheme('dark');
    fixture.detectChanges();

    expect(document.documentElement.dataset['theme']).toBe('dark');
  });
});
