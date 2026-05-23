/**
 * ================================================================
 * ÍNDICE DE FUNCIONES (UTILS.JS)
 * ================================================================
 *
 * === FUNCIONES BÁSICAS ===
 * - fechaKey(d)                  → Convierte Date a string "YYYY-MM-DD"
 * - uid()                        → Genera ID único
 * - esc(v)                       → Escapa HTML para evitar XSS
 *
 * === CLIENTES ===
 * - normalizarCliente(raw)       → Normaliza nombre de cliente (detecta "cuba")
 * - esCuba(n)                    → Retorna true si el cliente es "cuba"
 *
 * === CATÁLOGO Y PRECIOS ===
 * - getPrecioCat(cat, tamano)    → Obtiene precio de catálogo según talle
 * - normalizarTipo(tipo)         → Normaliza tipo de producto ("sin_tacc"/"con_tacc")
 *
 * === CONSTANTES GLOBALES ===
 * - MESES                        → Array de meses abreviados
 * - DIAS_S                       → Array de días abreviados
 * - DIAS_FULL                    → Array de días completos
 * - TAMANIOS                     → Array de talles disponibles
 * - DIA_CLASES                   → Clases CSS por día (0=domingo)
 * - DIA_DOTS                     → Colores por día para dots de navegación
 *
 * === KEYBOARD NAVIGATION (selector y modal — legacy) ===
 * - selectorItems()              → Retorna items del selector de productos
 * - kbHighlight(idx)             → Resalta item en selector con teclado
 * - kbClearHighlight()           → Limpia resaltado del selector
 * - Eventos de teclado global    → Maneja flechas, Enter y Escape en selector/modal
 *
 * === KEYBOARD NAVIGATION (módulo extendido) ===
 *
 * [A] HELPERS
 *     - getFocusableEls(containerEl)  → Array de elementos focuseables
 *     - isFocusable(el)               → Boolean
 *     - focusFirst(containerEl)       → Foca el primer elemento focuseable
 *     - focusLast(containerEl)        → Foca el último elemento focuseable
 *     - announceToScreenReader(msg)   → Anuncia msg en aria-live (accesibilidad)
 *
 * [B] FOCUS TRAP
 *     - FocusTrap(containerEl)        → Clase: atrapa Tab/Shift+Tab dentro de un modal
 *     - focusTrap.activate()          → Activa la trampa y foca el primer elemento
 *     - focusTrap.deactivate()        → Desactiva y restaura el foco anterior
 *
 * [C] FOCUS RING VISIBLE
 *     - initFocusRing()               → Muestra outline solo con teclado (oculta con mouse)
 *
 * [D] NAVEGACIÓN EN LISTAS / GRILLAS
 *     - ListNav(containerEl, itemSelector, opts)
 *       opts.orientation: "vertical"|"horizontal"|"grid"
 *       opts.columns: número de columnas (solo para grid)
 *       opts.loop: boolean (¿flechas dan la vuelta?)
 *       opts.onSelect(el, idx): callback al presionar Enter/Space
 *     - listNav.mount()               → Registra listeners
 *     - listNav.unmount()             → Remueve listeners
 *     - listNav.focus(idx)            → Foca item por índice programáticamente
 *     - listNav.getIndex()            → Retorna índice activo
 *
 * [E] SHORTCUTS GLOBALES
 *     - KbShortcuts                   → Registro de atajos globales
 *     - KbShortcuts.add(key, handler, opts)
 *       opts.ctrl / opts.shift / opts.alt: boolean
 *       opts.description: string (para el panel de ayuda)
 *       opts.when: fn → boolean (condición de activación)
 *     - KbShortcuts.remove(key)       → Elimina un atajo
 *     - KbShortcuts.pause()           → Pausa todos los atajos
 *     - KbShortcuts.resume()          → Reanuda los atajos
 *
 * [F] PANEL DE AYUDA
 *     - KbHelpPanel.show()            → Muestra overlay con lista de atajos (tecla ?)
 *     - KbHelpPanel.hide()            → Cierra el panel
 *     - KbHelpPanel.toggle()          → Alterna visibilidad
 *
 * [G] ROVING TABINDEX (para grupos de botones/tabs)
 *     - RovingTabindex(containerEl, itemSelector, opts)
 *       opts.orientation: "horizontal"|"vertical"
 *       opts.loop: boolean
 *     - rovingTabindex.mount()
 *     - rovingTabindex.unmount()
 *     - rovingTabindex.setActive(idx)
 *
 * ================================================================
 * USO RÁPIDO (módulo extendido)
 * ================================================================
 *
 * // Focus trap en modal:
 * const trap = new FocusTrap(document.getElementById("mi-modal"));
 * trap.activate();   // al abrir
 * trap.deactivate(); // al cerrar
 *
 * // Navegación con flechas en una lista:
 * const nav = new ListNav(document.getElementById("mi-lista"), ".item", {
 *   orientation: "vertical", loop: true,
 *   onSelect: (el, idx) => el.click()
 * });
 * nav.mount();
 *
 * // Registrar atajo global:
 * KbShortcuts.add("n", () => abrirNuevoPedido(), { description: "Nuevo pedido" });
 * KbShortcuts.add("f", () => buscarInput.focus(), { ctrl: true, description: "Buscar" });
 *
 * // Panel de ayuda con "?":
 * KbShortcuts.add("?", () => KbHelpPanel.toggle(), { description: "Ver atajos" });
 *
 * ================================================================
 */

"use strict";

// ── FUNCIONES BÁSICAS ──

// Convierte Date a string "YYYY-MM-DD"
function fechaKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

// Genera ID único (timestamp + random)
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Escapa HTML para evitar XSS
function esc(v) {
  return (v || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

// ── CLIENTES ──

// Normaliza nombre de cliente (detecta "cuba" y lo convierte a minúscula)
function normalizarCliente(raw) {
  const s = (raw || "").trim().toLowerCase();
  return s.includes("cuba") ? "cuba" : raw.trim() || "";
}

// Retorna true si el cliente es "cuba"
function esCuba(n) {
  return (n || "").toLowerCase() === "cuba";
}

// ── CATÁLOGO Y PRECIOS ──

// Obtiene precio de catálogo según talle
function getPrecioCat(cat, tamano) {
  if (!cat) return 0;
  if (cat.tiene_talle && tamano) {
    const t = (tamano || '').toLowerCase();
    if (t === 'chico'   && cat.precio_chico   != null) return cat.precio_chico;
    if (t === 'mediano' && cat.precio_mediano  != null) return cat.precio_mediano;
    if (t === 'grande'  && cat.precio_grande   != null) return cat.precio_grande;
  }
  return cat.precio || 0;
}

// Normaliza tipo de producto ("sin_tacc"/"con_tacc")
// Unifica 'comun' (legacy) y 'con_tacc' (nuevo) → siempre devuelve 'con_tacc'
function normalizarTipo(tipo) {
  if (!tipo) return "";
  const t = tipo.trim().toLowerCase();
  if (t === "con_tacc" || t === "comun") return "con_tacc";
  if (t === "sin_tacc") return "sin_tacc";
  return t;
}

// ── CONSTANTES GLOBALES ──
const MESES     = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const DIAS_S    = ["dom","lun","mar","mié","jue","vie","sáb"];
const DIAS_FULL = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const TAMANIOS  = ["Chico","Mediano","Grande"];

// Colores por día (0=dom,1=lun,...,6=sab)
const DIA_CLASES = ["dpb-domingo","dpb-lunes","dpb-martes","dpb-miercoles","dpb-jueves","dpb-viernes","dpb-sabado"];
const DIA_DOTS   = ["#4b5563","#2563eb","#7c3aed","#ca8a04","#dc2626","#16a34a","#ea580c"];


// ── KEYBOARD NAVIGATION (selector y modal — legacy) ──
(function () {
  let _kbIdx = -1; // índice del item resaltado en la lista del selector

  // Retorna los items del selector de productos
  function selectorItems() {
    return Array.from(document.querySelectorAll("#selector-lista .selector-item"));
  }

  // Resalta un item en el selector
  function kbHighlight(idx) {
    const items = selectorItems();
    if (!items.length) return;
    _kbIdx = Math.max(0, Math.min(idx, items.length - 1));
    items.forEach((el, i) => el.classList.toggle("kb-focus", i === _kbIdx));
    items[_kbIdx].scrollIntoView({ block: "nearest" });
  }

  // Limpia el resaltado del selector
  function kbClearHighlight() {
    selectorItems().forEach(el => el.classList.remove("kb-focus"));
    _kbIdx = -1;
  }

  // ── Eventos de teclado global ──
  document.addEventListener("keydown", function (e) {
    const selectorAbierto = !document.getElementById("selector-overlay").classList.contains("hidden");
    const npAbierto = document.getElementById("tab-np-page").classList.contains("active");

    // ── ESC: cerrar lo que esté abierto ──
    if (e.key === "Escape") {
      if (selectorAbierto) {
        cerrarSelector();
        e.preventDefault();
        return;
      }
      if (npAbierto) {
        cerrarModalNP();
        e.preventDefault();
        return;
      }
    }

    // ── Dentro del selector de productos ──
    if (selectorAbierto) {
      const search = document.getElementById("selector-search");

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const items = selectorItems();
        if (!items.length) return;
        kbHighlight(_kbIdx < 0 ? 0 : _kbIdx + 1);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (_kbIdx > 0) kbHighlight(_kbIdx - 1);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const items = selectorItems();
        // Si hay un item resaltado con flechas, seleccionarlo
        if (_kbIdx >= 0 && items[_kbIdx]) {
          items[_kbIdx].click();
          return;
        }
        // Si no, seleccionar el primero de la lista
        if (items.length) {
          items[0].click();
          return;
        }
        // Si no hay items en lista pero sí texto → producto libre
        const q = (search.value || "").trim();
        if (q) {
          const libreBtn = document.querySelector("#selector-libre-wrap button:last-child");
          if (libreBtn && document.getElementById("selector-libre-wrap").style.display !== "none") {
            libreBtn.click();
          }
        }
        return;
      }
      // Cualquier letra redirige el foco al buscador
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && document.activeElement !== search) {
        search.focus();
      }
      return;
    }

    // ── Dentro del modal nuevo pedido ──
    if (npAbierto) {
      const diaIds = ["np-dia-hoy", "np-dia-man", "np-dia-otro"];
      if ((e.key === "Enter" || e.key === " ") && diaIds.includes(document.activeElement.id)) {
        e.preventDefault();
        document.activeElement.click();
        setTimeout(() => document.getElementById("np-tp-btn").focus(), 50);
        return;
      }
      // Enter en el selector de hora → abrirlo
      if (e.key === "Enter" && document.activeElement === document.getElementById("np-tp-btn")) {
        e.preventDefault();
        npOpenTimePicker();
        return;
      }
      // Enter en campo nombre → avanzar a agregar producto
      if (e.key === "Enter" && document.activeElement === document.getElementById("np-nombre")) {
        e.preventDefault();
        document.getElementById("np-prods-wrap").querySelector("button")
          ? document.getElementById("np-prods-wrap").querySelector("button").focus()
          : document.querySelector('.btn-add-prod[tabindex="7"]').focus();
        return;
      }
    }
  });

  // Agrega estilos para el item resaltado con teclado
  const style = document.createElement("style");
  style.textContent = `
    .selector-item.kb-focus {
      background: var(--accent-soft);
      outline: 2px solid var(--accent);
      outline-offset: -2px;
    }
  `;
  document.head.appendChild(style);
})();


// ════════════════════════════════════════════════════════════════
// KEYBOARD NAVIGATION — MÓDULO EXTENDIDO
// ════════════════════════════════════════════════════════════════

/* ─────────────────────────────────────────────────────────────
   [A] HELPERS
   ───────────────────────────────────────────────────────────── */

/**
 * Selectores de elementos que pueden recibir foco.
 * Excluye los que están deshabilitados o tienen tabindex="-1".
 */
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'details > summary',
  'audio[controls]',
  'video[controls]',
].join(', ');

/**
 * Retorna todos los elementos focuseables dentro de `containerEl`,
 * en orden de aparición en el DOM.
 * @param {Element} containerEl
 * @returns {Element[]}
 */
function getFocusableEls(containerEl) {
  return Array.from(containerEl.querySelectorAll(FOCUSABLE_SELECTORS)).filter(
    el => !el.closest('[hidden]') &&
          getComputedStyle(el).display !== 'none' &&
          getComputedStyle(el).visibility !== 'hidden'
  );
}

/**
 * Indica si un elemento puede recibir foco.
 * @param {Element} el
 * @returns {boolean}
 */
function isFocusable(el) {
  return el.matches(FOCUSABLE_SELECTORS) &&
    !el.closest('[hidden]') &&
    getComputedStyle(el).display !== 'none' &&
    getComputedStyle(el).visibility !== 'hidden';
}

/**
 * Foca el primer elemento focuseable dentro de `containerEl`.
 * @param {Element} containerEl
 * @returns {Element|null}
 */
function focusFirst(containerEl) {
  const els = getFocusableEls(containerEl);
  if (els.length) { els[0].focus(); return els[0]; }
  return null;
}

/**
 * Foca el último elemento focuseable dentro de `containerEl`.
 * @param {Element} containerEl
 * @returns {Element|null}
 */
function focusLast(containerEl) {
  const els = getFocusableEls(containerEl);
  if (els.length) { els[els.length - 1].focus(); return els[els.length - 1]; }
  return null;
}

/**
 * Anuncia un mensaje a lectores de pantalla mediante un nodo aria-live.
 * El nodo se crea automáticamente la primera vez.
 * @param {string} msg
 * @param {'polite'|'assertive'} priority
 */
function announceToScreenReader(msg, priority = 'polite') {
  let node = document.getElementById('_kb_live_region');
  if (!node) {
    node = document.createElement('div');
    node.id = '_kb_live_region';
    node.setAttribute('aria-live', priority);
    node.setAttribute('aria-atomic', 'true');
    Object.assign(node.style, {
      position: 'absolute', width: '1px', height: '1px',
      overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap',
    });
    document.body.appendChild(node);
  }
  node.setAttribute('aria-live', priority);
  // Reset y re-set para forzar el anuncio incluso con el mismo texto
  node.textContent = '';
  requestAnimationFrame(() => { node.textContent = msg; });
}


/* ─────────────────────────────────────────────────────────────
   [B] FOCUS TRAP
   ───────────────────────────────────────────────────────────── */

/**
 * Atrapa el foco dentro de un contenedor modal.
 * Tab / Shift+Tab ciclan solo entre los elementos focuseables del contenedor.
 *
 * @param {Element} containerEl  — el modal o panel a atrapar
 */
class FocusTrap {
  constructor(containerEl) {
    this._container = containerEl;
    this._prevFocus = null;
    this._handler   = this._onKeydown.bind(this);
    this._active    = false;
  }

  /** Activa la trampa y mueve el foco al primer elemento del contenedor. */
  activate() {
    if (this._active) return;
    this._prevFocus = document.activeElement;
    this._active = true;
    document.addEventListener('keydown', this._handler);
    focusFirst(this._container);
  }

  /**
   * Desactiva la trampa y devuelve el foco al elemento que lo tenía antes.
   * @param {boolean} restoreFocus — si false, no restaura el foco (default: true)
   */
  deactivate(restoreFocus = true) {
    if (!this._active) return;
    this._active = false;
    document.removeEventListener('keydown', this._handler);
    if (restoreFocus && this._prevFocus && isFocusable(this._prevFocus)) {
      this._prevFocus.focus();
    }
    this._prevFocus = null;
  }

  isActive() { return this._active; }

  _onKeydown(e) {
    if (e.key !== 'Tab') return;
    const focusable = getFocusableEls(this._container);
    if (!focusable.length) { e.preventDefault(); return; }

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      // Shift+Tab: si el foco está en el primero → saltar al último
      if (document.activeElement === first || !this._container.contains(document.activeElement)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab: si el foco está en el último → saltar al primero
      if (document.activeElement === last || !this._container.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    }
  }
}


/* ─────────────────────────────────────────────────────────────
   [C] FOCUS RING VISIBLE
   ───────────────────────────────────────────────────────────── */

/**
 * Inyecta estilos que muestran el outline de foco solo cuando el usuario
 * navega con teclado, y lo ocultan cuando usa el mouse.
 * Llama a esta función una sola vez al inicializar la app.
 */
function initFocusRing() {
  if (document.getElementById('_kb_focus_ring_style')) return; // ya inicializado

  const style = document.createElement('style');
  style.id = '_kb_focus_ring_style';
  style.textContent = `
    /* Oculta outline por defecto */
    :focus:not(:focus-visible) { outline: none !important; }

    /* Muestra outline elegante solo con teclado */
    :focus-visible {
      outline: 2px solid var(--accent, #2563eb) !important;
      outline-offset: 2px !important;
      border-radius: 3px;
    }

    /* Indicador de foco para items de lista navegables */
    [data-kb-item]:focus-visible {
      outline: 2px solid var(--accent, #2563eb) !important;
      outline-offset: -2px !important;
      background: var(--accent-soft, rgba(37,99,235,0.08)) !important;
    }
  `;
  document.head.appendChild(style);
}


/* ─────────────────────────────────────────────────────────────
   [D] NAVEGACIÓN EN LISTAS / GRILLAS
   ───────────────────────────────────────────────────────────── */

/**
 * Agrega navegación con flechas a una lista o grilla de items.
 *
 * @param {Element} containerEl      — el contenedor de la lista
 * @param {string}  itemSelector     — selector CSS de cada item
 * @param {object}  opts
 * @param {'vertical'|'horizontal'|'grid'} opts.orientation — default: "vertical"
 * @param {number}  opts.columns     — columnas (solo para grid), default: 1
 * @param {boolean} opts.loop        — ¿las flechas dan la vuelta?, default: true
 * @param {Function} opts.onSelect   — callback(el, idx) al presionar Enter/Space
 * @param {boolean} opts.homeEnd     — Home/End para ir al primero/último, default: true
 */
class ListNav {
  constructor(containerEl, itemSelector, opts = {}) {
    this._container = containerEl;
    this._selector  = itemSelector;
    this._opts = Object.assign({
      orientation: 'vertical',
      columns: 1,
      loop: true,
      onSelect: null,
      homeEnd: true,
    }, opts);
    this._idx     = -1;
    this._handler = this._onKeydown.bind(this);
    this._mounted = false;
  }

  /** @returns {Element[]} */
  _items() {
    return Array.from(this._container.querySelectorAll(this._selector));
  }

  /** Registra los listeners de teclado. */
  mount() {
    if (this._mounted) return;
    this._mounted = true;
    this._container.addEventListener('keydown', this._handler);
  }

  /** Remueve los listeners. */
  unmount() {
    if (!this._mounted) return;
    this._mounted = false;
    this._container.removeEventListener('keydown', this._handler);
  }

  /** Foca un item por índice. */
  focus(idx) {
    const items = this._items();
    if (!items.length) return;
    this._idx = Math.max(0, Math.min(idx, items.length - 1));
    items.forEach((el, i) => {
      el.setAttribute('tabindex', i === this._idx ? '0' : '-1');
    });
    items[this._idx].focus();
  }

  /** Retorna el índice del item activo. */
  getIndex() { return this._idx; }

  _move(delta) {
    const items = this._items();
    if (!items.length) return;
    let next = this._idx + delta;
    if (this._opts.loop) {
      next = ((next % items.length) + items.length) % items.length;
    } else {
      next = Math.max(0, Math.min(next, items.length - 1));
    }
    this.focus(next);
  }

  _moveGrid(deltaRow, deltaCol) {
    const items = this._items();
    const cols  = this._opts.columns;
    const row   = Math.floor(this._idx / cols);
    const col   = this._idx % cols;
    const maxRow = Math.floor((items.length - 1) / cols);

    let newRow = row + deltaRow;
    let newCol = col + deltaCol;

    if (this._opts.loop) {
      newRow = ((newRow % (maxRow + 1)) + (maxRow + 1)) % (maxRow + 1);
      newCol = ((newCol % cols) + cols) % cols;
    } else {
      newRow = Math.max(0, Math.min(newRow, maxRow));
      newCol = Math.max(0, Math.min(newCol, cols - 1));
    }

    const newIdx = Math.min(newRow * cols + newCol, items.length - 1);
    this.focus(newIdx);
  }

  _onKeydown(e) {
    const items = this._items();
    if (!items.length) return;

    // Inicializar idx si aún no se ha usado
    if (this._idx < 0) this._idx = 0;

    const o = this._opts.orientation;

    switch (e.key) {
      case 'ArrowDown':
        if (o === 'vertical' || o === 'grid') {
          e.preventDefault();
          o === 'grid' ? this._moveGrid(1, 0) : this._move(1);
        }
        break;
      case 'ArrowUp':
        if (o === 'vertical' || o === 'grid') {
          e.preventDefault();
          o === 'grid' ? this._moveGrid(-1, 0) : this._move(-1);
        }
        break;
      case 'ArrowRight':
        if (o === 'horizontal' || o === 'grid') {
          e.preventDefault();
          o === 'grid' ? this._moveGrid(0, 1) : this._move(1);
        }
        break;
      case 'ArrowLeft':
        if (o === 'horizontal' || o === 'grid') {
          e.preventDefault();
          o === 'grid' ? this._moveGrid(0, -1) : this._move(-1);
        }
        break;
      case 'Home':
        if (this._opts.homeEnd) { e.preventDefault(); this.focus(0); }
        break;
      case 'End':
        if (this._opts.homeEnd) { e.preventDefault(); this.focus(items.length - 1); }
        break;
      case 'Enter':
      case ' ':
        if (document.activeElement && items.includes(document.activeElement)) {
          e.preventDefault();
          if (typeof this._opts.onSelect === 'function') {
            this._opts.onSelect(document.activeElement, this._idx);
          }
        }
        break;
    }
  }
}


/* ─────────────────────────────────────────────────────────────
   [E] SHORTCUTS GLOBALES
   ───────────────────────────────────────────────────────────── */

/**
 * Registro centralizado de atajos de teclado globales.
 * Los atajos NO se disparan si el foco está en un input/textarea/select,
 * a menos que se especifique `opts.allowInInputs = true`.
 */
const KbShortcuts = (() => {
  const _shortcuts = new Map(); // key → { handler, opts }
  let _paused = false;

  function _normalizeKey(key, opts) {
    // Genera una clave única: "ctrl+shift+n"
    const parts = [];
    if (opts.ctrl)  parts.push('ctrl');
    if (opts.alt)   parts.push('alt');
    if (opts.shift) parts.push('shift');
    parts.push(key.toLowerCase());
    return parts.join('+');
  }

  function _isInInput() {
    const el = document.activeElement;
    if (!el) return false;
    return el.matches('input, textarea, select, [contenteditable]');
  }

  document.addEventListener('keydown', function(e) {
    if (_paused) return;

    const key = _normalizeKey(e.key, {
      ctrl:  e.ctrlKey  || e.metaKey,
      alt:   e.altKey,
      shift: e.shiftKey,
    });

    const entry = _shortcuts.get(key);
    if (!entry) return;

    const { handler, opts } = entry;

    // Si hay una condición y no se cumple, salir
    if (typeof opts.when === 'function' && !opts.when()) return;

    // Si el foco está en un input, saltar a menos que allowInInputs
    if (_isInInput() && !opts.allowInInputs) return;

    e.preventDefault();
    handler(e);
  });

  return {
    /**
     * Registra un atajo de teclado global.
     * @param {string}   key          — tecla, ej: "n", "Escape", "F2", "?"
     * @param {Function} handler      — función a ejecutar
     * @param {object}   opts
     * @param {boolean}  opts.ctrl
     * @param {boolean}  opts.alt
     * @param {boolean}  opts.shift
     * @param {string}   opts.description   — texto para el panel de ayuda
     * @param {Function} opts.when          — fn → boolean, condición de activación
     * @param {boolean}  opts.allowInInputs — activar aunque el foco esté en un input
     */
    add(key, handler, opts = {}) {
      const nk = _normalizeKey(key, opts);
      _shortcuts.set(nk, { handler, opts: Object.assign({ description: '' }, opts), rawKey: key });
      return this; // chaineable
    },

    /** Elimina un atajo por su clave (mismos modificadores que al registrarlo). */
    remove(key, opts = {}) {
      _shortcuts.delete(_normalizeKey(key, opts));
      return this;
    },

    /** Pausa todos los atajos globales (útil mientras se escribe en un buscador). */
    pause()  { _paused = true;  return this; },

    /** Reanuda los atajos. */
    resume() { _paused = false; return this; },

    /** Retorna un array de todos los atajos registrados (para el panel de ayuda). */
    list() {
      return Array.from(_shortcuts.entries()).map(([nk, v]) => ({
        combo:       nk,
        description: v.opts.description || '',
        rawKey:      v.rawKey,
      })).filter(s => s.description);
    },
  };
})();


/* ─────────────────────────────────────────────────────────────
   [F] PANEL DE AYUDA  (tecla "?")
   ───────────────────────────────────────────────────────────── */

/**
 * Panel de ayuda que lista todos los atajos de teclado registrados.
 * Se crea en el DOM la primera vez que se llama a show().
 * Usa esc() definida arriba en este mismo archivo.
 */
const KbHelpPanel = (() => {
  let _overlay = null;
  let _trap    = null;

  function _build() {
    _overlay = document.createElement('div');
    _overlay.id = '_kb_help_overlay';
    _overlay.setAttribute('role', 'dialog');
    _overlay.setAttribute('aria-modal', 'true');
    _overlay.setAttribute('aria-label', 'Atajos de teclado');
    _overlay.style.cssText = `
      position:fixed;inset:0;z-index:9999;
      background:rgba(0,0,0,.55);backdrop-filter:blur(3px);
      display:flex;align-items:center;justify-content:center;
      opacity:0;transition:opacity .18s;
    `;

    const box = document.createElement('div');
    box.style.cssText = `
      background:var(--bg, #fff);color:var(--text, #111);
      border-radius:12px;padding:28px 32px;min-width:320px;max-width:480px;
      max-height:80vh;overflow-y:auto;
      box-shadow:0 24px 60px rgba(0,0,0,.25);
      font-family:inherit;
    `;
    box.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
        <h2 style="margin:0;font-size:1.1rem;font-weight:700;">⌨️ Atajos de teclado</h2>
        <button id="_kb_help_close" aria-label="Cerrar"
          style="background:none;border:none;cursor:pointer;font-size:1.4rem;
                 line-height:1;color:inherit;padding:4px 8px;border-radius:6px;">×</button>
      </div>
      <table id="_kb_help_table" style="border-collapse:collapse;width:100%;font-size:.9rem;">
        <tbody id="_kb_help_tbody"></tbody>
      </table>
    `;
    _overlay.appendChild(box);
    document.body.appendChild(_overlay);

    _overlay.addEventListener('click', e => { if (e.target === _overlay) KbHelpPanel.hide(); });
    document.getElementById('_kb_help_close').addEventListener('click', () => KbHelpPanel.hide());
    _trap = new FocusTrap(_overlay);
  }

  function _render() {
    const tbody = document.getElementById('_kb_help_tbody');
    tbody.innerHTML = '';
    KbShortcuts.list().forEach(({ combo, description }) => {
      const tr = document.createElement('tr');
      // esc() viene de las funciones básicas definidas arriba
      tr.innerHTML = `
        <td style="padding:6px 0;width:40%;white-space:nowrap;">
          <kbd style="
            background:var(--accent-soft,#eff6ff);color:var(--accent,#2563eb);
            border:1px solid var(--accent,#2563eb);border-radius:5px;
            padding:2px 8px;font-size:.8rem;font-family:monospace;font-weight:600;
          ">${esc(combo.replace(/\+/g, ' + '))}</kbd>
        </td>
        <td style="padding:6px 0 6px 16px;color:var(--text,#444);">${esc(description)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  return {
    show() {
      if (!_overlay) _build();
      _render();
      _overlay.style.display = 'flex';
      requestAnimationFrame(() => { _overlay.style.opacity = '1'; });
      _trap.activate();
      announceToScreenReader('Panel de atajos de teclado abierto', 'assertive');
    },
    hide() {
      if (!_overlay) return;
      _overlay.style.opacity = '0';
      setTimeout(() => { if (_overlay) _overlay.style.display = 'none'; }, 180);
      _trap.deactivate();
    },
    toggle() {
      if (_overlay && _overlay.style.display !== 'none') this.hide();
      else this.show();
    },
  };
})();


/* ─────────────────────────────────────────────────────────────
   [G] ROVING TABINDEX
   ───────────────────────────────────────────────────────────── */

/**
 * Implementa el patrón "roving tabindex" para grupos de botones o tabs:
 * solo el item activo tiene tabindex="0"; los demás tienen tabindex="-1".
 * Flechas ←/→ o ↑/↓ mueven entre items.
 *
 * Diferencia con ListNav: RovingTabindex es para componentes tipo toolbar,
 * radio-group o tab-list donde Tab debe salir del grupo, no navegar dentro.
 *
 * @param {Element} containerEl
 * @param {string}  itemSelector
 * @param {object}  opts
 * @param {'horizontal'|'vertical'} opts.orientation — default: "horizontal"
 * @param {boolean} opts.loop — default: true
 */
class RovingTabindex {
  constructor(containerEl, itemSelector, opts = {}) {
    this._container = containerEl;
    this._selector  = itemSelector;
    this._opts = Object.assign({ orientation: 'horizontal', loop: true }, opts);
    this._activeIdx = 0;
    this._handler   = this._onKeydown.bind(this);
    this._mounted   = false;
  }

  _items() {
    return Array.from(this._container.querySelectorAll(this._selector));
  }

  mount() {
    if (this._mounted) return;
    this._mounted = true;
    this._applyTabindex();
    this._container.addEventListener('keydown', this._handler);
    // Cuando un item recibe foco por click, actualizar el índice activo
    this._items().forEach((el, i) => {
      el.addEventListener('focus', () => {
        this._activeIdx = i;
        this._applyTabindex();
      });
    });
  }

  unmount() {
    if (!this._mounted) return;
    this._mounted = false;
    this._container.removeEventListener('keydown', this._handler);
  }

  setActive(idx) {
    const items = this._items();
    if (!items.length) return;
    this._activeIdx = Math.max(0, Math.min(idx, items.length - 1));
    this._applyTabindex();
    items[this._activeIdx].focus();
  }

  _applyTabindex() {
    this._items().forEach((el, i) => {
      el.setAttribute('tabindex', i === this._activeIdx ? '0' : '-1');
    });
  }

  _move(delta) {
    const items = this._items();
    if (!items.length) return;
    let next = this._activeIdx + delta;
    if (this._opts.loop) {
      next = ((next % items.length) + items.length) % items.length;
    } else {
      next = Math.max(0, Math.min(next, items.length - 1));
    }
    this.setActive(next);
  }

  _onKeydown(e) {
    const fwd  = this._opts.orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const back = this._opts.orientation === 'horizontal' ? 'ArrowLeft'  : 'ArrowUp';

    if (e.key === fwd)  { e.preventDefault(); this._move(1);  }
    if (e.key === back) { e.preventDefault(); this._move(-1); }
    if (e.key === 'Home') { e.preventDefault(); this.setActive(0); }
    if (e.key === 'End')  { e.preventDefault(); this.setActive(this._items().length - 1); }
  }
}


/* ─────────────────────────────────────────────────────────────
   INICIALIZACIÓN AUTOMÁTICA
   ───────────────────────────────────────────────────────────── */

// Activa el focus ring visible apenas cargue el módulo
initFocusRing();

// Atajo para abrir el panel de ayuda con "?" (con Shift, como en teclado QWERTY)
KbShortcuts.add('?', () => KbHelpPanel.toggle(), {
  shift: true,
  description: 'Mostrar/ocultar ayuda de teclado',
});

// También sin Shift por si el layout del teclado no lo requiere
KbShortcuts.add('?', () => KbHelpPanel.toggle(), {
  description: 'Mostrar/ocultar ayuda de teclado',
});