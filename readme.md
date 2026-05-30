# Puerto Dulce — Backoffice de Pastelería

Panel de administración para la gestión integral de pedidos, producción y logística de una pastelería con múltiples locales. Desarrollado como aplicación web sin frameworks ni dependencias de build.

---

## Descripción general

Puerto Dulce Backoffice es un sistema diseñado para el equipo operativo de la pastelería, permitiendo gestionar el ciclo completo de un pedido: desde la toma hasta la entrega. El sistema contempla la operatoria entre dos locales (Matienzo y Cuba) con lógica de producción diferenciada por tipo de producto (Sin TACC / Con TACC).

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Estructura | HTML5 semántico |
| Estilos | CSS3 modular (layout, módulos, temas, UI) |
| Lógica | JavaScript ES6+ vanilla (13 módulos) |
| Persistencia | `localStorage` (sin backend activo) |
| Exportación | [SheetJS (xlsx)](https://sheetjs.com/) vía CDN |
| Fuentes | Google Fonts (Outfit, Lora, Caveat) |

Sin frameworks, sin npm, sin pasos de build.

---

## Estructura del proyecto

```
/
├── index.html              # Punto de entrada único
├── css/
│   ├── layout.css          # Estructura de página, sidebar, responsive
│   ├── modulos.css         # Estilos específicos por módulo
│   ├── themes.css          # Variables de tema (default, girly, neon, pro, dark, pooh)
│   ├── ui.css              # Componentes reutilizables (modales, botones, toasts)
│   ├── nuevopedido.css     # Formulario de nuevo pedido
│   ├── pedidos.css         # Lista y paneles de pedidos
│   └── configuracion.css   # Panel de configuración
├── js/
│   ├── app.js              # Inicialización, eventos globales, UI de usuario
│   ├── auth.js             # Login por PIN, modal de bienvenida, selección de local
│   ├── config.js           # Configuración del local, catálogo, clientes, temas, horarios
│   ├── cuba.js             # Lógica del local Cuba (encargos, exportación)
│   ├── data.js             # Estado global, persistencia, backups automáticos, permisos
│   ├── demo-data.js        # Datos de prueba para desarrollo
│   ├── etiquetas.js        # Generación e impresión de etiquetas
│   ├── export.js           # Exportación a CSV y Excel (XLSX)
│   ├── html-events.js      # Listeners HTML declarativos
│   ├── navigation.js       # Navegación entre módulos, alertas de cierre
│   ├── nuevopedido.js      # Formulario de alta de pedido con autocompletado
│   ├── pedidos.js          # Listado, filtros, búsqueda, acciones sobre pedidos
│   ├── pizarron.js         # Vista pizarrón (producción visual por día)
│   ├── produccion.js       # Vista de producción con tandas y estados
│   ├── store.js            # Modelo de datos base (ESTADOS, TACC, helpers de acceso)
│   ├── themes.js           # Aplicación dinámica de temas
│   └── utils.js            # Funciones utilitarias (fechas, IDs, escape HTML)
└── assets/
    └── chalk/              # Assets gráficos (logo, imágenes de interfaz)
```

---

## Módulos funcionales

### Pedidos
Gestión del ciclo completo de un pedido. Los pedidos se organizan por día de entrega y pueden filtrarse por estado, local o tipo de producto.

**Estados disponibles:** `pendiente` → `producción` → `listo` → `entregado`

### Producción
Vista orientada al equipo de cocina. Agrupa los ítems de todos los pedidos del día en una planilla de producción. Soporta **días movidos** (producción dividida en dos tandas con horario de corte configurable).

### Cuba
Módulo específico para la gestión del local Cuba. Administra los encargos entre locales, diferenciando productos Sin TACC (producidos en Matienzo) y Con TACC (producidos en Cuba), con horario de llegada configurable.

### Etiquetas
Generación e impresión de etiquetas por pedido, con nombre del cliente, productos y observaciones.

### Exportación
- **CSV simple**: pedidos y producción del día.
- **Excel (XLSX)**: hoja de pedidos + hoja de producción con estilos.
- **Exportación Cuba**: resumen de encargos para el local vecino.

### Configuración
- Gestión de catálogo de productos (Sin TACC / Con TACC, con talle, precio por talle).
- Clientes frecuentes con importación/exportación CSV.
- Horarios del local por día de la semana.
- Hora de corte de pedidos para el mismo día.
- Hora de llegada de Cuba.
- Selección de tema visual.
- Cambio de layout (horizontal / vertical).

### Autenticación
Login liviano por selección de usuario + PIN. Roles: `admin` y `empleado`, con permisos diferenciados.

---

## Flujo principal

```
1. Creación de pedido   →  nuevopedido.js
2. Ingresa a Producción →  produccion.js / pizarron.js
3. Se genera etiqueta   →  etiquetas.js
4. Pedido → Listo       →  pedidos.js
5. Entrega confirmada   →  pedidos.js (estado: entregado)
```

---

## Persistencia y backups

Los datos se almacenan en `localStorage` bajo la clave `pd_datos`. El sistema genera automáticamente hasta **6 backups rotativos** (uno por hora), recuperables desde el panel de Configuración → Archivos.

> **Nota:** el sistema está preparado para conectar Firebase. Ver la sección comentada en `index.html` y las referencias a `setSyncGuardado()` / `setSyncPendiente()` en `data.js`.

---

## Temas visuales

El sistema incluye 6 temas seleccionables desde Configuración:

| Tema | Descripción |
|---|---|
| `default` | Claro y limpio |
| `girly` | Tonos rosa/lavanda |
| `neon` | Alto contraste oscuro con acentos neón |
| `pro` | Profesional oscuro |
| `dark` | Dark mode estándar |
| `pooh` | Tonos miel/amarillo |

---

## Convenciones de desarrollo

- Módulos separados por feature (un archivo JS por dominio funcional).
- Sin frameworks, sin TypeScript, sin npm.
- Estado centralizado en el objeto `datos` (definido en `data.js`).
- Render desacoplado del estado: las funciones `render*()` solo leen el estado y actualizan el DOM.
- Mobile como segunda prioridad (responsive básico, menú hamburguesa).
- Evitar lógica de negocio mezclada con manipulación del DOM.

---

## Cómo ejecutar

Por ser una aplicación puramente client-side, basta con abrir `index.html` en un navegador moderno. No requiere servidor, instalación ni build.

```bash
# Opción simple
open index.html

# Opción con servidor local (recomendado para evitar restricciones CORS)
npx serve .
# o
python3 -m http.server 8080
```

---

## Roadmap / Próximos pasos

- [ ] Integración con Firebase Firestore (estructura ya preparada en `data.js` e `index.html`)
- [ ] Autenticación Firebase Auth (reemplazar sistema de PIN local)
- [ ] Sincronización en tiempo real entre locales
- [ ] PWA: manifest + service worker para uso offline
- [ ] Módulo de ventas / caja
- [ ] Historial y métricas por período

---

## Autores

Clara Lizarralde — Puerto Dulce Pastelería.