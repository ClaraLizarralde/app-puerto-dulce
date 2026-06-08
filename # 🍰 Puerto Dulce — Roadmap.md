# 🍰 Puerto Dulce — Roadmap

---

## 1 — Datos y Firebase
> Hacer esto primero, antes de seguir puliendo visual.

- [ ] **Entender el modelo de datos actual** — Revisar cómo está guardado en localStorage: estructura de `datos`, cómo se manejan los días, pedidos, archivados.
- [ ] **Sanear el modelo de archivados** — El array `datos.archivados` crece indefinidamente y puede chocar con el límite de ~5MB de localStorage en meses de uso activo. Además los pedidos archivados tienen campos `_fecha` / `_nomDia` pegados, creando dos schemas distintos para el mismo objeto. Antes de migrar a Firestore conviene unificar: un pedido siempre tiene `fecha` embebida y un flag `archivado: true/false`.
- [ ] **Conectar Firebase y probar lectura/escritura básica** — Descomentar el bloque Firebase en `index.html`, crear proyecto real en consola Firebase, pegar config. Probar que `guardar()` y `cargarDatos()` funcionen con Firestore.
- [ ] **Definir qué pasa con los días viejos** — ¿Se archivan automáticamente después de X días? ¿Se borran de Firestore o quedan? ¿El usuario puede recuperarlos? Esto define la estructura de la base.
- [ ] **Probar multi-usuario (dos pestañas a la vez)** — Abrir la app en dos ventanas y editar el mismo pedido. Firestore tiene listeners en tiempo real — verificar que `renderAll()` se llame cuando hay cambios externos.

---

## 2 — Visual y UI

- [ ] **Favicon e ícono de app** — Favicon `.ico` o `.png` 32px + apple-touch-icon 180px. Rápido, impacto visual grande.
- [ ] **Logo como imagen en la sidebar/header**
  - Desktop (sidebar): `320 × 64px` — logo completo con "Puerto Dulce" + "sistema de pedidos"
  - Mobile (header): solo eque l ícono/símbolo — `64 × 64px`, sin texto
  - Asegurarse de que funcione en temas claros y oscuros
- [ ] **Paletas de colores — terminar los temas** — Revisar cada tema: badges de estado, chips y botones. Especialmente los temas oscuros.
- [ ] **Tabs mobile — mejorar estética** — Revisar tamaño de íconos, padding, el FAB central. Probar en un teléfono real.

---

## 3 — Funcionalidad

- [ ] **Nuevo pedido — selector de producto mejorado** — Categorías como tabs o íconos, orden por frecuencia de uso, o último producto usado primero.
- [ ] **Pizarrón — mejorar notas y sellos** — Definir qué falta: más tipos de sellos, mejor edición, colores, posicionamiento más fácil.
- [ ] **Limpiar código muerto** — `toggleDiaEspecial`, `confirmarDiaNormal`, `setDiaEspecialCampo` y estilos huérfanos del banner.

---

## 4 — Antes de subir a producción

- [ ] **Reglas de seguridad en Firestore** — Sin reglas, cualquiera puede leer/escribir la base. Mínimo: solo usuarios autenticados.
- [ ] **Probar offline / reconexión** — ¿Qué pasa si el celular pierde wifi mientras cargás un pedido? Firestore tiene soporte offline pero hay que verificar que la app no rompa.
- [ ] **Migración de datos `localStorage` → Firestore** — Si ya hay datos reales en localStorage, necesitás un script de migración para no perder nada.

---

## 5 — App espejo: local Cuba
> Cada local corre su propia instancia independiente (localStorage separado, sin comunicación digital entre sí). La coordinación inter-local sigue siendo por teléfono. Este nivel convierte la app en simétrica: Cuba tiene sus pedidos, su producción Con TACC, y su propia pestaña de coordinación hacia Matienzo.

### Base ya resuelta (no tocar)
- `datos.localId` ya existe en el modelo y persiste
- El catálogo ya tiene `tipo: "sin_tacc" | "con_tacc"` por ítem
- Cada producto de pedido ya tiene `tacc: "s" | "c"`
- La lógica de encargos (`pedido_cuba`, `separado_cuba`) ya es el patrón correcto — solo está hardcodeada para un lado
- `localStorage` ya es independiente por dispositivo — dos tablets = dos instancias sin hacer nada
- `auth.js` ya tiene el selector de local; Cuba solo está `disabled: true`

### Lo que hay que hacer

- [ ] **Crear `localConfig` como objeto derivado de `datos.localId`** — un único lugar que resuelve `tipoPropio`, `tipoExterno`, `nombreVecino`, `labelTabCoordinacion`. Todo el resto del código lo consume de acá.
  ```js
  // Ejemplo de lo que sería localConfig según localId
  // matienzo → tipoPropio: "s", tipoExterno: "c", nombreVecino: "Cuba"
  // cuba     → tipoPropio: "c", tipoExterno: "s", nombreVecino: "Matienzo"
  ```

- [ ] **Parametrizar `cuba.js`** — reemplazar los `r.tacc !== "s"`, `esCuba()` y strings `"cuba"` hardcodeados para que usen `localConfig`. La lógica de encargos es idéntica en ambos sentidos; solo cambia la perspectiva.

- [ ] **Renombrar la pestaña de coordinación dinámicamente** — hoy se llama "Cuba" siempre. Cuando `localId === "cuba"` debe llamarse "Matienzo" y mostrar los ítems `tacc: "s"` (los que Cuba le tiene que pedir a Matienzo).

- [ ] **Default de catálogo según local** — cuando Cuba abre la app por primera vez, el tipo activo en el catálogo debe ser `con_tacc`, no `sin_tacc`.

- [ ] **Habilitar Cuba en `auth.js`** — sacar el `disabled: true` del local Cuba en `LOCALES_PIZ`. Verificar que el login fluya igual que Matienzo.

- [ ] **Smoke test de la instancia Cuba** — abrir la app en un segundo dispositivo (o perfil de navegador limpio), seleccionar Cuba, cargar un pedido con ítems Sin TACC y Con TACC, verificar que la pestaña de coordinación muestre solo los ítems Sin TACC como "a pedirle a Matienzo".