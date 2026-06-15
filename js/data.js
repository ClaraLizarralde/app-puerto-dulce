/**
 * ================================================================
 * data.js — GESTIÓN DE ESTADO, DATOS, PERSISTENCIA Y AUTENTICACIÓN
 * ================================================================
 *
 * === GESTIÓN DE ESTADO Y DATOS ===
 * - getEstadoLocal()              → Determina si el local está abierto/cerrando/cerrado
 * - guardar()                     → Persiste 'datos' en localStorage y dispara backups/sync
 * - autoBackupCheck()             → Guarda snapshot horario rotativo (6 backups máx)
 * - listarBackups()               → Retorna array con backups existentes ordenados
 * - restaurarBackup(slot)         → Restaura datos desde un backup específico
 * - renderBackupsList()           → Renderiza lista de backups en el DOM
 *
 * === HELPERS DE DATOS (DÍAS) ===
 * - diaData()                     → Retorna objeto del día actual (lo crea si no existe)
 * - getPedidos()                  → Retorna pedidos del día actual
 * - getVentas()                   → Retorna ventas del día actual
 * - getAllPedidos()                → Retorna TODOS los pedidos de todos los días
 * - archivarDiasPasadosAuto(hoy)  → Archiva automáticamente pedidos de días anteriores
 *
 * === PERMISOS Y USUARIOS ===
 * - tienePermiso(permiso)         → Verifica si el usuario actual tiene cierto permiso
 *
 * === AVISOS ===
 * - initWarningCierre()           → Inicia intervalo que avisa 30 min antes del cierre
 *
 * === FUNCIONES EXTERNAS REFERENCIADAS (definidas en otros archivos) ===
 * - fechaKey(date)                → Convierte fecha a string clave (YYYY-MM-DD)       [utils.js]
 * - normalizarTipo(tipo)          → Normaliza 'sin_tacc' / 'con_tacc'                 [utils.js]
 * - uid()                         → Genera ID único                                   [utils.js]
 * - setSyncGuardado()             → Callback para sincronización (Firebase)           [firebase.js]
 * - abrirModalGen(titulo, msj, onConfirm, tipo) → Modal genérico de confirmación      [ui.js]
 * - actualizarUIUsuario()         → Refresca interfaz según usuario logueado          [ui.js]
 * - setLocal(localId)             → Cambia local activo                               [ui.js]
 * - chequearPendientesAyer()      → Verifica pedidos pendientes del día anterior      [pedidos.js]
 * - getTodosLosPedidos()          → Retorna todos los pedidos de todos los días       [pedidos.js]
 * - DIAS_FULL                     → Array con nombres completos de días               [utils.js]
 *
 * ================================================================
 */

// ══════════════════════════════════════════════════════════════════
// FIREBASE — PUNTO DE INTEGRACIÓN
// ══════════════════════════════════════════════════════════════════
// (el comentario original se mantiene igual)
// ══════════════════════════════════════════════════════════════════

// ── AUTO-BACKUP HORARIO ──
// Guarda un snapshot en localStorage cada hora, conserva las últimas 6 versiones.
// Claves: pd_backup_0 ... pd_backup_5 (rotación circular) + pd_backup_meta
const BACKUP_MAX = 6;
const BACKUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hora

function isMobileLayout() {
  return window.matchMedia('(orientation: portrait)').matches ||
         window.innerWidth < 768;
}

// Usuario actualmente logueado
let usuarioActivo = {
  id: "admin",
  nombre: "Admin",
  rol: "admin", // 'admin' | 'usuario'
  local: null, // null = todos, 'matienzo' | 'cuba' = solo ese
};

// Filtro global para la vista de pedidos
let filtro = "todos";
// Indica si hay cambios sin guardar
let hayCambios = false;
// Callback para selección (usado internamente)
let _selCb = null;
// Variables para manejo de pago
let _pagoId = null,
  _pagoMetodo = null,
  _pagoDeshacer = false;
// Callback genérico para modales
let _genCb = null;
// Ítem expandido en alguna lista
let _expandido = null;
// Tipo de catálogo actual (sin_tacc, con_tacc, etc.)
let _catTipo = "sin_tacc";
// Indica si se muestran talles en el catálogo
let _catTalleOn = true;

// ── DATOS PRINCIPALES ──
let datos = JSON.parse(localStorage.getItem("pd_v8") || "null");
if (!datos) {
  const viejo = JSON.parse(
    localStorage.getItem("pd_v7") ||
      localStorage.getItem("pd_v6") ||
      localStorage.getItem("pd_v5") ||
      "null"
  );
  const hoy = fechaKey(new Date());
  datos = {
    dias: { [hoy]: { pedidos: [], ventas: [] } },
    catalogo: [],
    clientes: [],
    archivados: [],
    itemEstados: {},
  };
  if (viejo) {
    datos.dias = viejo.dias || datos.dias;
    datos.clientes = viejo.clientes || [];
    datos.archivados = viejo.archivados || [];
    datos.itemEstados = viejo.itemEstados || {};
    if (viejo.catalogo && viejo.catalogo.length) {
      datos.catalogo = viejo.catalogo.map((x) => {
        if (typeof x === "string")
          return { nombre: x, tipo: "sin_tacc", tiene_talle: true, precio: 0 };
        return {
          ...x,
          tiene_talle: x.tiene_talle !== false,
          precio: x.precio || 0,
        };
      });
    }
  }
  localStorage.setItem("pd_v8", JSON.stringify(datos));
}
// Asegurar estructuras mínimas
if (!datos.catalogo) datos.catalogo = [];
if (!datos.clientes) datos.clientes = [];
if (!datos.archivados) datos.archivados = [];
if (!datos.itemEstados) datos.itemEstados = {};
if (!datos.notasCuba) datos.notasCuba = [];
if (typeof datos.notasCuba === "string")
  datos.notasCuba = datos.notasCuba.trim()
    ? [{ id: uid(), txt: datos.notasCuba, hecho: false }]
    : [];
// ── LOCAL ID (base para futura migración a Firebase multi-tenant) ──
if (!datos.localId) datos.localId = null;
if (!datos.nombre_local) datos.nombre_local = null;

// ── HORARIOS POR LOCAL ──
const HORARIOS_DEFAULT = {
  matienzo: {
    0: { open: "09:30", close: "13:00" }, // domingo
    1: null, // lunes cerrado
    2: { open: "09:30", close: "18:00" },
    3: { open: "09:30", close: "18:00" },
    4: { open: "09:30", close: "18:00" },
    5: { open: "09:30", close: "18:00" },
    6: { open: "09:30", close: "18:00" },
  },
  cuba: {
    0: null,
    1: null,
    2: { open: "09:00", close: "20:00" },
    3: { open: "09:00", close: "20:00" },
    4: { open: "09:00", close: "20:00" },
    5: { open: "09:00", close: "20:00" },
    6: { open: "09:00", close: "20:00" },
  },
};
// Migrar si no existe
if (!datos.horariosLocales)
  datos.horariosLocales = JSON.parse(JSON.stringify(HORARIOS_DEFAULT));
Object.keys(HORARIOS_DEFAULT).forEach((lid) => {
  if (!datos.horariosLocales[lid])
    datos.horariosLocales[lid] = JSON.parse(JSON.stringify(HORARIOS_DEFAULT[lid]));
});
// Hora de corte para pedidos del mismo día
if (!datos.cortePedidosHoy)
  datos.cortePedidosHoy = { matienzo: "14:00", cuba: "14:00" };
if (!datos.horaLlegadaCuba) datos.horaLlegadaCuba = "16:00";

// Normalizar catálogo
datos.catalogo = datos.catalogo.map((x) => ({
  nombre: x.nombre || "",
  tipo: normalizarTipo(x.tipo || "sin_tacc"),
  tiene_talle: x.tiene_talle !== false,
  precio: x.precio || 0,
  precio_chico: x.precio_chico || 0,
  precio_mediano: x.precio_mediano || 0,
  precio_grande: x.precio_grande || 0,
  categoria:
    x.categoria &&
    [
      "tortas",
      "mousses",
      "bandejas",
      "cuadrados",
      "congelados",
      "otros",
    ].includes(x.categoria)
      ? x.categoria
      : "otros",
}));

// Día actual seleccionado (el más próximo si hoy no existe)
let diaActual = (() => {
  const hoy = fechaKey(new Date());
  if (datos.dias[hoy]) return hoy;
  const futurosCercanos = Object.keys(datos.dias)
    .filter((k) => k > hoy)
    .sort();
  if (futurosCercanos.length) return futurosCercanos[0];
  datos.dias[hoy] = { pedidos: [], ventas: [] };
  return hoy;
})();

// ────────────────────────────────────────────────────────────────
// FUNCIÓN: getEstadoLocal
// Descripción: Determina si el local (según datos.localId) está abierto,
//              cerrando o cerrado según la hora actual y los horarios.
// Retorna: { estado, texto, color }
// ────────────────────────────────────────────────────────────────
function getEstadoLocal() {
  const localId = datos.localId || "matienzo";
  const hoy = new Date();
  const diaSemana = hoy.getDay();
  const horarios = datos.horariosLocales || HORARIOS_DEFAULT;
  const horLocal = horarios[localId] || horarios["matienzo"];
  const rango = horLocal[diaSemana];
  if (!rango)
    return { estado: "cerrado", texto: "Cerrado hoy", color: "var(--ink-light)" };

  const nowMin = hoy.getHours() * 60 + hoy.getMinutes();
  const [oh, om] = rango.open.split(":").map(Number);
  const [ch, cm] = rango.close.split(":").map(Number);
  const openMin = oh * 60 + om;
  const closeMin = ch * 60 + cm;

  if (nowMin < openMin)
    return {
      estado: "cerrado",
      texto: `Abre a las ${rango.open}`,
      color: "var(--amber)",
    };
  if (nowMin > closeMin)
    return { estado: "cerrado", texto: "Cerrado", color: "var(--ink-light)" };
  if (closeMin - nowMin <= 30)
    return {
      estado: "cerrando",
      texto: `Cierra a las ${rango.close}`,
      color: "var(--amber)",
    };
  return {
    estado: "abierto",
    texto: `Abierto hasta ${rango.close}`,
    color: "var(--green)",
  };
}

// ────────────────────────────────────────────────────────────────
// FUNCIÓN: guardar
// Descripción: Persiste 'datos' en localStorage (clave 'pd_v8').
//              También dispara funciones de sincronización y backup automático si existen.
// ────────────────────────────────────────────────────────────────
function guardar() {
  localStorage.setItem("pd_v8", JSON.stringify(datos));
  if (typeof setSyncGuardado === "function") setSyncGuardado();
  if (typeof autoBackupCheck === "function") autoBackupCheck();
  if (window._fb && datos.localId) {
    const {db} = window._fb;
    import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js')
    .then(({doc, setDoc}) => {
      const ref = doc(db, 'locales', datos.localId, 'datos', 'main');
      setDoc(ref, datos).catch(e => console.warn('Firebase save error:', e));
    });
  }
}

// ────────────────────────────────────────────────────────────────
// FUNCIÓN: autoBackupCheck
// Descripción: Verifica si ha pasado al menos 1 hora desde el último backup.
//              Si es así, guarda un snapshot rotativo en localStorage.
// ────────────────────────────────────────────────────────────────
function autoBackupCheck() {
  const meta = JSON.parse(
    localStorage.getItem("pd_backup_meta") || '{"last":0,"next":0}'
  );
  const ahora = Date.now();
  if (ahora - meta.last < BACKUP_INTERVAL_MS) return;
  const slot = meta.next % BACKUP_MAX;
  const snapshot = { ts: ahora, data: JSON.stringify(datos) };
  try {
    localStorage.setItem(`pd_backup_${slot}`, JSON.stringify(snapshot));
    meta.last = ahora;
    meta.next = slot + 1;
    localStorage.setItem("pd_backup_meta", JSON.stringify(meta));
  } catch (e) {
    // Si localStorage está lleno, se ignora sin interrumpir
  }
}

// Ejecutar backup automático tras 5 segundos de carga
setTimeout(autoBackupCheck, 5000);

// ────────────────────────────────────────────────────────────────
// FUNCIÓN: listarBackups
// Descripción: Recupera y devuelve un array con los backups existentes,
//              ordenados del más reciente al más antiguo.
// ────────────────────────────────────────────────────────────────
function listarBackups() {
  const backups = [];
  for (let i = 0; i < BACKUP_MAX; i++) {
    try {
      const raw = localStorage.getItem(`pd_backup_${i}`);
      if (!raw) continue;
      const b = JSON.parse(raw);
      backups.push({
        slot: i,
        ts: b.ts,
        fecha: new Date(b.ts).toLocaleString("es-AR"),
      });
    } catch (e) {}
  }
  return backups.sort((a, b) => b.ts - a.ts);
}

// ────────────────────────────────────────────────────────────────
// FUNCIÓN: restaurarBackup
// Descripción: Pide confirmación y, si se acepta, restaura los datos desde
//              el backup indicado (por número de slot) y recarga la página.
// ────────────────────────────────────────────────────────────────
function restaurarBackup(slot) {
  try {
    const raw = localStorage.getItem(`pd_backup_${slot}`);
    if (!raw) {
      alert("Backup no encontrado.");
      return;
    }
    const b = JSON.parse(raw);
    const fecha = new Date(b.ts).toLocaleString("es-AR");
    abrirModalGen(
      `¿Restaurar backup?`,
      `Se van a reemplazar TODOS los datos actuales con el backup del ${fecha}. Esta acción no se puede deshacer.`,
      () => {
        datos = JSON.parse(b.data);
        localStorage.setItem("pd_v8", b.data);
        location.reload();
      },
      "danger"
    );
  } catch (e) {
    alert("Error al leer el backup: " + e.message);
  }
}

// ────────────────────────────────────────────────────────────────
// FUNCIÓN: renderBackupsList
// Descripción: Renderiza la lista de backups dentro del elemento con id 'backups-lista'.
// ────────────────────────────────────────────────────────────────
function renderBackupsList() {
  const wrap = document.getElementById("backups-lista");
  if (!wrap) return;
  const backups = listarBackups();
  if (!backups.length) {
    wrap.innerHTML =
      '<div style="font-size:.72rem;color:var(--ink-light);font-style:italic;">Sin backups aún. Se genera uno automáticamente cada hora.</div>';
    return;
  }
  wrap.innerHTML = backups
    .map(
      (b) => `
    <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);">
      <span style="flex:1;font-size:.75rem;color:var(--ink);">🕐 ${b.fecha}</span>
      <button onclick="restaurarBackup(${b.slot})" style="font-family:'Outfit',sans-serif;font-size:.65rem;font-weight:500;padding:4px 10px;border:1.5px solid var(--amber,#ca8a04);border-radius:6px;background:transparent;color:var(--amber,#ca8a04);cursor:pointer;">Restaurar</button>
    </div>
  `
    )
    .join("");
}

// ── Helpers de datos ──

// ────────────────────────────────────────────────────────────────
// FUNCIÓN: diaData
// Descripción: Devuelve el objeto del día actual (lo crea si no existe).
// ────────────────────────────────────────────────────────────────
function diaData() {
  return (
    datos.dias[diaActual] ||
    (datos.dias[diaActual] = { pedidos: [], ventas: [] })
  );
}

// ────────────────────────────────────────────────────────────────
// FUNCIÓN: getPedidos
// Descripción: Retorna los pedidos del día actual.
// ────────────────────────────────────────────────────────────────
function getPedidos() {
  return diaData().pedidos;
}

// ────────────────────────────────────────────────────────────────
// FUNCIÓN: getVentas
// Descripción: Retorna las ventas del día actual.
// ────────────────────────────────────────────────────────────────
function getVentas() {
  return diaData().ventas || [];
}

// ────────────────────────────────────────────────────────────────
// FUNCIÓN: getAllPedidos
// Descripción: Retorna TODOS los pedidos de todos los días.
// ────────────────────────────────────────────────────────────────
function getAllPedidos() {
  return getTodosLosPedidos();
}

// ── ARCHIVO AUTOMÁTICO DE DÍAS PASADOS ──

// ────────────────────────────────────────────────────────────────
// FUNCIÓN: archivarDiasPasadosAuto
// Descripción: Mueve automáticamente pedidos de días anteriores al array 'archivados'.
// ────────────────────────────────────────────────────────────────
function archivarDiasPasadosAuto(hoy) {
  Object.keys(datos.dias).forEach((k) => {
    if (k >= hoy) return;
    const dData = datos.dias[k];
    if (!dData || !dData.pedidos || !dData.pedidos.length) return;
    const [y, m, d] = k.split("-").map(Number);
    const f = new Date(y, m - 1, d);
    const nomDia = DIAS_FULL[f.getDay()];
    const pedidosNoArchivados = dData.pedidos.filter(
      (p) => !datos.archivados.some((a) => a.id === p.id)
    );
    if (!pedidosNoArchivados.length) return;
    pedidosNoArchivados.forEach((p) => {
      datos.archivados.push({
        ...p,
        _fecha: k,
        _nomDia: nomDia,
        _archivadoTs: Date.now(),
        _autoArchivado: true,
      });
    });
    dData.pedidos = [];
    guardar();
  });
}

// ── INICIALIZACIÓN ADICIONAL ──
if (!datos.itemEstados) datos.itemEstados = {};
if (!window._hechoSet) window._hechoSet = { hoy: new Set(), manana: new Set() };
if (!window._prodCache) window._prodCache = {};
document.getElementById("cat-talle-toggle-wrap").className = "cat-tiene-talle on";

// Resincronizar categorías en ventas
(function resincCategoriasVentas() {
  Object.values(datos.dias).forEach((dData) => {
    if (!dData.ventas) return;
    dData.ventas.forEach((v) => {
      const cat = datos.catalogo.find((c) => c.nombre === v.nombre);
      if (cat && cat.categoria) {
        v._categoria = cat.categoria;
      }
    });
  });
})();

// Modo un solo local: asegurar matienzo como localId si no existe
if (!datos.localId) {
  datos.localId = "matienzo";
  datos.nombre_local = "Puerto Dulce — Matienzo";
  guardar();
  // FIX 15: en lugar de usar setTimeout aquí (auth.js puede no estar cargado aún),
  // dejamos una flag que app.js lee en DOMContentLoaded cuando todos los scripts
  // ya están definidos.
  window._pendingModalBienvenida = true;
}

// ── PERMISOS ──
const PERMISOS = {
  admin: ["exportar", "importar", "reportes", "config", "pedidos"],
  empleado: ["pedidos"],
};

// ────────────────────────────────────────────────────────────────
// FUNCIÓN: tienePermiso
// Descripción: Verifica si el usuario actual tiene un permiso específico.
// ────────────────────────────────────────────────────────────────
function tienePermiso(permiso) {
  const rol = usuarioActivo?.rol || "empleado";
  return PERMISOS[rol]?.includes(permiso) ?? false;
}


/* ================================================================
   AVISOS — WARNING PEDIDOS PENDIENTES ANTES DEL CIERRE
================================================================ */

// ────────────────────────────────────────────────────────────────
// FUNCIÓN: initWarningCierre
// Descripción: Inicia un intervalo que verifica cada minuto si faltan 30 minutos o menos
//              para el cierre del local. Si es así, muestra un toast de advertencia.
// ────────────────────────────────────────────────────────────────
function initWarningCierre() {
  if (window._warningCierreInterval) clearInterval(window._warningCierreInterval);

  const checkCierre = () => {
    const localId = datos.localId || "matienzo";
    const hoy = new Date();
    const dow = hoy.getDay();
    const horLocal = (datos.horariosLocales || {})[localId] || {};
    const rango = horLocal[dow];
    if (!rango || !rango.close) return;

    const [hCierre, mCierre] = rango.close.split(":").map(Number);
    const cierre = new Date();
    cierre.setHours(hCierre, mCierre, 0, 0);

    const diffMin = (cierre - hoy) / 60000;
    const yaHayToast = document.getElementById("toast-cierre");

    if (diffMin <= 30 && diffMin > 0) {
      if (yaHayToast) return;
      const min = Math.round(diffMin);
      const toast = document.createElement("div");
      toast.id = "toast-cierre";
      toast.className = "po-toast-pendientes";
      toast.innerHTML = `
  <div class="po-toast-ico">⏰</div>
  <div class="po-toast-body">
    <div class="po-toast-titulo">Cierre en ${min} minuto${
        min !== 1 ? "s" : ""
      }</div>
    <div class="po-toast-txt">Revisá que todos los pedidos estén retirados antes de cerrar.</div>
  </div>
  <div class="po-toast-actions">
    <button class="po-toast-close" onclick="document.getElementById('toast-cierre').remove()">✕</button>
  </div>
`;
      document.body.appendChild(toast);
    } else {
      if (yaHayToast) yaHayToast.remove();
    }
  };

  checkCierre();
  window._warningCierreInterval = setInterval(checkCierre, 60000);
}