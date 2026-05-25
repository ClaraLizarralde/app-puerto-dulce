/**
 * ================================================================
 * ÍNDICE DE FUNCIONES (CONFIG.JS)
 * ================================================================
 * 
 * === CLIENTES FRECUENTES ===
 * - guardarFrecuente()            → Guarda nuevo cliente frecuente (o actualiza teléfono)
 * - eliminarFrecuente(id)         → Elimina cliente frecuente con confirmación
 * - editarFrecuente(id)           → Toggle panel de edición inline de cliente
 * - guardarEditFrecuente(id)      → Guarda cambios de cliente editado
 * - exportarClientesCSV()         → Exporta clientes frecuentes a CSV
 * - importarClientesCSV(input)    → Importa clientes desde CSV
 * - renderFrecuentes()            → Renderiza lista de clientes frecuentes
 * 
 * === CATÁLOGO DE PRODUCTOS ===
 * - selCatTipo(tipo)              → Cambia filtro de tipo (sin TACC / con TACC)
 * - toggleCatTalle()              → Activa/desactiva campo de talle en agregar producto
 * - agregarProductoCatalogo()     → Agrega nuevo producto al catálogo
 * - eliminarProductoCatalogo(nombre, tipo) → Elimina producto con confirmación
 * - editarPrecioCatalogo(nombre, tipo, nuevo) → Actualiza precio de producto
 * - renderCatalogo()              → Renderiza lista completa del catálogo
 * - renderGrupoCat(items, tacc)   → Helper: renderiza grupo de productos por categoría
 * 
 * === SUBPESTAÑAS DE CONFIGURACIÓN ===
 * - showCfgTab(id, el)            → Cambia entre paneles de configuración
 * 
 * === TEMAS (THEMES) ===
 * - setTema(tema)                 → Cambia tema visual de la app (default, girly, neon, pro, dark, pooh)
 * 
 * === LAYOUT (barra lateral) ===
 * - setLayout(layout)             → Cambia layout (horizontal/vertical)
 * - toggleSidebarCollapse()       → Colapsa/expande barra lateral (desktop/tablet)
 * - applySidebarCollapseState()   → Aplica estado guardado de colapso según dispositivo
 * 
 * === LOCALES / SUCURSALES ===
 * - renderBotonesLocales(contenedorId, onSelect) → Renderiza botones de selección de local
 * - setLocal(id)                  → Cambia local activo y guarda en datos
 * - mostrarSetupLocal()           → Abre modal de bienvenida para setup inicial
 * - renderCfgLocal()              → Renderiza panel de configuración del local actual
 * 
 * === HORARIOS ===
 * - renderHorariosEditor()        → Renderiza editor de horarios por día de la semana
 * - toggleDiaCerrado(dia, abierto) → Marca/desmarca día como cerrado
 * - actualizarHorario(dia, campo, valor) → Actualiza hora de apertura/cierre
 * - actualizarCorteHoy(valor)     → Actualiza hora límite para pedidos del mismo día
 * - actualizarHoraLlegadaCuba(valor) → Actualiza hora de llegada de Cuba
 * - mostrarToastHorario()         → Muestra toast de confirmación de horario
 * 
 * ================================================================
 */

// ── CLIENTES FRECUENTES ──
// Guarda nuevo cliente frecuente (o actualiza teléfono si ya existe)
function guardarFrecuente() {
  const nom = (document.getElementById("frec-nom-input").value || "").trim();
  const tel = (document.getElementById("frec-tel-input").value || "").trim();
  if (!nom) return;
  const existe = datos.clientes.find(c => c.nombre.toLowerCase() === nom.toLowerCase());
  if (existe) {
    existe.tel = tel || existe.tel;
    guardar();
    renderFrecuentes();
    return;
  }
  datos.clientes.push({ id: uid(), nombre: nom, tel, frecuente: true });
  document.getElementById("frec-nom-input").value = "";
  document.getElementById("frec-tel-input").value = "";
  guardar();
  renderFrecuentes();
}

// Elimina cliente frecuente con confirmación
function eliminarFrecuente(id) {
  abrirModalGen("¿Eliminar cliente?", "Se eliminará de la lista de frecuentes.", () => {
    datos.clientes = datos.clientes.filter(c => c.id !== id);
    guardar();
    renderFrecuentes();
  }, "danger");
}

// Toggle panel de edición inline de cliente
function editarFrecuente(id) {
  const existing = document.getElementById("frec-edit-" + id);
  if (existing) { existing.classList.toggle("open"); return; }
}

// Guarda cambios de cliente editado
function guardarEditFrecuente(id) {
  const c = datos.clientes.find(x => x.id === id);
  if (!c) return;
  const nom = (document.getElementById("frec-edit-nom-" + id).value || "").trim();
  const tel = (document.getElementById("frec-edit-tel-" + id).value || "").trim();
  if (!nom) return;
  c.nombre = nom;
  c.tel = tel;
  guardar();
  renderFrecuentes();
}

// Exporta clientes frecuentes a CSV
function exportarClientesCSV() {
  const frecs = datos.clientes.filter(c => !esCuba(c.nombre));
  if (!frecs.length) { alert("No hay clientes frecuentes para exportar."); return; }
  const rows = ["\uFEFFNombre,Teléfono"];
  frecs.forEach(c => rows.push(`"${(c.nombre || "").replace(/"/g, '""')}","${(c.tel || "").replace(/"/g, '""')}"`));
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" }));
  a.download = "clientes_puerto_dulce.csv";
  a.click();
}

// Importa clientes desde CSV
function importarClientesCSV(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const lines = e.target.result.replace(/\r/g, "").split("\n").filter(Boolean);
    const dataLines = lines[0].toLowerCase().includes("nombre") ? lines.slice(1) : lines;
    const nuevos = [];
    dataLines.forEach(line => {
      const parts = line.match(/(".*?"|[^,]+)(?=,|$)/g) || [];
      const nombre = (parts[0] || "").replace(/^"|"$/g, "").trim();
      const tel = (parts[1] || "").replace(/^"|"$/g, "").trim();
      if (!nombre) return;
      nuevos.push({ nombre, tel });
    });
    if (!nuevos.length) { alert("No se encontraron clientes válidos en el archivo."); return; }
    let agregados = 0;
    nuevos.forEach(({ nombre, tel }) => {
      const existe = datos.clientes.find(c => c.nombre.toLowerCase() === nombre.toLowerCase());
      if (!existe) {
        datos.clientes.push({ id: uid(), nombre, tel, frecuente: true });
        agregados++;
      }
    });
    guardar();
    renderFrecuentes();
    alert(`✓ ${agregados} clientes importados (${nuevos.length - agregados} ya existían).`);
  };
  reader.readAsText(file, "utf-8");
  input.value = "";
}

// Renderiza lista de clientes frecuentes
function renderFrecuentes() {
  const wrap = document.getElementById("frec-lista-wrap");
  if (!wrap) return;
  const frecs = datos.clientes.filter(c => !esCuba(c.nombre));
  if (!frecs.length) {
    wrap.innerHTML = '<div class="vacio">Sin clientes frecuentes aún.</div>';
    return;
  }
  wrap.innerHTML = frecs.map(c => `
    <div>
      <div class="frec-item">
        <span class="frec-star">⭐</span>
        <span class="frec-nom">${esc(c.nombre)}</span>
        <span class="frec-tel">${esc(c.tel || "—")}</span>
        <button style="font-size:.65rem;padding:3px 8px;border:1.5px solid var(--border);border-radius:6px;background:transparent;color:var(--ink-mid);cursor:pointer;font-family:'Outfit',sans-serif;" onclick="document.getElementById('frec-edit-${c.id}').classList.toggle('open')">Editar</button>
        <button class="btn-cat-del" onclick="eliminarFrecuente('${c.id}')">✕</button>
      </div>
      <div class="frec-edit-wrap" id="frec-edit-${c.id}">
        <div style="font-size:.62rem;color:var(--ink-light);margin-bottom:4px;">Editar datos:</div>
        <div class="frec-edit-row">
          <input type="text" id="frec-edit-nom-${c.id}" value="${esc(c.nombre)}" placeholder="Nombre...">
          <input type="tel" id="frec-edit-tel-${c.id}" value="${esc(c.tel || "")}" placeholder="Teléfono...">
          <button style="font-family:'Outfit',sans-serif;font-size:.72rem;padding:6px 11px;border:none;border-radius:6px;background:var(--green);color:#fff;cursor:pointer;" onclick="guardarEditFrecuente('${c.id}')">Guardar</button>
        </div>
      </div>
    </div>
  `).join("");
}

// ── CATÁLOGO ──
let _catTalleOnState = true;

// Cambia filtro de tipo (sin TACC / con TACC)
function selCatTipo(tipo) {
  _catTipo = tipo;
  document.getElementById("cat-tipo-sin").className = tipo === "sin_tacc" ? "sel-sin" : "";
  document.getElementById("cat-tipo-com").className = tipo === "con_tacc" ? "sel-com" : "";
}

// Activa/desactiva campo de talle en agregar producto
function toggleCatTalle() {
  _catTalleOnState = !_catTalleOnState;
  document.getElementById("cat-talle-toggle-wrap").className = "cat-tiene-talle" + (_catTalleOnState ? " on" : "");
}

// Agrega nuevo producto al catálogo
function agregarProductoCatalogo() {
  const inp = document.getElementById("cat-input");
  const nombre = inp.value.trim();
  if (!nombre) return;
  const precioRaw = document.getElementById("cat-precio-input").value;
  const precio = parseFloat(precioRaw) || 0;
  if (datos.catalogo.some(c => c.nombre.toLowerCase() === nombre.toLowerCase() && c.tipo === _catTipo)) {
    alert("Ya existe ese producto en el catálogo.");
    return;
  }
  const catSel = document.getElementById("cat-categoria-input");
  const categoria = catSel ? catSel.value : "otros";
  datos.catalogo.push({ nombre, tipo: _catTipo, tiene_talle: _catTalleOnState, precio, categoria });
  inp.value = "";
  document.getElementById("cat-precio-input").value = "";
  guardar();
  renderCatalogo();
}

// Elimina producto con confirmación
function eliminarProductoCatalogo(nombre, tipo) {
  abrirModalGen("¿Eliminar producto?", `"${nombre}" se eliminará del catálogo.`, () => {
    datos.catalogo = datos.catalogo.filter(c => !(c.nombre === nombre && c.tipo === tipo));
    guardar();
    renderCatalogo();
  }, "danger");
}

// Actualiza precio de producto
function editarPrecioCatalogo(nombre, tipo, nuevo) {
  const cat = datos.catalogo.find(c => c.nombre === nombre && c.tipo === tipo);
  if (cat) {
    cat.precio = parseFloat(nuevo) || 0;
    guardar();
  }
}

// Renderiza lista completa del catálogo
function renderCatalogo() {
  const wrap = document.getElementById("catalogo-lista");
  wrap.innerHTML = "";
  if (!datos.catalogo.length) {
    wrap.innerHTML = '<div class="vacio">Catálogo vacío.</div>';
    return;
  }

  function precioStr(c) {
    if (c.tiene_talle) {
      const partes = [];
      if (c.precio_chico) partes.push(`Ch $${c.precio_chico.toLocaleString("es-AR")}`);
      if (c.precio_mediano) partes.push(`Med $${c.precio_mediano.toLocaleString("es-AR")}`);
      if (c.precio_grande) partes.push(`Gr $${c.precio_grande.toLocaleString("es-AR")}`);
      return partes.length ? `<span class="cat-item-precio">${partes.join(" · ")}</span>` : "";
    }
    return c.precio ? `<span class="cat-item-precio">$${c.precio.toLocaleString("es-AR")}</span>` : "";
  }

  function renderGrupoCat(items, tacc) {
    const porCat = {};
    items.forEach(c => {
      const cat = c.categoria && CAT_ORDEN.includes(c.categoria) ? c.categoria : "otros";
      if (!porCat[cat]) porCat[cat] = [];
      porCat[cat].push(c);
    });
    CAT_ORDEN.forEach(cat => {
      if (!porCat[cat]) return;
      const lbl = document.createElement("div");
      lbl.className = "cat-section-label";
      lbl.textContent = (tacc === "s" ? "🌿 ST · " : "🌾 C · ") + CAT_LABELS[cat];
      wrap.appendChild(lbl);
      porCat[cat].sort((a, b) => a.nombre.localeCompare(b.nombre)).forEach(c => {
        const d = document.createElement("div");
        d.className = "cat-item-row";
        const pill = tacc === "s" ? '<span class="tacc-pill s">ST</span>' : '<span class="tacc-pill c">C</span>';
        d.innerHTML = `<span class="cat-item-nombre">${esc(c.nombre)}</span>${precioStr(c)}<div class="cat-item-flags">${c.tiene_talle ? '<span class="cat-flag tam">talle</span>' : ""}${pill}</div><button class="btn-cat-del" onclick="eliminarProductoCatalogo('${esc(c.nombre)}','${c.tipo}')">✕</button>`;
        wrap.appendChild(d);
      });
    });
  }

  const sin = datos.catalogo.filter(c => c.tipo === "sin_tacc");
  const com = datos.catalogo.filter(c => c.tipo === "con_tacc");
  if (sin.length) renderGrupoCat(sin, "s");
  if (com.length) renderGrupoCat(com, "c");
}

// ── CONFIG SUBPESTAÑAS ──
// Cambia entre paneles de configuración
function showCfgTab(id, el) {
  document.querySelectorAll(".cfg-tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".cfg-panel").forEach(p => p.classList.remove("active"));
  if (el) el.classList.add("active");
  const panel = document.getElementById("cfgpanel-" + id);
  if (panel) panel.classList.add("active");
  if (id === "clientes") renderFrecuentes();
  if (id === "catalogo") renderCatalogo();
  if (id === "archivos") renderArchivadosGlobal();
  if (id === "local") renderCfgLocal();

  document.querySelectorAll("#sidebar-subtabs-config .sidebar-subtab")
    .forEach(b => b.classList.remove("active"));
  const ssBtn = document.getElementById("ss-cfgtab-" + id);
  if (ssBtn) ssBtn.classList.add("active");
}

// ── TEMAS ──
// Cambia tema visual de la app (default, girly, neon, pro, dark, pooh)
function setTema(tema) {
  const temas = ["default", "girly", "neon", "pro", "dark", "pooh"];
  const html = document.documentElement;
  if (tema === "default") {
    html.removeAttribute("data-theme");
  } else {
    html.setAttribute("data-theme", tema);
  }
  localStorage.setItem("pd_tema", tema);
  temas.forEach(t => {
    const btn = document.getElementById("tema-btn-" + t);
    if (btn) btn.classList.toggle("activo", t === tema);
  });
}
(function () {
  const t = localStorage.getItem("pd_tema") || "default";
  setTema(t);
})();

// ── LAYOUT (horizontal / vertical) ──
// Cambia layout (horizontal/vertical)
function setLayout(layout) {
  const body = document.body;
  const btnH = document.getElementById("layout-btn-horizontal");
  const btnV = document.getElementById("layout-btn-vertical");
  if (layout === "vertical") {
    body.classList.add("layout-vertical");
    if (btnH) btnH.classList.remove("activo");
    if (btnV) btnV.classList.add("activo");
  } else {
    body.classList.remove("layout-vertical");
    if (btnH) btnH.classList.add("activo");
    if (btnV) btnV.classList.remove("activo");
  }
  applySidebarCollapseState();
  localStorage.setItem("pd_layout", layout);
}
document.addEventListener("DOMContentLoaded", function () {
  const l = localStorage.getItem("pd_layout") || "horizontal";
  setLayout(l);
});

// Colapsa/expande barra lateral (desktop/tablet)
function toggleSidebarCollapse() {
  const tabs = document.getElementById("main-tabs");
  if (!tabs) return;

  const isTabletLandscape = window.matchMedia(
    "(min-width: 768px) and (max-width: 1024px) and (orientation: landscape)"
  ).matches;

  if (isTabletLandscape) {
    const next = tabs.classList.contains("expanded");
    localStorage.setItem("pd_sidebar_expanded", next ? "0" : "1");
  } else {
    const next = !tabs.classList.contains("collapsed");
    localStorage.setItem("pd_sidebar_collapsed", next ? "1" : "0");
  }

  applySidebarCollapseState();

  const menu = document.getElementById("usuario-menu");
  if (menu) menu.style.display = "none";
}

// Aplica estado guardado de colapso según dispositivo
function applySidebarCollapseState() {
  const tabs = document.getElementById("main-tabs");
  const btn = document.getElementById("tabs-collapse-btn");
  if (!tabs || !btn) return;

  const isMobile = window.matchMedia(
    "(max-width: 767px), (max-width: 1024px) and (orientation: portrait)"
  ).matches;

  if (isMobile) {
    tabs.classList.remove("expanded");
    tabs.classList.remove("collapsed");
    return;
  }

  const isTabletLandscape = window.matchMedia(
    "(min-width: 768px) and (max-width: 1024px) and (orientation: landscape)"
  ).matches;

  if (isTabletLandscape) {
    const expanded = localStorage.getItem("pd_sidebar_expanded") === "1";
    tabs.classList.toggle("expanded", expanded);
    tabs.classList.remove("collapsed");
  } else {
    const collapsed = localStorage.getItem("pd_sidebar_collapsed") === "1";
    tabs.classList.toggle("collapsed", collapsed);
    tabs.classList.remove("expanded");
  }

  document.body.classList.toggle("sidebar-collapsed",
    tabs.classList.contains("collapsed")
  );
}
(function () {
  applySidebarCollapseState();
})();

// ══════════════════════════════════════
// LOCALES — setup y gestión de ID
// ══════════════════════════════════════
const LOCALES_DISPONIBLES = [
  { id: "matienzo", nombre: "Puerto Dulce — Matienzo", emoji: "🍮", desc: "Local original. Produce Sin TACC, recibe productos de Cuba." },
  { id: "cuba", nombre: "Cuba", emoji: "🏪", desc: "Local vecino. Produce Con TACC, recibe productos de Matienzo." },
];

// Renderiza botones de selección de local
function renderBotonesLocales(contenedorId, onSelect) {
  const cont = document.getElementById(contenedorId);
  if (!cont) return;
  const esSetup = contenedorId === "setup-locales-lista";
  cont.innerHTML = LOCALES_DISPONIBLES.map(l => {
    const activo = datos.localId === l.id;
    if (esSetup) {
      return `<button onclick="(${onSelect.toString()})('${l.id}')"
        style="font-family:'Outfit',sans-serif;text-align:left;padding:16px 18px;border:2px solid ${activo ? "var(--accent)" : "var(--border)"};border-radius:var(--radius);background:${activo ? "var(--accent-soft)" : "var(--paper)"};cursor:pointer;display:flex;align-items:center;gap:14px;width:100%;box-shadow:0 2px 12px var(--shadow);transition:all .15s;">
        <span style="font-size:2rem;line-height:1;">${l.emoji}</span>
        <div style="flex:1;">
          <div style="font-size:.95rem;font-weight:700;color:${activo ? "var(--accent)" : "var(--ink)"};">${l.nombre}${activo ? " ✓" : ""}</div>
          <div style="font-size:.72rem;color:var(--ink-light);margin-top:2px;">${l.desc}</div>
        </div>
        <span style="font-size:1.1rem;color:var(--accent);opacity:.6;">›</span>
      </button>`;
    } else {
      return `<button onclick="(${onSelect.toString()})('${l.id}')"
        style="font-family:'Outfit',sans-serif;text-align:left;padding:12px 14px;border:2px solid ${activo ? "var(--accent)" : "var(--border)"};border-radius:var(--radius-sm);background:${activo ? "var(--accent-soft)" : "var(--paper)"};cursor:pointer;display:flex;align-items:center;gap:12px;width:100%;">
        <span style="font-size:1.4rem;">${l.emoji}</span>
        <div>
          <div style="font-size:.85rem;font-weight:700;color:${activo ? "var(--accent)" : "var(--ink)"};">${l.nombre}${activo ? " ✓" : ""}</div>
          <div style="font-size:.7rem;color:var(--ink-light);margin-top:1px;">${l.desc}</div>
        </div>
      </button>`;
    }
  }).join("");
}

// Cambia local activo y guarda en datos
function setLocal(id) {
  const local = LOCALES_DISPONIBLES.find(l => l.id === id);
  if (!local) return;
  datos.localId = local.id;
  datos.nombre_local = local.nombre;
  guardar();
  const modal = document.getElementById("modal-setup-local");
  if (modal) modal.style.display = "none";
  renderCfgLocal();
  const t = document.getElementById("toast-guardado");
  if (t) {
    const prev = t.textContent;
    t.textContent = `🏠 ${local.nombre}`;
    t.classList.add("visible");
    setTimeout(() => {
      t.classList.remove("visible");
      setTimeout(() => { t.textContent = prev; }, 400);
    }, 2200);
  }
}

// Abre modal de bienvenida para setup inicial
function mostrarSetupLocal() {
  if (typeof abrirModalBienvenida === "function") {
    abrirModalBienvenida();
  }
}

// Renderiza panel de configuración del local actual
function renderCfgLocal() {
  const actual = document.getElementById("cfg-local-actual");
  if (actual) {
    const l = LOCALES_DISPONIBLES.find(x => x.id === datos.localId);
    actual.innerHTML = l
      ? `<div style="display:flex;align-items:center;gap:10px;padding:12px 14px;border:2px solid var(--accent);border-radius:var(--radius-sm);background:var(--accent-soft);">
           <span style="font-size:1.3rem;">${l.emoji}</span>
           <div style="flex:1;">
             <div style="font-size:.88rem;font-weight:700;color:var(--accent);">${l.nombre}</div>
             <div style="font-size:.68rem;color:var(--ink-light);margin-top:1px;">ID: <code>${l.id}</code></div>
           </div>
           <div id="local-status-pill" style="font-size:.72rem;font-weight:500;padding:3px 9px;border-radius:12px;background:var(--paper);border:1.5px solid var(--border);white-space:nowrap;"></div>
         </div>`
      : `<div style="font-size:.8rem;color:var(--ink-light);font-style:italic;">Sin local configurado.</div>`;
    renderEstadoLocal();
  }
  renderBotonesLocales("cfg-locales-lista", setLocal);
  renderCfgDiaEspecial();
  renderHorariosEditor();
}

// ── HORARIOS ──
const DIAS_NOMBRES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// Renderiza editor de horarios por día de la semana
function renderHorariosEditor() {
  const wrap = document.getElementById("cfg-horarios-wrap");
  if (!wrap) return;
  const localId = datos.localId || "matienzo";
  const horarios = datos.horariosLocales;
  const horLocal = horarios[localId] || {};
  const corteHoy = (datos.cortePedidosHoy || {})[localId] || "14:00";

  let html = `
    <div class="hl-section-card" style="margin-top:16px;">
      <div class="hl-section-head">
        <span class="hl-section-ico">🕐</span>
        <div class="hl-section-text">
          <div class="hl-section-titulo">Horarios del local</div>
          <div class="hl-section-sub">Los slots de hora se generan automáticamente a partir de estos rangos.</div>
        </div>
      </div>
      <div class="hl-dias-list" id="horarios-dias-list">`;

  for (let d = 0; d < 7; d++) {
    const rango = horLocal[d];
    const cerrado = !rango;
    const open = rango ? rango.open : "09:00";
    const close = rango ? rango.close : "18:00";
    html += `
      <div class="hl-dia-row${cerrado ? ' hl-dia-row--off' : ''}" id="hor-row-${d}">
        <span class="hl-dia-nom">${DIAS_NOMBRES[d]}</span>
        <label class="hl-dia-check">
          <input type="checkbox" ${cerrado ? "" : "checked"} onchange="toggleDiaCerrado(${d},this.checked)">
          <span class="hl-dia-check-lbl">Abierto</span>
        </label>
        <div class="hl-dia-times${cerrado ? ' hl-dia-times--off' : ''}" id="hor-inputs-${d}">
          <input class="hl-time-inp" type="time" value="${open}" step="900" onchange="actualizarHorario(${d},'open',this.value)">
          <span class="hl-dia-arrow">→</span>
          <input class="hl-time-inp" type="time" value="${close}" step="900" onchange="actualizarHorario(${d},'close',this.value)">
        </div>
        ${cerrado ? '<span class="hl-dia-cerrado">Cerrado</span>' : ''}
      </div>`;
  }

  html += `</div>
    </div>

    <div class="hl-section-card">
      <div class="hl-section-head">
        <span class="hl-section-ico">✂️</span>
        <div class="hl-section-text">
          <div class="hl-section-titulo">Corte de pedidos para hoy</div>
          <div class="hl-section-sub">Hasta qué hora se pueden tomar pedidos para el mismo día.</div>
        </div>
      </div>
      <div class="hl-single-row">
        <input class="hl-time-inp" type="time" value="${corteHoy}" step="900" onchange="actualizarCorteHoy(this.value)">
        <span class="hl-single-hint">Los pedidos para hoy se pueden cargar hasta este horario.</span>
      </div>
    </div>

    <div class="hl-section-card">
      <div class="hl-section-head">
        <span class="hl-section-ico">🏪</span>
        <div class="hl-section-text">
          <div class="hl-section-titulo" style="color:var(--cuba-ink,var(--accent));">Hora de llegada de Cuba</div>
          <div class="hl-section-sub">Hora a la que Cuba trae productos Con TACC. Los pedidos anteriores van al día previo.</div>
        </div>
      </div>
      <div class="hl-single-row">
        <input class="hl-time-inp" type="time" value="${datos.horaLlegadaCuba || "16:00"}" step="900" onchange="actualizarHoraLlegadaCuba(this.value)">
        <span class="hl-single-hint">Actualmente: <strong>${datos.horaLlegadaCuba || "16:00"}</strong></span>
      </div>
    </div>`;

  wrap.innerHTML = html;
}

// Marca/desmarca día como cerrado
function toggleDiaCerrado(dia, abierto) {
  const localId = datos.localId || "matienzo";
  if (!datos.horariosLocales[localId]) datos.horariosLocales[localId] = {};
  if (abierto) {
    const def = HORARIOS_DEFAULT[localId] || {};
    datos.horariosLocales[localId][dia] = def[dia] || { open: "09:00", close: "18:00" };
  } else {
    datos.horariosLocales[localId][dia] = null;
  }
  guardar();
  renderHorariosEditor();
  mostrarToastHorario();
}

// Actualiza hora de apertura/cierre
function actualizarHorario(dia, campo, valor) {
  if (!valor) return;
  const localId = datos.localId || "matienzo";
  if (!datos.horariosLocales[localId]) datos.horariosLocales[localId] = {};
  if (!datos.horariosLocales[localId][dia]) datos.horariosLocales[localId][dia] = { open: "09:00", close: "18:00" };
  datos.horariosLocales[localId][dia][campo] = valor;
  guardar();
  mostrarToastHorario();
}

// Actualiza hora límite para pedidos del mismo día
function actualizarCorteHoy(valor) {
  if (!valor) return;
  const localId = datos.localId || "matienzo";
  if (!datos.cortePedidosHoy) datos.cortePedidosHoy = {};
  datos.cortePedidosHoy[localId] = valor;
  guardar();
  mostrarToastHorario();
}

// Actualiza hora de llegada de Cuba
function actualizarHoraLlegadaCuba(valor) {
  if (!valor) return;
  datos.horaLlegadaCuba = valor;
  guardar();
  mostrarToastHorario();
  if (document.getElementById("cubapanel-pedir") && document.getElementById("cubapanel-pedir").classList.contains("active")) {
    renderEncargos();
  }
}

// Muestra toast de confirmación de horario
function mostrarToastHorario() {
  const t = document.getElementById("toast-guardado");
  if (!t) return;
  const prev = t.textContent;
  t.textContent = "🕐 Horario guardado";
  t.classList.add("visible");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.classList.remove("visible");
    setTimeout(() => { t.textContent = prev; }, 400);
  }, 2000);
}

// Hook para renderizar panel Local cuando se abre la subtab
const _showCfgTabOrig = showCfgTab;
// ── DÍAS MOVIDOS (panel configuración multi-día) ──

const _DIAS_S_CFG = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const _DIAS_FULL_CFG = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const _MESES_CFG = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

function _cfgLabelDia(diaKey) {
  const hoyKey = fechaKey(new Date());
  const [y, m, d] = diaKey.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  const base = `${_DIAS_S_CFG[dow]} ${d} ${_MESES_CFG[m - 1]}`;
  if (diaKey === hoyKey) return `${base} <span class="cfg-dm-hoy-badge">HOY</span>`;
  return base;
}

// Activa/desactiva día movido para un diaKey específico (sin tocar diaActual)
function toggleDiaMovido(diaKey) {
  if (!datos.dias[diaKey]) return;
  const dd = datos.dias[diaKey];
  dd.especial = !dd.especial;
  if (dd.especial && !dd.corteHora) dd.corteHora = "15:00";
  guardar();
  renderCfgDiaEspecial();
  // Refrescar producción si está visible
  const prodTab = document.getElementById("tab-produccion");
  if (prodTab && prodTab.classList.contains("active")) renderProduccion();
  renderCuba();
  renderDiaBanner();
}

// Actualiza un campo del día movido sin cambiar diaActual
function setDiaMovidoCampo(diaKey, campo, valor) {
  if (!datos.dias[diaKey]) return;
  datos.dias[diaKey][campo] = valor;
  guardar();
  renderCfgDiaEspecial();
  const prodTab = document.getElementById("tab-produccion");
  if (prodTab && prodTab.classList.contains("active")) renderProduccion();
  renderCuba();
}

// Agrega un día movido desde el picker de fecha
function agregarDiaMovido(fechaStr) {
  if (!fechaStr) return;
  const hoyKey = fechaKey(new Date());
  if (fechaStr < hoyKey) return; // no permitir pasados
  if (!datos.dias[fechaStr]) datos.dias[fechaStr] = { pedidos: [] };
  const dd = datos.dias[fechaStr];
  dd.especial = true;
  if (!dd.corteHora) dd.corteHora = "15:00";
  guardar();
  renderCfgDiaEspecial();
  // limpiar picker
  const picker = document.getElementById("cfg-dm-picker");
  if (picker) picker.value = "";
  const prodTab = document.getElementById("tab-produccion");
  if (prodTab && prodTab.classList.contains("active")) renderProduccion();
  renderCuba();
  renderDiaBanner();
}

// Quita el flag especial de un día movido (sin borrar sus pedidos)
function quitarDiaMovido(diaKey) {
  if (!datos.dias[diaKey]) return;
  datos.dias[diaKey].especial = false;
  guardar();
  renderCfgDiaEspecial();
  const prodTab = document.getElementById("tab-produccion");
  if (prodTab && prodTab.classList.contains("active")) renderProduccion();
  renderCuba();
  renderDiaBanner();
}

// Abre/cierra el panel de edición de una card de día movido
function _toggleDmEdit(diaKey) {
  const panel = document.getElementById("dm-edit-" + diaKey);
  if (!panel) return;
  panel.classList.toggle("open");
}

// Guarda los cambios del panel de edición y vuelve a modo lectura
function _guardarDmEdit(diaKey) {
  const nombreInp = document.getElementById("dm-edit-nombre-" + diaKey);
  const corteInp  = document.getElementById("dm-edit-corte-" + diaKey);
  if (!nombreInp || !corteInp) return;
  const nombre = nombreInp.value.trim();
  const corte  = corteInp.value || "15:00";
  setDiaMovidoCampo(diaKey, "nombreEspecial", nombre);
  setDiaMovidoCampo(diaKey, "corteHora", corte);
  // setDiaMovidoCampo ya llama a renderCfgDiaEspecial, así que no hace falta más
}

// Renderiza el panel de días movidos con picker de fecha
function renderCfgDiaEspecial() {
  const wrap = document.getElementById("cfg-dia-especial-panel");
  if (!wrap) return;

  const hoyKey = fechaKey(new Date());

  // Días movidos activos (presentes o futuros)
  const activos = Object.keys(datos.dias)
    .filter(k => k >= hoyKey && (datos.dias[k] || {}).especial)
    .sort();

  const cantActivos = activos.length;

  // Cards de días movidos activos
  const cardsHTML = activos.map(diaKey => {
    const dd = datos.dias[diaKey] || {};
    const corte  = dd.corteHora    || "15:00";
    const nombre = dd.nombreEspecial || "";
    const labelDia = _cfgLabelDia(diaKey);
    const sinNombre = !nombre;

    return `
      <div class="dm-card">
        <div class="dm-card-top">
          <div class="dm-card-fecha">${labelDia}</div>
          <button class="dm-card-btn-edit" onclick="_toggleDmEdit('${diaKey}')">✏ Editar</button>
          <button class="dm-card-btn-quitar" onclick="quitarDiaMovido('${diaKey}')" title="Quitar día movido">✕</button>
        </div>
        <div class="dm-card-body">
          <div class="dm-card-nombre ${sinNombre ? "vacio" : ""}">${sinNombre ? "Sin nombre…" : esc(nombre)}</div>
          <div class="dm-tanda-row">
            <span class="dm-tanda-badge dm-tanda-1">hasta ${esc(corte)}</span>
            <span class="dm-tanda-arr">→</span>
            <span class="dm-tanda-badge dm-tanda-2">después de ${esc(corte)}</span>
          </div>
        </div>
        <div class="dm-edit-panel" id="dm-edit-${diaKey}">
          <div class="dm-edit-campo">
            <label class="dm-edit-lbl">Nombre</label>
            <input class="dm-edit-inp" type="text" id="dm-edit-nombre-${diaKey}"
              value="${esc(nombre)}" placeholder="ej: Día de la madre…">
          </div>
          <div class="dm-edit-campo">
            <label class="dm-edit-lbl">Corte</label>
            <input class="dm-edit-inp dm-edit-inp-time" type="time" id="dm-edit-corte-${diaKey}"
              value="${esc(corte)}">
            <span class="dm-edit-hint">divide las tandas</span>
          </div>
          <div class="dm-edit-footer">
            <button class="dm-btn-guardar" onclick="_guardarDmEdit('${diaKey}')">✓ Guardar</button>
          </div>
        </div>
      </div>`;
  }).join("");

  wrap.innerHTML = `
    <div class="cfg-desp-wrap">
      <div class="cfg-desp-header">
        <span class="cfg-desp-ico">⚡</span>
        <div style="flex:1;">
          <div class="cfg-desp-titulo">Días movidos</div>
          <div class="cfg-desp-sub">Producción dividida en dos tandas.</div>
        </div>
        ${cantActivos > 0
          ? `<div class="cfg-desp-estado on"><span class="cfg-desp-estado-dot"></span>${cantActivos} activo${cantActivos > 1 ? "s" : ""}</div>`
          : `<div class="cfg-desp-estado off"><span class="cfg-desp-estado-dot"></span>Ninguno</div>`
        }
      </div>

      <div class="cfg-dm-explicacion">
        <div class="cfg-dm-exp-item"><span>🟠</span><span><strong>Tanda 1:</strong> pedidos del mismo día + Cuba hasta el corte.</span></div>
        <div class="cfg-dm-exp-item"><span>🔵</span><span><strong>Tanda 2:</strong> pedidos del día siguiente hasta las 14hs + Cuba después del corte.</span></div>
      </div>

      <div class="cfg-dm-picker-wrap">
        <label class="cfg-dm-picker-lbl">Agregar día movido</label>
        <div class="cfg-dm-picker-row">
          <input id="cfg-dm-picker" type="date"
            class="cfg-dm-campo-inp"
            min="${hoyKey}"
            style="max-width:180px;"
            onchange="agregarDiaMovido(this.value)">
          <span class="cfg-dm-campo-hint">elegí cualquier fecha</span>
        </div>
      </div>

      <div class="cfg-dm-lista">
        ${cantActivos === 0
          ? `<div class="cfg-dm-vacio">No hay días movidos activos. Elegí una fecha arriba para agregar.</div>`
          : cardsHTML
        }
      </div>
    </div>`;
}