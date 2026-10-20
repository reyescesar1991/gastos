---
    name: Modulo Administrar metodos de pago
    description: Implementar modulo de administracion de metodos de pago para visualizar, actualizar o eliminar
---

# TaskFlow

1. **Implementar el modulo en src\app\features\payment-methods\components\list-payment-methods\list-payment-methods.(html, scss y ts)**

2. **Usar la tienda src\app\core\stores\paymentMethods\payment-method.store.ts para obtener la lista de metodos de pago a traves de un computed**

3. **Implementar la vista en formato de tabla: colocando todos los valores del modelo del metodo de pago src\app\features\payment-methods\models\payment-method.model.ts, dos botones de accion (actualizar y eliminar) para cada elemento. Para los campos opcionales que no tengan valores se coloca un valor por defecto string**

4. **Implementar una modal de actualizacion para el boton de actualizar, carga los datos de ese elemento y permite cambiar los siguientes campos: name, type, description, number y currency. Todos los campos aplican las mismas condiciones ya presentes en su schema src\app\features\payment-methods\schemas\payment-methods.schemas.ts**

5. **Implementar una modal de eliminar elemento simple, con un mensaje de aviso y dos botones: aceptar y cancelar que al ser exitosa la eliminacion debe ejecutar un toasts de exito**

6. **Verificar los metodos implementados en la store y el servicio api src\app\features\payment-methods\payment-methods-api.service.ts y el uso del Partial para el update**

7. **Diseñar el html y el scss de modo que la tabla en modo mobile se vea de forma armonica y correcta siguiendo la taste-skill**

8. **Agregar el modulo como ruta principal al tocar el menu principal de metodos de pago, agregar un boton en este componente "Agregar metodo de pago" que rediriga al modulo "Agregar metodo de pago"**

9. **Actualizar los routing pertinentes: routing del modulo y routing principal, asi como menu y navegacion rapida**

# Constraints

1. **Mobile First**

2. **Tipado obligatorio**


# Jit Loading

1. **src\app\features\payment-methods\components\list-payment-methods\list-payment-methods.(html, scss y ts)**

2. **src\app\core\stores\paymentMethods\payment-method.store.ts**

3. **src\app\features\payment-methods\schemas\payment-methods.schemas.ts**

4. **src\app\features\payment-methods\models\payment-method.model.ts**

5. **src\app\features\payment-methods\payment-methods-api.service.ts**

