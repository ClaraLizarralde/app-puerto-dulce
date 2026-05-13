Puerto Dulce Backoffice — continuación
App vanilla HTML/CSS/JS. "Nuevo pedido" es una página completa (#tab-np-page). Toda la lógica JS está en pedidos.js y no se toca.
Lo que hay que rediseñar ahora — solo HTML y CSS de #tab-np-page:
La sección izquierda (campos obligatorios) tiene que quedar así, compacta y en filas:

Fila 1 — Día: 3 pills en línea: Hoy [Lun 11] · Mañana [Mar 12] · Seleccionar día
Fila 2 — Horario: label "Horario" + selector en la misma línea (el picker existente o un select)
Fila 3 — Cliente toggle: 2 botones: 👤 Cliente | 🏪 Cuba — por defecto Cliente activo
Fila 4 — Nombre + Teléfono: aparecen solo si está en modo Cliente, desaparecen si es Cuba

Sin gaps grandes entre filas. Estilo compacto tipo formulario rápido.
IDs existentes que hay que mantener: np-dia-hoy, np-dia-man, np-dia-otro, np-campo-hora, np-nombre, np-tel, np-btn-cuba, np-campo-tel
Variables CSS: --accent, --paper, --bg, --border, --ink, --ink-mid, --accent-soft, --radius-sm
Arrancar con el HTML de la columna izquierda y su CSS. Sin tocar JS.