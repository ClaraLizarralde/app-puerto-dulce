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

// Toggle visual Cliente ↔ Cuba (el JS real de npToggleCuba() sigue igual en pedidos.js)
// Solo sincroniza el estado visual del botón nuevo
const _origToggleCuba = window.npToggleCuba;
window.npToggleCuba = function() {
  _origToggleCuba && _origToggleCuba();
  // Después del toggle, leer si quedó en modo cuba o no
  requestAnimationFrame(() => {
    const badge = document.getElementById('np-cuba-badge');
    const esCuba = badge && badge.style.display !== 'none';
    document.getElementById('np-btn-cuba')?.classList.toggle('active', esCuba);
    document.getElementById('np-btn-cliente-toggle')?.classList.toggle('active', !esCuba);
    document.getElementById('np-campo-tel').style.display = esCuba ? 'none' : 'flex';
  });
};

function npModoCliente() {
  // Si estamos en Cuba, volver a cliente llamando el toggle original
  const badge = document.getElementById('np-cuba-badge');
  const esCuba = badge && badge.style.display !== 'none';
  if (esCuba) window.npToggleCuba();
}

(function(){

  /* — Toggle Cliente / Cuba (sincroniza UI nueva con lógica existente) — */
  var _origToggleCuba = null;

  function hookToggleCuba() {
    if (window.npToggleCuba && !_origToggleCuba) {
      _origToggleCuba = window.npToggleCuba;
      window.npToggleCuba = function() {
        _origToggleCuba();
        requestAnimationFrame(syncCubaUI);
      };
    }
  }

  function syncCubaUI() {
    var badge   = document.getElementById('np-cuba-badge');
    var esCuba  = badge && badge.style.display !== 'none';
    var btnCuba = document.getElementById('np-btn-cuba');
    var btnCli  = document.getElementById('np-btn-cliente-ui');
    var filaNom = document.getElementById('np-fila-nombre');
    var filaTel = document.getElementById('np-campo-tel');

    if (btnCuba) {
      btnCuba.classList.toggle('active-cuba', !!esCuba);
      btnCuba.classList.remove('active-cliente');
    }
    if (btnCli) {
      btnCli.classList.toggle('active-cliente', !esCuba);
      btnCli.classList.remove('active-cuba');
    }
    if (filaNom) filaNom.style.display = esCuba ? 'none' : '';
    if (filaTel) filaTel.style.display = esCuba ? 'none' : '';
  }

  window.npUiModoCliente = function() {
    var badge  = document.getElementById('np-cuba-badge');
    var esCuba = badge && badge.style.display !== 'none';
    if (esCuba) {
      hookToggleCuba();
      window.npToggleCuba();
    }
  };

  /* — Estado pill — */
  window.npUiToggleEstado = function() {
    var wrap = document.getElementById('np-estado-wrap');
    if (!wrap) return;
    var open = wrap.style.display !== 'none';
    wrap.style.display = open ? 'none' : 'block';
    var pill = document.getElementById('np-opt-estado');
    if (pill) pill.classList.toggle('active', !open);
  };

  /* Actualiza el label del pill de estado cuando pedidos.js cambia el estado */
  var _origNpSelEstado = null;
  function hookSelEstado() {
    if (window.npSelEstado && !_origNpSelEstado) {
      _origNpSelEstado = window.npSelEstado;
      window.npSelEstado = function(val, el) {
        _origNpSelEstado(val, el);
        var labels = { pendiente:'⏳ Pendiente', prod:'🔧 En producción', listo:'✅ Listo', entregado:'📦 Retirado' };
        var pill = document.getElementById('np-opt-estado');
        if (pill) pill.textContent = labels[val] || '⏳ Pendiente';
      };
    }
  }

  /* — Nota pill — */
  window.npUiToggleNota = function() {
    var wrap = document.getElementById('np-nota-wrap');
    if (!wrap) return;
    var open = wrap.style.display !== 'none';
    wrap.style.display = open ? 'none' : 'block';
    var pill = document.getElementById('np-nota-btn');
    if (pill) pill.classList.toggle('active', !open);
  };

  /* — Pago pill — */
  var _origNpTogglePago = null;
  function hookTogglePago() {
    if (window.npTogglePago && !_origNpTogglePago) {
      _origNpTogglePago = window.npTogglePago;
      window.npTogglePago = function() {
        var pagoWrap = document.getElementById('np-campo-pago');
        if (pagoWrap) pagoWrap.style.display = 'block';
        _origNpTogglePago();
        requestAnimationFrame(function(){
          var bar  = document.getElementById('np-pago-bar');
          var pill = document.getElementById('np-opt-pago');
          if (pill && bar) {
            var pagado = !bar.classList.contains('no');
            pill.classList.toggle('active', pagado);
            pill.textContent = pagado ? '💳 Pago confirmado' : '💳 Confirmar pago';
          }
        });
      };
    }
  }

  /* — Hook en cuanto los scripts de la app estén listos — */
  function initHooks() {
    hookToggleCuba();
    hookSelEstado();
    hookTogglePago();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHooks);
  } else {
    setTimeout(initHooks, 0);
  }

  /* Re-hook si la app se recarga dinámicamente */
  document.addEventListener('npPageReady', initHooks);

})();

/* ══════════════════════════════
   INLINE PRODUCT SEARCH — NP
   ══════════════════════════════ */

window.npSearchProdSelectByName = function(nombre, tacc) {
  const tipo = tacc === 's' ? 'sin_tacc' : 'con_tacc';
  const cat = (datos.catalogo || []).find(c =>
    c.nombre === nombre && c.tipo === tipo
  );
  if (!cat) return;
  if (!_npPedido) _npPedido = { id: '__np__', productos: [] };
  _npPedido.productos.push(crearProductoBase({
    nombre: cat.nombre,
    tipo: 'catalogo',
    tacc,
  }));
  npRenderProds();
  npSearchProdClear();
};