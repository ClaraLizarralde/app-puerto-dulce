/**
 * ================================================================
 * ÍNDICE DE FUNCIONES (PEDIDOS.JS)
 * ================================================================
 *
 * === ESTADO Y RENDER GENERAL ===
 * - renderEstadoLocal()               → Actualiza la UI con estado del local (abierto/cerrando/cerrado)
 * - renderAll()                       → Refresca toda la interfaz (pedidos, stats, banner, etc.)
 *
 * === BANNER DÍA PRINCIPAL ===
 * - renderDiaBanner()                 → Muestra el banner del día actual con fecha, estado especial
 * - toggleDiaEspecial()               → Activa modo día especial
 * - confirmarDiaNormal()              → Confirma volver a día normal (modal)
 * - setDiaEspecialCampo(campo, valor) → Cambia nombre o corte horario de día especial
 *
 * === NAVEGACIÓN DE DÍAS ===
 * - setDiaActivo(k)                   → Cambia el día activo (sincroniza diaActual y _poTabDia)
 * - renderDiasNav()                   → Renderiza pestañas de navegación por días (vista legacy)
 * - agregarDia()                      → Agrega un nuevo día al sistema
 *
 * === ESTADÍSTICAS ===
 * - renderStats()                     → Calcula y muestra total de pedidos, tortas y otros productos
 *
 * === BÚSQUEDA Y AUTOCOMPLETADO ===
 * - onBuscadorInput()                 → Autocompleta clientes al escribir en buscador
 * - seleccionarAutocompletado(clienteId) → Selecciona cliente desde autocompletado
 *
 * === FILTROS ===
 * - setFiltro(f, el)                  → Filtra pedidos por estado (pendientes, listos, Cuba, etc.)
 * - setFiltroDia(tipo, el)            → Filtra pedidos por día (hoy, mañana, otro)
 * - setFiltroDiaKey(k)                → Cambia clave de día para filtro "otro"
 *
 * === OBTENCIÓN DE PEDIDOS FILTRADOS ===
 * - getPedidosFiltradosDeDia(diaKey)  → Retorna pedidos de un día aplicando filtros activos
 * - getPedidosFiltrados()             → Alias para pedidos del día actual
 *
 * === RENDER DE PEDIDOS (VISTA PLANILLA LEGACY) ===
 * - buildDiaBanner(diaKey)            → Construye banner separador de día en la planilla
 * - calcularTotalPedido(p)            → Calcula el total monetario de un pedido
 * - buildPanel(p)                     → Construye panel de edición de pedido (vista expandida)
 *
 * === AUTOCOMPLETADO CLIENTE EN PANEL ===
 * - onClienteInput(pedidoId, valor)   → Sugiere clientes al escribir en panel edición
 * - aplicarClientePanel(pedidoId, clienteId) → Aplica cliente seleccionado al pedido
 *
 * === ACCIONES SOBRE PEDIDOS ===
 * - marcarDiaEspecialPedido(id)       → Marca un pedido como "día especial"
 * - confirmarDesmarcarEspecial(id)    → Confirma quitar marca de día especial
 * - updatePedido(id, campo, valor)    → Actualiza campo genérico de un pedido
 * - updateClienteInput(id, valor)     → Actualiza nombre de cliente en pedido
 * - setEstado(id, estado)             → Cambia estado del pedido (pendiente/prod/listo/entregado)
 * - toggleListoPedido(id)             → Alterna estado entre listo/pendiente
 * - validarPedido(p)                  → Valida que el pedido tenga datos mínimos
 * - guardarCerrar(id)                 → Guarda cambios y cierra panel de edición
 * - confirmarEliminar(id)             → Elimina pedido con confirmación
 *
 * === ARCHIVADOS ===
 * - archivarRetirados()               → Mueve pedidos retirados a archivados
 * - toggleArchivadosLista()           → Muestra/oculta lista de archivados del día
 * - toggleArchivadosGlobal()          → Muestra/oculta lista global de archivados
 * - renderArchivadosContent(wrapperId, global) → Renderiza contenido de archivados (local o global)
 * - renderArchivadosSeccion()         → Muestra sección de archivados del día actual
 * - actualizarContadorArchivadosGlobal() → Actualiza solo el contador global de archivados
 *
 * === PEDIDOS PENDIENTES DE DÍAS ANTERIORES ===
 * - chequearPendientesAyer()          → Muestra toast si hay pedidos sin revisar de días pasados
 * - cerrarBannerPendientes()          → Cierra el toast de pendientes
 *
 * === MANEJO DE PRODUCTOS (dentro de pedido) ===
 * - ajustarCantidad(pedidoId, rId, delta)     → Ajusta cantidad de producto (+/-)
 * - setProdCampo(pedidoId, rId, campo, valor) → Actualiza campo de producto
 * - toggleNotaProd(pedidoId, rId)             → Muestra/oculta textarea de nota por producto
 * - toggleNotaGeneral(pedidoId)               → Muestra/oculta nota general del pedido
 * - actualizarBotonNota(pedidoId, valor)      → Actualiza texto del botón de nota
 * - toggleProdListo(pedidoId, rId)            → Marca/desmarca producto como listo
 * - toggleTaccChk(pedidoId, rId, campo)       → Alterna checkbox de producto (pedido_cuba/separado_cuba)
 * - setTamano(pedidoId, rId, tam)             → Cambia talle del producto (Chico/Mediano/Grande/Libre)
 * - setTamanoLibre(pedidoId, rId, valor)      → Cambia talle libre (texto)
 * - eliminarProducto(pedidoId, rId)           → Elimina producto del pedido
 * - agregarProducto(pedidoId)                 → Abre selector para agregar producto
 * - buildProdEdit(pedidoId, r, idx)           → Construye HTML de fila de producto en edición
 *
 * === MOVER PEDIDOS ENTRE DÍAS ===
 * - buildMoverOpts(pedidoId)          → Construye opciones de días para mover pedido
 * - moverPedido(pedidoId, diaDestino) → Mueve pedido a otro día
 *
 * === BACK-OFFICE: TABLA DE PEDIDOS ===
 * - asignarIds()                      → Asigna IDs ascendentes (_pid) a pedidos sin ID
 * - _poDayTabLabel(k)                 → Genera etiqueta corta para pestaña de día
 * - _poDaySepLabel(k)                 → Genera etiqueta larga para separador de día
 * - _poFormatTs(ts)                   → Formatea timestamp a DD/MM HH:MM
 * - _poGetDiaDePedido(id)             → Retorna la clave del día donde está un pedido
 * - setOrden(v)                       → Cambia el criterio de ordenamiento de pedidos
 * - sortPedidos(ps)                   → Ordena array de pedidos según _poOrden
 * - toggleVistaArchivados()           → Alterna entre vista pedidos activos / archivados
 * - actualizarContadorArchivados()    → Actualiza contador de archivados en la tabla
 * - renderTablaArchivados(tbody)      → Renderiza tabla de pedidos archivados
 * - renderDayTabs()                   → Renderiza pestañas de navegación por días
 * - setTabTodos()                     → Activa la vista "Todos los días"
 * - renderPedidos()                   → Punto de entrada principal: renderiza tabs + tabla
 * - renderPedidosTable()              → Renderiza el contenido de la tabla de pedidos
 * - poToggleExpand(id)                → Expande/colapsa fila con detalles del pedido
 * - initPedidosBO()                   → Inicializa el back-office de pedidos
 *
 * ================================================================
 */

let filtroDia = "todos";
let filtroDiaKey = null;

// ── ESTADO LOCAL ──
// Actualiza la UI con el estado del local (abierto/cerrando/cerrado)
function renderEstadoLocal() {
  const { estado, texto, color } = getEstadoLocal();
  const dot = estado === "abierto" ? "🟢" : estado === "cerrando" ? "🟡" : "🔴";
  ["local-status-pill", "local-status-pill-banner"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = dot + " " + texto;
    el.style.color = color;
    el.title = texto;
  });
}

// Refresca toda la interfaz
function renderAll() {
  renderPedidos();
  renderStats();
  renderDiaBanner();
  renderArchivadosSeccion();
  renderEstadoLocal();
  const cubaTab = document.getElementById("tab-cuba");
  if (cubaTab && cubaTab.classList.contains("active")) renderCuba();
  const prodTab = document.getElementById("tab-produccion");
  if (prodTab && prodTab.classList.contains("active")) renderProduccion();
}

// ── NAVEGACIÓN DE DÍAS ──
// Fuente de verdad única para cambiar el día activo.
// Siempre usar esta función en lugar de asignar diaActual y _poTabDia por separado.
function setDiaActivo(k) {
  diaActual = k;
  _poTabDia = k;
  _poExpandedId = null;
}

// ── BANNER DÍA ──
// Muestra el banner del día actual con fecha y modo especial
function renderDiaBanner() {
  const hoy = fechaKey(new Date());
  const esHoy = diaActual === hoy;
  const [y, m, d] = diaActual.split("-").map(Number);
  const f = new Date(y, m - 1, d);
  const dow = f.getDay();
  const nombreDia = DIAS_FULL[dow].toUpperCase();
  const fechaStr = `${d} de ${MESES[m - 1]} de ${y}`;
  const dd = diaData();
  const especial = dd.especial || false;

  const banner = document.getElementById("dia-principal-banner");
  banner.className = "dia-principal-banner";
  banner.classList.add(DIA_CLASES[dow]);

  document.getElementById("dpb-dia").textContent = `${nombreDia} ${d}`;
  document.getElementById("dpb-fecha").textContent = fechaStr;

  const badgeHoy = document.getElementById("dpb-hoy-badge");
  badgeHoy.style.display = esHoy ? "" : "none";

  let cfg = document.getElementById("dia-especial-config-bar");
  if (!cfg) {
    cfg = document.createElement("div");
    cfg.id = "dia-especial-config-bar";
    banner.parentNode.insertBefore(cfg, banner.nextSibling);
  }
  if (especial) {
    const corte = dd.corteHora || "15:00";
    const nombreEsp = dd.nombreEspecial || "";
    cfg.className = "dia-especial-config";
    cfg.innerHTML = `
      <span style="font-size:.9rem">⚡</span>
      <span class="dec-label">Nombre:</span>
      <input type="text" value="${esc(nombreEsp)}" placeholder="Día de la madre..." onchange="setDiaEspecialCampo('nombreEspecial',this.value)">
      <div class="dec-sep"></div>
      <span class="dec-label">Corte:</span>
      <input type="time" value="${esc(corte)}" onchange="setDiaEspecialCampo('corteHora',this.value)">
      <span style="font-size:.62rem;opacity:.6;margin-left:2px;">← divide turnos</span>
      <button class="btn-dia-normal" onclick="confirmarDiaNormal()">Volver a normal</button>
    `;
  } else {
    cfg.className = "";
    cfg.innerHTML = "";
  }

  renderDiasNav();
}

// Activa modo día especial
function toggleDiaEspecial() {
  const dd = diaData();
  if (!dd.especial) {
    dd.especial = true;
    if (!dd.corteHora) dd.corteHora = "15:00";
    guardar();
    renderDiaBanner();
    renderProduccion();
    renderCuba();
  }
}

// Confirma volver a día normal
function confirmarDiaNormal() {
  abrirModalGen("¿Volver a día normal?", "Se desactivará el modo día especial para este día.", () => {
    diaData().especial = false;
    guardar();
    renderDiaBanner();
    renderProduccion();
    renderCuba();
  }, "danger");
}

// Cambia nombre o corte horario de día especial
function setDiaEspecialCampo(campo, valor) {
  diaData()[campo] = valor;
  guardar();
  renderProduccion();
  renderCuba();
}

// ── NAVEGACIÓN POR DÍAS (legacy) ──
// Renderiza pestañas de navegación por días en la vista de banner
function renderDiasNav() {
  const nav = document.getElementById("dias-nav");
  if (!nav) return;
  const hoy = fechaKey(new Date());
  archivarDiasPasadosAuto(hoy);
  const keys = Object.keys(datos.dias).filter(k => k >= hoy || k === diaActual).sort();
  nav.innerHTML = "";
  keys.forEach(k => {
    const [y, m, d] = k.split("-").map(Number);
    const f = new Date(y, m - 1, d);
    const dow = f.getDay();
    const btn = document.createElement("div");
    btn.className = "dia-tab" + (k === diaActual ? " active" : "") + (k === hoy ? " hoy" : "");
    const dot = `<span class="dia-dot" style="background:${DIA_DOTS[dow]}"></span>`;
    btn.innerHTML = `<span class="dia-num">${d}</span>${dot}${DIAS_S[dow]} ${MESES[m - 1]}`;
    btn.onclick = () => {
      setDiaActivo(k);
      const tabPedidos = document.querySelector(".tab");
      if (tabPedidos) showTab("pedidos", tabPedidos);
      renderDiasNav();
      renderAll();
    };
    nav.appendChild(btn);
  });
  const add = document.createElement("button");
  add.className = "btn-add-dia";
  add.textContent = "+";
  add.onclick = agregarDia;
  nav.appendChild(add);
  setTimeout(() => {
    const a = nav.querySelector(".dia-tab.active");
    if (a) a.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, 50);
}

// Agrega un nuevo día al sistema
function agregarDia() {
  const hoy = fechaKey(new Date());
  const keys = Object.keys(datos.dias).sort();
  const ultimo = keys[keys.length - 1] || hoy;
  const base = new Date(ultimo + "T12:00:00");
  base.setDate(base.getDate() + 1);
  const nuevo = fechaKey(base);
  if (!datos.dias[nuevo]) datos.dias[nuevo] = { pedidos: [], ventas: [] };
  setDiaActivo(nuevo);
  guardar();
  renderDiasNav();
  renderAll();
}

// ── STATS ──
// Calcula y muestra total de pedidos, tortas y otros productos
function renderStats() {
  const hoy = fechaKey(new Date());
  const diasVisibles = Object.keys(datos.dias).filter(k => k >= hoy || k === diaActual).sort();
  const psAll = diasVisibles.flatMap(k => (datos.dias[k]?.pedidos || []));

  const fcPedidos = psAll.length;
  const fcTortasReal = psAll.reduce((s, p) => s + (p.productos || []).filter(r => {
    const cat = datos.catalogo.find(c => c.nombre === r.nombre);
    return cat && cat.tiene_talle;
  }).reduce((ss, r) => ss + (() => { const _n = Number(r.cantidad); return isNaN(_n) ? 1 : _n; })(), 0), 0);
  const fcOtros = psAll.reduce((s, p) => s + (p.productos || []).filter(r => {
    const cat = datos.catalogo.find(c => c.nombre === r.nombre);
    return !(cat && cat.tiene_talle);
  }).reduce((ss, r) => ss + (() => { const _n = Number(r.cantidad); return isNaN(_n) ? 1 : _n; })(), 0), 0);

  const elFcP = document.getElementById("fc-pedidos");
  if (elFcP) elFcP.textContent = fcPedidos;
  const elFcT = document.getElementById("fc-tortas");
  if (elFcT) elFcT.textContent = fcTortasReal;
  const elFcO = document.getElementById("fc-productos");
  if (elFcO) elFcO.textContent = fcOtros;
}

// ── AUTOCOMPLETADO EN BUSCADOR ──
function onBuscadorInput() {
  renderPedidos();
  const q = (document.getElementById("buscador").value || "").toLowerCase().trim();
  const lista = document.getElementById("autocomplete-lista");
  if (!q || q.length < 2) {
    lista.classList.remove("visible");
    return;
  }
  const frecs = datos.clientes.filter(c => c.nombre.toLowerCase().includes(q) && !esCuba(c.nombre));
  if (!frecs.length) {
    lista.classList.remove("visible");
    return;
  }
  const sorted = [...frecs].sort((a, b) => (b.frecuente ? 1 : 0) - (a.frecuente ? 1 : 0));
  lista.innerHTML = sorted.map(c => `
    <div class="autocomplete-item" onclick="seleccionarAutocompletado('${c.id}')">
      <span>${c.frecuente ? '<span class="ac-star">⭐</span>' : ""} ${esc(c.nombre)}</span>
      <span class="ac-tel">${esc(c.tel || "")}</span>
    </div>
  `).join("");
  lista.classList.add("visible");
}

function seleccionarAutocompletado(clienteId) {
  const cl = datos.clientes.find(c => c.id === clienteId);
  if (!cl) return;
  document.getElementById("buscador").value = cl.nombre;
  document.getElementById("autocomplete-lista").classList.remove("visible");
  renderPedidos();
}

// ── FILTROS ──
function setFiltro(f, el) {
  if (filtro === f && f !== "todos") {
    filtro = "todos";
    document.querySelectorAll(".po-filter-row .po-chip").forEach(b => b.classList.remove("active"));
    document.querySelector('.po-filter-row .po-chip[onclick*="todos"]')?.classList.add("active");
    renderDayTabs();
    renderPedidosTable();
    return;
  }
  filtro = f;
  document.querySelectorAll(".po-filter-row .po-chip").forEach(b => b.classList.remove("active"));
  if (el) el.classList.add("active");
  renderDayTabs();
  renderPedidosTable();
}

function setFiltroDia(tipo, el) {
  if (filtroDia === tipo) {
    filtroDia = null;
    el.classList.remove("active");
    document.getElementById("filtro-dia-select").style.display = "none";
    filtroDiaKey = null;
    renderPedidos();
    return;
  }

  filtroDia = tipo;
  document.querySelectorAll("#filtro-dia-hoy,#filtro-dia-manana,#filtro-dia-otro")
    .forEach(b => b.classList.remove("active"));
  el.classList.add("active");
  const sel = document.getElementById("filtro-dia-select");
  if (tipo === "otro") {
    const keys = Object.keys(datos.dias).sort();
    sel.innerHTML = keys.map(k => {
      const [y, m, d] = k.split("-").map(Number);
      const f = new Date(y, m - 1, d);
      const dow = f.getDay();
      return `<option value="${k}">${DIAS_FULL[dow]} ${d} de ${MESES[m - 1]}</option>`;
    }).join("");
    sel.style.display = "";
    filtroDiaKey = keys[0] || null;
    sel.value = filtroDiaKey;
  } else {
    sel.style.display = "none";
    filtroDiaKey = null;
  }
  renderPedidos();
}

function setFiltroDiaKey(k) {
  filtroDiaKey = k;
  renderPedidos();
}

// ── OBTENCIÓN DE PEDIDOS FILTRADOS ──
// Retorna pedidos de un día aplicando filtros activos
function getPedidosFiltradosDeDia(diaKey) {
  if (filtroDia !== "todos") {
    const hoy = fechaKey(new Date());
    const manana = fechaKey(new Date(Date.now() + 86400000));
    if (filtroDia === "hoy" && diaKey !== hoy) return [];
    if (filtroDia === "manana" && diaKey !== manana) return [];
    if (filtroDia === "otro" && diaKey !== filtroDiaKey) return [];
  }
  const dData = datos.dias[diaKey];
  if (!dData) return [];
  let ps = dData.pedidos || [];
  const q = (document.getElementById("buscador").value || "").toLowerCase().trim();
  if (q) ps = ps.filter(p => {
    if ((p.cliente || "").toLowerCase().includes(q)) return true;
    if ((p.cliente_input || "").toLowerCase().includes(q)) return true;
    if ((p.tel || "").toLowerCase().includes(q)) return true;
    if ((p.notas || "").toLowerCase().includes(q)) return true;
    if ((p.productos || []).some(r => {
      const nom = r.tipo === "catalogo" ? r.nombre : r.libre;
      return (nom || "").toLowerCase().includes(q) || (r.nota_prod || "").toLowerCase().includes(q);
    })) return true;
    return false;
  });
  if (filtro === "pendientes") ps = ps.filter(p => p.estado === "pendiente" || p.estado === "prod");
  if (filtro === "listos") ps = ps.filter(p => p.estado === "listo");
  if (filtro === "noRetirados") ps = ps.filter(p => p.estado !== "entregado");
  if (filtro === "cuba") ps = ps.filter(p => esCuba(p.cliente));
  if (filtro === "sinTacc") ps = ps.filter(p => (p.productos || []).some(r => r.tacc === "s"));
  // "clientes" filtra todo lo que NO es Cuba (pedidos de clientes externos)
  if (filtro === "clientes") ps = ps.filter(p => !esCuba(p.cliente));
  return sortPedidos(ps);
}

function getPedidosFiltrados() {
  return getPedidosFiltradosDeDia(diaActual);
}

// ── BANNER DE DÍA DIVISOR (vista planilla legacy) ──
function buildDiaBanner(diaKey) {
  const hoy = fechaKey(new Date());
  const [y, m, d] = diaKey.split("-").map(Number);
  const f = new Date(y, m - 1, d);
  const dow = f.getDay();
  const nombreDia = DIAS_FULL[dow].toUpperCase();
  const fechaStr = `${d} de ${MESES[m - 1]}`;
  const esHoy = diaKey === hoy;
  const esMañana = diaKey === fechaKey(new Date(new Date().setDate(new Date().getDate() + 1)));
  const dData = datos.dias[diaKey] || {};
  const ps = (dData.pedidos || []);
  const total = ps.length;
  const pendientes = ps.filter(p => p.estado === "pendiente" || p.estado === "prod").length;
  const listos = ps.filter(p => p.estado === "listo").length;
  const retirados = ps.filter(p => p.estado === "entregado").length;

  const etiquetaDia = esHoy ? "HOY" : esMañana ? "MAÑANA" : "";

  const div = document.createElement("div");
  div.className = `dia-banner-divisor ${DIA_CLASES[dow]}`;
  div.dataset.diaKey = diaKey;
  div.innerHTML = `
    <div class="dbd-left">
      <div class="dbd-dia">${nombreDia} ${d}</div>
      <div class="dbd-fecha">${fechaStr} de ${y}</div>
    </div>
    <div class="dbd-right">
      ${etiquetaDia ? `<span class="dbd-badge">${etiquetaDia}</span>` : ""}
      <div class="dbd-stats">
        ${pendientes > 0 ? `<span class="dbd-stat pend">${pendientes} pend.</span>` : ""}
        ${listos > 0 ? `<span class="dbd-stat listo">${listos} listo${listos > 1 ? "s" : ""}</span>` : ""}
        ${retirados > 0 ? `<span class="dbd-stat ret">${retirados} ret.</span>` : ""}
        ${total === 0 ? `<span class="dbd-stat vacio">sin pedidos</span>` : ""}
      </div>
    </div>
  `;
  return div;
}

// Calcula el total monetario de un pedido
function calcularTotalPedido(p) {
  return totalDePedido(p);
}

// Construye panel de edición de pedido (vista expandida)
function buildPanel(p) {
  const isCuba = esCuba(p.cliente);
  const estado = p.estado || "pendiente";
  const estadoOpts = ["pendiente", "prod", "listo", "entregado"];
  const estadoLabels = { pendiente: "Pendiente", prod: "En producción", listo: "Listo", entregado: "Retirado" };
  const estadoHTML = estadoOpts.map(e => `<div class="estado-opt${estado === e ? " active-" + e : ""}" onclick="setEstado('${p.id}','${e}')">${estadoLabels[e]}</div>`).join("");
  const prodsHTML = (p.productos || []).map((r, i) => buildProdEdit(p.id, r, i)).join("");
  const pagadoBar = p.pagado
    ? `<div class="pago-bar si">✅ Pagado · ${esc(p.metodoPago || "")} <button class="btn-pagar despagar" onclick="abrirModalPago('${p.id}',true)">Deshacer</button></div>`
    : `<div class="pago-bar no">💳 Sin confirmar pago <button class="btn-pagar pagar" onclick="abrirModalPago('${p.id}',false)">Confirmar pago</button></div>`;
  const dd = diaData();
  const especial = dd.especial || false;
  const corte = dd.corteHora || "15:00";
  const totalPedido = calcularTotalPedido(p);
  const esEspecialPedido = p.dia_especial || false;

  return `
    ${isCuba ? `
    <div style="background:var(--cuba-bg);border:1.5px solid var(--cuba-border);border-radius:var(--radius-sm);padding:6px 12px;margin-bottom:10px;font-size:.75rem;color:var(--cuba-ink);font-weight:500;">🏪 Pedido de Cuba</div>
    ${especial ? `
    <div class="campo"><label>Turno de envío</label>
      <div class="cuba-turno-sel">
        <div class="cuba-turno-btn t1${(p.hora_entrega || "") <= corte && p.hora_entrega ? " active" : ""}" onclick="updatePedido('${p.id}','hora_entrega','${corte}');renderPedidos()">🟠 Turno 1 — ${esc(corte)}</div>
        <div class="cuba-turno-btn t2${(p.hora_entrega || "") > corte ? " active" : ""}" onclick="updatePedido('${p.id}','hora_entrega','18:00');renderPedidos()">🔵 Turno 2 — 18:00</div>
      </div>
    </div>` : ""}
    ` : `
    <div class="campos-2">
      <div class="campo autocomplete-wrap">
        <label>Cliente</label>
        <input type="text" id="inp-cliente-${p.id}" value="${esc(p.cliente_input || p.cliente || "")}" placeholder="Nombre..." oninput="onClienteInput('${p.id}',this.value)" autocomplete="off">
        <div class="autocomplete-lista" id="ac-${p.id}"></div>
      </div>
      <div class="campo"><label>Teléfono</label><input type="tel" id="inp-tel-${p.id}" value="${esc(p.tel || "")}" placeholder="11 1234-5678" onchange="updatePedido('${p.id}','tel',this.value)"></div>
    </div>
    <div class="campo" style="max-width:140px"><label>Hora de entrega</label><input type="time" value="${esc(p.hora_entrega || "")}" onchange="updatePedido('${p.id}','hora_entrega',this.value)"></div>
    `}

    <!-- Día especial pedido -->
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
      <label style="font-size:.62rem;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-light);font-weight:500;">Marcar como:</label>
      ${esEspecialPedido
        ? `<span style="font-size:.65rem;font-weight:700;padding:3px 10px;border-radius:10px;background:var(--amber);color:#fff;">⚡ DÍA ESPECIAL</span>
           <button onclick="confirmarDesmarcarEspecial('${p.id}')" style="font-size:.6rem;padding:2px 8px;border:1.5px solid var(--amber);border-radius:8px;background:transparent;color:var(--amber);cursor:pointer;">Cambiar a normal</button>`
        : `<button onclick="marcarDiaEspecialPedido('${p.id}')" style="font-size:.62rem;padding:3px 10px;border:1.5px dashed var(--amber);border-radius:10px;background:transparent;color:var(--amber);cursor:pointer;">⚡ Día especial</button>`
      }
    </div>

    <div class="sep-line"></div>
    <div class="campo"><label>Productos</label></div>
    <div class="prod-edit-wrap" id="prods-${p.id}">${prodsHTML}</div>
    <button class="btn-add-prod" onclick="agregarProducto('${p.id}')">＋ Agregar producto</button>

    ${totalPedido > 0 ? `<div class="pedido-total-bar"><span>Total del pedido</span><span class="ptb-num">$${totalPedido.toLocaleString("es-AR")}</span></div>` : ""}

    <div class="sep-line"></div>
    <div class="campo"><label>Estado</label><div class="estado-sel">${estadoHTML}</div></div>
    <div class="sep-line"></div>
    ${isCuba ? "" : pagadoBar}
    <div class="campo">
      <button class="nota-general-toggle" onclick="toggleNotaGeneral('${p.id}')">📝 ${p.notas ? "Nota: " + esc(p.notas.slice(0, 40)) + (p.notas.length > 40 ? "…" : "") : "Agregar nota general"}</button>
      <div class="nota-general-wrap" id="nota-gen-${p.id}" style="${p.notas ? "display:block" : "display:none"}">
        <textarea class="notas-input" placeholder="${isCuba ? "Aclaraciones para Cuba..." : "Sin dulce de leche, avisame cuando esté..."}" onchange="updatePedido('${p.id}','notas',this.value);actualizarBotonNota('${p.id}',this.value)">${esc(p.notas || "")}</textarea>
      </div>
    </div>
    <div class="sep-line"></div>
    <div class="mover-dia-wrap">
      <div style="font-size:.56rem;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-light);font-weight:500;margin-bottom:4px;">Mover a otro día</div>
      <div class="mover-dia-opts">${buildMoverOpts(p.id)}</div>
    </div>
    <div class="btns-accion">
      <button class="btn-guardar" onclick="guardarCerrar('${p.id}')">Guardar</button>
      <button class="btn-danger" onclick="confirmarEliminar('${p.id}')">Eliminar</button>
    </div>
  `;
}

// ── AUTOCOMPLETADO CLIENTE EN PANEL ──
function onClienteInput(pedidoId, valor) {
  updateClienteInput(pedidoId, valor);
  const q = valor.toLowerCase().trim();
  const lista = document.getElementById("ac-" + pedidoId);
  if (!lista) return;
  if (!q || q.length < 2) {
    lista.classList.remove("visible");
    return;
  }
  const matches = datos.clientes.filter(c => c.nombre.toLowerCase().includes(q) && !esCuba(c.nombre)).slice(0, 6);
  if (!matches.length) {
    lista.classList.remove("visible");
    return;
  }
  const sorted = [...matches].sort((a, b) => (b.frecuente ? 1 : 0) - (a.frecuente ? 1 : 0));
  lista.innerHTML = sorted.map(c => `
    <div class="autocomplete-item" onclick="aplicarClientePanel('${pedidoId}','${c.id}')">
      <span>${c.frecuente ? '<span class="ac-star">⭐</span> ' : ""} ${esc(c.nombre)}</span>
      <span class="ac-tel">${esc(c.tel || "")}</span>
    </div>
  `).join("");
  lista.classList.add("visible");
}

function aplicarClientePanel(pedidoId, clienteId) {
  const cl = datos.clientes.find(c => c.id === clienteId);
  if (!cl) return;
  const p = getAllPedidos().find(x => x.id === pedidoId);
  if (!p) return;
  p.cliente_input = cl.nombre;
  p.cliente = normalizarCliente(cl.nombre);
  if (cl.tel) p.tel = cl.tel;
  guardar();
  const lista = document.getElementById("ac-" + pedidoId);
  if (lista) lista.classList.remove("visible");
  const inp = document.getElementById("inp-cliente-" + pedidoId);
  if (inp) inp.value = cl.nombre;
  const telInp = document.getElementById("inp-tel-" + pedidoId);
  if (telInp) telInp.value = cl.tel || "";
}

// ── ACCIONES SOBRE PEDIDOS ──
function marcarDiaEspecialPedido(id) {
  const p = getAllPedidos().find(x => x.id === id);
  if (!p) return;
  p.dia_especial = true;
  guardar();
  renderPedidos();
}

function confirmarDesmarcarEspecial(id) {
  abrirModalGen("¿Cambiar a pedido normal?", "Este pedido dejará de marcarse como día especial.", () => {
    const p = getAllPedidos().find(x => x.id === id);
    if (!p) return;
    p.dia_especial = false;
    guardar();
    renderPedidos();
  }, "danger");
}

function updatePedido(id, campo, valor) {
  const p = getAllPedidos().find(x => x.id === id);
  if (!p) return;
  if (campo === "cliente_input") {
    p.cliente_input = valor;
    p.cliente = normalizarCliente(valor);
  } else {
    p[campo] = valor;
  }
  guardar();
  setSyncPendiente();
}

function updateClienteInput(id, valor) {
  const p = getAllPedidos().find(x => x.id === id);
  if (!p) return;
  p.cliente_input = valor;
  p.cliente = normalizarCliente(valor);
  guardar();
}

function setEstado(id, estado) {
  const p = getAllPedidos().find(x => x.id === id);
  if (!p) return;
  p.estado = estado;
  if (!p.historial) p.historial = [];
  p.historial.push({ estado, ts: Date.now() });

  if (estado === "entregado") {
    const diaKey = _poGetDiaDePedido(id);
    const [y, m, d] = diaKey.split("-").map(Number);
    const nomDia = DIAS_FULL[new Date(y, m - 1, d).getDay()];
    // Verificar ANTES del push para evitar duplicados
    const yaArchivado = datos.archivados.some(a => a.id === id);
    if (!yaArchivado) {
      datos.archivados.push({
        ...p,
        _fecha: diaKey,
        _nomDia: nomDia,
        _archivadoTs: Date.now()
      });
    }
    if (datos.dias[diaKey]) {
      datos.dias[diaKey].pedidos = datos.dias[diaKey].pedidos.filter(x => x.id !== id);
    }
    _poExpandedId = null;
  }

  guardar();
  renderPedidos();
}

function toggleListoPedido(id) {
  const p = getAllPedidos().find(x => x.id === id);
  if (!p) return;
  const nuevo = p.estado === "listo" ? "pendiente" : "listo";
  setEstado(id, nuevo);
}

function validarPedido(p) {
  const isCuba = esCuba(p.cliente);
  const errores = [];
  if (!isCuba && !(p.cliente || "").trim()) errores.push("Falta el nombre del cliente");
  if (!isCuba && !(p.hora_entrega || "").trim()) errores.push("Falta la hora de entrega");
  if (!p.productos || !p.productos.length) errores.push("Agregá al menos un producto");
  return errores;
}

function guardarCerrar(id) {
  const p = getAllPedidos().find(x => x.id === id);
  if (!p) return;
  const errores = validarPedido(p);
  if (errores.length) {
    let warn = document.getElementById("warn-" + id);
    if (!warn) {
      warn = document.createElement("div");
      warn.id = "warn-" + id;
      warn.className = "validacion-warn";
      const btns = document.querySelector(`[onclick="guardarCerrar('${id}')"]`).closest(".btns-accion");
      btns.parentNode.insertBefore(warn, btns);
    }
    warn.innerHTML = `⚠️ Faltan datos:<ul>${errores.map(e => `<li>${e}</li>`).join("")}</ul>`;
    warn.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return;
  }
  _expandido = null;
  guardar();
  renderPedidos();
}

function confirmarEliminar(id) {
  abrirModalGen("¿Eliminar pedido?", "Esta acción no se puede deshacer.", () => {
    _expandido = null;
    eliminarPedido(id);
    renderPedidos();
  }, "danger");
}

// ── ARCHIVADOS ──
function archivarRetirados() {
  const hoy = fechaKey(new Date());
  const diasVisibles = Object.keys(datos.dias).filter(k => k >= hoy || k === diaActual).sort();
  const retiradosPorDia = [];
  diasVisibles.forEach(dKey => {
    const ps = (datos.dias[dKey]?.pedidos || []).filter(p => p.estado === "entregado");
    if (ps.length) retiradosPorDia.push({ dKey, ps });
  });
  const totalRet = retiradosPorDia.reduce((s, x) => s + x.ps.length, 0);
  if (!totalRet) {
    alert("No hay pedidos retirados para archivar.");
    return;
  }
  abrirModalGen(`Archivar ${totalRet} pedido(s)`,
    `Los pedidos marcados como "Retirado" se moverán a Archivados y podrás consultarlos después.`,
    () => {
      retiradosPorDia.forEach(({ dKey, ps }) => {
        const [y, m, d] = dKey.split("-").map(Number);
        const f = new Date(y, m - 1, d);
        const nomDia = DIAS_FULL[f.getDay()];
        ps.forEach(p => {
          datos.archivados.push({ ...p, _fecha: dKey, _nomDia: nomDia, _archivadoTs: Date.now() });
        });
        datos.dias[dKey].pedidos = (datos.dias[dKey].pedidos || []).filter(p => p.estado !== "entregado");
      });
      _expandido = null;
      guardar();
      renderPedidos();
      renderArchivadosSeccion();
    }, "confirm");
}

function toggleArchivadosLista() {
  const lista = document.getElementById("archivados-lista");
  lista.classList.toggle("open");
  if (lista.classList.contains("open")) renderArchivadosContent("archivados-lista", false);
}

function toggleArchivadosGlobal() {
  const lista = document.getElementById("archivados-global-lista");
  lista.classList.toggle("open");
  if (lista.classList.contains("open")) renderArchivadosContent("archivados-global-lista", true);
}

// Renderiza contenido de archivados — unificada para uso local y global.
// global=false → solo archivados del día actual
// global=true  → todos los archivados (con botones Restaurar/Eliminar)
function renderArchivadosContent(wrapperId, global) {
  const wrap = document.getElementById(wrapperId);
  if (!wrap) return;
  const fuente = global ? datos.archivados : datos.archivados.filter(a => a._fecha === diaActual);
  if (!fuente.length) {
    wrap.innerHTML = '<div class="vacio" style="padding:14px;">Sin archivados.</div>';
    return;
  }
  const ordenados = [...fuente].sort((a, b) => (b._archivadoTs || 0) - (a._archivadoTs || 0));
  wrap.innerHTML = ordenados.map(a => {
    const prods = (a.productos || []).map(r => {
      const nom = r.tipo === "catalogo" ? r.nombre : r.libre;
      const cant = Number(r.cantidad) || 1;
      return `${nom} x${cant}`;
    }).join(", ");
    const botonesGlobal = global ? `
      <div style="display:flex;gap:6px;margin-top:6px;">
        <button onclick="restaurarArchivado('${a.id}')" style="font-family:'Outfit',sans-serif;font-size:.65rem;font-weight:500;padding:4px 10px;border:1.5px solid var(--green);border-radius:6px;background:transparent;color:var(--green);cursor:pointer;">↩ Restaurar</button>
        <button onclick="eliminarArchivado('${a.id}')" style="font-family:'Outfit',sans-serif;font-size:.65rem;font-weight:500;padding:4px 10px;border:1.5px solid var(--border);border-radius:6px;background:transparent;color:var(--ink-light);cursor:pointer;">✕ Eliminar</button>
      </div>` : "";
    return `<div class="arch-item">
      <div class="arch-item-top">
        ${global ? `<span class="arch-fecha">${a._nomDia || ""} ${(a._fecha || "").slice(8)}/${(a._fecha || "").slice(5, 7)}</span>` : ""}
        <span class="arch-nombre">${esc(a.cliente_input || a.cliente || "Sin nombre")}</span>
        <span class="arch-hora">${a.hora_entrega || "--:--"}</span>
      </div>
      <div class="arch-prods">${esc(prods) || "(sin productos)"}</div>
      ${botonesGlobal}
    </div>`;
  }).join("");
}

// Muestra/oculta la sección de archivados del día actual y actualiza su contador
function renderArchivadosSeccion() {
  const delDia = datos.archivados.filter(a => a._fecha === diaActual);
  const sec = document.getElementById("archivados-section");
  sec.style.display = delDia.length ? "" : "none";
  document.getElementById("archivados-count").textContent = delDia.length + " archivado(s)";
}

// Actualiza solo el contador global de archivados (no renderiza la lista)
function actualizarContadorArchivadosGlobal() {
  const total = datos.archivados.length;
  const countEl = document.getElementById("archivados-global-count");
  if (countEl) countEl.textContent = total + " total";
}

// ── PEDIDOS PENDIENTES DE DÍAS ANTERIORES ──
function chequearPendientesAyer() {
  const hoy = fechaKey(new Date());
  const diasPasados = Object.keys(datos.dias).filter(k => k < hoy);

  const pendientes = diasPasados.reduce((s, k) => {
    return s + (datos.dias[k]?.pedidos?.length || 0);
  }, 0);

  if (!pendientes) return;

  const yaVisto = localStorage.getItem("aviso_pendientes_fecha");
  if (yaVisto === hoy) return;
  localStorage.setItem("aviso_pendientes_fecha", hoy);

  const toast = document.createElement("div");
  toast.id = "toast-pendientes-ayer";
  toast.className = "po-toast-pendientes";
  toast.innerHTML = `
    <div class="po-toast-ico">📋</div>
    <div class="po-toast-body">
      <div class="po-toast-titulo">Pedidos sin revisar</div>
      <div class="po-toast-txt">Quedaron <b>${pendientes} pedido${pendientes !== 1 ? "s" : ""}</b> del día anterior sin chequear.</div>
    </div>
    <div class="po-toast-actions">
      <button class="po-toast-btn" onclick="toggleVistaArchivados();cerrarBannerPendientes()">Ver en Archivados</button>
      <button class="po-toast-close" onclick="cerrarBannerPendientes()">✕</button>
    </div>
  `;
  document.body.appendChild(toast);
}

function cerrarBannerPendientes() {
  const t = document.getElementById("toast-pendientes-ayer");
  if (t) {
    t.classList.add("saliendo");
    setTimeout(() => t.remove(), 300);
  }
}

// ── MANEJO DE PRODUCTOS ──
function ajustarCantidad(pedidoId, rId, delta) {
  const p = getAllPedidos().find(x => x.id === pedidoId);
  if (!p) return;
  const r = p.productos.find(x => x.id === rId);
  if (!r) return;
  const cantActual = Number(r.cantidad);
  r.cantidad = Math.max(1, (isNaN(cantActual) ? 1 : cantActual) + delta);
  guardar();
  renderPedidos();
}

function setProdCampo(pedidoId, rId, campo, valor) {
  const p = getAllPedidos().find(x => x.id === pedidoId);
  if (!p) return;
  const r = p.productos.find(x => x.id === rId);
  if (!r) return;
  r[campo] = valor;
  guardar();
  setSyncPendiente();
}

function toggleNotaProd(pedidoId, rId) {
  const ta = document.getElementById("nota-prod-" + rId);
  if (!ta) return;
  ta.classList.toggle("visible");
  if (ta.classList.contains("visible")) ta.focus();
}

function toggleNotaGeneral(pedidoId) {
  const wrap = document.getElementById("nota-gen-" + pedidoId);
  if (!wrap) return;
  const visible = wrap.style.display !== "none";
  wrap.style.display = visible ? "none" : "block";
  if (!visible) wrap.querySelector("textarea").focus();
}

function actualizarBotonNota(pedidoId, valor) {
  const btn = document.querySelector(`[onclick="toggleNotaGeneral('${pedidoId}')"]`);
  if (btn) btn.textContent = (valor ? "📝 Nota: " + valor.slice(0, 40) + (valor.length > 40 ? "…" : "") : "📝 Agregar nota general");
}

function toggleProdListo(pedidoId, rId) {
  const p = getAllPedidos().find(x => x.id === pedidoId);
  if (!p) return;
  const r = p.productos.find(x => x.id === rId);
  if (!r) return;
  r.listo = !r.listo;
  if (r.tacc === "c") r.separado_cuba = r.listo;
  const todosListos = p.productos.every(x => x.listo);
  if (todosListos && (p.estado === "pendiente" || p.estado === "prod")) p.estado = "listo";
  guardar();
  renderPedidos();
  if (typeof renderProduccion === "function") renderProduccion();
  const cubaTab = document.getElementById("tab-cuba");
  if (cubaTab && cubaTab.classList.contains("active")) renderEncargos();
}

function toggleTaccChk(pedidoId, rId, campo) {
  const p = getAllPedidos().find(x => x.id === pedidoId);
  if (!p) return;
  const r = p.productos.find(x => x.id === rId);
  if (!r) return;
  r[campo] = !r[campo];
  guardar();
  renderPedidos();
}

function setTamano(pedidoId, rId, tam) {
  const p = getAllPedidos().find(x => x.id === pedidoId);
  if (!p) return;
  const r = p.productos.find(x => x.id === rId);
  if (!r) return;
  if (tam === "__libre__") {
    r._tamLibre = true;
    const wrap = document.getElementById("prod-" + rId);
    if (wrap) {
      wrap.querySelectorAll(".tam-btn").forEach(b => b.classList.remove("active"));
      const libreBtn = wrap.querySelector(".tam-btn-libre");
      if (libreBtn) libreBtn.classList.add("active");
      const inp = wrap.querySelector(".tam-libre-input");
      if (inp) {
        inp.classList.add("visible");
        inp.focus();
      }
    }
    guardar();
    return;
  }
  r._tamLibre = false;
  r.tamano = tam;
  guardar();
  renderPedidos();
}

function setTamanoLibre(pedidoId, rId, valor) {
  const p = getAllPedidos().find(x => x.id === pedidoId);
  if (!p) return;
  const r = p.productos.find(x => x.id === rId);
  if (!r) return;
  r.tamano = valor;
  r._tamLibre = true;
  guardar();
  setSyncPendiente();
}

function eliminarProducto(pedidoId, rId) {
  const p = getAllPedidos().find(x => x.id === pedidoId);
  if (!p) return;
  p.productos = p.productos.filter(x => x.id !== rId);
  guardar();
  renderPedidos();
}

function agregarProducto(pedidoId) {
  abrirSelector(pedidoId, null);
}

function buildProdEdit(pedidoId, r, idx) {
  const cat = datos.catalogo.find(c => c.nombre === r.nombre && c.tipo === (r.tacc === "s" ? "sin_tacc" : "con_tacc"));
  const tieneTalle = r.tipo === "catalogo" ? (cat ? cat.tiene_talle : true) : true;
  const nom = r.tipo === "catalogo" ? r.nombre : r.libre;
  const precio = (cat && cat.precio) || 0;
  const precioStr = precio > 0 ? `<span class="prod-precio">$${precio.toLocaleString("es-AR")}</span>` : "";

  let taccBar = "";
  if (r.tacc === "s") {
    taccBar = `<div class="tacc-info-bar s">🌿 Sin TACC — va a Producción</div>`;
  } else if (r.tacc === "c") {
    taccBar = `<div class="tacc-info-bar c">🌾 Común — va a Cuba
      <div class="tacc-checks">
        <label class="tacc-chk-item" onclick="toggleTaccChk('${pedidoId}','${r.id}','pedido_cuba')">
          <div class="tacc-chk-box${r.pedido_cuba ? " on" : ""}">✓</div>Pedido a Cuba
        </label>
        <label class="tacc-chk-item" onclick="toggleTaccChk('${pedidoId}','${r.id}','separado_cuba')">
          <div class="tacc-chk-box${r.separado_cuba ? " on" : ""}">✓</div>Separado
        </label>
      </div>
    </div>`;
  }

  let tamHTML = "";
  if (tieneTalle) {
    const libreActivo = r._tamLibre || (!!(r.tamano) && !TAMANIOS.includes(r.tamano));
    const tamBtns = TAMANIOS.map(t =>
      `<button class="tam-btn${!libreActivo && r.tamano === t ? " active" : ""}"
               onclick="setTamano('${pedidoId}','${r.id}','${t}')">${t}</button>`
    ).join("");

    const mostrarPrecioLibre = libreActivo || r.tipo === "libre";
    const precioLibreHtml = mostrarPrecioLibre ? `
      <div class="np-prod-precio-libre">
        <label>Precio</label>
        <input type="number" class="np-precio-libre-input"
          placeholder="ej: 15000" min="0"
          value="${r._precioLibre || ""}"
          oninput="setProdCampo('${pedidoId}','${r.id}','_precioLibre',parseFloat(this.value)||0);_npActualizarTotal()">
      </div>` : "";

    tamHTML = `
      <div class="campo"><label>Tamaño</label>
        <div class="tam-btns">
          ${tamBtns}
          <button class="tam-btn tam-btn-libre${libreActivo ? " active" : ""}"
                  onclick="setTamano('${pedidoId}','${r.id}','__libre__')">Libre</button>
        </div>
        <input type="text" class="tam-libre-input${libreActivo ? " visible" : ""}"
          value="${esc(libreActivo && r.tamano ? r.tamano : "")}"
          placeholder="ej: 2kg, bandeja..."
          oninput="setTamanoLibre('${pedidoId}','${r.id}',this.value)">
        ${precioLibreHtml}
      </div>
    `;
  }

  return `<div class="prod-edit-fila" id="prod-${r.id}">
    <div class="prod-edit-top">
      <div class="prod-listo-chk${r.listo ? " on" : ""}" onclick="toggleProdListo('${pedidoId}','${r.id}')">✓</div>
      <div class="prod-edit-nombre${r.tipo === "libre" ? " libre" : ""}">${esc(nom || "(sin nombre)")}</div>
      ${precioStr}
      <button class="btn-cambiar-prod" onclick="abrirSelector('${pedidoId}','${r.id}')">Cambiar</button>
      <button class="btn-remove-prod" onclick="eliminarProducto('${pedidoId}','${r.id}')">✕</button>
    </div>
    ${taccBar}
    <div class="prod-fila-mid">
      ${tamHTML || "<div></div>"}
      <div class="campo"><label>Cantidad</label>
        <div style="display:flex;align-items:center;gap:5px;margin-top:2px;">
          <button onclick="event.stopPropagation();ajustarCantidad('${pedidoId}','${r.id}',-1)" style="width:28px;height:28px;border:1.5px solid var(--border);border-radius:6px;background:var(--paper);font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--ink-mid)">−</button>
          <input type="text" inputmode="numeric" value="${esc(String(r.cantidad || 1))}" onfocus="this.select()" onchange="setProdCampo('${pedidoId}','${r.id}','cantidad',parseInt(this.value)||1)" style="text-align:center;width:44px;border:none;border-bottom:1.5px solid var(--border);background:transparent;font-size:1rem;font-family:'Lora',serif;color:var(--accent);font-weight:600;padding:2px 0;outline:none;">
          <button onclick="event.stopPropagation();ajustarCantidad('${pedidoId}','${r.id}',+1)" style="width:28px;height:28px;border:1.5px solid var(--border);border-radius:6px;background:var(--paper);font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--ink-mid)">＋</button>
        </div>
      </div>
    </div>
    <div style="padding-top:3px;">
      <button class="prod-nota-toggle" onclick="toggleNotaProd('${pedidoId}','${r.id}')">${r.nota_prod ? "✏️ " + esc(r.nota_prod) : "＋ Agregar nota"}</button>
      <textarea class="prod-nota-textarea${r.nota_prod ? " visible" : ""}" id="nota-prod-${r.id}" placeholder="ej: sin flambear, sin DDL..." onchange="setProdCampo('${pedidoId}','${r.id}','nota_prod',this.value)">${esc(r.nota_prod || "")}</textarea>
    </div>
  </div>`;
}

// ── MOVER PEDIDOS ──
function buildMoverOpts(pedidoId) {
  const otrosDias = Object.keys(datos.dias).filter(k => k !== diaActual).sort();
  if (!otrosDias.length) return '<span style="font-size:.7rem;color:var(--ink-light);font-style:italic;">No hay otros días cargados.</span>';
  return otrosDias.map(k => {
    const [y, m, d] = k.split("-").map(Number);
    const f = new Date(y, m - 1, d);
    const hoy = fechaKey(new Date());
    const label = k === hoy ? `Hoy ${d}/${m}` : `${DIAS_S[f.getDay()]} ${d}/${m}`;
    return `<div class="mover-dia-opt" onclick="moverPedido('${pedidoId}','${k}')">${label}</div>`;
  }).join("");
}

function moverPedido(pedidoId, diaDestino) {
  const origen = diaData();
  const idx = origen.pedidos.findIndex(x => x.id === pedidoId);
  if (idx < 0) return;
  const [pedido] = origen.pedidos.splice(idx, 1);
  if (!datos.dias[diaDestino]) datos.dias[diaDestino] = { pedidos: [], ventas: [] };
  datos.dias[diaDestino].pedidos.push(pedido);
  _expandido = null;
  guardar();
  renderDiasNav();
  renderAll();
}

/* ══════════════════════════════════════
   PEDIDOS — BACK-OFFICE (TABLA)
   ══════════════════════════════════════ */

// ── IDs ASCENDENTES ──
function asignarIds() {
  const all = getAllPedidos();
  const sinId = all.filter(p => !p._pid).sort((a, b) => (a.creado || 0) - (b.creado || 0));
  if (!sinId.length) return;
  let max = 0;
  [...all, ...(datos.archivados || [])].forEach(p => { if (p._pid > max) max = p._pid; });
  sinId.forEach(p => { p._pid = ++max; });
  guardar();
}

// ── HELPERS ──
// Nota: se usan las constantes globales DIAS_S, DIAS_FULL, MESES y fechaKey()
// que ya existen en el proyecto — no se duplican aquí.

function _poDayTabLabel(k) {
  const [y, m, d] = k.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  const hoy = fechaKey(new Date());
  const man = fechaKey(new Date(Date.now() + 86400000));
  if (k === hoy) return `HOY · ${DIAS_S[dow]} ${d}`;
  if (k === man) return `MÑ · ${DIAS_S[dow]} ${d}`;
  return `${DIAS_S[dow].toUpperCase()} ${d}`;
}

function _poDaySepLabel(k) {
  const [y, m, d] = k.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  const hoy = fechaKey(new Date());
  const tag = k === hoy ? " · HOY" : k === fechaKey(new Date(Date.now() + 86400000)) ? " · MAÑANA" : "";
  return `${DIAS_FULL[dow].toUpperCase()} ${d} DE ${MESES[m - 1].toUpperCase()}${tag}`;
}

function _poFormatTs(ts) {
  const d = new Date(ts);
  const p = n => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function _poGetDiaDePedido(id) {
  return getFechaDePedido(id);
}

let _poTabDia = fechaKey(new Date());
let _poExpandedId = null;
let _vistaArchivados = false;
let _poOrden = "creacion_desc";

// ── ORDENAMIENTO ──
function setOrden(v) {
  _poOrden = v;
  renderPedidosTable();
}

function sortPedidos(ps) {
  const ORDER_ESTADO = { pendiente: 0, prod: 1, listo: 2, entregado: 3 };
  return [...ps].sort((a, b) => {
    switch (_poOrden) {
      case "hora_entrega":
        return (a.hora_entrega || "99:99").localeCompare(b.hora_entrega || "99:99");
      case "hora_entrega_desc":
        return (b.hora_entrega || "00:00").localeCompare(a.hora_entrega || "00:00");
      case "total_desc":
        return calcularTotalPedido(b) - calcularTotalPedido(a);
      case "apellido": {
        const na = (a.cliente_input || a.cliente || "").split(" ").pop();
        const nb = (b.cliente_input || b.cliente || "").split(" ").pop();
        return na.localeCompare(nb, "es");
      }
      case "estado":
        return (ORDER_ESTADO[a.estado] ?? 99) - (ORDER_ESTADO[b.estado] ?? 99);
      case "creacion_desc":
      default:
        return (b.creado || 0) - (a.creado || 0);
    }
  });
}

// ── VISTA ARCHIVADOS ──
function toggleVistaArchivados() {
  _vistaArchivados = !_vistaArchivados;
  const btn = document.getElementById("btn-ver-archivados");
  if (btn) btn.classList.toggle("active", _vistaArchivados);
  renderPedidosTable();
}

// Actualiza el contador de archivados en la tabla (columna de acciones)
function actualizarContadorArchivados() {
  const el = document.getElementById("po-arch-cnt");
  if (el) el.textContent = datos.archivados.length;
}

// Renderiza tabla de pedidos archivados
function renderTablaArchivados(tbody) {
  if (!datos.archivados.length) {
    tbody.innerHTML = `<tr class="po-empty-row"><td colspan="9">No hay pedidos archivados.</td></tr>`;
    return;
  }

  const ordenados = [...datos.archivados].sort((a, b) => (b._archivadoTs || 0) - (a._archivadoTs || 0));

  const porFecha = {};
  ordenados.forEach(a => {
    const k = a._fecha || "sin-fecha";
    if (!porFecha[k]) porFecha[k] = [];
    porFecha[k].push(a);
  });

  let html = "";
  Object.keys(porFecha).sort((a, b) => b.localeCompare(a)).forEach(diaKey => {
    const ps = porFecha[diaKey];
    html += `<tr class="po-tr-day-sep"><td colspan="9">
      <div class="po-day-sep-inner">
        <span class="po-day-sep-label">📥 ${_poDaySepLabel(diaKey)}</span>
        <span class="po-day-sep-line"></span>
        <span class="po-day-sep-count">${ps.length} archivado${ps.length !== 1 ? "s" : ""}</span>
      </div>
    </td></tr>`;

    ps.forEach(a => {
      const nombre = a.cliente_input || a.cliente || "Sin nombre";
      const pills = (a.productos || []).map(r => {
        const nom = r.tipo === "catalogo" ? r.nombre : r.libre;
        const cant = Number(r.cantidad) || 1;
        const isST = r.tacc === "s";
        return `<span class="po-prod-pill${isST ? " st" : ""}">${esc(nom)} ×${cant}</span>`;
      }).join("");
      const total = calcularTotalPedido(a);
      const totalStr = total > 0 ? `$${total.toLocaleString("es-AR")}` : "—";

      html += `
        <tr class="po-tr po-retirado">
          <td></td>
          <td></td>
          <td class="po-td-id">#${a._pid || "—"}</td>
          <td class="po-td-hora">${esc(a.hora_entrega || "--:--")}</td>
          <td>
            <div class="po-cliente-nombre">${esc(nombre)}</div>
            ${a.tel ? `<div class="po-cliente-tel">${esc(a.tel)}</div>` : ""}
          </td>
          <td><div class="po-prod-pills">${pills}</div></td>
          <td class="po-td-total${total === 0 ? " zero" : ""}">${totalStr}</td>
          <td><span class="po-estado-badge entregado">Archivado</span></td>
          <td>
            <div class="po-row-actions" style="opacity:1">
              <button class="po-btn-action ret" onclick="restaurarArchivado('${a.id}')">↩ Restaurar</button>
              <button class="po-btn-action" style="color:var(--red,#ef4444);border-color:var(--red,#ef4444)" onclick="eliminarArchivado('${a.id}')">✕</button>
            </div>
          </td>
        </tr>`;
    });
  });

  tbody.innerHTML = html;
}

// ── DAY TABS ──
function renderDayTabs() {
  const bar = document.getElementById("po-day-tabs");
  if (!bar) return;

  const hoy = fechaKey(new Date());
  const keys = Object.keys(datos.dias)
    .filter(k => k >= hoy || k === diaActual)
    .sort();

  bar.innerHTML = "";

  const totalTodos = keys.reduce((s, k) => s + (datos.dias[k]?.pedidos?.length || 0), 0);
  const btnTodosEl = document.getElementById("btn-todos-global");
  const todosCount = document.getElementById("po-todos-count");
  if (todosCount) todosCount.textContent = totalTodos;
  if (btnTodosEl) btnTodosEl.classList.toggle("active", _poTabDia === null);

  const scroll = document.createElement("div");
  scroll.className = "po-day-tabs-scroll";

  const _diaNombres = ["dia-domingo","dia-lunes","dia-martes","dia-miercoles","dia-jueves","dia-viernes","dia-sabado"];
  keys.forEach(k => {
    const cnt = datos.dias[k]?.pedidos?.length || 0;
    const btn = document.createElement("button");
    const diaSemana = k.length === 10 ? _diaNombres[new Date(k + "T12:00:00").getDay()] : "";
    btn.className = "po-day-tab" + (diaSemana ? " " + diaSemana : "") + (_poTabDia === k ? " active" : "");
    btn.innerHTML = `${_poDayTabLabel(k)} <span class="po-tab-count">${cnt}</span>`;
    btn.onclick = () => {
      setDiaActivo(k);
      renderDayTabs();
      renderPedidosTable();
    };
    scroll.appendChild(btn);
  });

  const addBtn = document.createElement("button");
  addBtn.className = "po-day-tab-add";
  addBtn.textContent = "+";
  addBtn.title = "Agregar día";
  addBtn.onclick = agregarDia;
  scroll.appendChild(addBtn);

  bar.appendChild(scroll);

  setTimeout(() => {
    const active = scroll.querySelector(".po-day-tab.active");
    if (active) active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, 50);
}

// Activa la vista "Todos los días" desde el botón de la topbar
function setTabTodos() {
  _poTabDia = null;
  renderDayTabs();
  renderPedidosTable();
}

// ── RENDER TABLE ──
function renderPedidosTable() {
  asignarIds();
  renderStats();

  const tbody = document.getElementById("pedidos-tbody");
  if (!tbody) return;

  actualizarContadorArchivados();
  if (_vistaArchivados) { renderTablaArchivados(tbody); return; }

  const hoy = fechaKey(new Date());
  const diasAMostrar = _poTabDia !== null
    ? [_poTabDia]
    : Object.keys(datos.dias).filter(k => k >= hoy || k === diaActual).sort();

  const q = (document.getElementById("buscador")?.value || "").toLowerCase().trim();
  const hayFiltro = filtro !== "todos" || q;
  const diasFinales = hayFiltro && _poTabDia === null
    ? Object.keys(datos.dias).sort().filter(k => getPedidosFiltradosDeDia(k).length > 0)
    : diasAMostrar;

  let html = "";
  const mostrarSep = _poTabDia === null;

  diasFinales.forEach(diaKey => {
    const ps = getPedidosFiltradosDeDia(diaKey);

    if (!ps.length) {
      if (!hayFiltro) {
        html += `<tr class="po-empty-row"><td colspan="9">Sin pedidos para este día.</td></tr>`;
      }
      return;
    }

    if (mostrarSep) {
      html += `<tr class="po-tr-day-sep"><td colspan="9">
        <div class="po-day-sep-inner">
          <span class="po-day-sep-label">${_poDaySepLabel(diaKey)}</span>
          <span class="po-day-sep-line"></span>
          <span class="po-day-sep-count">${ps.length} pedido${ps.length !== 1 ? "s" : ""}</span>
        </div>
      </td></tr>`;
    }

    ps.forEach(p => {
      const isCuba = esCuba(p.cliente);
      const estado = p.estado || "pendiente";
      const total = calcularTotalPedido(p);
      const totalStr = total > 0 ? `$${total.toLocaleString("es-AR")}` : "—";
      const isExp = _poExpandedId === p.id;
      const nombre = p.cliente_input || p.cliente || "Sin nombre";

      const pills = (p.productos || []).map(r => {
        const nom = r.tipo === "catalogo" ? r.nombre : r.libre;
        const cant = Number(r.cantidad) || 1;
        const isST = r.tacc === "s";
        return `<span class="po-prod-pill${isST ? " st" : ""}">${esc(nom)} ×${cant}</span>`;
      }).join("");

      const estadoLabels = { pendiente: "Pendiente", listo: "Listo", entregado: "Retirado", suspendido: "Suspendido" };
      const notaIcon = p.notas ? `<span title="${esc(p.notas)}" style="font-size:.7rem;margin-left:3px;">📝</span>` : "";
      const pagadoBadge = p.pagado ? `<span class="po-pagado-badge">✓ PAGADO</span>` : "";

      html += `
        <tr class="po-tr${estado === "entregado" ? " po-retirado" : ""}${isExp ? " po-expanded" : ""}"
            data-id="${p.id}" onclick="poToggleExpand('${p.id}')">
          <td onclick="event.stopPropagation();toggleListoPedido('${p.id}')">
            <div class="po-row-check${(estado === "listo" || estado === "entregado") ? " on" : ""}">✓</div>
          </td>
          <td style="width:0;padding:0!important;"></td>
          <td class="po-td-id">#${p._pid || "—"}</td>
          <td class="po-td-hora">
            ${esc(p.hora_entrega || "--:--")}${p.fuera_horario ? ' <span title="Fuera de horario" style="font-size:.6rem">🌙</span>' : ""}
          </td>
          <td>
            <div class="po-td-cliente-wrap">
              ${mostrarSep ? `<div class="po-td-dia-tag">${_poDayTabLabel(diaKey)}</div>` : ""}
              <div class="po-cliente-nombre${isCuba ? " cuba" : ""}">${isCuba ? "🏪 " : ""}${esc(nombre)}${notaIcon}</div>
              ${p.tel ? `<div class="po-cliente-tel-row"><span class="po-cliente-tel">${esc(p.tel)}</span>${pagadoBadge}</div>` : pagadoBadge}
            </div>
            ${p.hora_entrega && !isExp ? `<span class="po-td-hora-mobile">${esc(p.hora_entrega)}</span>` : ""}
          </td>
          <td>${isExp ? "" : `<div class="po-prod-pills">${pills}</div>`}</td>
          <td class="po-td-total${total === 0 ? " zero" : ""}">${totalStr}</td>
          <td><span class="po-estado-badge ${estado}">${estadoLabels[estado] || estado}</span></td>
          <td onclick="event.stopPropagation()">
            <div class="po-row-actions">
              ${estado !== "entregado"
                ? `<button class="po-btn-action ret" onclick="event.stopPropagation();setEstado('${p.id}','entregado')">Retirado</button>`
                : `<button class="po-btn-action undo" onclick="event.stopPropagation();setEstado('${p.id}','listo')">↩ Deshacer</button>`
              }
              <button class="po-btn-expand" onclick="event.stopPropagation();poToggleExpand('${p.id}')">
                <span class="po-expand-arrow">▶</span>
              </button>
            </div>
          </td>
        </tr>`;

      const expProds = (p.productos || []).map(r => {
        const nom = r.tipo === "catalogo" ? r.nombre : r.libre;
        const cant = Number(r.cantidad) || 1;
        const tam = r.tamano ? ` · ${r.tamano}` : "";
        const isST = r.tacc === "s";
        const cubaPedidoChk = r.tacc === "c"
          ? `<div onclick="event.stopPropagation();toggleCubaPedido('${p.id}','${r.id}')"
                title="${r.pedido_cuba ? "Pedido a Cuba ✓" : "Pedir a Cuba"}"
                style="width:14px;height:14px;border-radius:50%;border:1.5px solid ${r.pedido_cuba ? "var(--accent)" : "var(--border)"};background:${r.pedido_cuba ? "var(--amber)" : "transparent"};display:flex;align-items:center;justify-content:center;font-size:7px;color:${r.pedido_cuba ? "#fff" : "transparent"};flex-shrink:0;cursor:pointer;transition:all .15s;">✓</div>`
          : "";
        return `
          <div>
            <div class="po-exp-prod-row">
              <div class="po-exp-prod-chk${r.listo ? " on" : ""}"
                   onclick="event.stopPropagation();toggleProdListo('${p.id}','${r.id}')">✓</div>
              <span class="po-exp-tacc ${isST ? "st" : "com"}">${isST ? "ST" : "C"}</span>
              <span class="po-exp-prod-nombre">${esc(nom)}${esc(tam)} ×${cant}</span>
              ${cubaPedidoChk}
            </div>
            ${r.nota_prod ? `<div class="po-exp-prod-nota">↳ ${esc(r.nota_prod)}</div>` : ""}
          </div>`;
      }).join("");

      const diaDePedido = _poGetDiaDePedido(p.id);

      html += `
        <tr class="po-tr-expanded${isExp ? " open" : ""}" data-expanded-id="${p.id}">
          <td class="po-expanded-cell" colspan="9">
            <div class="po-expanded-inner">

              <!-- 1: nombre+tel -->
              <div class="po-exp-cliente">
                <div class="po-exp-cliente-nombre">${isCuba ? "🏪 " : ""}${esc(nombre)}</div>
                ${p.tel ? `<div class="po-exp-cliente-tel">📞 ${esc(p.tel)}</div>` : ""}
              </div>

              <!-- 2: productos -->
              <div class="po-exp-left">
                <div class="po-exp-products">${expProds}</div>
                ${p.notas ? `<div class="po-exp-nota">📝 ${esc(p.notas)}</div>` : ""}
              </div>

              <!-- 3: info (fecha/hora/pago/estado/botones) -->
              <div class="po-exp-right">

                <div class="po-exp-info-row">
                  <span class="po-exp-info-label">📅</span>
                  <span class="po-exp-info-val">${_poDaySepLabel(diaDePedido)}</span>
                </div>
                ${p.hora_entrega ? `<div class="po-exp-info-row">
                  <span class="po-exp-info-label">🕐</span>
                  <span class="po-exp-info-val">${esc(p.hora_entrega)}</span>
                </div>` : ""}

                ${total > 0 ? `<div class="po-exp-total-row">
                  <span class="po-exp-total-num">$${total.toLocaleString("es-AR")}</span>
                  ${p.pagado
                    ? `<span class="po-exp-pago-pill pagado" onclick="event.stopPropagation();abrirModalPago('${p.id}',true)">✓ ${esc(p.metodoPago || "Pagado")}</span>`
                    : `<span class="po-exp-pago-pill nopago" onclick="event.stopPropagation();abrirModalPago('${p.id}',false)">Sin confirmar</span>`
                  }
                  ${!p.pagado ? `
                  <div class="po-exp-pago-inline" id="po-pago-inline-${p.id}" style="display:none">
                    ${["💵 Efectivo","🏦 Transferencia","💳 Otro"].map(m =>
                      `<button class="po-exp-pago-metodo" onclick="event.stopPropagation();poConfirmarPagoInline('${p.id}','${m}')">${m}</button>`
                    ).join("")}
                  </div>` : ""}
                </div>` : ""}

                <div class="po-exp-estado-wrap">
                  <select class="po-exp-estado-select po-exp-estado-${estado}"
                    onchange="event.stopPropagation();setEstado('${p.id}',this.value)"
                    onclick="event.stopPropagation()">
                    <option value="pendiente"${estado==="pendiente"?" selected":""}>⏳ Pendiente</option>
                    <option value="listo"${estado==="listo"?" selected":""}>✅ Listo</option>
                    <option value="entregado"${estado==="entregado"?" selected":""}>📦 Retirado</option>
                    <option value="suspendido"${estado==="suspendido"?" selected":""}>🚫 Suspendido</option>
                  </select>
                </div>

                ${p.notas ? `<div class="po-exp-nota-pill">📝 ${esc(p.notas)}</div>` : ""}

                <div class="po-exp-actions">
                  <button class="po-btn-exp primary" onclick="event.stopPropagation();abrirModalNP_edicion('${p.id}')">✏️ Editar</button>
                  <button class="po-btn-exp danger"  onclick="event.stopPropagation();confirmarEliminar('${p.id}')">🗑 Eliminar</button>
                </div>

                <div class="po-exp-watermark">
                  #${p._pid || "—"} · ${p.creado ? _poFormatTs(p.creado) : "sin fecha"}${p._creadoPor ? ` · ${esc(p._creadoPor)}` : ""}
                </div>

              </div>

              <!-- 4: fila final mobile -->
              <div class="po-exp-bottom-row">
                <span class="po-td-total">${totalStr}</span>
                <span class="po-estado-badge ${estado}">${estadoLabels[estado] || estado}</span>
                <div style="display:flex;gap:6px;align-items:center;margin-left:auto;">
                  ${estado !== "entregado"
                    ? `<button class="po-btn-action ret" onclick="event.stopPropagation();setEstado('${p.id}','entregado')">Retirado</button>`
                    : `<button class="po-btn-action undo" onclick="event.stopPropagation();setEstado('${p.id}','listo')">↩ Deshacer</button>`
                  }
                  <button class="po-btn-vermobile" onclick="event.stopPropagation();poToggleExpand('${p.id}')">ver menos</button>
                </div>
              </div>

            </div>
          </td>
        </tr>`;
    });
  });

  tbody.innerHTML = html || `<tr class="po-empty-row"><td colspan="9">No hay pedidos.</td></tr>`;
  renderArchivadosSeccion();
}

// ── EXPAND ──
function poToggleExpand(id) {
  _poExpandedId = _poExpandedId === id ? null : id;
  renderPedidosTable();
}

// ── PUNTO DE ENTRADA PRINCIPAL ──
// Refresca tabs de días + tabla. Es la función que el resto del código llama como "renderPedidos".
function renderPedidos() {
  renderDayTabs();
  renderPedidosTable();
}

// ── INIT ──
function initPedidosBO() {
  asignarIds();
  const hoy = fechaKey(new Date());
  if (datos.dias[hoy]) {
    setDiaActivo(hoy);
  }
  renderDayTabs();
  renderPedidosTable();
}