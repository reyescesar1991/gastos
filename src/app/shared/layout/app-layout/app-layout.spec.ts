import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { NavStore } from '../../../core/stores/navigation/nav.store';
import { AppLayout } from './app-layout';

/** Módulo de prueba que ocupa el `router-outlet` del layout. */
@Component({
  selector: 'app-stub-module',
  template: '<p class="stub">Contenido del módulo</p>',
})
class StubModule {}

/**
 * Pruebas del layout.
 *
 * Verifican que header, menú y `router-outlet` convivan en la ruta padre, y que
 * el panel del menú se cierre al cambiar de ruta o al pulsar Escape.
 */
describe('AppLayout', () => {
  let fixture: ComponentFixture<AppLayout>;
  let navStore: InstanceType<typeof NavStore>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppLayout],
      providers: [
        provideRouter([
          { path: 'dashboard', component: StubModule },
          { path: 'otra', component: StubModule },
        ]),
      ],
    }).compileComponents();

    navStore = TestBed.inject(NavStore);
    router = TestBed.inject(Router);

    await router.navigateByUrl('/dashboard');

    fixture = TestBed.createComponent(AppLayout);
    await fixture.whenStable();
  });

  it('monta el header, el menú y el contenido de la ruta', () => {
    expect(fixture.nativeElement.querySelector('app-header')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-nav-menu')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#main-content')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.stub')).toBeTruthy();
  });

  it('cierra el panel del menú al pulsar Escape', async () => {
    patchState(unprotected(navStore), { isMenuOpen: true });
    await fixture.whenStable();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();

    expect(navStore.isMenuOpen()).toBe(false);
  });

  it('cierra el panel del menú al cambiar de ruta', async () => {
    patchState(unprotected(navStore), { isMenuOpen: true });
    await fixture.whenStable();

    await router.navigateByUrl('/otra');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(navStore.isMenuOpen()).toBe(false);
  });
});
