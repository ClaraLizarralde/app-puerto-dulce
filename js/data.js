/**
 * ================================================================
 * ÍNDICE DE FUNCIONES Y FUNCIONALIDADES
 * ================================================================
 * 
 * === GESTIÓN DE ESTADO Y DATOS ===
 * - getEstadoLocal()         → Determina si el local está abierto/cerrando/cerrado
 * - guardar()                → Persiste 'datos' en localStorage y dispara backups/sync
 * - autoBackupCheck()        → Guarda snapshot horario rotativo (6 backups máx)
 * - listarBackups()          → Retorna array con backups existentes ordenados
 * - restaurarBackup(slot)    → Restaura datos desde un backup específico
 * - renderBackupsList()      → Renderiza lista de backups en el DOM
 * 
 * === HELPERS DE DATOS (DÍAS) ===
 * - diaData()                → Retorna objeto del día actual (lo crea si no existe)
 * - getPedidos()             → Retorna pedidos del día actual
 * - getVentas()              → Retorna ventas del día actual
 * - getAllPedidos()          → Retorna TODOS los pedidos de todos los días
 * - archivarDiasPasadosAuto(hoy) → Archiva automáticamente pedidos de días anteriores
 * 
 * === PERMISOS Y USUARIOS ===
 * - tienePermiso(permiso)    → Verifica si el usuario actual tiene cierto permiso
 * 
 * === MODAL BIENVENIDA / LOGIN (SISTEMA PIZARRÓN) ===
 * - abrirModalBienvenida(desdeCambioUsuario) → Abre modal de selección de local/usuario
 * - cerrarModalBienvenida()  → Cierra el modal de bienvenida
 * - pizPantallaLocales()     → Muestra pantalla de selección de local
 * - pizPantallaUsuarios(localId) → Muestra pantalla de selección de usuario por local
 * - pizPantallaPin(localId, userId) → Muestra pantalla de ingreso de PIN
 * - pizTecla(tecla, localId, userId) → Maneja entrada de teclas numéricas o '⌫'
 * - pizEntrar(localId, userId, nombre, rol) → Ejecuta login y cierra modal
 * - pizMensajeConstruccion() → Muestra mensaje "en construcción" para locales no disponibles
 * 
 * === UI Y MENÚS ===
 * - abrirMenuHamburguesa()   → Abre el menú lateral hamburguesa
 * - cerrarMenuHamburguesa()  → Cierra el menú hamburguesa
 * - selectMobileSubtab(parent, id, el) → Maneja selección de subtabs en móviles
 * - initWarningCierre()      → Inicia intervalo que avisa 30 min antes del cierre
 * 
 * === FUNCIONES EXTERNAS REFERENCIADAS (definidas en otros archivos) ===
 * - fechaKey(date)           → Convierte fecha a string clave (YYYY-MM-DD)
 * - normalizarTipo(tipo)     → Normaliza 'sin_tacc' / 'con_tacc'
 * - uid()                    → Genera ID único
 * - setSyncGuardado()        → Callback para sincronización (Firebase)
 * - abrirModalGen(titulo, msj, onConfirm, tipo) → Modal genérico de confirmación
 * - actualizarUIUsuario()    → Refresca interfaz según usuario logueado
 * - setLocal(localId)        → Cambia local activo
 * - chequearPendientesAyer() → Verifica pedidos pendientes del día anterior
 * - showProdTab(id, el)      → Muestra pestaña de producción
 * - showCubaTab(id, el)      → Muestra pestaña de local Cuba
 * - showCfgTab(id, el)       → Muestra pestaña de configuración
 * - DIAS_FULL                → Array con nombres completos de días
 * 
 * MOBILE FLOATING SUBTAB PANEL
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

// ── TOAST y helpers de datos ──
// Devuelve el objeto del día actual (lo crea si no existe)
function diaData() {
  return (
    datos.dias[diaActual] ||
    (datos.dias[diaActual] = { pedidos: [], ventas: [] })
  );
}
// Retorna los pedidos del día actual
function getPedidos() {
  return diaData().pedidos;
}
// Retorna las ventas del día actual
function getVentas() {
  return diaData().ventas || [];
}
// Retorna TODOS los pedidos de todos los días
function getAllPedidos() {
  return Object.values(datos.dias).flatMap((d) => d.pedidos || []);
}

// ── ARCHIVO AUTOMÁTICO DE DÍAS PASADOS ──
// Mueve automáticamente pedidos de días anteriores al array 'archivados'
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
  setTimeout(() => {
    if (typeof abrirModalBienvenida === "function") abrirModalBienvenida();
  }, 400);
}

// ── PERMISOS ──
const PERMISOS = {
  admin: ["exportar", "importar", "reportes", "config", "pedidos"],
  empleado: ["pedidos"],
};

// Verifica si el usuario actual tiene un permiso específico
function tienePermiso(permiso) {
  const rol = usuarioActivo?.rol || "empleado";
  return PERMISOS[rol]?.includes(permiso) ?? false;
}

/* ================================================================
   MODAL BIENVENIDA — PIZARRÓN
   (Contiene la UI de selección de local, usuario y PIN)
================================================================ */

// Función anónima auto-ejecutada que define todo el sistema de bienvenida
(function () {
  const COLORES_POSTIT = ["y", "b", "g", "p"];
  const EMOJIS_POSTIT = ["🍮", "📦", "☎", "✏", "🧁", "📝"];

  const LOCALES_PIZ = [
    { id: "matienzo", nombre: "Matienzo", tag: "LOCAL PRINCIPAL" },
    {
      id: "cuba",
      nombre: "Cuba",
      tag: "EN CONSTRUCCIÓN",
      disabled: true,
    },
  ];

  const USUARIOS_PIZ = {
    matienzo: [
      { id: "admin", nombre: "👑 Admin", rol: "admin", pin: "1234" },
      { id: "u1", nombre: "👤 Usuario 1", rol: "empleado", pin: "0001" },
      { id: "u2", nombre: "👤 Usuario 2", rol: "empleado", pin: "0002" },
    ],
    cuba: [
      { id: "admin", nombre: "👑 Admin", rol: "admin", pin: "1234" },
      { id: "u1", nombre: "👤 Usuario 1", rol: "empleado", pin: "0001" },
    ],
  };

  // Muestra pantalla de ingreso de PIN
  function pizPantallaPin(localId, userId) {
    const postits = document.getElementById("piz-postits-area");
    if (postits) postits.style.display = "none";
    const lineas = document.querySelectorAll(".piz-line");
    lineas.forEach((l) => (l.style.display = "none"));

    const usuario = (USUARIOS_PIZ[localId] || []).find((u) => u.id === userId);
    if (!usuario) return;
    const sec = document.getElementById("piz-login-section");
    if (!sec) return;

    const modal = document.getElementById("modal-setup-local");
    const desdeCambio = modal?._desdeCambioUsuario || false;
    const esDesktop = window.innerWidth >= 901;

    sec.innerHTML = `
    <div class="piz-pantalla piz-pin-wrap">
      <p class="piz-label">ingresá tu PIN · ${usuario.nombre.replace(
        /^\S+\s*/,
        ""
      )}</p>
      <div class="piz-pin-dots">
        <span class="piz-pin-dot" id="piz-dot-0"></span>
        <span class="piz-pin-dot" id="piz-dot-1"></span>
        <span class="piz-pin-dot" id="piz-dot-2"></span>
        <span class="piz-pin-dot" id="piz-dot-3"></span>
      </div>
      <p class="piz-pin-error" id="piz-pin-error"></p>
      
      ${
        esDesktop
          ? `
        <p class="piz-label" style="font-size:.7rem;margin-top:4px;">usá el teclado numérico</p>
      `
          : `
        <div class="piz-teclado">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"]
            .map(
              (k) => `
            <button class="piz-tecla${k === "" ? " invisible" : ""}" 
              ${k !== "" ? `onclick="pizTecla('${k}','${localId}','${usuario.id}')"` : ""}>
              ${k}
            </button>
          `
            )
            .join("")}
        </div>
      `
      }
      
      <button class="piz-back-btn" onclick="pizPantallaUsuarios('${localId}')">← volver</button>
      ${
        desdeCambio
          ? `
        <button class="piz-back-btn" onclick="cerrarModalBienvenida()" style="margin-top:4px;opacity:.5;">✕ cancelar</button>
      `
          : ""
      }
    </div>
  `;

    window._pinActual = "";

    if (esDesktop) {
      if (window._pizKeyListener) {
        document.removeEventListener("keydown", window._pizKeyListener);
      }
      window._pizKeyListener = function (e) {
        if (document.getElementById("modal-setup-local")?.style.display === "none")
          return;
        if (e.key >= "0" && e.key <= "9") {
          pizTecla(e.key, localId, usuario.id);
        } else if (e.key === "Backspace") {
          pizTecla("⌫", localId, usuario.id);
        } else if (e.key === "Escape") {
          if (desdeCambio) cerrarModalBienvenida();
          else pizPantallaUsuarios(localId);
        }
      };
      document.addEventListener("keydown", window._pizKeyListener);
    }
  }

  // Cierra el modal de bienvenida
  window.cerrarModalBienvenida = function () {
    const modal = document.getElementById("modal-setup-local");
    if (modal) modal.style.display = "none";
    document.querySelector(".piz-cerrar-x")?.remove();
    if (window._pizKeyListener) {
      document.removeEventListener("keydown", window._pizKeyListener);
      window._pizKeyListener = null;
    }
  };

  window.pizPantallaPin = pizPantallaPin;

  // Maneja la pulsación de tecla (numérica o borrar) en el PIN
  window.pizTecla = function (tecla, localId, userId) {
    const usuario = (USUARIOS_PIZ[localId] || []).find((u) => u.id === userId);
    if (!usuario) return;

    if (tecla === "⌫") {
      window._pinActual = (window._pinActual || "").slice(0, -1);
    } else {
      if ((window._pinActual || "").length >= 4) return;
      window._pinActual = (window._pinActual || "") + tecla;
    }

    for (let i = 0; i < 4; i++) {
      const dot = document.getElementById(`piz-dot-${i}`);
      if (dot) dot.classList.toggle("activo", i < window._pinActual.length);
    }

    if (window._pinActual.length === 4) {
      if (window._pinActual === usuario.pin) {
        window.pizEntrar(localId, userId, usuario.nombre, usuario.rol);
      } else {
        window._pinActual = "";
        for (let i = 0; i < 4; i++) {
          const dot = document.getElementById(`piz-dot-${i}`);
          if (dot) dot.classList.remove("activo");
        }
        const err = document.getElementById("piz-pin-error");
        if (err) {
          err.textContent = "PIN incorrecto, intentá de nuevo";
          err.classList.add("visible");
          setTimeout(() => err.classList.remove("visible"), 2000);
        }
        const dots = document.querySelector(".piz-pin-dots");
        if (dots) {
          dots.classList.add("shake");
          setTimeout(() => dots.classList.remove("shake"), 400);
        }
      }
    }
  };

  // Renderiza los post-its dentro del pizarrón
  function renderPizPostits() {
    const area = document.getElementById("piz-postits-area");
    if (!area) return;

    let notas = [];
    try {
      const bbRaw = localStorage.getItem("spa_blackboard_v3");
      const bbData = bbRaw ? JSON.parse(bbRaw) : null;
      notas = bbData && bbData.notas && bbData.notas.length
        ? bbData.notas.slice(0, 3).map((n) => ({ texto: n.titulo || n.cuerpo || "" }))
        : [];
    } catch (e) {}

    if (!notas.length) {
      notas = [
        { texto: "Bienvenida al sistema 🍮" },
        { texto: "Revisá los pedidos del día" },
        { texto: "Agregá notas en el Pizarrón" },
      ];
    }

    area.innerHTML = notas
      .map(
        (n, i) => `
      <div class="piz-postit ${COLORES_POSTIT[i % 4]}">
        <span class="piz-postit-emoji">${EMOJIS_POSTIT[i % 6]}</span>
        ${n.texto || n.contenido || ""}
      </div>
    `
      )
      .join("");
  }

  // Muestra la pantalla de selección de locales
  function pizPantallaLocales() {
    const postits = document.getElementById("piz-postits-area");
    if (postits) postits.style.display = "flex";
    const lineas = document.querySelectorAll(".piz-line");
    lineas.forEach((l) => (l.style.display = "block"));
    const sec = document.getElementById("piz-login-section");
    if (!sec) return;
    const modal = document.getElementById("modal-setup-local");
    const desdeCambio = modal?._desdeCambioUsuario || false;

    const pizarron = document.querySelector(".pizarron");
    pizarron?.querySelector(".piz-cerrar-x")?.remove();
    if (desdeCambio && pizarron) {
      const btnX = document.createElement("button");
      btnX.className = "piz-cerrar-x";
      btnX.textContent = "✕";
      btnX.onclick = cerrarModalBienvenida;
      pizarron.appendChild(btnX);
    }

    sec.innerHTML = `
    <div class="piz-pantalla">
      <p class="piz-label">seleccioná tu local</p>
      <div class="piz-locales">
        ${LOCALES_PIZ.map(
          (l) => `
          <button class="piz-local-btn${l.disabled ? " disabled" : ""}"
            onclick="${
              l.disabled
                ? "pizMensajeConstruccion()"
                : `pizPantallaUsuarios('${l.id}')`
            }">
            ${l.nombre}
            <span class="piz-local-tag">${l.tag}</span>
          </button>
        `
        ).join("")}
      </div>
    </div>
  `;
  }

  window.pizPantallaUsuarios = function (localId) {
    const postits = document.getElementById("piz-postits-area");
    if (postits) postits.style.display = "none";
    const lineas = document.querySelectorAll(".piz-line");
    lineas.forEach((l) => (l.style.display = "none"));

    const local = LOCALES_PIZ.find((l) => l.id === localId);
    const users = USUARIOS_PIZ[localId] || [];
    const sec = document.getElementById("piz-login-section");
    if (!sec) return;
    const modal = document.getElementById("modal-setup-local");
    const desdeCambio = modal?._desdeCambioUsuario || false;

    const pizarron = document.querySelector(".pizarron");
    pizarron?.querySelector(".piz-cerrar-x")?.remove();
    if (desdeCambio && pizarron) {
      const btnX = document.createElement("button");
      btnX.className = "piz-cerrar-x";
      btnX.textContent = "✕";
      btnX.onclick = cerrarModalBienvenida;
      pizarron.appendChild(btnX);
    }

    sec.innerHTML = `
    <div class="piz-pantalla">
      <p class="piz-label">quién sos · ${local.nombre}</p>
      <div class="piz-usuarios">
        ${users.map(
          (u) => `
          <button class="piz-usuario-btn" onclick="pizPantallaPin('${localId}', '${u.id}')">
            ${u.nombre}
            <span class="piz-rol">${u.rol}</span>
          </button>
        `
        ).join("")}
      </div>
      <button class="piz-back-btn" onclick="pizPantallaLocales()">← volver</button>
    </div>
  `;
  };

  window.pizPantallaLocales = pizPantallaLocales;

  // Ejecuta el ingreso del usuario y cierra el modal
  window.pizEntrar = function (localId, userId, nombre, rol) {
    if (typeof usuarioActivo !== "undefined") {
      usuarioActivo.id = userId;
      usuarioActivo.nombre = nombre.replace(/^.+?\s/, "");
      usuarioActivo.rol = userId === "admin" ? "admin" : "usuario";
      usuarioActivo.local = localId === "matienzo" ? null : localId;
    }
    if (typeof actualizarUIUsuario === "function") actualizarUIUsuario();
    if (typeof setLocal === "function") setLocal(localId);
    document.getElementById("modal-setup-local").style.display = "none";
    chequearPendientesAyer();
    initWarningCierre();
  };

  // Abre el modal de bienvenida (puede ser desde cambio de usuario o inicial)
  window.abrirModalBienvenida = function (desdeCambioUsuario = false) {
    const modal = document.getElementById("modal-setup-local");
    if (!modal) return;
    modal._desdeCambioUsuario = desdeCambioUsuario;
    modal.style.display = "flex";
    renderPizPostits();
    pizPantallaLocales();
  };

  // Muestra mensaje de "en construcción" para locales no disponibles
  function pizMensajeConstruccion() {
    const sec = document.getElementById("piz-login-section");
    if (!sec) return;
    sec.innerHTML = `
    <div class="piz-pantalla" style="text-align:center;">
      <p style="font-family:'Shadows Into Light',cursive; color:var(--chalk-dim); font-size:1.4rem; letter-spacing:2px; margin-bottom:8px;">
        🚧 en construcción 🚧
      </p>
      <p style="font-family:'Caveat',cursive; color:var(--chalk-dim); font-size:1rem; letter-spacing:1px; opacity:.7;">
        este local todavía no está disponible.
      </p>
      <button class="piz-back-btn" onclick="pizPantallaLocales()" style="margin-top:14px;">← volver</button>
    </div>
  `;
  }

  window.pizMensajeConstruccion = pizMensajeConstruccion;
})();

// ────────────────────────────────────────────────────────────────
// FUNCIÓN: selectMobileSubtab
// Descripción: Maneja la selección de subtabs en móviles (oculta la pantalla
//              de selector y activa el tab correspondiente).
// ────────────────────────────────────────────────────────────────
function selectMobileSubtab(parent, id, el) {
  const screen = document.getElementById("subtab-screen-" + parent);
  if (screen) screen.classList.remove("active");

  if (parent === "produccion") {
    showProdTab(id, document.getElementById("prodtab-" + id));
  } else if (parent === "cuba") {
    showCubaTab(id, document.getElementById("cubatab-" + id));
  } else if (parent === "config") {
    showCfgTab(id, document.getElementById("cfgtab-" + id));
  }
}

/* WARNING PEDIDOS PENDIENTES ANTES DEL CIERRE */
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

// ────────────────────────────────────────────────────────────────
// FUNCIÓN: abrirMenuHamburguesa
// Descripción: Abre el menú hamburguesa (sidebar) y su overlay.
// ────────────────────────────────────────────────────────────────
function abrirMenuHamburguesa() {
  document.getElementById("ham-sheet").classList.add("open");
  document.getElementById("ham-overlay").classList.add("open");
}

// ────────────────────────────────────────────────────────────────
// FUNCIÓN: cerrarMenuHamburguesa (global)
// Descripción: Cierra el menú hamburguesa.
// ────────────────────────────────────────────────────────────────
window.cerrarMenuHamburguesa = function () {
  document.getElementById("ham-sheet").classList.remove("open");
  document.getElementById("ham-overlay").classList.remove("open");
};

// ══════════════════════════════════════
// MOBILE FLOATING SUBTAB PANEL
// Reemplazá showTab() y agregá las funciones nuevas
// ══════════════════════════════════════

// Variable para rastrear qué panel está abierto
let _mobPanelActivo = null;

function cerrarMobPanel() {
  if (_mobPanelActivo) {
    document.getElementById('mob-panel-' + _mobPanelActivo)?.classList.remove('open');
    // Quitar highlight del tab
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('panel-open'));
  }
  document.getElementById('mob-panel-backdrop')?.classList.remove('open');
  _mobPanelActivo = null;
}

function abrirMobPanel(key, tabEl) {
  // Si el mismo panel está abierto, cerrarlo (toggle)
  if (_mobPanelActivo === key) {
    cerrarMobPanel();
    return;
  }
  // Cerrar el que estaba abierto
  cerrarMobPanel();

  _mobPanelActivo = key;
  document.getElementById('mob-panel-' + key)?.classList.add('open');
  document.getElementById('mob-panel-backdrop')?.classList.add('open');
  // Highlight del tab activo
  if (tabEl) tabEl.classList.add('panel-open');
}

function mobPanelPick(parent, id) {
  cerrarMobPanel();

  if (parent === 'produccion') {
    showProdTab(id, document.getElementById('prodtab-' + id));
  } else if (parent === 'cuba') {
    showCubaTab(id, document.getElementById('cubatab-' + id));
  } else if (parent === 'mas') {
    if (id === 'usuario') {
      if (id === 'usuario') {
  abrirModalCambioUsuario();
}
    } else if (id === 'pizarron') {
      abrirPizarron();
    } else if (id === 'etiquetas') {
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.getElementById('tab-etiquetas').classList.add('active');
      renderEtiquetas();
    } else if (id === 'config') {
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.getElementById('tab-config').classList.add('active');
      const screen = document.getElementById('subtab-screen-config');
      if (screen) screen.classList.add('active');
    }
  }
}

// ── showTab reemplazado ──
// REEMPLAZÁ tu función showTab() existente con esta:

function showTab(id, el) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + id)?.classList.add('active');
  if (el) el.classList.add('active');

  if (id === 'produccion') {
    const elTab = document.getElementById('prodtab-' + _prodTabActiva);
    showProdTab(_prodTabActiva, elTab || document.getElementById('prodtab-hoy'));
  }
  if (id === 'cuba') renderCuba();
  if (id === 'config') {
    const activePanel = document.querySelector('.cfg-panel.active');
    const activePanelId = activePanel ? activePanel.id.replace('cfgpanel-', '') : 'catalogo';
    showCfgTab(activePanelId, document.getElementById('cfgtab-' + activePanelId));
  }

  const isMobile = window.innerWidth < 768 ||
    (window.innerWidth <= 1024 && window.screen.orientation?.type?.includes('portrait'));

  if (isMobile) {
    // Tabs con panel flotante: no navegan, abren el panel
    if (id === 'produccion' || id === 'cuba') {
      // Reactivar el tab anterior de contenido (no cambiar vista)
      // En realidad sí queremos ir al tab, y además abrir el panel
      abrirMobPanel(id, el);
      return;
    }
    // "Más" no tiene tab propio — lo maneja su botón directamente
  }

  // Desktop/tablet: comportamiento original con sidebar subtabs
  document.querySelectorAll('.sidebar-subtabs').forEach(el => el.classList.remove('visible'));
  const subtabGroup = document.getElementById('sidebar-subtabs-' + id);
  if (subtabGroup) subtabGroup.classList.add('visible');
}

// ── Botón "Más" en el bottom bar ──
// En tu HTML el tab de "Más" (hamburguesa) debe llamar a esto:
// onclick="toggleMobMas(this)"

function toggleMobMas(el) {
  const isMobile = window.innerWidth < 768 ||
    (window.innerWidth <= 1024 && window.screen.orientation?.type?.includes('portrait'));
  if (isMobile) {
    abrirMobPanel('mas', el);
  } else {
    abrirMenuHamburguesa(); // fallback desktop por si acaso
  }
}