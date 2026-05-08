/**
 * ================================================================
 * ÍNDICE DE FUNCIONES (APP.JS)
 * ================================================================
 * 
 * === TOAST Y SINCRONIZACIÓN ===
 * - mostrarToastGuardado()        → Muestra toast de "Guardado" por 2 segundos
 * - setSyncPendiente()            → Marca UI con estado "Sin guardar" (cambios pendientes)
 * - setSyncGuardado()             → Marca UI con estado "Guardado"
 * 
 * === EVENTOS GLOBALES ===
 * - beforeunload                  → Alerta al cerrar si hay cambios sin guardar
 * - click (autocomplete)          → Cierra autocompletado al hacer clic fuera
 * - setInterval(renderEstadoLocal) → Actualiza estado del local cada minuto
 * 
 * === INICIALIZACIÓN ===
 * - renderDiasNav(), renderAll(), renderCatalogo(), renderArchivadosGlobal()
 * 
 * === UI DE USUARIO ===
 * - actualizarUIUsuario()         → Actualiza nombre y rol del usuario en toda la UI
 * - toggleUsuarioMenu(btnId)      → Abre/cierra menú de usuario (posiciona según botón)
 * - abrirModalCambioUsuario()     → Abre modal para cambiar usuario (reutiliza bienvenida)
 * 
 * === MOBILE: MENÚ HAMBURGUESA ===
 * - initMobileUsuarioEnHam()      → Agrega botón de usuario en menú hamburguesa (mobile)
 * - syncHamUsuarioNombre()        → Sincroniza nombre de usuario en item de hamburguesa
 * 
 * === MOBILE: FILTROS ===
 * - initFiltroToggleMobile()      → Agrega botón toggle para mostrar/ocultar filtros en mobile
 * 
 * === DOMContentLoaded ===
 * - Inicializa componentes mobile y UI de usuario
 * 
 * ================================================================
 */

// ── TOAST ──
// Muestra un toast de "Guardado" que desaparece a los 2 segundos
function mostrarToastGuardado() {
  const t = document.getElementById("toast-guardado");
  if (!t) return;
  t.classList.add("visible");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("visible"), 2000);
}

// ── SYNC ──
// Marca la UI con estado "Sin guardar" (cambios pendientes)
function setSyncPendiente() {
  ["sync-dot", "sync-dot-banner"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = "sync-dot amarillo";
  });
  ["sync-txt", "sync-txt-banner"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = "Sin guardar";
  });
  hayCambios = true;
}

// Marca la UI con estado "Guardado"
function setSyncGuardado() {
  ["sync-dot", "sync-dot-banner"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = "sync-dot verde";
  });
  ["sync-txt", "sync-txt-banner"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = "Guardado";
  });
  hayCambios = false;
}

// Alerta al cerrar la página si hay cambios sin guardar
window.addEventListener("beforeunload", e => {
  if (hayCambios) {
    e.preventDefault();
    e.returnValue = "";
  }
});

// Cierra el autocompletado al hacer clic fuera del contenedor
document.addEventListener("click", e => {
  if (!e.target.closest(".autocomplete-wrap")) {
    document.getElementById("autocomplete-lista").classList.remove("visible");
  }
});

// Actualiza el estado del local cada minuto
setInterval(renderEstadoLocal, 60000);

// Inicializaciones principales
renderDiasNav();
renderAll();
renderCatalogo();
renderArchivadosGlobal();

// ── UI DE USUARIO ──
// Actualiza nombre y rol del usuario en toda la UI
function actualizarUIUsuario() {
  if (!usuarioActivo) return;
  const nombre = usuarioActivo.nombre || "—";
  const rol = usuarioActivo.rol || "";

  document.querySelectorAll(".usuario-nombre").forEach(el => el.textContent = nombre);

  const menuHeader = document.getElementById("usuario-nombre-menu");
  if (menuHeader) menuHeader.textContent = nombre;

  const menuRol = document.getElementById("usuario-rol-menu");
  if (menuRol) menuRol.textContent = usuarioActivo.rol === "admin" ? "Administrador" : "Empleado";

  const menu = document.getElementById("usuario-menu");
  if (menu) menu.classList.add("hidden");

  const mobLabel = document.getElementById("mob-panel-usuario-nombre");
  if (mobLabel) mobLabel.textContent = nombre;
}

// Abre/cierra menú de usuario, posicionándolo según el botón que lo activó

  function toggleUsuarioMenu(btnId) {
  const menu = document.getElementById("usuario-menu");
  const btn = document.getElementById(btnId);
  const rect = btn.getBoundingClientRect();

  if (btnId === "btn-usuario") {
    menu.style.setProperty("left", (rect.right + 8) + "px", "important");
    menu.style.setProperty("right", "auto", "important");
    menu.style.setProperty("top", "auto", "important");
    menu.style.setProperty("bottom", (window.innerHeight - rect.bottom) + "px", "important");
    menu.style.setProperty("width", "200px", "important");
  } else {
    menu.style.setProperty("left", "auto", "important");
    menu.style.setProperty("right", (window.innerWidth - rect.right) + "px", "important");
    menu.style.setProperty("top", (rect.bottom + 8) + "px", "important");
    menu.style.setProperty("bottom", "auto", "important");
    menu.style.setProperty("width", "200px", "important");
  }

  menu.classList.toggle("hidden");
  menu.style.display = menu.classList.contains("hidden") ? "none" : "block";
}

// Cierra menú al hacer clic fuera
document.addEventListener("click", e => {
  if (!e.target.closest(".btn-usuario") && !e.target.closest(".usuario-menu")) {
    document.getElementById("usuario-menu").classList.add("hidden");
  }
});

// Abre modal para cambiar usuario (reutiliza el modal de bienvenida)
function abrirModalCambioUsuario() {
  document.getElementById("usuario-menu").style.display = "none";
  abrirModalBienvenida(true);
}

// Aplica UI de usuario al cargar
actualizarUIUsuario();

// ── Mobile: botón usuario en hamburguesa ──
// Agrega botón de usuario en menú hamburguesa (solo en mobile)
function initMobileUsuarioEnHam() {
  if (window.innerWidth >= 768) return;
  const sheet = document.getElementById("ham-sheet");
  if (!sheet || document.getElementById("ham-item-usuario")) return;

  const btn = document.createElement("button");
  btn.className = "ham-item";
  btn.id = "ham-item-usuario";
  btn.innerHTML = `
    <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z
           M4.501 20.118a7.5 7.5 0 0 1 14.998 0
           A17.933 17.933 0 0 1 12 21.75
           c-2.676 0-5.216-.584-7.499-1.632Z"/>
    </svg>
    <span class="usuario-nombre">—</span>`;
  btn.onclick = () => {
    cerrarMenuHamburguesa();
    toggleUsuarioMenu("btn-usuario-header");
  };

  const handle = sheet.querySelector(".ham-handle");
  handle.insertAdjacentElement("afterend", btn);
}

// Sincroniza nombre de usuario en el item de hamburguesa
function syncHamUsuarioNombre() {
  const span = document.getElementById("ham-usuario-nombre");
  const fuente = document.getElementById("usuario-nombre");
  if (span && fuente) span.textContent = fuente.textContent || "—";
}

// ── Mobile: toggle de filtros ──
// Agrega botón toggle para mostrar/ocultar filtros en mobile
function initFiltroToggleMobile() {
  if (window.innerWidth >= 768) return;
  const filterRow = document.querySelector(".po-filter-row");
  if (!filterRow || document.getElementById("po-filter-toggle-btn")) return;

  const btn = document.createElement("button");
  btn.id = "po-filter-toggle-btn";
  btn.className = "po-filter-toggle";
  btn.innerHTML = `⚙ Filtros <span class="toggle-arrow">▾</span>`;
  btn.onclick = () => {
    const abierto = filterRow.classList.toggle("abierto");
    btn.classList.toggle("activo", abierto);
  };

  filterRow.insertAdjacentElement("beforebegin", btn);
}

// ── Init ──
// Inicializa componentes al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  initMobileUsuarioEnHam();
  actualizarUIUsuario();
  initFiltroToggleMobile();
});

// Si el nombre de usuario se setea después del DOMContentLoaded,
// llamar syncHamUsuarioNombre() desde donde se actualice el nombre.