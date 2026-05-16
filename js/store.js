/**
 * ================================================================
 * MODELS.JS — Fuente de verdad del modelo de datos
 * ================================================================
 *
 * Este archivo define:
 *   1. Constantes centrales (ESTADOS, TACC)
 *   2. Funciones base para crear pedidos y productos
 *   3. Helpers centrales de acceso a datos
 *   4. Migración silenciosa de datos viejos al cargar
 *
 * REGLA: Todo el código nuevo usa estos helpers.
 *        El código viejo se migra gradualmente.
 *        Nunca acceder a datos.dias directamente — usar los helpers.
 *
 * ================================================================
 * ÍNDICE
 * ================================================================
 *
 * === CONSTANTES ===
 * - ESTADOS                        → Estados posibles de un pedido
 * - TACC                           → Tipos de TACC de un producto
 *
 * === MODELOS BASE ===
 * - crearPedidoBase(campos)        → Objeto pedido con todos los campos
 * - crearProductoBase(campos)      → Objeto producto con todos los campos
 *
 * === HELPERS DE ACCESO ===
 * - getTodosLosPedidos()           → Todos los pedidos activos (todos los días)
 * - getPedido(id)                  → Un pedido por id
 * - getPedidosPorFecha(fecha)      → Pedidos de un día específico
 * - getFechaDePedido(id)           → Fecha (YYYY-MM-DD) donde vive un pedido
 *
 * === HELPERS DE ESCRITURA ===
 * - guardarPedido(pedido, fecha)   → Persiste cambios de un pedido editado
 * - eliminarPedido(id)             → Elimina pedido de su día
 *
 * === CÁLCULOS ===
 * - totalDePedido(pedido)          → Total monetario de un pedido (unifica duplicados)
 *
 * === MIGRACIÓN ===
 * - _migrarDatosViejos()           → Normaliza datos legacy al cargar (se ejecuta sola)
 *
 * ================================================================
 */


// ══════════════════════════════════════════════════════════════════
// 1. CONSTANTES
// ══════════════════════════════════════════════════════════════════

const ESTADOS = {
  PENDIENTE:  "pendiente",
  PRODUCCION: "prod",
  LISTO:      "listo",
  ENTREGADO:  "entregado",
};

const TACC = {
  SIN: "s",  // Sin TACC → va a Producción
  CON: "c",  // Con TACC → va a Cuba
};


// ══════════════════════════════════════════════════════════════════
// 2. MODELOS BASE
// ══════════════════════════════════════════════════════════════════

/**
 * crearPedidoBase
 * Retorna un objeto pedido con todos los campos en su valor por defecto.
 * Pasar campos para sobreescribir valores específicos.
 *
 * @param {Object} campos - Campos opcionales para sobreescribir
 * @returns {Object} pedido
 */
function crearPedidoBase(campos = {}) {
  return {
    id:             uid(),
    cliente:        "",   // normalizado (ej: "cuba" o nombre limpio)
    cliente_input:  "",   // tal como lo escribió el usuario
    tel:            "",
    hora_entrega:   "",
    estado:         ESTADOS.PENDIENTE,
    productos:      [],
    pagado:         false,
    metodoPago:     "",
    notas:          "",
    dia_especial:   false,
    fuera_horario:  false,
    creado:         Date.now(),
    ...campos,
  };
}

/**
 * crearProductoBase
 * Retorna un objeto producto con todos los campos en su valor por defecto.
 *
 * @param {Object} campos - Campos opcionales para sobreescribir
 * @returns {Object} producto
 */
function crearProductoBase(campos = {}) {
  return {
    id:           uid(),
    nombre:       "",
    tipo:         "catalogo",  // "catalogo" | "libre"
    libre:        "",          // nombre si tipo === "libre"
    tacc:         TACC.SIN,    // TACC.SIN ("s") | TACC.CON ("c")
    tamano:       "",
    cantidad:     1,
    listo:        false,
    pedido_cuba:  false,
    separado_cuba: false,
    nota_prod:    "",
    precio_libre: 0,
    extras:       [],
    ...campos,
  };
}


// ══════════════════════════════════════════════════════════════════
// 3. HELPERS DE ACCESO (lectura)
// ══════════════════════════════════════════════════════════════════

/**
 * getTodosLosPedidos
 * Retorna todos los pedidos activos de todos los días.
 * Reemplaza: getAllPedidos()
 *
 * @returns {Array} pedidos
 */
function getTodosLosPedidos() {
  return Object.values(datos.dias).flatMap(d => d.pedidos || []);
}

/**
 * getPedido
 * Retorna un pedido por su id, o null si no existe.
 * Reemplaza: getAllPedidos().find(x => x.id === id)
 *
 * @param {string} id
 * @returns {Object|null}
 */
function getPedido(id) {
  for (const dData of Object.values(datos.dias)) {
    const p = (dData.pedidos || []).find(x => x.id === id);
    if (p) return p;
  }
  return null;
}

/**
 * getPedidosPorFecha
 * Retorna los pedidos de un día específico.
 * Reemplaza: datos.dias[fecha]?.pedidos || []
 *
 * @param {string} fecha - Formato YYYY-MM-DD
 * @returns {Array}
 */
function getPedidosPorFecha(fecha) {
  return datos.dias[fecha]?.pedidos || [];
}

/**
 * getFechaDePedido
 * Retorna la fecha (YYYY-MM-DD) donde vive un pedido.
 * Reemplaza: _poGetDiaDePedido(id)
 *
 * @param {string} id
 * @returns {string} fecha o diaActual como fallback
 */
function getFechaDePedido(id) {
  for (const [fecha, dData] of Object.entries(datos.dias)) {
    if ((dData.pedidos || []).find(p => p.id === id)) return fecha;
  }
  return diaActual;
}


// ══════════════════════════════════════════════════════════════════
// 4. HELPERS DE ESCRITURA
// ══════════════════════════════════════════════════════════════════

/**
 * guardarPedido
 * Persiste los cambios de un pedido editado en su día correspondiente.
 * Reemplaza el patrón: Object.values(datos.dias).forEach(... ps[idx] = {...} ...)
 *
 * @param {Object} pedido - Pedido con los cambios aplicados
 * @returns {boolean} true si se encontró y guardó, false si no se encontró
 */
function guardarPedido(pedido) {
  for (const dData of Object.values(datos.dias)) {
    const ps = dData.pedidos || [];
    const idx = ps.findIndex(x => x.id === pedido.id);
    if (idx >= 0) {
      ps[idx] = { ...ps[idx], ...pedido };
      guardar();
      return true;
    }
  }
  return false;
}

/**
 * eliminarPedido
 * Elimina un pedido de su día.
 * Reemplaza el patrón manual de splice en confirmarEliminar()
 *
 * @param {string} id
 * @returns {boolean} true si se encontró y eliminó
 */
function eliminarPedido(id) {
  for (const dData of Object.values(datos.dias)) {
    const ps = dData.pedidos || [];
    const idx = ps.findIndex(x => x.id === id);
    if (idx >= 0) {
      ps.splice(idx, 1);
      guardar();
      return true;
    }
  }
  return false;
}


// ══════════════════════════════════════════════════════════════════
// 5. CÁLCULOS
// ══════════════════════════════════════════════════════════════════

/**
 * totalDePedido
 * Calcula el total monetario de un pedido.
 * Unifica: calcularTotalPedido() (pedidos.js) y calcTotalPedido() (modales.js)
 * Ambas funciones siguen existiendo por ahora — llaman a esta internamente.
 *
 * @param {Object} pedido
 * @returns {number}
 */
function totalDePedido(pedido) {
  if (!pedido || !pedido.productos) return 0;
  return pedido.productos.reduce((sum, r) => {
    const cant = Number(r.cantidad) || 1;
    const cat = datos.catalogo.find(c =>
      c.nombre === r.nombre &&
      c.tipo === (r.tacc === TACC.SIN ? "sin_tacc" : "con_tacc")
    );
    const base = r.tipo === "libre"
      ? (r.precio_libre || 0)
      : getPrecioCat(cat, r.tamano);
    const extras = (r.extras || []).reduce(
      (s, ex) => s + (parseFloat(ex.precio) || 0), 0
    );
    return sum + (base * cant) + extras;
  }, 0);
}


// ══════════════════════════════════════════════════════════════════
// 6. MIGRACIÓN SILENCIOSA
// ══════════════════════════════════════════════════════════════════

/**
 * _migrarDatosViejos
 * Normaliza campos legacy en pedidos y productos existentes.
 * Se ejecuta una sola vez al cargar la app.
 * No modifica datos que ya están bien — es seguro correrla siempre.
 *
 * Qué normaliza:
 *   - cliente_input vacío → lo rellena con cliente
 *   - productos sin id → les asigna uid()
 *   - productos sin tacc → asume TACC.SIN
 *   - productos sin tipo → asume "catalogo"
 *   - cantidad no numérica → la convierte a 1
 */
function _migrarDatosViejos() {
  let huboCambios = false;

  getTodosLosPedidos().forEach(p => {
    // Unificar cliente / cliente_input
    if (!p.cliente_input && p.cliente) {
      p.cliente_input = p.cliente;
      huboCambios = true;
    }

    // Normalizar productos
    (p.productos || []).forEach(r => {
      if (!r.id) {
        r.id = uid();
        huboCambios = true;
      }
      if (!r.tipo) {
        r.tipo = "catalogo";
        huboCambios = true;
      }
      if (!r.tacc) {
        r.tacc = TACC.SIN;
        huboCambios = true;
      }
      if (isNaN(Number(r.cantidad))) {
        r.cantidad = 1;
        huboCambios = true;
      }
      if (!r.extras) {
        r.extras = [];
        huboCambios = true;
      }
    });
  });

  if (huboCambios) guardar();
}

// Ejecutar migración al cargar
// Se ejecuta después de que datos esté disponible (este archivo
// debe cargarse después de data.js en el HTML)
if (typeof datos !== "undefined") {
  _migrarDatosViejos();
}