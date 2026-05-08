/**
 * ================================================================
 * ÍNDICE DE FUNCIONES (pizarron.JS)
 * ================================================================
 * 
 * === CONSTANTES GLOBALES ===
 * - BB_STAMPS                    → Array de emojis disponibles para sellos
 * - BB_COLORES                   → Colores disponibles para notas/post-its
 * - BB_FLOATS                    → Clases CSS para animaciones flotantes
 * - BB_KEY                       → Clave de localStorage para persistencia
 * - BB                           → Objeto global con estado del pizarrón
 * 
 * === INICIALIZACIÓN ===
 * - bbInit()                     → Inicializa pizarrón: carga estado, renderiza UI, eventos
 * - bbCargarEstado()             → Carga notas y sellos desde localStorage
 * - bbGuardarEstado()            → Guarda notas y sellos en localStorage
 * - bbSincronizarDatos()         → Sincroniza con sistema principal (pizDatos)
 * - bbGetPostitsDelDia()         → Retorna notas para mostrar en modal de bienvenida
 * 
 * === ABRIR / CERRAR PIZARRÓN ===
 * - abrirPizarron()              → Abre el modal del pizarrón
 * - cerrarPizarron()             → Cierra el modal del pizarrón
 * - bbCerrar()                   → Cierra y guarda estado
 * 
 * === TECLADO (atajos) ===
 * - bbKeydown(e)                 → Maneja teclas: Escape (cierra modales), Alt+N (nueva nota), Alt+S (sellos)
 * 
 * === SELLOS (stamps) ===
 * - bbRenderStampGrid()          → Renderiza grilla de sellos disponibles
 * - bbSelectSello(emoji)         → Selecciona sello activo para pegar en tablero
 * - bbDeseleccionarSello()       → Desactiva modo sello
 * - bbToggleGridSellos()         → Abre/cierra grid de sellos flotante
 * - bbCerrarGridSellos()         → Cierra grid de sellos
 * - bbTableroClick(e)            → Agrega sello al tablero (si modo activo)
 * - bbEliminarStamp(id)          → Elimina sello del tablero
 * 
 * === NOTAS / POST-ITS ===
 * - bbAbrirEditorNota(id)        → Abre modal para crear/editar nota
 * - bbCerrarEditorNota()         → Cierra modal de edición
 * - bbGuardarNota()              → Guarda nota nueva o editada
 * - bbEliminarNota(id, e)        → Elimina nota del tablero
 * - bbSetColorNota(color, btn)   → Cambia color de nota en editor
 * - bbToggleSelloPicker()        → Abre/cierra selector de sello para nota
 * - bbSetSelloNota(emoji)        → Asigna sello a nota en edición
 * - bbRenderSelloPicker()        → Renderiza selector de sellos para nota
 * 
 * === LECTURA DE NOTAS ===
 * - bbAbrirLeer(id)              → Abre modal para leer nota (vista ampliada)
 * - bbCerrarLeer()               → Cierra modal de lectura
 * - bbEditarDesdeVista()         → Edita nota desde vista de lectura
 * 
 * === RENDER DEL TABLERO ===
 * - bbRenderTablero()            → Renderiza todas las notas y sellos en el tablero
 * - bbHacerArrastrable(el, data, container) → Hace que un elemento sea arrastrable
 * 
 * === HELPERS ===
 * - bbUID()                      → Genera ID único
 * - bbEsc(s)                     → Escapa HTML para evitar XSS
 * 
 * ================================================================
 */

/* ══════════════════════════════════════════════════
   BLACKBOARD (PIZARRÓN VIRTUAL)
══════════════════════════════════════════════════ */

const BB_STAMPS = [
  "🎉", "⭐", "✅", "❌", "🔥", "💯", "👀", "🎂", "🍰", "🍩",
  "☕", "🌸", "💪", "🚀", "😂", "🤌", "💅", "🫶", "🧁", "🍫",
];
const BB_COLORES = ["#fef08a", "#bae6fd", "#bbf7d0", "#fecdd3", "#e9d5ff"];
const BB_FLOATS = ["bb-float-a", "bb-float-b", "bb-float-c", "bb-float-d"];
const BB_KEY = "spa_blackboard_v3";

const BB = {
  notas: [],       // { id, titulo, cuerpo, color, sello, x, y, floatClass }
  stamps: [],      // { id, emoji, x, y }
  stampActivo: null,
  leyendo: null,
  editor: { notaId: null, color: "#fef08a", sello: "" },
};

/* ── Init ─────────────────────────────────────── */
// Inicializa el pizarrón: carga estado, renderiza UI y configura eventos
function bbInit() {
  bbCargarEstado();
  bbRenderStampGrid();
  bbRenderSelloPicker();
  bbRenderTablero();

  const tablero = document.getElementById("bb-tablero");
  if (tablero) tablero.addEventListener("click", bbTableroClick);

  document.addEventListener("keydown", bbKeydown);
  // cerrar grid de sellos al click fuera
  document.addEventListener("click", e => {
    if (!e.target.closest(".bb-sellos-wrap")) bbCerrarGridSellos();
  });
}

/* ── Teclado ──────────────────────────────────── */
// Maneja atajos de teclado: Escape (cierra modales), Alt+N (nueva nota), Alt+S (sellos)
function bbKeydown(e) {
  if (e.key === "Escape") {
    // Modal bienvenida
    const modalBienvenida = document.getElementById("modal-setup-local");
    if (modalBienvenida?.style.display !== "none" && modalBienvenida?._desdeCambioUsuario) {
      cerrarModalBienvenida();
      return;
    }
    // Modal leer nota
    if (document.getElementById("bb-nota-leer-overlay")?.classList.contains("bb-visible")) {
      bbCerrarLeer();
      return;
    }
    // Modal editor nota
    if (document.getElementById("bb-nota-overlay")?.classList.contains("bb-visible")) {
      bbCerrarEditorNota();
      return;
    }
    // Grid sellos
    if (document.getElementById("bb-sellos-flotante")?.classList.contains("bb-visible")) {
      bbCerrarGridSellos();
      return;
    }
    // Pizarrón
    if (document.getElementById("modal-pizarron")?.classList.contains("bb-visible")) {
      bbCerrar();
      return;
    }
  }
  if (!document.getElementById("modal-pizarron")?.classList.contains("bb-visible")) return;
  if (e.altKey && e.key.toLowerCase() === "n") { e.preventDefault(); bbAbrirEditorNota(null); }
  if (e.altKey && e.key.toLowerCase() === "s") { e.preventDefault(); bbToggleGridSellos(); }
}

/* ── Abrir / Cerrar pizarrón ─────────────────── */
// Abre el modal del pizarrón
function abrirPizarron() {
  document.body.classList.add("bb-pizarron-open");
  document.getElementById("modal-pizarron")?.classList.add("bb-visible");
}

// Cierra el modal del pizarrón
function cerrarPizarron() { bbCerrar(); }

function bbCerrar() {
  bbGuardarEstado();
  document.body.classList.remove("bb-pizarron-open");
  document.getElementById("modal-pizarron")?.classList.remove("bb-visible");
}

/* ── Grid de sellos flotante ─────────────────── */
// Abre/cierra el grid de sellos flotante
function bbToggleGridSellos() {
  const flotante = document.getElementById("bb-sellos-flotante");
  const btn = document.getElementById("bb-btn-sellos");
  if (!flotante) return;
  const abierto = flotante.classList.toggle("bb-visible");
  btn?.classList.toggle("bb-activo", abierto);
}

// Cierra el grid de sellos flotante
function bbCerrarGridSellos() {
  document.getElementById("bb-sellos-flotante")?.classList.remove("bb-visible");
  document.getElementById("bb-btn-sellos")?.classList.remove("bb-activo");
}

/* ── Sellos ──────────────────────────────────── */
// Renderiza la grilla de sellos disponibles
function bbRenderStampGrid() {
  const grid = document.getElementById("bb-sellos-grid");
  if (!grid) return;
  grid.innerHTML = BB_STAMPS.map(e =>
    `<button class="bb-sello-btn ${BB.stampActivo === e ? "bb-sello-activo" : ""}"
       onclick="bbSelectSello('${e}')">${e}</button>`
  ).join("");
}

// Selecciona un sello para pegar en el tablero
function bbSelectSello(emoji) {
  BB.stampActivo = BB.stampActivo === emoji ? null : emoji;
  const tablero = document.getElementById("bb-tablero");
  if (tablero) tablero.classList.toggle("bb-sello-mode", !!BB.stampActivo);

  const label = document.getElementById("bb-sello-activo-label");
  if (label) label.textContent = BB.stampActivo || "";

  bbRenderStampGrid();
}

// Desactiva el modo sello
function bbDeseleccionarSello() {
  BB.stampActivo = null;
  document.getElementById("bb-tablero")?.classList.remove("bb-sello-mode");
  document.getElementById("bb-sello-activo-label").textContent = "";
  bbRenderStampGrid();
  bbCerrarGridSellos();
}

/* ── Click en el tablero ─────────────────────── */
// Agrega un sello al tablero si el modo sello está activo
function bbTableroClick(e) {
  if (!BB.stampActivo) return;
  if (e.target.closest(".bb-postit") || e.target.closest(".bb-stamp")) return;

  const rect = e.currentTarget.getBoundingClientRect();
  BB.stamps.push({
    id: bbUID(),
    emoji: BB.stampActivo,
    x: e.clientX - rect.left - 16,
    y: e.clientY - rect.top - 16,
  });

  bbRenderTablero();
  bbGuardarEstado();
}

// Elimina un sello del tablero
function bbEliminarStamp(id) {
  BB.stamps = BB.stamps.filter(s => s.id !== id);
  bbRenderTablero();
  bbGuardarEstado();
}

/* ── Editor de nota ──────────────────────────── */
// Abre el modal para crear o editar una nota
function bbAbrirEditorNota(id) {
  const nota = id ? BB.notas.find(n => n.id === id) : null;
  BB.editor.notaId = id || null;
  BB.editor.color = nota?.color || BB_COLORES[Math.floor(Math.random() * BB_COLORES.length)];
  BB.editor.sello = nota?.sello || "";

  document.getElementById("bb-nota-titulo").value = nota?.titulo || "";
  document.getElementById("bb-nota-cuerpo").value = nota?.cuerpo || "";
  document.getElementById("bb-nota-sello-actual").textContent = BB.editor.sello;

  bbSetColorNota(BB.editor.color, null);
  document.getElementById("bb-nota-overlay")?.classList.add("bb-visible");
  setTimeout(() => document.getElementById("bb-nota-titulo")?.focus(), 80);
}

// Cierra el editor de notas
function bbCerrarEditorNota() {
  document.getElementById("bb-nota-overlay")?.classList.remove("bb-visible");
  document.getElementById("bb-sello-picker-mini")?.classList.remove("bb-visible");
}

// Guarda una nota nueva o editada
function bbGuardarNota() {
  const titulo = document.getElementById("bb-nota-titulo")?.value.trim() || "";
  const cuerpo = document.getElementById("bb-nota-cuerpo")?.value.trim() || "";
  if (!titulo && !cuerpo) { bbCerrarEditorNota(); return; }

  const { notaId, color, sello } = BB.editor;

  if (notaId) {
    const nota = BB.notas.find(n => n.id === notaId);
    if (nota) Object.assign(nota, { titulo, cuerpo, color, sello });
  } else {
    const tablero = document.getElementById("bb-tablero");
    const w = tablero?.offsetWidth || 600;
    const h = tablero?.offsetHeight || 400;
    BB.notas.push({
      id: bbUID(), titulo, cuerpo, color, sello,
      x: 40 + Math.random() * Math.max(0, w - 220),
      y: 40 + Math.random() * Math.max(0, h - 180),
      floatClass: BB_FLOATS[BB.notas.length % 4],
    });
  }

  bbCerrarEditorNota();
  bbRenderTablero();
  bbSincronizarDatos();
  bbGuardarEstado();
}

// Elimina una nota del tablero
function bbEliminarNota(id, e) {
  e?.stopPropagation();
  BB.notas = BB.notas.filter(n => n.id !== id);
  bbRenderTablero();
  bbSincronizarDatos();
  bbGuardarEstado();
}

/* ── Color nota ──────────────────────────────── */
// Cambia el color de la nota en el editor
function bbSetColorNota(color, _btn) {
  BB.editor.color = color;
  const preview = document.getElementById("bb-nota-preview");
  if (preview) {
    preview.style.background = color;
    preview.style.color = color === "#bae6fd" ? "#0c2a3a" : "#3a3000";
  }
  document.querySelectorAll(".bb-color-dot").forEach(d =>
    d.classList.toggle("bb-color-activo", d.dataset.color === color)
  );
}

/* ── Sello en nota ───────────────────────────── */
// Abre/cierra el selector de sello para la nota
function bbToggleSelloPicker() {
  document.getElementById("bb-sello-picker-mini")?.classList.toggle("bb-visible");
}

// Asigna un sello a la nota en edición
function bbSetSelloNota(emoji) {
  BB.editor.sello = emoji;
  document.getElementById("bb-nota-sello-actual").textContent = emoji;
  document.getElementById("bb-sello-picker-mini")?.classList.remove("bb-visible");
}

// Renderiza el selector de sellos para nota
function bbRenderSelloPicker() {
  const picker = document.getElementById("bb-sello-picker-mini");
  if (!picker) return;
  picker.innerHTML =
    `<button class="bb-sello-mini-btn" onclick="bbSetSelloNota('')" title="Quitar">✕</button>` +
    BB_STAMPS.map(e =>
      `<button class="bb-sello-mini-btn" onclick="bbSetSelloNota('${e}')">${e}</button>`
    ).join("");
}

/* ── Render tablero ──────────────────────────── */
// Renderiza todas las notas y sellos en el tablero
function bbRenderTablero() {
  const tablero = document.getElementById("bb-tablero");
  if (!tablero) return;

  tablero.querySelectorAll(".bb-postit, .bb-stamp").forEach(el => el.remove());

  const vacio = document.getElementById("bb-tablero-vacio");
  if (vacio) vacio.style.display = (BB.notas.length + BB.stamps.length) === 0 ? "" : "none";

  // post-its
  BB.notas.forEach(n => {
    const textColor = n.color === "#bae6fd" ? "#0c2a3a" : "#3a3000";
    const el = document.createElement("div");
    el.className = `bb-postit ${n.floatClass || ""}`;
    el.style.cssText = `left:${n.x}px;top:${n.y}px;background:${n.color};color:${textColor};`;
    el.dataset.id = n.id;
    el.innerHTML = `
      <button class="bb-postit-del" onclick="bbEliminarNota('${n.id}',event)">✕</button>
      ${n.sello ? `<span class="bb-postit-sello">${n.sello}</span>` : ""}
      <span class="bb-postit-titulo">${bbEsc(n.titulo) || '<em style="opacity:.4">sin título</em>'}</span>
      <span class="bb-postit-preview">${bbEsc(n.cuerpo)}</span>
    `;
    el.addEventListener("click", ev => {
      if (!ev.target.closest(".bb-postit-del") && !el.classList.contains("bb-dragging"))
        bbAbrirLeer(n.id);
    });
    bbHacerArrastrable(el, n, tablero);
    tablero.appendChild(el);
  });

  // sellos
  BB.stamps.forEach(s => {
    const el = document.createElement("div");
    el.className = "bb-stamp";
    el.style.cssText = `left:${s.x}px;top:${s.y}px;`;
    el.dataset.id = s.id;
    el.innerHTML = `${s.emoji}<button class="bb-stamp-del" onclick="bbEliminarStamp('${s.id}')">✕</button>`;
    bbHacerArrastrable(el, s, tablero);
    tablero.appendChild(el);
  });
}

/* ── Leer nota ───────────────────────────────── */
// Abre modal para leer nota (vista ampliada)
function bbAbrirLeer(id) {
  const nota = BB.notas.find(n => n.id === id);
  if (!nota) return;
  BB.leyendo = id;
  const textColor = nota.color === "#bae6fd" ? "#0c2a3a" : "#3a3000";

  const modal = document.getElementById("bb-nota-leer-modal");
  if (modal) {
    modal.style.background = nota.color;
    modal.style.color = textColor;
    modal.querySelectorAll(".bb-btn-chalk-sm").forEach(b => {
      b.style.borderColor = `${textColor}44`;
      b.style.color = `${textColor}88`;
    });
  }
  document.getElementById("bb-leer-sello").textContent = nota.sello || "";
  document.getElementById("bb-leer-titulo").textContent = nota.titulo || "";
  document.getElementById("bb-leer-cuerpo").textContent = nota.cuerpo || "";
  document.getElementById("bb-nota-leer-overlay")?.classList.add("bb-visible");
}

// Cierra modal de lectura
function bbCerrarLeer() {
  document.getElementById("bb-nota-leer-overlay")?.classList.remove("bb-visible");
  BB.leyendo = null;
}

// Edita la nota desde la vista de lectura
function bbEditarDesdeVista() {
  const id = BB.leyendo;
  bbCerrarLeer();
  if (id) bbAbrirEditorNota(id);
}

/* ── Drag & drop ─────────────────────────────── */
// Hace que un elemento sea arrastrable en el tablero
function bbHacerArrastrable(el, data, container) {
  let dragging = false, ox = 0, oy = 0, moved = false;

  el.addEventListener("mousedown", e => {
    if (e.target.tagName === "BUTTON" || e.target.tagName === "TEXTAREA") return;
    dragging = true;
    moved = false;
    ox = e.clientX - data.x;
    oy = e.clientY - data.y;
    el.classList.add("bb-dragging");
    el.style.zIndex = 100;
    e.preventDefault();
  });

  const onMove = e => {
    if (!dragging) return;
    moved = true;
    const rect = container.getBoundingClientRect();
    data.x = Math.max(0, Math.min(e.clientX - ox, rect.width - el.offsetWidth));
    data.y = Math.max(0, Math.min(e.clientY - oy, rect.height - el.offsetHeight));
    el.style.left = data.x + "px";
    el.style.top = data.y + "px";
  };

  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    el.classList.remove("bb-dragging");
    el.style.zIndex = "";
    if (moved) bbGuardarEstado();
  };

  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
}

/* ── Sincronizar con datos.pizarron ──────────── */
// Sincroniza el pizarrón con el sistema principal (si existe pizDatos)
function bbSincronizarDatos() {
  if (typeof pizDatos !== "function") return;
  const d = pizDatos();
  d.notas = BB.notas.map(n => ({
    texto: n.titulo || n.cuerpo || "",
    contenido: n.cuerpo || "",
    color: n.color,
    sello: n.sello,
  }));
}

// Retorna las primeras 4 notas para mostrar en modal de bienvenida
function bbGetPostitsDelDia() {
  return BB.notas.slice(0, 4).map(n => ({
    texto: n.titulo || n.cuerpo || "",
    contenido: n.cuerpo || "",
    color: n.color,
    sello: n.sello,
  }));
}

/* ── Persistencia ────────────────────────────── */
// Guarda el estado del pizarrón en localStorage
function bbGuardarEstado() {
  try {
    localStorage.setItem(BB_KEY, JSON.stringify({ notas: BB.notas, stamps: BB.stamps }));
    bbSincronizarDatos();
  } catch (e) { }
}

// Carga el estado del pizarrón desde localStorage
function bbCargarEstado() {
  try {
    const raw = localStorage.getItem(BB_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    BB.notas = data.notas || [];
    BB.stamps = data.stamps || [];
    bbSincronizarDatos();
  } catch (e) { }
}

/* ── Helpers ─────────────────────────────────── */
// Genera un ID único
function bbUID() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36); }

// Escapa HTML para evitar XSS
function bbEsc(s = "") {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ── Arrancar ────────────────────────────────── */
// Inicializa el pizarrón cuando el DOM está listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bbInit);
} else {
  bbInit();
}