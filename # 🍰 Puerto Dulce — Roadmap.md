Roadmap Puerto Dulce
Fase 0 — rápido, ya

 Favicon e ícono de app — Favicon .ico o .png 32px + apple-touch-icon 180px. Rápido, impacto visual grande.
 Eliminar itemEstados del modelo — Está declarado en datos, se migra entre versiones, se asegura en los guards de inicialización, pero nunca se lee ni escribe en ningún archivo. Ocupa espacio en cada guardar() sin hacer nada. Antes de migrar a Firestore conviene eliminarlo.
 Mover libretaVenta a data.js — Hoy se crea on-demand en produccion.js con if (!datos.libretaVenta) datos.libretaVenta = {}. Funciona, pero es inconsistente con el resto del modelo donde todos los campos se inicializan en data.js. Es un campo que se puede olvidar incluir en la migración a Firestore.
 Logo como imagen en la sidebar/header — Desktop (sidebar): 320 × 64px — logo completo con "Puerto Dulce" + "sistema de pedidos". Mobile (header): solo el ícono/símbolo — 64 × 64px, sin texto. Asegurarse de que funcione en temas claros y oscuros.


Fase 1 — un par de horas

 try/catch en guardar() con aviso al usuario — Hoy si localStorage está lleno, guardar() tira una excepción silenciosa (no tiene try/catch). El usuario no se entera de que sus cambios no se guardaron. Importante antes de que otras personas usen la app.
 Función de purga de archivados desde Configuración — Conservar solo los últimos 60 días. Eso da meses de margen sin tocar el modelo ni migrar a Firestore. El usuario puede ejecutarla manualmente desde Configuración. El límite de localStorage no es urgente hoy, pero tiene una fecha de vencimiento concreta: con 10 pedidos/día llegás al 56% del límite en un año, y con 15 pedidos/día al 84%. No es urgente hoy, pero sí antes de que la app lleve 6 meses en producción activa.
 Limpiar código muerto de la vista legacy — toggleDiaEspecial, confirmarDiaNormal, renderDiasNav, renderDiaBanner, buildDiaBanner, buildPanel, buildProdEdit y todo el bloque de filtros por día (setFiltroDia, filtroDia, filtroDiaKey) son la vista legacy. Si confirmás que no los vas a usar, se puede eliminar una fracción grande de pedidos.js. Hacer todo junto de una sola vez. También hay que resolver el problema de _expandido vs _poExpandedId — son dos variables de estado separadas para el "pedido expandido" (una en el panel legacy, otra en la tabla) que pueden quedar en estados inconsistentes si volvés a activar la vista legacy.
 Paletas de colores — terminar los temas — Revisar cada tema: badges de estado, chips y botones. Especialmente los temas oscuros.
 Tabs mobile — mejorar estética — Revisar tamaño de íconos, padding, el FAB central. Probar en un teléfono real.
 Nuevo pedido — selector de producto mejorado — Categorías como tabs o íconos, orden por frecuencia de uso, o último producto usado primero.
 Pizarrón — mejorar notas y sellos — Definir qué falta: más tipos de sellos, mejor edición, colores, posicionamiento más fácil.


Fase 2 — requiere planificación (Firebase)

 Sanear el modelo de archivados — El array datos.archivados crece indefinidamente y puede chocar con el límite de ~5MB de localStorage en meses de uso activo. Además los pedidos archivados tienen campos _fecha / _nomDia pegados, creando dos schemas distintos para el mismo objeto. Unificar: un pedido siempre tiene fecha embebida y un flag archivado: true/false.
 Decidir estructura de Firestore antes de conectar — El objeto datos mezcla configuración (catálogo, horarios, localId) con datos operativos (pedidos del día, archivados). En Firestore conviene separarlos — configuración en un documento, pedidos de cada día en su propia colección. Esa decisión impacta todo el código de guardar() y cargarDatos(), así que hay que tomarla antes de empezar a conectar. Estructura sugerida:

  locales/{localId}/
    config          → catálogo, clientes, horarios
    dias/{diaKey}   → pedidos y ventas del día
    archivados/{id} → un documento por pedido archivado

 Conectar Firebase — lectura/escritura básica — Descomentar el bloque Firebase en index.html, crear proyecto real en consola Firebase, pegar config. Probar que guardar() y cargarDatos() funcionen con Firestore.
 Rediseñar guardar() con escrituras granulares — No escribir el objeto datos completo en cada cambio. En Firestore cada escritura cuenta contra el límite diario. Un pedido cambia → escribir solo ese documento. El catálogo cambia → escribir solo el catálogo. Un archivado → escribir solo ese documento en la subcolección. Esto mantiene el uso real (~400 escrituras/día) muy por debajo del límite gratuito de Firestore (20.000/día).
 Definir qué pasa con los días viejos — ¿Se archivan automáticamente después de X días? ¿Se borran de Firestore o quedan? ¿El usuario puede recuperarlos? Esto define la estructura de la base.
 Reglas de seguridad en Firestore — Sin reglas, cualquiera puede leer/escribir la base. Mínimo: solo usuarios autenticados.
 Probar multi-usuario (dos pestañas a la vez) — Abrir la app en dos ventanas y editar el mismo pedido. Firestore tiene listeners en tiempo real — verificar que renderAll() se llame cuando hay cambios externos.
 Probar offline / reconexión — ¿Qué pasa si el celular pierde wifi mientras cargás un pedido? Firestore tiene soporte offline pero hay que verificar que la app no rompa.
 Migración localStorage → Firestore — Si ya hay datos reales en localStorage, se necesita un script de migración para no perder nada. Hacer después de definir la estructura de Firestore, no antes.
 Sistema de backups con Firebase — El problema es silencioso: no rompe nada hoy, pero cuando conectes Firestore, guardar() va a seguir llamando autoBackupCheck() que escribe snapshots en localStorage cada hora. Con 6 slots eso puede ser 6× el tamaño del objeto completo. Conviene hacer los backups en Firestore también, o desactivarlos en localStorage si Firestore ya es el backup.


Fase 3 — app espejo Cuba (después)

 Crear localConfig como objeto derivado de datos.localId — Un único lugar que resuelve tipoPropio, tipoExterno, nombreVecino, labelTabCoordinacion. Todo el resto del código lo consume de acá.

js  // matienzo → tipoPropio: "s", tipoExterno: "c", nombreVecino: "Cuba"
  // cuba     → tipoPropio: "c", tipoExterno: "s", nombreVecino: "Matienzo"

 Parametrizar cuba.js — Reemplazar los r.tacc !== "s", esCuba() y strings "cuba" hardcodeados para que usen localConfig. La lógica de encargos es idéntica en ambos sentidos; solo cambia la perspectiva.
 Renombrar la pestaña de coordinación dinámicamente — Hoy se llama "Cuba" siempre. Cuando localId === "cuba" debe llamarse "Matienzo" y mostrar los ítems tacc: "s".
 Default de catálogo según local — Cuando Cuba abre la app por primera vez, el tipo activo en el catálogo debe ser con_tacc, no sin_tacc.
 Habilitar Cuba en auth.js — Sacar el disabled: true del local Cuba en LOCALES_PIZ. Verificar que el login fluya igual que Matienzo.
 Smoke test de la instancia Cuba — Abrir la app en un segundo dispositivo (o perfil de navegador limpio), seleccionar Cuba, cargar un pedido con ítems Sin TACC y Con TACC, verificar que la pestaña de coordinación muestre solo los ítems Sin TACC como "a pedirle a Matienzo".