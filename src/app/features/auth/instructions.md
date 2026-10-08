---
    name: Creacion de interfaces Login, register y forgot
    description: Uso de skill para generar html, scss y ts minimo necesario de las interfaces
---

# TaskFlow

1. **Procesar la skill ubicada en agents\skills\taste-skill.md**

2. **Usar la skill para generar una idea para cada interfaz de los componentes: src\app\features\auth\pages\login\login.html, src\app\features\auth\pages\register\register.html y src\app\features\auth\pages\forgot-password\forgot-password.html**

3. **Aplicar las ideas y crear el html y scss de cada uno de los componentes tomando en cuenta lo generado por la skill para cada uno**

4. **Implementar un routing routerlink de etiquetas html en la interfaz del login apuntando al registro de usuario y otra a la recuperacion de contraseña**

5. **Implementar los formularios en sus respectivos componentes .ts y vincularlos a un form en el html: src\app\features\auth\models\forgot-password.model.ts, src\app\features\auth\models\login-credentials.model.ts y src\app\features\auth\models\register-request.model.ts**

6. **Implementar las validaciones en el formulario de login: formato de email estandar y contraseña (incluye minimo 8 caracteres entre los cuales debe tener un caracter especial, minimo un numero y como maximo 20 caracteres totales) que iran vinculadas a la propiedad disabled del boton de dicho form**

7. **Implementar las validaciones en el formulario de registro: mismas validaciones en email y contraseña, en el campo username (minimo 5 caracteres y maximo 20, no espacios en blanco) que iran vinculadas a la propiedad disabled del boton de dicho form**

8. **Implementar las validaciones en el formulario de olvide contraseña: mismas validaciones en email que iran vinculadas a la propiedad disabled del boton de dicho form**

9. **Usar elementos de angular 22 reactivos para el manejo de los forms y validaciones**

# Constraints

1. **Seguir la skill para generar la interfaces**

2. **Solo implementar lo solicitado**

3. **Documentacion obligatoria en el .ts de cada componente**

4. **First mobile prioridad**

# Jit Loading 

1. **agents\skills\taste-skill.md**

2. **src\app\features\auth\pages\login\login.html**

3. **src\app\features\auth\pages\register\register.html**

4. **src\app\features\auth\pages\forgot-password\forgot-password.html**

5. **src\app\features\auth\models\forgot-password.model.ts**

6. **src\app\features\auth\models\login-credentials.model.ts**

7. **src\app\features\auth\models\register-request.model.ts**

