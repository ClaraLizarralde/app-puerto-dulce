# Puerto Dulce — Reorganización de estructura de datos

## Situación actual

La app nació con una lógica tipo “planilla por día”:

```js
datos.dias["2026-05-08"].pedidos
```

Esto funcionó bien para una primera versión porque el objetivo era similar a una Google Sheet mejorada.

Pero la app creció y ahora:

* hay filtros
* estados
* producción
* etiquetas
* búsqueda
* clientes frecuentes
* estadísticas
* lógica de productos
* edición de pedidos
* acciones cruzadas

Entonces la estructura actual empieza a generar:

* lógica duplicada
* renders demasiado complejos
* dificultad para mover pedidos
* dificultad para buscar globalmente
* dependencia excesiva de `datos.dias`
* mezcla de UI + lógica + datos

---

# Objetivo futuro

Pasar de una estructura “por día” a una estructura “centrada en pedidos”.

La idea es que:

* el pedido sea la entidad principal
* la fecha sea una propiedad del pedido
* los días se calculen dinámicamente

---

# Estructura recomendada

```js
datos = {
  pedidos: {
    "p_001": {
      id: "p_001",

      fecha_entrega: "2026-05-08",
      hora_entrega: "17:00",

      cliente: {
        nombre: "Clara",
        frecuente: true
      },

      estado: "pendiente",

      pagado: false,
      dia_especial: false,
      fuera_horario: false,

      productos: [
        {
          id: "prod_1",
          nombre: "Cheesecake",
          cantidad: 2,
          tamano: "mediano",

          tacc: false,
          pedido_cuba: false,
          listo: false,

          nota_prod: ""
        }
      ],

      notas: "",

      creado: "2026-05-08T12:00:00"
    }
  }
}
```

---

# Beneficios de esta estructura

## Más simple para:

* buscar pedidos
* editar pedidos
* mover pedidos de fecha
* exportar
* hacer estadísticas
* agregar persistencia real
* agregar backend en el futuro
* agregar historial
* agregar vistas distintas

---

# Cambios recomendados (graduales)

## 1. NO acceder más directo a `datos.dias`

Crear helpers centrales:

```js
getTodosLosPedidos()
getPedido(id)
getPedidosPorDia(fecha)
crearPedido()
editarPedido()
eliminarPedido()
```

Toda la app debería usar esos helpers.

---

## 2. Centralizar estados

Evitar strings hardcodeados.

Crear:

```js
const ESTADOS = {
  PENDIENTE: "pendiente",
  PRODUCCION: "prod",
  LISTO: "listo",
  ENTREGADO: "entregado"
}
```

---

## 3. Unificar estructura de cliente

Eliminar cosas como:

```js
cliente
cliente_input
```

Tener una única fuente de verdad.

---

## 4. Evitar códigos crípticos

Reemplazar:

```js
tacc: "s"
tacc: "c"
```

por algo más claro:

```js
tacc: true/false
```

o

```js
tipo_tacc: "sin_tacc"
```

---

## 5. Separar render de lógica

Actualmente `renderPedidos()` hace demasiadas cosas:

* lógica de negocio
* validaciones
* derivaciones
* cálculo de estados
* HTML

El objetivo futuro:

* helpers preparan datos
* render solamente dibuja

---

## 6. Crear un modelo base de pedido

Aunque sea vanilla JS simple.

Ejemplo:

```js
function crearPedidoBase() {
  return {
    id: generarId(),
    fecha_entrega: "",
    hora_entrega: "",
    estado: ESTADOS.PENDIENTE,
    productos: [],
    pagado: false,
    notas: ""
  };
}
```

Esto evita inconsistencias y campos inventados sobre la marcha.

---

# Importante

NO rehacer toda la app de golpe.

La migración debería ser:

1. helpers
2. centralización de lógica
3. limpieza de modelo
4. recién después cambiar estructura interna

Si se intenta rehacer todo junto:

* se rompe la UI
* aparecen bugs difíciles
* se pierde velocidad de desarrollo

La app ya funciona.
El objetivo ahora es volverla mantenible.
