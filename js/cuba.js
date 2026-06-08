/**
 * ================================================================
 * ÍNDICE DE FUNCIONES (CUBA.JS)
 * ================================================================
 * 
 * === SUBPESTAÑAS DE CUBA ===
 * - showCubaTab(id, el)           → Cambia entre subpestañas de Cuba (pedidos, pedir, ventas, exportar)
 * - renderCuba()                  → Renderiza todas las secciones de Cuba (encargos, ventas, resumen, MP)
 * 
 * === ENCARGOS (pedir a Cuba) ===
 * - buildEncargoCard(p)           → Construye tarjeta visual de un pedido para encargos
 * - renderEncargos()              → Renderiza lista de productos que hay que pedir a Cuba
 * - getPedidoGlobal(pedidoId)     → Busca un pedido en todos los días (no solo el actual)
 * - encargoCubaPedido(pedidoId, prodId) → Alterna flag "pedido_cuba" de un producto
 * - encargoCubaSeparado(pedidoId, prodId) → Alterna flag "separado_cuba" y sincroniza con "listo"
 * 
 * === MATERIA PRIMA / NOTAS ===
 * - agregarItemMateriaPrima()     → Agrega un ítem a la lista de materia prima/notas
 * - toggleItemMateriaPrima(id)    → Marca/desmarca ítem como hecho
 * - eliminarItemMateriaPrima(id)  → Elimina un ítem de la lista
 * - renderMateriaPrima()          → Renderiza la lista de materia prima
 * 
 * === RESUMEN DE CUBA (qué se lleva) ===
 * - renderCubaResumen()           → Muestra resumen agrupado de productos para Cuba (con/sin día especial)
 * 
 * === VENTAS (mostrador) ===
 * - agregarVenta()                → Agrega una venta vacía (deprecated, se usa agregarVentaManual)
 * - agregarVentaManual()          → Agrega una venta manual (producto libre)
 * - updateVentaTalle(ventaId, campo, valor) → Actualiza campo de venta con talle
 * - updateVenta(id, campo, valor) → Actualiza campo genérico de una venta
 * - eliminarVenta(id)             → Elimina una venta
 * - _ventaStep(id, campo, delta)  → Stepper para cantidades simples de venta
 * - _ventaTalleStep(id, cantKey, delta) → Stepper para cantidades con talle
 * - renderVentas()                → Renderiza tabla de ventas con steppers (sin tacc)
 * 
 * ================================================================
 */

// ── CUBA ──
// ── CUBA SUBPESTAÑAS ──
let _cubaTabActiva = "pedidos";

// Cambia entre subpestañas de Cuba (pedidos, pedir, ventas, exportar)
function showCubaTab(id, el) {
  _cubaTabActiva = id;
  document.querySelectorAll("#cuba-subtabs .prod-tab-btn").forEach(t => t.classList.remove("active"));
  document.querySelectorAll("#tab-cuba .prod-panel").forEach(p => { p.classList.remove("active"); p.style.display = "none"; });
  if (el) el.classList.add("active");
  const panel = document.getElementById("cubapanel-" + id);
  if (panel) { panel.classList.add("active"); panel.style.display = ""; }
  if (id === "pedidos") renderCubaResumen();
  else if (id === "pedir") renderEncargos();
  else if (id === "ventas") renderVentas();
  else if (id === "exportar") renderCubaExportSelector();

  document.querySelectorAll("#sidebar-subtabs-cuba .sidebar-subtab")
    .forEach(b => b.classList.remove("active"));
  const ssBtn = document.getElementById("ss-cubatab-" + id);
  if (ssBtn) ssBtn.classList.add("active");
}

// Renderiza todas las secciones de Cuba
function renderCuba() {
  renderEncargos();
  renderVentas();
  renderCubaResumen();
  renderMateriaPrima();
  const activeTab = _cubaTabActiva || "pedidos";
  document.querySelectorAll("#tab-cuba .prod-panel").forEach(p => { p.classList.remove("active"); p.style.display = "none"; });
  const activePanel = document.getElementById("cubapanel-" + activeTab);
  if (activePanel) { activePanel.classList.add("active"); activePanel.style.display = ""; }
  // sync tab button
  document.querySelectorAll("#cuba-subtabs .prod-tab-btn").forEach(t => t.classList.remove("active"));
  const activeBtn = document.querySelector(`#cuba-subtabs .prod-tab-btn[onclick*="'${activeTab}'"]`);
  if (activeBtn) activeBtn.classList.add("active");
}

// ── ENCARGOS (pedir a Cuba) ──
// Construye tarjeta visual de un pedido para encargos
function buildEncargoCard(p) {
  const div = document.createElement("div");
  div.className = "cuba-encargo";
  const top = document.createElement("div");
  top.className = "cuba-enc-top";
  const nomSpanH = document.createElement("span");
  nomSpanH.className = "cuba-enc-nombre";
  nomSpanH.textContent = p.cliente_input || p.cliente || "(sin nombre)";
  const horaSpanH = document.createElement("span");
  horaSpanH.className = "cuba-enc-hora";
  horaSpanH.textContent = p.hora_entrega || "--:--";
  top.appendChild(nomSpanH);
  top.appendChild(horaSpanH);
  div.appendChild(top);

  const prodsFiltrados = (p.productos || []).filter(r => r.tacc !== "s");
  if (!prodsFiltrados.length) {
    const empty = document.createElement("div");
    empty.style.cssText = "font-size:.72rem;color:var(--ink-light);font-style:italic;";
    empty.textContent = "Sin productos";
    div.appendChild(empty);
  } else {
    prodsFiltrados.forEach(r => {
      const nom = r.tipo === "catalogo" ? r.nombre : r.libre;
      const _cantN = Number(r.cantidad);
      const cant = isNaN(_cantN) ? 1 : _cantN;
      if (!nom) return;
      const row = document.createElement("div");
      row.style.cssText = "display:flex;align-items:center;gap:7px;padding:5px 0;border-bottom:1px solid var(--border);";
      const nomSpan = document.createElement("span");
      nomSpan.style.cssText = "flex:1;font-size:.8rem;color:var(--ink);";
      nomSpan.innerHTML = esc(nom) + (r.tamano ? " · " + esc(r.tamano) : "") + " <strong>x" + cant + "</strong>";
      row.appendChild(nomSpan);

      const pedOn = r.pedido_cuba;
      const pedCircle = document.createElement("div");
      pedCircle.style.cssText = "display:flex;align-items:center;gap:4px;cursor:pointer;";
      const pedDot = document.createElement("div");
      pedDot.style.cssText = "width:18px;height:18px;border-radius:50%;border:2px solid " + (pedOn ? "var(--accent)" : "var(--border)") + ";background:" + (pedOn ? "var(--accent)" : "transparent") + ";display:flex;align-items:center;justify-content:center;font-size:9px;color:" + (pedOn ? "#fff" : "transparent") + ";transition:all .15s;";
      pedDot.textContent = "✓";
      const pedLbl = document.createElement("span");
      pedLbl.style.cssText = "font-size:.6rem;color:" + (pedOn ? "var(--accent)" : "var(--ink-light)") + ";";
      pedLbl.textContent = "pedido";
      pedCircle.appendChild(pedDot);
      pedCircle.appendChild(pedLbl);
      (function(pid, rid) { pedCircle.onclick = function() { encargoCubaPedido(pid, rid); }; })(p.id, r.id);
      row.appendChild(pedCircle);

      const sepOn = r.separado_cuba;
      const sepBox = document.createElement("div");
      sepBox.style.cssText = "display:flex;align-items:center;gap:4px;cursor:pointer;";
      const sepDot = document.createElement("div");
      sepDot.style.cssText = "width:18px;height:18px;border-radius:4px;border:2px solid " + (sepOn ? "var(--green)" : "var(--border)") + ";background:" + (sepOn ? "var(--green)" : "transparent") + ";display:flex;align-items:center;justify-content:center;font-size:9px;color:" + (sepOn ? "#fff" : "transparent") + ";transition:all .15s;";
      sepDot.textContent = "✓";
      const sepLbl = document.createElement("span");
      sepLbl.style.cssText = "font-size:.6rem;color:" + (sepOn ? "var(--green)" : "var(--ink-light)") + ";";
      sepLbl.textContent = "sep.";
      sepBox.appendChild(sepDot);
      sepBox.appendChild(sepLbl);
      (function(pid, rid) { sepBox.onclick = function() { encargoCubaSeparado(pid, rid); }; })(p.id, r.id);
      row.appendChild(sepBox);
      div.appendChild(row);
    });
  }
  return div;
}

// Renderiza lista de productos que hay que pedir a Cuba
function renderEncargos() {
  const cont = document.getElementById("cuba-encargos");
  const vacio = document.getElementById("vacio-encargos");
  cont.innerHTML = "";

  const _hoy = new Date(); const _man = new Date(); _man.setDate(_man.getDate() + 1);
  const hoyKey = fechaKey(_hoy);
  const manKey = fechaKey(_man);

  const HORA_CUBA = datos.horaLlegadaCuba || "16:00";

  const pedidosConTacc = [];
  Object.entries(datos.dias).forEach(([dKey, dData]) => {
    if (dKey < hoyKey) return;
    (dData.pedidos || [])
      .filter(p => p.estado !== "entregado" && (p.productos || []).some(r => r.tacc !== "s"))
      .forEach(p => pedidosConTacc.push({ ...p, _diaKey: dKey }));
  });

  if (!pedidosConTacc.length) {
    vacio.style.display = "";
    return;
  }
  vacio.style.display = "none";

  // Determina en qué fecha hay que pedir a Cuba un pedido.
  // En día especial: Cuba 15 (hora <= corteEspecial) → día anterior (tanda 1)
  //                  Cuba 18 (hora > corteEspecial)  → mismo día (tanda 2)
  // En día normal: si hora < HORA_CUBA → día anterior; si no → mismo día.
  function diaPedidoACuba(diaEntregaKey, horaEntrega) {
    const hora = horaEntrega || "99:99";
    const dData = datos.dias[diaEntregaKey] || {};
    if (dData.especial) {
      const corteEsp = dData.corteHora || "15:00";
      if (hora <= corteEsp) {
        // Tanda 1: se pide el día anterior
        const [y, m, d] = diaEntregaKey.split("-").map(Number);
        const prev = new Date(y, m - 1, d);
        prev.setDate(prev.getDate() - 1);
        return { key: fechaKey(prev), tanda: 1, corteEsp };
      }
      return { key: diaEntregaKey, tanda: 2, corteEsp };
    }
    // Día normal
    if (hora < HORA_CUBA) {
      const [y, m, d] = diaEntregaKey.split("-").map(Number);
      const prev = new Date(y, m - 1, d);
      prev.setDate(prev.getDate() - 1);
      return { key: fechaKey(prev), tanda: null, corteEsp: null };
    }
    return { key: diaEntregaKey, tanda: null, corteEsp: null };
  }

  // Agrupar por {diaKey + tanda} para poder mostrar subencabezados en día especial
  const porDiaPedido = {};
  pedidosConTacc.forEach(p => {
    const { key, tanda, corteEsp } = diaPedidoACuba(p._diaKey, p.hora_entrega);
    const groupKey = tanda !== null ? `${key}__t${tanda}` : key;
    if (!porDiaPedido[groupKey]) porDiaPedido[groupKey] = { key, tanda, corteEsp, pedidos: [] };
    porDiaPedido[groupKey].pedidos.push(p);
  });

  const gruposOrdenados = Object.keys(porDiaPedido).sort();

  gruposOrdenados.forEach((gKey, idx) => {
    const { key: dPedirKey, tanda, corteEsp, pedidos } = porDiaPedido[gKey];
    pedidos.sort((a, b) => (a.hora_entrega || "99:99").localeCompare(b.hora_entrega || "99:99"));

    let tituloTxt;
    if (dPedirKey === hoyKey) tituloTxt = "Pedir HOY a Cuba";
    else if (dPedirKey === manKey) tituloTxt = "Pedir MAÑANA a Cuba";
    else if (dPedirKey < hoyKey) tituloTxt = "Pedir URGENTE (ya pasó)";
    else {
      const f = new Date(dPedirKey + "T12:00:00");
      tituloTxt = "Pedir el " + DIAS_FULL[f.getDay()] + " " + f.getDate() + " " + MESES[f.getMonth()];
    }

    // En día especial, agregar subtítulo de tanda
    let tandaLabel = "";
    if (tanda === 1 && corteEsp) tandaLabel = ` <span style="font-size:.6rem;color:var(--amber);font-weight:700;">🟠 Tanda 1 (hasta las ${corteEsp})</span>`;
    if (tanda === 2 && corteEsp) tandaLabel = ` <span style="font-size:.6rem;color:var(--blue,#2563eb);font-weight:700;">🔵 Tanda 2 (después de las ${corteEsp})</span>`;

    const diasEntrega = [...new Set(pedidos.map(p => p._diaKey))].sort();
    const subtxt = diasEntrega.map(dk => {
      if (dk === hoyKey) return "hoy";
      if (dk === manKey) return "mañana";
      const f = new Date(dk + "T12:00:00");
      return DIAS_FULL[f.getDay()] + " " + f.getDate();
    }).join(", ");

    const esUrgente = dPedirKey < hoyKey;
    const esHoy = dPedirKey === hoyKey;

    const header = document.createElement("div");
    header.style.cssText = `
      display:flex;align-items:baseline;gap:8px;
      font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;
      color:${esUrgente ? "var(--red)" : esHoy ? "var(--accent)" : "var(--ink-light)"};
      padding:10px 0 4px;
      border-bottom:1.5px solid ${esUrgente ? "var(--red)" : esHoy ? "var(--accent)" : "var(--border)"};
      margin-bottom:6px;margin-top:${idx === 0 ? "0" : "16px"};
    `;
    header.innerHTML = `${esUrgente ? "⚠️ " : ""}${tituloTxt}${tandaLabel}
      <span style="font-size:.6rem;font-weight:400;text-transform:none;letter-spacing:0;opacity:.7;font-style:italic;">
        para entregas: ${subtxt}
      </span>`;
    cont.appendChild(header);

    pedidos.forEach(p => {
      const card = buildEncargoCard(p);
      if (diasEntrega.length > 1) {
        const dk = p._diaKey;
        const dLabel = dk === hoyKey ? "hoy" : dk === manKey ? "mañana" : (() => { const f = new Date(dk + "T12:00:00"); return DIAS_FULL[f.getDay()] + " " + f.getDate(); })();
        const tag = document.createElement("div");
        tag.style.cssText = "font-size:.58rem;color:var(--ink-light);margin:-4px 0 4px 4px;font-style:italic;";
        tag.textContent = "📦 entrega: " + dLabel + (p.hora_entrega ? " a las " + p.hora_entrega : "");
        card.insertBefore(tag, card.firstChild);
      }
      cont.appendChild(card);
    });
  });

  const nota = document.createElement("div");
  nota.style.cssText = "font-size:.62rem;color:var(--ink-light);font-style:italic;margin-top:14px;padding-top:8px;border-top:1px dashed var(--border);";
  nota.innerHTML = `🕐 Cuba trae los productos a las <strong>${HORA_CUBA}</strong>. Pedidos para antes de esa hora se agrupan el día anterior.`;
  cont.appendChild(nota);
}

// Busca un pedido en todos los días (no solo el actual)
function getPedidoGlobal(pedidoId) {
  for (const dData of Object.values(datos.dias)) {
    const p = (dData.pedidos || []).find(x => x.id === pedidoId);
    if (p) return p;
  }
  return null;
}

// Agrega un ítem a la lista de materia prima/notas
function agregarItemMateriaPrima() {
  const input = document.getElementById("cuba-mp-input");
  const txt = (input.value || "").trim();
  if (!txt) return;
  if (!datos.notasCuba || !Array.isArray(datos.notasCuba)) datos.notasCuba = [];
  datos.notasCuba.push({ id: uid(), txt, hecho: false });
  guardar();
  input.value = "";
  renderMateriaPrima();
}

// Marca/desmarca ítem como hecho
function toggleItemMateriaPrima(id) {
  if (!Array.isArray(datos.notasCuba)) return;
  const item = datos.notasCuba.find(x => x.id === id);
  if (item) item.hecho = !item.hecho;
  guardar();
  renderMateriaPrima();
}

// Elimina un ítem de la lista
function eliminarItemMateriaPrima(id) {
  if (!Array.isArray(datos.notasCuba)) return;
  datos.notasCuba = datos.notasCuba.filter(x => x.id !== id);
  guardar();
  renderMateriaPrima();
}

// Renderiza la lista de materia prima
function renderMateriaPrima() {
  const lista = document.getElementById("cuba-mp-lista");
  if (!lista) return;
  if (!Array.isArray(datos.notasCuba) || !datos.notasCuba.length) {
    lista.innerHTML = '<div class="cuba-mp-empty">Sin ítems aún.</div>';
    return;
  }
  lista.innerHTML = datos.notasCuba.map(item => `
    <div class="cuba-mp-item${item.hecho ? " tachado" : ""}">
      <div class="cuba-mp-chk${item.hecho ? " on" : ""}" onclick="toggleItemMateriaPrima('${item.id}')">✓</div>
      <span class="cuba-mp-item-txt">${esc(item.txt)}</span>
      <button class="cuba-mp-del" onclick="eliminarItemMateriaPrima('${item.id}')">✕</button>
    </div>`).join("");
}

// Alterna flag "pedido_cuba" de un producto
function encargoCubaPedido(pedidoId, prodId) {
  const p = getPedidoGlobal(pedidoId);
  if (!p) return;
  const r = (p.productos || []).find(x => x.id === prodId);
  if (!r) return;
  r.pedido_cuba = !r.pedido_cuba;
  guardar();
  renderEncargos();
  renderPedidos();
}

// Alterna flag "separado_cuba" y sincroniza con "listo"
function encargoCubaSeparado(pedidoId, prodId) {
  const p = getPedidoGlobal(pedidoId);
  if (!p) return;
  const r = (p.productos || []).find(x => x.id === prodId);
  if (!r) return;
  r.separado_cuba = !r.separado_cuba;
  r.listo = r.separado_cuba;
  const todosListos = (p.productos || []).every(x => x.listo);
  if (todosListos && (p.estado === "pendiente" || p.estado === "prod")) p.estado = "listo";
  guardar();
  renderEncargos();
  renderPedidos();
  if (_prodTabActiva === "semanal") renderProduccion();
}

// ── RESUMEN DE CUBA ──
function renderCubaResumen() {
  const dd = diaData();
  const especial = dd.especial || false;
  const corte = dd.corteHora || "15:00";
  // Usar pedidos del día activo (diaActual), no solo el "día data" del buscador
  const pedidosCuba = (datos.dias[diaActual]?.pedidos || []).filter(p => esCuba(p.cliente) && p.estado !== "entregado");

  function acumular(pedidos) {
    const totales = {};
    pedidos.forEach(p => {
      (p.productos || []).forEach(r => {
        const nom = r.tipo === "catalogo" ? r.nombre : r.libre;
        if (!nom || !nom.trim()) return;
        const _cantN = Number(r.cantidad);
        const cant = isNaN(_cantN) ? 1 : _cantN;
        const key = [nom, r.tamano].filter(Boolean).join(" ").trim().toLowerCase();
        const label = [nom, r.tamano].filter(Boolean).join(" ").trim();
        if (!totales[key]) totales[key] = { label, qty: 0, notas: [] };
        totales[key].qty += cant;
        if (r.nota_prod && r.nota_prod.trim()) {
          const nota = r.nota_prod.trim();
          const existing = totales[key].notas.find(n => n.texto === nota);
          if (existing) existing.qty += cant;
          else totales[key].notas.push({ texto: nota, qty: cant });
        }
      });
    });
    return totales;
  }

  const TALLES_ORD = ["chico", "mediano", "grande"];

  function clasificar(label) {
    const l = label.toLowerCase();
    const cat = datos.catalogo.find(c => {
      const cn = c.nombre.toLowerCase();
      return l === cn || l.startsWith(cn + " ") || l.startsWith(cn + " ·");
    });
    if (cat && cat.categoria && cat.categoria !== "otros") return cat.categoria;
    if (l.includes("mousse")) return "mousses";
    if (TALLES_ORD.some(t => l.endsWith(t))) return "tortas";
    return "otros";
  }

  function sortItems(items) {
    return items.slice().sort((a, b) => {
      const partsA = a.label.trim().split(" ");
      const partsB = b.label.trim().split(" ");
      const talleA = TALLES_ORD.indexOf((partsA[partsA.length - 1] || "").toLowerCase());
      const talleB = TALLES_ORD.indexOf((partsB[partsB.length - 1] || "").toLowerCase());
      const nomA = partsA.slice(0, talleA >= 0 ? partsA.length - 1 : partsA.length).join(" ").toLowerCase();
      const nomB = partsB.slice(0, talleB >= 0 ? partsB.length - 1 : partsB.length).join(" ").toLowerCase();
      if (nomA !== nomB) return nomA.localeCompare(nomB, "es");
      return (talleA === -1 ? 99 : talleA) - (talleB === -1 ? 99 : talleB);
    });
  }

  const CAT_EMOJI_RES = { tortas: "🎂", mousses: "🍮", bandejas: "🍫", cuadrados: "🟫", congelados: "❄️", otros: "✨" };

  function buildListaHTML(totales) {
    const keys = Object.keys(totales);
    if (!keys.length) return '<div style="color:var(--ink-light);font-size:.76rem;font-style:italic;">Sin productos.</div>';
    const porCategoria = {};
    keys.forEach(k => {
      const cat = clasificar(totales[k].label);
      if (!porCategoria[cat]) porCategoria[cat] = [];
      porCategoria[cat].push({ ...totales[k] });
    });
    const ordenado = [...CAT_ORDEN, "otros"].filter((c, i, a) => a.indexOf(c) === i);
    let html = "";
    ordenado.forEach(cat => {
      const items = porCategoria[cat];
      if (!items || !items.length) return;
      const emoji = CAT_EMOJI_RES[cat] || "✨";
      html += `<div class="cuba-grupo-titulo">${emoji} ${cat.charAt(0).toUpperCase() + cat.slice(1)}</div>`;
      html += sortItems(items).map(i => {
        const notasHTML = (i.notas && i.notas.length) ? i.notas.map(n => `<div class="cuba-item-nota">${n.qty} x ${esc(n.texto)}</div>`).join("") : "";
        return `<div class="cuba-item" style="gap:8px;">
          <div onclick="this.classList.toggle('cuba-cb-on')" class="cuba-cb" title="Marcar como separado" style="width:16px;height:16px;border-radius:4px;border:1.5px solid var(--accent);flex-shrink:0;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:9px;color:transparent;transition:all .15s;background:transparent;">✓</div>
          <span style="flex:1;">${esc(i.label)}</span>
          <span class="cqty">${i.qty}</span>
        </div>${notasHTML}`;
      }).join("");
    });
    return html;
  }

  const cont = document.getElementById("cuba-resumen-lista");
  if (!especial) {
    const totales = acumular(pedidosCuba);
    const keys = Object.keys(totales);
    if (!keys.length) {
      cont.innerHTML = '<div style="color:var(--ink-light);font-size:.76rem;font-style:italic;">Sin pedidos de Cuba para hoy.</div>';
      return;
    }
    cont.innerHTML = buildListaHTML(totales);
  } else {
    const t1 = pedidosCuba.filter(p => (p.hora_entrega || "99:99") <= corte);
    const t2 = pedidosCuba.filter(p => (p.hora_entrega || "99:99") > corte);
    cont.innerHTML = `
      <div style="font-size:.6rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--amber);margin-bottom:4px;">🟠 Envío — hasta las ${esc(corte)}</div>
      ${buildListaHTML(acumular(t1))}
      <div style="font-size:.6rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--blue);margin-top:10px;margin-bottom:4px;">🔵 Envío — después de las ${esc(corte)}</div>
      ${buildListaHTML(acumular(t2))}
    `;
  }
}

// ── VENTAS (mostrador) ──
function agregarVenta() {
  if (!diaData().ventas) diaData().ventas = [];
  diaData().ventas.push({ id: uid(), nombre: "", cantidad: "", llevada: "", _deCatalogo: false });
  guardar();
  renderVentas();
}

function agregarVentaManual() {
  const inp = document.getElementById("venta-nueva-nombre");
  const nombre = (inp ? inp.value : "").trim();
  if (!nombre) return;
  if (!diaData().ventas) diaData().ventas = [];
  diaData().ventas.push({ id: uid(), nombre, cantidad: "", llevada: "", _deCatalogo: false });
  guardar();
  renderVentas();
  setTimeout(() => {
    const i = document.getElementById("venta-nueva-nombre");
    if (i) {
      i.value = "";
      i.focus();
    }
  }, 50);
}

function updateVentaTalle(ventaId, campo, valor) {
  const v = getVentas().find(x => x.id === ventaId);
  if (!v) return;
  v[campo] = valor;
  guardar();
}

function updateVenta(id, campo, valor) {
  const v = getVentas().find(x => x.id === id);
  if (v) {
    v[campo] = valor;
    guardar();
    renderCubaResumen();
  }
}

function eliminarVenta(id) {
  diaData().ventas = getVentas().filter(x => x.id !== id);
  guardar();
  renderVentas();
}

// Helpers de stepper para ventas
function _ventaStep(id, campo, delta) {
  const v = getVentas().find(x => x.id === id);
  if (!v) return;
  const cur = parseInt(v[campo]) || 0;
  const nuevo = Math.max(0, cur + delta);
  v[campo] = nuevo > 0 ? String(nuevo) : "";
  guardar();
  renderVentas();
}

function _ventaTalleStep(id, cantKey, delta) {
  const v = getVentas().find(x => x.id === id);
  if (!v) return;
  const cur = parseInt(v[cantKey]) || 0;
  const nuevo = Math.max(0, cur + delta);
  v[cantKey] = nuevo > 0 ? String(nuevo) : "";
  guardar();
  renderVentas();
}

// Renderiza tabla de ventas con steppers
// ── modo ventas (pedido / llevado) ──
let _ventasModo = "pedido";

// Detecta si estamos en mobile (≤600px)
function _esMobile() {
  return window.innerWidth <= 768;
}

function renderVentas() {
  const cont = document.getElementById("venta-lista");
  if (!cont) return;

  const catCuba = (datos.catalogo || []).filter(c => c.tipo === "sin_tacc");
  const ventas = getVentas();

  // Sincronizar con catálogo
  catCuba.forEach(c => {
    if (!ventas.find(v => v.nombre === c.nombre)) {
      ventas.push({
        id: uid(), nombre: c.nombre,
        cantidad: "", llevada: "",
        _deCatalogo: true,
        _categoria: c.categoria || "otros",
        _tieneTalle: c.tiene_talle || false
      });
    }
  });
  ventas.forEach(v => {
    const cat = catCuba.find(c => c.nombre === v.nombre);
    if (cat) {
      v._deCatalogo = true;
      v._categoria = cat.categoria || "otros";
      v._tieneTalle = cat.tiene_talle || false;
    }
  });
  diaData().ventas = ventas;
  guardar();

  const deCatalogo = ventas.filter(v => v._deCatalogo);
  const manuales   = ventas.filter(v => !v._deCatalogo);

  const porCat = {};
  CAT_ORDEN.forEach(cat => { porCat[cat] = []; });
  deCatalogo.forEach(v => {
    const c = v._categoria || "otros";
    (porCat[c] || porCat["otros"]).push(v);
  });

  const TALLES = ["ch", "md", "gr"];
  const CAT_LABEL = {
    tortas: "🎂 Tortas", mousses: "🍮 Mousses",
    bandejas: "🫙 Bandejas", cuadrados: "🟫 Cuadrados",
    congelados: "❄️ Congelados", otros: "📦 Otros"
  };

  const mobile = _esMobile();

  // ── helpers de total para summary ──
  function totalCampo(campo) {
    return ventas.reduce((acc, v) => {
      if (v._tieneTalle) {
        return acc + TALLES.reduce((s, l) => s + (parseInt(v["_" + campo.replace("cantidad","cant").replace("llevada","llev") + "_" + l]) || 0), 0);
      }
      return acc + (parseInt(v[campo]) || 0);
    }, 0);
  }

  // ── stepper minimalista ──
  function stp(val, onMinus, onPlus, onInput, accent = false) {
    const n = parseInt(val) || 0;
    const on = n > 0;
    return `<div class="vg-stp${accent ? " vg-stp-acc" : ""}${on ? " vg-on" : ""}">
      <button class="vg-btn" onclick="${onMinus}">−</button>
      <input class="vg-num" type="number" min="0" value="${on ? n : ""}" placeholder="·" oninput="${onInput}">
      <button class="vg-btn" onclick="${onPlus}">+</button>
    </div>`;
  }

  // ── celda de referencia (solo lectura) ──
  function refCell(val) {
    const n = parseInt(val) || 0;
    return `<div class="vg-ref${n > 0 ? " vg-ref-on" : ""}">${n || "—"}</div>`;
  }

  // ── badge diferencia ──
  function diffBadge(pedTotal, llevTotal) {
    if (pedTotal === 0 && llevTotal === 0) return `<div class="vg-diff" style="color:var(--ink-light)">—</div>`;
    if (llevTotal === pedTotal) return `<div class="vg-diff vg-diff-ok">✓</div>`;
    const d = llevTotal - pedTotal;
    if (d < 0) return `<div class="vg-diff vg-diff-low">${d}</div>`;
    return `<div class="vg-diff vg-diff-hi">+${d}</div>`;
  }

  // ── fila sin talle ──
  function filaSimple(v, deletable = false) {
    const modo = _ventasModo;
    const hayP = (parseInt(v.cantidad) || 0) > 0;
    const hayL = (parseInt(v.llevada) || 0) > 0;
    const rowOn = hayP || hayL;
    const nomHtml = `<div class="vg-nom${deletable ? " vg-nom-del" : ""}">
      ${esc(v.nombre)}
      ${deletable ? `<button class="vg-del-btn" onclick="eliminarVenta('${v.id}')">✕</button>` : ""}
    </div>`;

    if (modo === "pedido") {
      return `<div class="vg-row${rowOn ? " vg-row-on" : ""}">
        ${nomHtml}
        <div class="vg-celdas">
          <div class="vg-grupo"><div class="vg-celda-wide">
            ${stp(v.cantidad,
              `_ventaStep('${v.id}','cantidad',-1)`,
              `_ventaStep('${v.id}','cantidad',1)`,
              `(function(el){var x=getVentas().find(x=>x.id==='${v.id}');if(x){x.cantidad=el.value;guardar();}})(this)`
            )}
          </div></div>
        </div>
      </div>`;
    } else {
      const pT = parseInt(v.cantidad) || 0;
      const lT = parseInt(v.llevada) || 0;
      return `<div class="vg-row${rowOn ? " vg-row-on" : ""}">
        ${nomHtml}
        <div class="vg-celdas" style="gap:4px;">
          <div class="vg-grupo"><div class="vg-celda-wide" style="justify-content:center;">
            ${refCell(v.cantidad)}
          </div></div>
          <div class="vg-sep-vert"></div>
          <div class="vg-grupo vg-grupo-acc"><div class="vg-celda-wide">
            ${stp(v.llevada,
              `_ventaStep('${v.id}','llevada',-1)`,
              `_ventaStep('${v.id}','llevada',1)`,
              `(function(el){var x=getVentas().find(x=>x.id==='${v.id}');if(x){x.llevada=el.value;guardar();renderVentas();}})(this)`,
              true
            )}
          </div></div>
          ${diffBadge(pT, lT)}
        </div>
      </div>`;
    }
  }

  // ── fila con talle — DESKTOP ──
  function fillaTalleDesktop(v) {
    const modo = _ventasModo;
    const hayDatos = TALLES.some(l =>
      (parseInt(v["_cant_" + l]) || 0) > 0 || (parseInt(v["_llev_" + l]) || 0) > 0
    );

    if (modo === "pedido") {
      const pedCeldas = TALLES.map(lbl => {
        const k = "_cant_" + lbl;
        return `<div class="vg-celda">
          ${stp(v[k],
            `_ventaTalleStep('${v.id}','${k}',-1)`,
            `_ventaTalleStep('${v.id}','${k}',1)`,
            `(function(el){var x=getVentas().find(x=>x.id==='${v.id}');if(x){x['${k}']=el.value;guardar();}})(this)`
          )}
        </div>`;
      }).join("");
      return `<div class="vg-row${hayDatos ? " vg-row-on" : ""}">
        <div class="vg-nom">${esc(v.nombre)}</div>
        <div class="vg-celdas"><div class="vg-grupo">${pedCeldas}</div></div>
      </div>`;
    } else {
      const pT = TALLES.reduce((s, l) => s + (parseInt(v["_cant_" + l]) || 0), 0);
      const lT = TALLES.reduce((s, l) => s + (parseInt(v["_llev_" + l]) || 0), 0);
      const refCeldas = TALLES.map(lbl => `<div class="vg-celda">${refCell(v["_cant_" + lbl])}</div>`).join("");
      const llevCeldas = TALLES.map(lbl => {
        const k = "_llev_" + lbl;
        return `<div class="vg-celda">
          ${stp(v[k],
            `_ventaTalleStep('${v.id}','${k}',-1)`,
            `_ventaTalleStep('${v.id}','${k}',1)`,
            `(function(el){var x=getVentas().find(x=>x.id==='${v.id}');if(x){x['${k}']=el.value;guardar();renderVentas();}})(this)`,
            true
          )}
        </div>`;
      }).join("");
      return `<div class="vg-row${hayDatos ? " vg-row-on" : ""}">
        <div class="vg-nom">${esc(v.nombre)}</div>
        <div class="vg-celdas" style="gap:4px;">
          <div class="vg-grupo">${refCeldas}</div>
          <div class="vg-sep-vert"></div>
          <div class="vg-grupo vg-grupo-acc">${llevCeldas}</div>
          ${diffBadge(pT, lT)}
        </div>
      </div>`;
    }
  }

  // ── fila con talle — MOBILE (apilada) ──
  function fillaTalleMobile(v) {
    const modo = _ventasModo;
    const hayDatos = TALLES.some(l =>
      (parseInt(v["_cant_" + l]) || 0) > 0 || (parseInt(v["_llev_" + l]) || 0) > 0
    );

    if (modo === "pedido") {
      // Mobile pedido: igual que desktop pero sin encabezado de columnas
      const steppers = TALLES.map(lbl => {
        const k = "_cant_" + lbl;
        return `<div class="vg-talle-stp">
          <div class="vg-talle-stp-lbl">${lbl}</div>
          ${stp(v[k],
            `_ventaTalleStep('${v.id}','${k}',-1)`,
            `_ventaTalleStep('${v.id}','${k}',1)`,
            `(function(el){var x=getVentas().find(x=>x.id==='${v.id}');if(x){x['${k}']=el.value;guardar();}})(this)`
          )}
        </div>`;
      }).join("");
      return `<div class="vg-row vg-row-talle-mobile${hayDatos ? " vg-row-on" : ""}">
        <div class="vg-row-talle-top">
          <div class="vg-nom">${esc(v.nombre)}</div>
        </div>
        <div class="vg-llevado-row">
          <div class="vg-llevado-lbl" style="color:var(--ink-light);">cant.</div>
          <div class="vg-talle-steppers">${steppers}</div>
        </div>
      </div>`;
    } else {
      // Mobile llevado: chips de referencia arriba + steppers abajo
      const pT = TALLES.reduce((s, l) => s + (parseInt(v["_cant_" + l]) || 0), 0);
      const lT = TALLES.reduce((s, l) => s + (parseInt(v["_llev_" + l]) || 0), 0);

      const chips = TALLES.map(lbl => {
        const n = parseInt(v["_cant_" + lbl]) || 0;
        return `<span class="vg-ref-chip">
          <span class="vg-ref-chip-sz">${lbl}</span>
          <span class="vg-ref-chip-val${n === 0 ? " zero" : ""}">${n || "—"}</span>
        </span>`;
      }).join("");

      const steppers = TALLES.map(lbl => {
        const k = "_llev_" + lbl;
        return `<div class="vg-talle-stp">
          <div class="vg-talle-stp-lbl">${lbl}</div>
          ${stp(v[k],
            `_ventaTalleStep('${v.id}','${k}',-1)`,
            `_ventaTalleStep('${v.id}','${k}',1)`,
            `(function(el){var x=getVentas().find(x=>x.id==='${v.id}');if(x){x['${k}']=el.value;guardar();renderVentas();}})(this)`,
            true
          )}
        </div>`;
      }).join("");

      // diff badge
      let diffCls = "", diffTxt = "—";
      if (pT > 0 || lT > 0) {
        if (lT === pT) { diffCls = "ok"; diffTxt = "✓"; }
        else if (lT < pT) { diffCls = "low"; diffTxt = String(lT - pT); }
        else { diffCls = "hi"; diffTxt = "+" + (lT - pT); }
      }

      return `<div class="vg-row vg-row-talle-mobile${hayDatos ? " vg-row-on" : ""}">
        <div class="vg-row-talle-top">
          <div class="vg-nom">${esc(v.nombre)}</div>
          <div class="vg-ref-chips">
            <span class="vg-ref-chips-lbl">ref</span>
            ${chips}
          </div>
        </div>
        <div class="vg-llevado-row">
          <div class="vg-llevado-lbl">llev.</div>
          <div class="vg-talle-steppers">${steppers}</div>
          <div class="vg-llevado-diff ${diffCls}">${diffTxt}</div>
        </div>
      </div>`;
    }
  }

  // ── selector de función según plataforma ──
  function fillaTalle(v) {
    return mobile ? fillaTalleMobile(v) : fillaTalleDesktop(v);
  }

  // ── encabezado según modo (solo desktop) ──
  const headTop = _ventasModo === "pedido"
    ? `<div class="vg-head-grupo">pedido</div>`
    : `<div class="vg-head-grupo" style="color:var(--ink-light);font-size:.52rem;">referencia</div>
       <div class="vg-head-grupo vg-head-acc">llevado</div>`;

  const headSub = _ventasModo === "pedido"
    ? `<div class="vg-head-grupo">
         <div class="vg-head-talle">ch</div>
         <div class="vg-head-talle">md</div>
         <div class="vg-head-talle">gr</div>
       </div>`
    : `<div class="vg-head-grupo">
         <div class="vg-head-talle">ch</div>
         <div class="vg-head-talle">md</div>
         <div class="vg-head-talle">gr</div>
       </div>
       <div class="vg-sep-vert vg-sep-head"></div>
       <div class="vg-head-grupo vg-head-acc">
         <div class="vg-head-talle">ch</div>
         <div class="vg-head-talle">md</div>
         <div class="vg-head-talle">gr</div>
       </div>
       <div style="width:36px;"></div>`;

  // ── summary bar (solo en modo llevado) ──
  const totPed = totalCampo("cantidad");
  const totLlev = totalCampo("llevada");
  const summaryHtml = _ventasModo === "llevado" ? `
    <div class="vg-summary-bar">
      <div class="vg-scard"><div class="vg-scard-label">Pedido total</div><div class="vg-scard-val">${totPed}</div></div>
      <div class="vg-scard"><div class="vg-scard-label">Llevado total</div><div class="vg-scard-val">${totLlev}</div></div>
      <div class="vg-scard"><div class="vg-scard-label">Restante</div><div class="vg-scard-val">${totPed - totLlev}</div></div>
    </div>` : "";

  // ── armar tabla ──
  let html = `
    <div class="vg-mode-bar">
      <button class="vg-mode-btn${_ventasModo === "pedido" ? " vg-mode-active" : ""}"
        onclick="_ventasModo='pedido';renderVentas()">① Cargar pedidos</button>
      <button class="vg-mode-btn${_ventasModo === "llevado" ? " vg-mode-active" : ""}"
        onclick="_ventasModo='llevado';renderVentas()">② Marcar llevados</button>
    </div>
    ${summaryHtml}
    <div class="vg-tabla">
      <div class="vg-head-top">
        <div class="vg-head-nom"></div>
        <div class="vg-head-groups">${headTop}</div>
      </div>
      <div class="vg-head-sub">
        <div class="vg-head-nom"></div>
        <div class="vg-head-groups">${headSub}</div>
      </div>`;

  CAT_ORDEN.forEach(cat => {
    const items = porCat[cat] || [];
    if (!items.length) return;
    const tieneData = items.some(v =>
      v._tieneTalle
        ? TALLES.some(l => (parseInt(v["_cant_" + l]) || 0) > 0 || (parseInt(v["_llev_" + l]) || 0) > 0)
        : (parseInt(v.cantidad) || 0) > 0 || (parseInt(v.llevada) || 0) > 0
    );
    const catId = "vg-cat-" + cat;
    html += `<div class="vg-sep-cat" onclick="(function(el){const body=document.getElementById('${catId}');const open=body.style.display!=='none';body.style.display=open?'none':'block';el.querySelector('.vg-cat-arrow').textContent=open?'▶':'▼';})(this)" style="cursor:pointer;user-select:none;">
      <span class="vg-cat-arrow" style="font-size:.55rem;color:var(--ink-light);margin-right:5px;">${tieneData ? "▼" : "▶"}</span>${CAT_LABEL[cat] || cat}
    </div>
    <div id="${catId}" style="display:${tieneData ? "block" : "none"}">
      ${items.map(v => v._tieneTalle ? fillaTalle(v) : filaSimple(v)).join("")}
    </div>`;
  });

  html += `</div>`;

  // Botón "pasar al siguiente paso" solo en modo pedido
  if (_ventasModo === "pedido") {
    html += `<button class="vg-mode-next" onclick="_ventasModo='llevado';renderVentas()">Listo, pasar a marcar llevados →</button>`;
  }

  // Productos manuales + agregar
  html += `<div class="vg-libre">
    <div class="vg-libre-titulo">✏️ Agregar producto</div>
    ${manuales.map(v => filaSimple(v, true)).join("")}
    <div class="vg-libre-row">
      <input type="text" id="venta-nueva-nombre" placeholder="Nombre del producto..."
        class="vg-libre-input"
        onkeydown="if(event.key==='Enter'){agregarVentaManual();event.preventDefault();}">
      <button onclick="agregarVentaManual()" class="vg-libre-add">＋</button>
    </div>
  </div>`;

  cont.innerHTML = html;
  renderCubaResumen();
}