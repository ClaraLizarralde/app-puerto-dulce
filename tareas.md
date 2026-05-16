Lista de tareas pendientes:
Producto libre no funciona

Click en "Agregar como producto libre" no hace nada
Sospecha: algo cierra los resultados antes de que el click llegue (blur del input o listener externo)
Ya tiene mousedown + touchstart + onclick — revisar si hay un onblur en el input o un listener global que oculta results antes

Dropdown catálogo

Los resultados tienen que flotar sobre el contenido (position absolute), no empujar el layout
CSS ya sugerido: position:absolute; top:calc(100% + 4px); z-index:400 en .np-search-prod-results y position:relative en .np-search-prod-wrap

Estilos cards de producto

Tag ST/C y precio tienen que verse más chicos y en la misma línea (.pe-info-sub ya está en el JS, falta verificar que el CSS esté aplicado)
.pe-talle-warn no tiene estilo definido

Total

Formato tiene que ser: Total (efectivo $X) a la izquierda, $63.000 grande verde a la derecha
npRenderTotal() ya genera el HTML correcto, falta CSS para #np-total-wrap

Contexto importante para el próximo chat

Archivos: nuevopedido.js, nuevopedido.css, nuevopedido.html (el div #tab-np-page)
El JS de patches está al final de nuevopedido.js
Tema oscuro/claro se maneja por separado, no tocar colores
