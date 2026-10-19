---
    name : Modulo de agregar metodo de pago
    description: Terminar el desarrollo del modulo de agregar metodos de pago
---

# TaskFlow

1. **Terminar la implementacion del modulo src\app\features\payment-methods\components\add-payment-method\add-payment-method.(html, scss y ts).**

2. **Analizar todos los archivos del modulo que ya yo implemente**

3. **Analizar la tienda src\app\core\stores\paymentMethods\payment-method.store.ts**

4. **Implementar el html y el scss del componente agregar metodo usando la taste skill y acorde a la paleta ya planteada agents\skills\taste-skill.md y metodos de la tienda para el control del estado del componente**

5. **Implementar la siguiente logica en el form: si el usuario escoge un tipo tarjeta la maxima longitud del campo "number" si el usuario la coloca debe ser de 16, si es cuenta sera de 20. Se debe implementar lo necesario tanto en el schema zod y en el html para evitar que el usuario pueda tipar mas de 20 caracteres en el form**

6. **Incorporar el modulo al routing principal de la app**

# Constraint

1. **Mobile first en el desarrollo de la visual**

2. **Tipado obligatorio**

# Jit Loading

1. **src\app\core\stores\paymentMethods\payment-method.store.ts**

2. **src\app\features\payment-methods\components\add-payment-method\add-payment-method.(html, scss y ts)**

3. **agents\skills\taste-skill.md**