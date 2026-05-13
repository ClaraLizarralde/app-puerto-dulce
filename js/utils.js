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
 * === KEYBOARD NAVIGATION (selector y modal) ===
 * - selectorItems()              → Retorna items del selector de productos
 * - kbHighlight(idx)             → Resalta item en selector con teclado
 * - kbClearHighlight()           → Limpia resaltado del selector
 * - Eventos de teclado global    → Maneja flechas, Enter y Escape en selector/modal
 * 
 * ================================================================
 */

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
    const t = (tamano || "").toLowerCase();
    if (t === "chico" && cat.precio_chico) return cat.precio_chico;
    if (t === "mediano" && cat.precio_mediano) return cat.precio_mediano;
    if (t === "grande" && cat.precio_grande) return cat.precio_grande;
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
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const DIAS_S = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const DIAS_FULL = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const TAMANIOS = ["Chico", "Mediano", "Grande"];

// Colores por día (0=dom,1=lun,...,6=sab)
const DIA_CLASES = ["dpb-domingo", "dpb-lunes", "dpb-martes", "dpb-miercoles", "dpb-jueves", "dpb-viernes", "dpb-sabado"];
const DIA_DOTS = ["#4b5563", "#2563eb", "#7c3aed", "#ca8a04", "#dc2626", "#16a34a", "#ea580c"];

// ── KEYBOARD NAVIGATION ──
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