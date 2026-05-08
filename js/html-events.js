/**
 * ================================================================
 * ÍNDICE DE FUNCIONES (HTML-EVENTS.JS)
 * ================================================================
 * 
 * === HELPERS INTERNOS ===
 * - onEnter(input, handler)       → Helper: ejecuta handler al presionar Enter en un input
 * 
 * === EVENTOS DOMContentLoaded ===
 * - Botón "limpiar buscador"      → Vacía el campo buscador y refresca pedidos
 * - Enter en input de materia prima (cuba-mp-input) → Llama a agregarItemMateriaPrima()
 * - Enter en input de catálogo (cat-input) → Llama a agregarProductoCatalogo()
 * - Cambio/input en np-dia-custom → Llama a npOnCustomDia()
 * - Input en np-hora-mobile       → Llama a npOnMobileTimeInput()
 * - Input en np-nombre            → Llama a npOnNombreInput()
 * - Blur en np-nombre             → Oculta autocompletado (con delay)
 * - Input en selector-search      → Llama a renderSelectorLista()
 * - Enter en piz-nota-input       → Llama a pizAgregarNota()
 * 
 * ================================================================
 */

(function () {
  // Helper: ejecuta handler al presionar Enter en un input
  function onEnter(input, handler) {
    if (!input) return;
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      handler();
    });
  }

  // Inicializa todos los eventos cuando el DOM está listo
  document.addEventListener("DOMContentLoaded", () => {
    // ── Botón limpiar buscador ──
    const clearBuscadorBtn = document.getElementById("btn-clear-buscador");
    if (clearBuscadorBtn) {
      clearBuscadorBtn.addEventListener("click", () => {
        const buscador = document.getElementById("buscador");
        if (buscador) buscador.value = "";
        if (typeof renderPedidos === "function") renderPedidos();
      });
    }

    // ── Enter en input de materia prima (Cuba) ──
    onEnter(document.getElementById("cuba-mp-input"), () => {
      if (typeof agregarItemMateriaPrima === "function") agregarItemMateriaPrima();
    });

    // ── Enter en input de catálogo ──
    onEnter(document.getElementById("cat-input"), () => {
      if (typeof agregarProductoCatalogo === "function") agregarProductoCatalogo();
    });

    // ── Día custom en nuevo pedido ──
    const npDiaCustom = document.getElementById("np-dia-custom");
    if (npDiaCustom) {
      const handler = () => {
        if (typeof npOnCustomDia === "function") npOnCustomDia();
      };
      npDiaCustom.addEventListener("change", handler);
      npDiaCustom.addEventListener("input", handler);
    }

    // ── Hora mobile en nuevo pedido ──
    const npHoraMobile = document.getElementById("np-hora-mobile");
    if (npHoraMobile) {
      npHoraMobile.addEventListener("input", () => {
        if (typeof npOnMobileTimeInput === "function") npOnMobileTimeInput(npHoraMobile.value);
      });
    }

    // ── Autocompletado de nombre en nuevo pedido ──
    const npNombre = document.getElementById("np-nombre");
    if (npNombre) {
      npNombre.addEventListener("input", () => {
        if (typeof npOnNombreInput === "function") npOnNombreInput();
      });
      npNombre.addEventListener("blur", () => {
        setTimeout(() => {
          if (!window._npSeleccionandoAutocomp && typeof npOcultarAutocomp === "function") {
            npOcultarAutocomp();
          }
        }, 200);
      });
    }

    // ── Búsqueda en selector de productos ──
    const selectorSearch = document.getElementById("selector-search");
    if (selectorSearch) {
      selectorSearch.addEventListener("input", () => {
        if (typeof renderSelectorLista === "function") renderSelectorLista();
      });
    }

    // ── Enter en input de nota del pizarrón ──
    onEnter(document.getElementById("piz-nota-input"), () => {
      if (typeof pizAgregarNota === "function") pizAgregarNota();
    });
  });
})();