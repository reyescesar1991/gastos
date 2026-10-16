/**
 * Sugerencias de categoría del formulario de movimientos.
 *
 * Alimentan el `datalist` del campo: orientan al usuario con las categorías
 * habituales de una app de gastos personales, pero la categoría sigue siendo
 * opcional y de texto libre, así que se puede escribir cualquier otra. Cuando
 * exista el endpoint de categorías, esta lista se reemplaza por su respuesta sin
 * tocar el formulario: el componente solo consume el arreglo.
 */
export const MOVEMENT_CATEGORIES: readonly string[] = [
  'Supermercado',
  'Servicios',
  'Transporte',
  'Vivienda',
  'Salud',
  'Restaurantes',
  'Educación',
  'Ocio',
];
