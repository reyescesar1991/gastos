import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppIcon, IconName } from './app-icon';

/** Host de prueba: permite cambiar el nombre del icono después del render. */
@Component({
  imports: [AppIcon],
  selector: 'app-icon-host',
  template: '<app-icon [name]="name()" />',
})
class IconHost {
  readonly name = signal<IconName>('plus');
}

/**
 * Pruebas del componente de iconos.
 *
 * Se verifica que el registro pinte el glifo pedido y que reaccione al cambio de
 * nombre, que es lo que consumen el menú y el header.
 */
describe('AppIcon', () => {
  let fixture: ComponentFixture<IconHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [IconHost] }).compileComponents();

    fixture = TestBed.createComponent(IconHost);
    await fixture.whenStable();
  });

  it('dibuja el glifo solicitado en el lienzo de 24x24', () => {
    const glyph = fixture.nativeElement.querySelector('svg') as SVGElement;

    expect(glyph).toBeTruthy();
    expect(glyph.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(fixture.nativeElement.querySelectorAll('path').length).toBe(2);
  });

  it('cambia el glifo cuando cambia el nombre', async () => {
    fixture.componentInstance.name.set('menu');
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('path').length).toBe(3);
  });
});
