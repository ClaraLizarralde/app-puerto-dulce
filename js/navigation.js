/**
 * ================================================================
 * navigation.js — NAVEGACIÓN, MENÚS Y PANELES MÓVILES
 * ================================================================
 *
 * === UI Y MENÚS ===
 * - abrirMenuHamburguesa()        → Abre el menú lateral hamburguesa
 * - cerrarMenuHamburguesa()       → Cierra el menú hamburguesa
 * - selectMobileSubtab(parent, id, el) → Maneja selección de subtabs en móviles (legacy)
 *
 * === MOBILE FLOATING SUBTAB PANEL ===
 * - cerrarMobPanel()              → Cierra el panel flotante móvil activo
 * - abrirMobPanel(key, tabEl)     → Abre el panel flotante móvil para la key indicada
 * - mobPanelPick(parent, id)      → Ejecuta la acción al elegir un ítem dentro del panel
 * - toggleMobMas(el)              → Alterna el panel "Más" en el bottom bar móvil
 *
 * === TABS PRINCIPALES ===
 * - showTab(id, el)               → Activa un tab principal y gestiona subtabs/paneles
 *
 * === FUNCIONES EXTERNAS REFERENCIADAS (definidas en otros archivos) ===
 * - isMobileLayout()              → Detecta si el layout es móvil               [data.js]
 * - showProdTab(id, el)           → Muestra pestaña de producción               [produccion.js]
 * - showCubaTab(id, el)           → Muestra pestaña de local Cuba               [cuba.js]
 * - showCfgTab(id, el)            → Muestra pestaña de configuración            [config.js]
 * - renderCuba()                  → Renderiza la vista del local Cuba            [cuba.js]
 * - renderEtiquetas()             → Renderiza la vista de etiquetas              [etiquetas.js]
 * - abrirModalCambioUsuario()     → Abre el modal de cambio de usuario          [data.js]
 * - abrirPizarron()               → Abre la vista del pizarrón                  [pizarron.js]
 * - _prodTabActiva                → Variable con el tab de producción activo     [produccion.js]
 *
 * ================================================================
 */

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

/* ================================================================
   MOBILE FLOATING SUBTAB PANEL
================================================================ */

// Variable para rastrear qué panel está abierto
let _mobPanelActivo = null;

// ────────────────────────────────────────────────────────────────
// FUNCIÓN: cerrarMobPanel
// Descripción: Cierra el panel flotante móvil activo y quita el backdrop.
// ────────────────────────────────────────────────────────────────
function cerrarMobPanel() {
  if (_mobPanelActivo) {
    document.getElementById('mob-panel-' + _mobPanelActivo)?.classList.remove('open');
    // Quitar highlight del tab
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('panel-open'));
  }
  document.getElementById('mob-panel-backdrop')?.classList.remove('open');
  _mobPanelActivo = null;
}

// ────────────────────────────────────────────────────────────────
// FUNCIÓN: abrirMobPanel
// Descripción: Abre el panel flotante móvil para la key indicada.
//              Si el mismo panel ya está abierto, lo cierra (toggle).
// ────────────────────────────────────────────────────────────────
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

// ────────────────────────────────────────────────────────────────
// FUNCIÓN: mobPanelPick
// Descripción: Cierra el panel móvil y ejecuta la acción correspondiente
//              al ítem seleccionado dentro del panel.
// ────────────────────────────────────────────────────────────────
function mobPanelPick(parent, id) {
  cerrarMobPanel();

  if (parent === 'produccion') {
    showProdTab(id, document.getElementById('prodtab-' + id));
  } else if (parent === 'cuba') {
    showCubaTab(id, document.getElementById('cubatab-' + id));
  } else if (parent === 'mas') {
    if (id === 'usuario') {
      abrirModalCambioUsuario();
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

/* ================================================================
   TAB PRINCIPAL
================================================================ */

// ────────────────────────────────────────────────────────────────
// FUNCIÓN: showTab
// Descripción: Activa un tab principal, gestiona subtabs en desktop/tablet
//              y abre paneles flotantes en móvil para produccion/cuba.
// ────────────────────────────────────────────────────────────────
function showTab(id, el) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + id)?.classList.add('active');

  const tabEl = el || document.querySelector(`.tab[data-title="${id}"]`)
             || document.querySelector(`.tab[onclick*="'${id}'"]`);
  if (tabEl) tabEl.classList.add('active');

  if (id === 'produccion') renderProduccion();
  if (id === 'cuba') renderCuba();
  if (id === 'config') {
    const activePanel = document.querySelector('.cfg-panel.active');
    const activePanelId = activePanel ? activePanel.id.replace('cfgpanel-', '') : 'catalogo';
    showCfgTab(activePanelId, document.getElementById('cfgtab-' + activePanelId));
  }

  const isMobile = isMobileLayout();
  if (isMobile) {
    if (id === 'produccion' || id === 'cuba') {
      abrirMobPanel(id, el);
      return;
    }
  }

  // Desktop/tablet: subtabs
  const subtabGroup = document.getElementById('sidebar-subtabs-' + id);
  const yaEstabaVisible = subtabGroup?.classList.contains('visible');

  document.querySelectorAll('.sidebar-subtabs').forEach(s => s.classList.remove('visible'));

  if (subtabGroup && !yaEstabaVisible) {
    const sidebar = document.querySelector('.tabs');
    const isMedium = window.innerWidth <= 1024;
    const isCollapsed = isMedium
      ? !sidebar.classList.contains('expanded')
      : sidebar.classList.contains('collapsed');

    if (isCollapsed) {
      if (isMedium) {
        sidebar.classList.add('expanded');
      } else {
        sidebar.classList.remove('collapsed');
      }
    }

    subtabGroup.classList.add('visible');
    document.querySelector('.tabs-list').classList.add('has-subtabs-open');
  } else {
    document.querySelector('.tabs-list').classList.remove('has-subtabs-open');
  }
}

// ────────────────────────────────────────────────────────────────
// FUNCIÓN: toggleMobMas
// Descripción: Alterna el panel "Más" en el bottom bar móvil.
//              En desktop funciona como fallback abriendo el menú hamburguesa.
// Uso en HTML: onclick="toggleMobMas(this)"
// ────────────────────────────────────────────────────────────────
function toggleMobMas(el) {
  const isMobile = isMobileLayout();
  if (isMobile) {
    abrirMobPanel('mas', el);
  } else {
    abrirMenuHamburguesa(); // fallback desktop por si acaso
  }
}