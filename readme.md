🍰 Puerto Dulce - Backoffice de Pastelería
📋 Descripción
Panel de administración (backoffice) para gestión de pedidos y producción de una pastelería. Aplicación web vanilla (HTML/CSS/JS puro).

🛠️ Tecnologías
HTML5 + CSS3 (estructura modular: base, layout, módulos, temas, UI)
JavaScript ES6+ (13 módulos funcionales)
Sin frameworks ni dependencias externas

📁 Estructura del proyecto
/
├── index.html
├── css/
│ ├── base1.css
│ ├── layout.css
│ ├── modulos.css
│ ├── themes.css
│ └── ui.css
├── js/
│ ├── app.js
│ ├── pedidos.js
│ ├── produccion.js
│ ├── pizarron.js
│ ├── data.js
│ ├── demo-data.js
│ ├── export.js
│ ├── utils.js
│ ├── config.js
│ ├── cuba.js
│ ├── etiquetas.js
│ ├── html-events.js
│ ├── modeles.js
│ └── themes.js
└── assets/
└── chalk/

## Objetivo del sistema
Sistema para gestionar:
- pedidos
- producción
- stock futuro
- etiquetas
- exportaciones

## Flujo principal
1. Se crea pedido
2. Pedido pasa a producción
3. Producción genera tareas
4. Se imprime etiqueta
5. Pedido se marca entregado

## Estado actual
- Vanilla JS
- Sin backend
- Data mockeada
- UI en refactor

## Problemas actuales
- lógica de pedidos confusa
- modal de nuevo pedido desordenado
- demasiada lógica mezclada con DOM
- CSS difícil de mantener

## Convenciones
- módulos separados por feature
- evitar frameworks
- evitar dependencias
- mobile secondary

# Puerto Dulce - Contexto

Proyecto vanilla JS sin frameworks.

Objetivo:
Backoffice de pastelería para pedidos y producción.

Prioridades:
1. claridad visual
2. rapidez de carga
3. facilidad de mantenimiento

No quiero:
- React
- TypeScript
- npm
- build steps complejos

Arquitectura deseada:
- módulos simples
- funciones chicas
- estado centralizado simple
- render desacoplado