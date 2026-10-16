---
    name : Modulo de agregar movimiento
    description: Implementar y diseñar el modulo completo de agregar movimiento
---

# Task Flow

1. **Implementar y diseñar la vista de agregar movimientos en el componente src\app\features\movements\components\add-movement\add-movement.(html, scss y ts) utilizando la skill taste-skill agents\skills\taste-skill.md e implementado filosofia mobile first. Debe poseer un formulario, boton de enviar, limpiar y una redireccion condicional al usuario al dashboard**

2. **Verificar y validar la correcta implementacion del schema que yo plantee en src\app\features\movements\schemas\movements.schemas.ts**

3. **Implementar metodos de obtencion de valores del form y su posterior mapeo al tipo addMovementRequest**

4. **Implementar validaciones html asociadas a valores incorrectos o requeridos en el form**

5. **Implementar valores iniciales para los siguientes campos: currency -> USD, amount -> 1.00 numerico, category -> es opcional, date -> fecha de hoy, type -> usando el enum con valor "expense" por defecto que seria "Gasto" en la etiqueta**

6. **Implementar el metodo limpiar del form garantizando la funcionalidad de los validadores una vez reiniciado el form**

7. **Implementar la siguiente funcionalidad: una vez agregado con exito un movimiento se le debe consultar al usuario si desea agregar otro movimiento, si lo desea el form ya debe estar limpio y disponible para volver a usarlo, si no lo desea redirigimos al dashboard**

8. **Implementar una confirmacion modal antes de agregar cada movimiento para validar los valores y darle mejor experiencia al usuario**

9. **Implementar la store de movimientos src\app\core\stores\movements\movements.store.ts para manejar todos los eventos en el componente**

10. **Añadir este componente al routing del feature y al routing general de la app, a su vez debe estar linkeado al menu de la app ya disponible para navegar desde el menu y el input de busqueda rapida del dashboard**

# Constraint

1. **Tipado obligatorio**

2. **Mobile first**

# Jit Loading

1. **src\app\features\movements\components\add-movement\add-movement.(html, scss y ts)**

2. **agents\skills\taste-skill.md**

3. **src\app\features\movements\schemas\movements.schemas.ts**

4. **src\app\core\stores\movements\movements.store.ts**

5. **src\app\features\dashboard\dashboard.ts**