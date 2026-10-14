---
    name: Modulo Dashboard
    description: Construccion del modulo de dashboard, menu de navegacion y filtros
---

# Task Flow

1. **Construir un menu de navegacion en src\app\shared con los siguientes atributos: icono, nombre de la opcion, activacion o desactivacion de la opcion y posibilidad de tener rutar subhijas, y estilos de selected option. Meditar si es necesario una Store para el manejo del menu pero no es obligatorio**

2. **Construir un header en src\app\shared con los siguientes elementos: boton de cerrar sesion, etiqueta de nombre del usuario, imagen de avatar del usuario**

3. **Diseñar el modo responsive para mobile en la parte superior de la app: El header incluye el menu de navegacion en modo hamburguesa con un desplegable con las opciones, sigue manteniendo de forma visualmente armonica el nombre del usuario, imagen de avatar (al darle click nos redirige a la opcion del menu "Configuracion de usuario" donde se podra configurar el cambio de la imagen y tema de la app) y boton de cerrar sesion**

4. **Incluir las siguientes opciones en el menu de navegacion como data dummy en una misma carpeta "mock" del menu de navegacion con sus respectivos atributos: "Agregar movimiento", "Ver movimientos", "Agregar metodo de pago" y "Configuracion de usuario". Selecciona iconos acordes a las opciones**

5. **Incluir estos elementos al nivel del router-oulet para garantizar visualizacion en todos los modulos**

6. **Crear la vista "Dashboard" en src\app\features\dashboard\dashboard.html incluyendo los siguientes elementos: 1. Un contenedor divido en tres celdas que se va a distribuir de izquierda a derecha con los valores obtenidos por la tienda de balance src\app\core\stores\balance\balance.store.ts income, outcome y available. Dicho contenedor debe usar semaforizacion de valores de acuerdo a la paleta principal de la app, y ademas considerar el caso en el que el usuario no ha registrado data en la app por lo tanto usara un etiqueta de valor nulo. 2. Un input de navegacion rapido que lista las opciones del menu de navegacion en un desplegable y va actualizando mediante interaccion del usuario, al hacer click redirige a la vista asociada a la opcion del menu seleccionada. 3. Contenedor con los ultimos movimientos listados usando el atributo computed de la tienda src\app\core\stores\movements\movements.store.ts mostrando sus atributos: description, amount, type, currency y date, debe estar semaforizado en base al type del movimiento, considera el uso acorde la paleta o agrega un valor en armonia a la misma. 4. Boton de acceso rapido a la accion: registrar movimiento**

7. **Agregar el dashboard en carga lazy al routing principal de la app**

8. **Diseñar la vista con filosofia first-mobile**

# Constraints 

1. **First Mobile prioridad**

2. **Uso de la skill taste-skill para el diseño de la vista**

3. **Armonizacion de colores nuevos con la paleta de colores actual**

# Jit Loading 

1. **src\app\shared**

2. **src\app\features\dashboard\dashboard.(html, scss y ts)**

3. **src\app\core\stores\balance\balance.store.ts**

4. **src\app\core\stores\movements\movements.store.ts**

5. **agents\skills\taste-skill.md**