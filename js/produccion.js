/**
 * ================================================================
 * PRODUCCIÓN — v7
 * ================================================================
 * Lógica simplificada:
 * - Sin producción anticipada. Cada pedido aparece en su día de entrega.
 * - El día muestra todos los pedidos pendientes hasta el corte del día siguiente.
 * - Los martes tienen corte especial a las 14:00.
 * - Warning informativo si hay pedidos del martes tomados antes del corte
 *   (no modifica lógica, solo avisa).
 * ================================================================
 */

/* ══════════════════════════════════════
   ESTADO
   ══════════════════════════════════════ */

let _prodTabActiva = null;
const _prodHechos = new Set();
window._prodGrupoKeys = {};
const _prodCatColapsadas = new Set();
let _lvTabActiva = null;


/* ══════════════════════════════════════
   CONSTANTES DE CATEGORÍA
   ══════════════════════════════════════ */

const _PROD_CAT_ORDEN  = ["tortas", "mousses", "bandejas", "cuadrados", "congelados", "otros"];
const _PROD_CAT_LABELS = {
  tortas:     "🎂 Tortas",
  mousses:    "🍮 Mousses",
  bandejas:   "🍫 Bandejas",
  cuadrados:  "🟫 Cuadrados",
  congelados: "❄️ Congelados",
  otros:      "✨ Otros",
};


/* ══════════════════════════════════════
   HELPERS
   ══════════════════════════════════════ */

function _prodFechaKey(d) {
  return d.toISOString().slice(0, 10);
}

// Retorna el corte en minutos para un día dado, usando la config del local.
function _prodCorteMin(diaKey) {
  const localId = datos.localId || "matienzo";
  const corteStr = ((datos.cortePedidosHoy || {})[localId]) || "14:00";
  const [h, min] = corteStr.split(":").map(Number);
  return h * 60 + min;
}

// Devuelve true si el día (por su dow 0-6) está abierto según la config del local.
function _prodDiaAbierto(dow) {
  const localId = datos.localId || "matienzo";
  const horarios = datos.horariosLocales || {};
  const horLocal = horarios[localId] || {};
  return !!horLocal[dow];
}

// Dado un diaKey, devuelve el key del día siguiente calendario.
function _prodKeyDiaSiguiente(diaKey) {
  const [y, m, d] = diaKey.split("-").map(Number);
  const f = new Date(y, m - 1, d);
  f.setDate(f.getDate() + 1);
  return _prodFechaKey(f);
}

function _prodSemanaActual() {
  const hoy = new Date();
  const dow = hoy.getDay();
  const diasDesdeMartes = dow === 0 ? 5 : dow === 1 ? 6 : dow - 2;
  const martes = new Date(hoy);
  martes.setDate(hoy.getDate() - diasDesdeMartes);
  const domingo = new Date(martes);
  domingo.setDate(martes.getDate() + 6);
  return { martes: _prodFechaKey(martes), domingo: _prodFechaKey(domingo) };
}

const _PROD_DIAS_S = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function _prodLabelDia(diaKey) {
  const [y, m, d] = diaKey.split("-").map(Number);
  return `${_PROD_DIAS_S[new Date(y, m - 1, d).getDay()]} ${d}/${m}`;
}

function _prodCatDeProducto(nombre) {
  const cat = (datos.catalogo || []).find(c => c.nombre === nombre);
  if (cat && cat.categoria && _PROD_CAT_ORDEN.includes(cat.categoria)) return cat.categoria;
  return "otros";
}

function _prodEsHecho(pedidoId, prodId) {
  if (_prodHechos.has(`${pedidoId}:${prodId}`)) return true;
  const p = Object.values(datos.dias)
    .flatMap(d => d.pedidos || [])
    .find(x => x.id === pedidoId);
  return p?.productos?.find(x => x.id === prodId)?.listo || false;
}


/* ══════════════════════════════════════
   ARMADO DE DATOS
   ══════════════════════════════════════ */

function _prodBuildMap() {
  // Reglas día NORMAL:
  // - Pedidos de HOY → siempre en hoy (nunca se adelantan)
  //   · si hora <= corte → flag esHoyAnteCorte=true para warning visual
  // - Pedidos futuros con hora <= corte y día anterior abierto → día anterior
  //   · excepción: martes nunca se adelanta, tiene warning propio en sáb/dom
  // - Pedidos futuros con hora > corte, o día anterior cerrado → su propio día
  //
  // Reglas día ESPECIAL (dData.especial === true):
  // - Tanda 1: pedidos de clientes del mismo día + pedidos de Cuba con hora <= corteHora
  //   → se producen el día anterior (o hoy si es hoy), con flag tanda=1
  // - Tanda 2: pedidos del día siguiente hasta las 14hs + pedidos de Cuba con hora > corteHora
  //   → se producen en su propio día, con flag tanda=2
  //
  // - Productos con r.listo=true → no aparecen
  const hoyKey = _prodFechaKey(new Date());
  const map = new Map();

  const _addItem = (diaProduccion, item) => {
    if (!map.has(diaProduccion)) map.set(diaProduccion, []);
    map.get(diaProduccion).push(item);
  };

  Object.entries(datos.dias).forEach(([diaEntregaKey, dData]) => {
    const [y, m, d] = diaEntregaKey.split("-").map(Number);
    const dowEntrega = new Date(y, m - 1, d).getDay();
    const esHoy = diaEntregaKey === hoyKey;
    const especial = dData.especial || false;
    const corteEspecialStr = dData.corteHora || "15:00";
    const [ceH, ceM] = corteEspecialStr.split(":").map(Number);
    const corteEspecialMin = ceH * 60 + ceM;

    (dData.pedidos || []).forEach(p => {
      if (p.estado === "entregado" || p.estado === "listo") return;
      (p.productos || []).forEach(r => {
        if (r.tacc !== "s") return;
        if (r.listo) return;

        // Protección contra hora_entrega nula o mal formada
        const horaRaw = p.hora_entrega || "00:00";
        const partes = horaRaw.split(":");
        const hh = parseInt(partes[0]) || 0;
        const mm = parseInt(partes[1]) || 0;
        const horaMin = hh * 60 + mm;
        const corte   = _prodCorteMin(diaEntregaKey);

        if (especial) {
          // ── MODO DÍA ESPECIAL ──
          // Tanda 1: pedidos del MISMO día (cliente) o Cuba hasta el corte especial
          // → van al día anterior (o hoy si ya es hoy), marcados tanda=1
          // Tanda 2: pedidos de clientes del día siguiente hasta las 14hs,
          //          o Cuba después del corte especial → van en su propio día, tanda=2

          const esCubaP = esCuba(p.cliente);

          if (esCubaP) {
            // Cuba se divide por corteEspecial: <= corte → tanda 1, > corte → tanda 2
            if (horaMin <= corteEspecialMin) {
              // Tanda 1: producir antes del corte → va al día anterior
              if (esHoy) {
                _addItem(hoyKey, { pedido: p, producto: r, diaEntrega: diaEntregaKey, tanda: 1, esHoyAnteCorte: true });
              } else {
                const prev = new Date(y, m - 1, d);
                prev.setDate(prev.getDate() - 1);
                const prevKey = _prodFechaKey(prev);
                _addItem(_prodDiaAbierto(prev.getDay()) ? prevKey : diaEntregaKey,
                  { pedido: p, producto: r, diaEntrega: diaEntregaKey, tanda: 1 });
              }
            } else {
              // Tanda 2: producir después del corte → queda en su propio día
              _addItem(diaEntregaKey, { pedido: p, producto: r, diaEntrega: diaEntregaKey, tanda: 2 });
            }
          } else {
            // Clientes normales en día especial → siempre tanda 1 (producir antes del corte)
            if (esHoy) {
              _addItem(hoyKey, { pedido: p, producto: r, diaEntrega: diaEntregaKey, tanda: 1, esHoyAnteCorte: horaMin <= corte });
            } else {
              const prev = new Date(y, m - 1, d);
              prev.setDate(prev.getDate() - 1);
              const prevKey = _prodFechaKey(prev);
              _addItem(_prodDiaAbierto(prev.getDay()) ? prevKey : diaEntregaKey,
                { pedido: p, producto: r, diaEntrega: diaEntregaKey, tanda: 1 });
            }
          }

        } else {
          // ── MODO NORMAL ──
          if (esHoy) {
            // Pedidos de hoy: siempre en hoy, con flag si es antes del corte
            _addItem(hoyKey, {
              pedido: p, producto: r, diaEntrega: diaEntregaKey,
              esHoyAnteCorte: horaMin <= corte,
            });
          } else if (horaMin <= corte && dowEntrega !== 2) {
            // Futuro antes del corte y no es martes → intenta adelantar al día anterior
            const f = new Date(y, m - 1, d);
            f.setDate(f.getDate() - 1);
            const diaAnteriorKey = _prodFechaKey(f);
            const dowAnterior = f.getDay();

            if (_prodDiaAbierto(dowAnterior)) {
              // Si el día anterior es especial, este pedido va a Tanda 2
              const dDataAnterior = datos.dias[diaAnteriorKey] || {};
              const tandaAnterior = dDataAnterior.especial ? 2 : undefined;
              _addItem(diaAnteriorKey, { pedido: p, producto: r, diaEntrega: diaEntregaKey, tanda: tandaAnterior });
            } else {
              // Día anterior cerrado (ej: lunes) → queda en su propio día
              _addItem(diaEntregaKey, { pedido: p, producto: r, diaEntrega: diaEntregaKey });
            }
          } else {
            // Hora > corte, o es martes → queda en su propio día
            _addItem(diaEntregaKey, { pedido: p, producto: r, diaEntrega: diaEntregaKey });
          }
        }
      });
    });
  });

  return map;
}

// Devuelve los pedidos del martes siguiente a diaKey con hora < corte y no listos.
// Solo aplica cuando diaKey es sábado (dow=6) o domingo (dow=0).
function _prodPedidosWarningMartes(diaKey) {
  const [y, m, d] = diaKey.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();

  let diasHastaMartes;
  if (dow === 6) diasHastaMartes = 3;       // sábado → martes en 3 días
  else if (dow === 0) diasHastaMartes = 2;  // domingo → martes en 2 días
  else return [];                           // solo aplica sáb y dom

  const martes = new Date(y, m - 1, d);
  martes.setDate(martes.getDate() + diasHastaMartes);
  const martesKey = _prodFechaKey(martes);

  const corte = _prodCorteMin(martesKey);
  const resultado = [];

  const dData = datos.dias[martesKey] || {};
  (dData.pedidos || []).forEach(p => {
    if (p.estado === "entregado" || p.estado === "listo") return;
    if (!p.hora_entrega) return;
    const [hh, mm] = p.hora_entrega.split(":").map(Number);
    if (hh * 60 + mm >= corte) return;
    (p.productos || []).forEach(r => {
      if (r.tacc !== "s") return;
      if (r.listo) return; // ya marcado listo → no aparece en warning
      resultado.push({ pedido: p, producto: r });
    });
  });

  return resultado;
}

function _prodClasificar(map) {
  const hoyKey = _prodFechaKey(new Date());
  const { martes, domingo } = _prodSemanaActual();
  const activos = [], futuros = [];
  [...map.keys()].sort().forEach(k => {
    const items = map.get(k);
    if (!items || !items.length || k < hoyKey) return;
    (k >= martes && k <= domingo ? activos : futuros).push({ diaKey: k, items });
  });
  return { activos, futuros };
}


/* ══════════════════════════════════════
   AGRUPADOR COMÚN
   cat → nom → tam → items[]
   ══════════════════════════════════════ */

function _prodAgrupar(lista) {
  const porCat = new Map();
  lista.forEach(({ pedido, producto, diaEntrega }) => {
    const nom = producto.tipo === "catalogo" ? producto.nombre : (producto.libre || "Libre");
    const tam = producto.tamano || "";
    const cat = producto.tipo === "catalogo" ? _prodCatDeProducto(producto.nombre) : "otros";
    const cant = Number(producto.cantidad) || 1;
    if (!porCat.has(cat)) porCat.set(cat, new Map());
    const porNom = porCat.get(cat);
    if (!porNom.has(nom)) porNom.set(nom, new Map());
    const porTam = porNom.get(nom);
    if (!porTam.has(tam)) porTam.set(tam, []);
    porTam.get(tam).push({ pedido, producto, diaEntrega, cant });
  });
  return porCat;
}

const _PROD_TAM_ORD = ["Chico", "Mediano", "Grande"];
function _sortTam(entries) {
  return entries.sort(([a], [b]) => {
    const ia = _PROD_TAM_ORD.indexOf(a), ib = _PROD_TAM_ORD.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1; if (ib === -1) return -1;
    return ia - ib;
  });
}


/* ══════════════════════════════════════
   RENDER PRINCIPAL
   ══════════════════════════════════════ */

function renderProduccion() {
  const map = _prodBuildMap();
  const { activos, futuros } = _prodClasificar(map);

  const todasLasKeys = activos.map(x => x.diaKey);
  if (
    _prodTabActiva !== "semanal" && _prodTabActiva !== "futuro" &&
    _prodTabActiva !== "libreta" && _prodTabActiva !== "resumen" &&
    _prodTabActiva !== null && !todasLasKeys.includes(_prodTabActiva)
  ) _prodTabActiva = null;

  if (_prodTabActiva === null)
    _prodTabActiva = activos.length ? activos[0].diaKey : "semanal";

  _renderProdTabs(activos, futuros);
  _renderProdPanel(map, activos, futuros);

}


/* ══════════════════════════════════════
   PESTAÑAS
   ══════════════════════════════════════ */

function _renderProdTabs(activos, futuros) {
  const bar = document.getElementById("prod-tabs-bar");
  if (!bar) return;
  const hoyKey = _prodFechaKey(new Date());
  let html = "";

  activos.forEach(({ diaKey, items }) => {
    const [y, m, d] = diaKey.split("-").map(Number);
    const dow = new Date(y, m - 1, d).getDay();
    const esHoy = diaKey === hoyKey;
    const active = _prodTabActiva === diaKey;
    const pendientes = items.filter(({ pedido, producto }) =>
      !_prodEsHecho(pedido.id, producto.id)
    ).length;

    html += `<button class="prod-tab-btn${active ? " active" : ""}${pendientes === 0 ? " done" : ""}" onclick="_prodSetTab('${diaKey}')">
      <span class="prod-tab-label">${esHoy ? "&#9728;&#65039; Hoy" : `${_PROD_DIAS_S[dow]} ${d}`}</span>
      ${pendientes > 0 ? `<span class="prod-tab-badge">${pendientes}</span>` : `<span class="prod-tab-check">&#10003;</span>`}
    </button>`;
  });

  html += `<button class="prod-tab-btn${_prodTabActiva === "semanal" ? " active" : ""}" onclick="_prodSetTab('semanal')">
    <span class="prod-tab-label">&#128197; Semanal</span>
  </button>`;

  const totalFuturo = futuros.reduce((s, x) => s + x.items.length, 0);
  html += `<button class="prod-tab-btn${_prodTabActiva === "futuro" ? " active" : ""}${totalFuturo === 0 ? " empty" : ""}" onclick="_prodSetTab('futuro')">
    <span class="prod-tab-label">&#128302; Futuro</span>
    ${totalFuturo > 0 ? `<span class="prod-tab-badge futuro">${totalFuturo}</span>` : ""}
  </button>`;

  const libretaActive = _prodTabActiva === "libreta";
  const totalLibreta = Object.entries(datos.libretaVenta || {})
    .reduce((s, [k, v]) => s + (Array.isArray(v) ? v.length : 0), 0);

  const btnLibreta = `<button class="prod-tab-btn prod-tab-libreta${libretaActive ? " active" : ""}" onclick="_prodSetTab('libreta')">
    <span class="prod-tab-label">&#128221; Libreta</span>
    ${totalLibreta > 0 ? `<span class="prod-tab-badge prod-tab-badge-libreta">${totalLibreta}</span>` : ""}
  </button>`;

  const resumenActive = _prodTabActiva === "resumen";
  const btnResumen = `<button class="prod-tab-btn prod-tab-resumen${resumenActive ? " active" : ""}" onclick="_prodSetTab('resumen')">
    <span class="prod-tab-label">&#128203; Resumen</span>
  </button>`;

  bar.innerHTML = `<div class="prod-tabs-izq">${html}</div><div class="prod-tabs-der">${btnResumen}${btnLibreta}</div>`;

  setTimeout(() => {
    const a = bar.querySelector(".prod-tab-btn.active");
    if (a) a.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, 50);
}

function _prodSetTab(key) {
    console.log("_prodSetTab llamado con:", key);
  _prodTabActiva = key;
  if (key === "libreta" && _lvTabActiva === null) {
    _lvTabActiva = _prodFechaKey(new Date());
  }
  if (key !== "libreta") _lvTabActiva = null;
  renderProduccion();
}


/* ══════════════════════════════════════
   DISPATCH DE PANEL
   ══════════════════════════════════════ */

function _renderProdPanel(map, activos, futuros) {
  console.log("_renderProdPanel, tab activa:", _prodTabActiva);
  const wrap = document.getElementById("prod-panel-wrap");
  if (!wrap) return;
  if (_prodTabActiva === "libreta") {
    console.log("entrando a libreta...");
    wrap.innerHTML = "";
    if (!datos.libretaVenta) datos.libretaVenta = {};
    const hoyKey = _prodFechaKey(new Date());
    if (!_lvTabActiva) _lvTabActiva = hoyKey;
    renderLibretaVenta();
    return;
  }
  if (_prodTabActiva === "resumen") { wrap.innerHTML = _buildProdResumen(); return; }
  if (_prodTabActiva === "semanal") { wrap.innerHTML = _buildProdSemanal(map); return; }
  if (_prodTabActiva === "futuro")  { wrap.innerHTML = _buildProdFuturo(futuros); return; }
  const dia = activos.find(x => x.diaKey === _prodTabActiva);
  wrap.innerHTML = dia
    ? _buildProdDia(dia.diaKey, dia.items)
    : `<div class="vacio">No hay producci&oacute;n para este d&iacute;a.</div>`;
}


/* ══════════════════════════════════════
   BUILDER DE CATEGORÍAS — v6
   Tabla: Producto | Cantidad/Talle | Notas | Listo
   ══════════════════════════════════════ */

/**
 * @param {Map}    porCat   cat → nom → tam → items[] | { total, hechos } | number
 * @param {string} scope    prefijo único para IDs
 * @param {string} mode     "dia" | "sem" | "fut"
 * @param {string} diaKey   solo para mode=dia
 */
function _buildCatHTML(porCat, scope, mode, diaKey) {
  const hoyKey = _prodFechaKey(new Date());
  let html = "";

  _PROD_CAT_ORDEN.forEach(cat => {
    if (!porCat.has(cat)) return;
    const porNom = porCat.get(cat);

    // ── Contar hechos y total para el badge ──
    let totalCat = 0, hechosCat = 0;
    if (mode === "dia") {
      porNom.forEach(porTam => {
        porTam.forEach(tamItems => {
          tamItems.forEach(({ pedido, producto, cant }) => {
            totalCat += cant;
            if (_prodEsHecho(pedido.id, producto.id)) hechosCat += cant;
          });
        });
      });
    } else {
      porNom.forEach(porTam => {
        porTam.forEach(g => {
          if (typeof g === "number") {
            totalCat += g;
          } else {
            totalCat  += g.total;
            hechosCat += g.hechos || 0;
          }
        });
      });
    }

    const pendienteCat = totalCat - hechosCat;
    const catKey   = `${scope}-${cat}`;
    const colapsada = _prodCatColapsadas.has(catKey);
    const catId    = `prodcat-${catKey}`.replace(/[^a-z0-9-]/gi, "_");

    html += `<div class="prod-cat-bloque">
      <div class="prod-cat-header" onclick="_prodToggleCat('${catKey}','${catId}')">
        <span class="prod-cat-label">${_PROD_CAT_LABELS[cat]}</span>
        ${pendienteCat > 0
          ? `<span class="prod-cat-count">${hechosCat}/${totalCat}</span>`
          : `<span class="prod-cat-done">&#10003;</span>`}
        <span class="prod-cat-chevron">${colapsada ? "&#9654;" : "&#9660;"}</span>
      </div>
      <div class="prod-cat-body" id="${catId}" style="${colapsada ? "display:none" : ""}">
        <div class="prod-tabla-wrap">
        <table class="prod-tabla">
          <colgroup>
            <col class="prod-col-prod">
            <col class="prod-col-cant">
            <col class="prod-col-nota">
            ${mode === "dia" ? `<col class="prod-col-listo">` : ""}
          </colgroup>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad / Talle</th>
              <th class="prod-th-nota">Notas</th>
              ${mode === "dia" ? `<th class="prod-th-listo">Listo</th>` : ""}
            </tr>
          </thead>
          <tbody>`;

    // ── Filas de producto ──
    [...porNom.entries()].sort(([a], [b]) => a.localeCompare(b, "es")).forEach(([nom, porTam]) => {

      if (mode === "dia") {
        // ── MODO DÍA: pills expandibles + check por talle ──

        const allKeys = [];
        let totalProd = 0;
        // Notas con prefijo de talle: Map tam → Set de textos
        const notasPorTam = new Map();
        const notasPedido = new Set();
        porTam.forEach((tamItems, tam) => tamItems.forEach(({ pedido, producto, cant }) => {
          totalProd += cant;
          allKeys.push(`${pedido.id}:${producto.id}`);
          if (producto.nota_prod) {
            if (!notasPorTam.has(tam)) notasPorTam.set(tam, new Set());
            notasPorTam.get(tam).add(producto.nota_prod);
          }
          if (pedido.notas) notasPedido.add(pedido.notas);
        }));
        const todosHechos = allKeys.length > 0 && allKeys.every(k => {
          const [p, r] = k.split(":"); return _prodEsHecho(p, r);
        });

        const grupoId = `grp-${scope}-${nom}`.replace(/[^a-z0-9-]/gi, "_").toLowerCase();
        window._prodGrupoKeys[grupoId] = allKeys;

        // ── Armar pills de talle ──
        const pillsHTML = _sortTam([...porTam.entries()]).map(([tam, tamItems]) => {
          let cantTam = 0;
          const tamKeys = [];
          const clientes = [];

          tamItems.forEach(({ pedido, producto, diaEntrega, cant }) => {
            cantTam += cant;
            tamKeys.push(`${pedido.id}:${producto.id}`);
            clientes.push({
              nombre: pedido.cliente_input || pedido.cliente || "Sin nombre",
              cant,
              notaProd:   producto.nota_prod || "",
              notaPedido: pedido.notas || "",
              horaEntrega: pedido.hora_entrega || "",
              diaEntrega,
            });
          });

          const hechoTam = tamKeys.length > 0 && tamKeys.every(k => {
            const [p, r] = k.split(":"); return _prodEsHecho(p, r);
          });
          const tamId = `tam-${scope}-${nom}-${tam}`.replace(/[^a-z0-9-]/gi, "_").toLowerCase();
          const dsgId = `dsg-${tamId}`;
          window._prodGrupoKeys[tamId] = tamKeys;

          // Warning: entrega hoy y ya pasó el corte
          let hasWarning = false;
          tamItems.forEach(({ diaEntrega, producto }) => {
            if (diaEntrega === hoyKey && !producto.listo) {
              const now = new Date();
              if (now.getHours() * 60 + now.getMinutes() > _prodCorteMin(diaEntrega))
                hasWarning = true;
            }
          });

          // Desglose de clientes
          const desgloseHTML = clientes.map(cl => `
            <div class="prod-dsg-row">
              <div class="prod-dsg-info">
                <span class="prod-dsg-cliente">${esc(cl.nombre)}</span>
                ${cl.horaEntrega ? `<span class="prod-dsg-hora">&#128336; ${esc(cl.horaEntrega)}${cl.diaEntrega !== diaKey ? ` &middot; ${_prodLabelDia(cl.diaEntrega)}` : ""}</span>` : ""}
                ${cl.notaProd   ? `<div class="prod-dsg-nota">&#8627; ${esc(cl.notaProd)}</div>` : ""}
                ${cl.notaPedido ? `<div class="prod-dsg-nota pedido">&#128221; ${esc(cl.notaPedido)}</div>` : ""}
              </div>
              <div class="prod-dsg-cant">${cl.cant}</div>
            </div>`).join("");

          const labelTam = tam || "sin talle";
          const etiqueta = tam ? `${tam} ${cantTam}` : `${cantTam}`;

          return `<span class="prod-pill-wrap">
            <span class="prod-pill${hechoTam ? " hecho" : ""}${hasWarning ? " warn" : ""}"
                  onclick="_prodToggleDsg('${dsgId}', this)"
                  data-dsg="${dsgId}"
                  title="${labelTam}">
              ${esc(etiqueta)}
              <span class="prod-pill-chev">&#9660;</span>
            </span>
            <span class="prod-pill-dsg" id="${dsgId}" style="display:none">
              ${desgloseHTML}
            </span>
          </span>`;
        }).join("");

        // Notas con prefijo de talle cuando hay más de un talle
        const _notaLines = [];
        const _tamsSorted = _sortTam([...notasPorTam.entries()]);
        const _hayMasDeUnTalle = porTam.size > 1;
        _tamsSorted.forEach(([tam, textos]) => {
          textos.forEach(txt => {
            const prefijo = (tam && _hayMasDeUnTalle) ? `${tam}: ` : "";
            _notaLines.push(`${prefijo}${txt}`);
          });
        });
        notasPedido.forEach(txt => _notaLines.push(txt));
        const notaCell = _notaLines.length
          ? _notaLines.map(n => `<span class="prod-nota-item">&#8627; ${esc(n)}</span>`).join("")
          : `<span class="prod-nota-vacia">—</span>`;

        html += `<tr class="prod-fila${todosHechos ? " prod-fila-hecha" : ""}">
          <td class="prod-td-prod">
            <span class="prod-td-nom">${esc(nom)}<span class="prod-td-total">&thinsp;&middot;&thinsp;${totalProd}</span></span>
            <div class="prod-nota-mobile">${_notaLines.length ? _notaLines.map(n => `<span class="prod-nota-item">&#8627; ${esc(n)}</span>`).join("") : ""}</div>
          </td>
          <td class="prod-td-cant">
            <div class="prod-pills-wrap">${pillsHTML}</div>
          </td>
          <td class="prod-td-nota prod-col-desktop">${notaCell}</td>
          <td class="prod-td-listo">
            <button class="prod-chk-grupo${todosHechos ? " on" : ""}"
                    onclick="_prodToggleGrupo(window._prodGrupoKeys['${grupoId}'])"
                    title="Marcar todo listo">&#10003;</button>
          </td>
        </tr>`;

      } else {
        // ── MODO SEM / FUT: solo cantidades, sin interacción ──

        let totalProd = 0, hechosProd = 0;
        const pillsSem = _sortTam([...porTam.entries()]).map(([tam, g]) => {
          const total   = typeof g === "number" ? g : g.total;
          const hechos  = typeof g === "number" ? 0 : (g.hechos || 0);
          const faltante = total - hechos;
          totalProd  += total;
          hechosProd += hechos;
          const done = faltante <= 0;
          const etiqueta = tam ? `${tam} ${faltante}` : `${faltante}`;
          return `<span class="prod-pill${done ? " hecho" : ""}" title="${tam || "sin talle"}">${esc(etiqueta)}</span>`;
        }).join("");

        const done = totalProd - hechosProd <= 0;

        html += `<tr class="prod-fila${done ? " prod-fila-hecha" : ""}">
          <td class="prod-td-prod">
            <span class="prod-td-nom">${esc(nom)}<span class="prod-td-total">&thinsp;&middot;&thinsp;${totalProd - hechosProd > 0 ? totalProd - hechosProd : "&#10003;"}</span></span>
          </td>
          <td class="prod-td-cant" colspan="2">
            <div class="prod-pills-wrap">${pillsSem}</div>
          </td>
        </tr>`;
      }
    });

    html += `</tbody></table>
        </div>
      </div>
    </div>`; // cierra prod-tabla-wrap + prod-cat-body + prod-cat-bloque
  });

  return html;
}


/* ══════════════════════════════════════
   PANEL DE DÍA
   ══════════════════════════════════════ */

function _buildProdDia(diaKey, items) {
  if (!items.length) return `<div class="vacio" style="padding:24px 0;">Sin producci&oacute;n para este d&iacute;a.</div>`;

  const [y, m, d] = diaKey.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  const corteStr = ((datos.cortePedidosHoy || {})[datos.localId || "matienzo"]) || "14:00";
  let warningHTML = "";

  // Detectar si alguno de los ítems de este día tiene día especial activo
  // (los items de tanda=1 vienen del día siguiente que es especial, o del propio día si es hoy)
  const tieneTandas = items.some(x => x.tanda === 1 || x.tanda === 2);

  if (tieneTandas) {
    // ── MODO DÍA ESPECIAL: mostrar en dos tandas ──
    const itemsTanda1 = items.filter(x => x.tanda === 1 || x.tanda === undefined && !items.some(i => i.tanda));
    const itemsTanda2 = items.filter(x => x.tanda === 2);

    // Obtener el corteHora del día especial
    // Los items de tanda 1 vienen de un diaEntrega que puede ser el siguiente
    let corteEspecialStr = "15:00";
    const diaEntregaEjemplo = itemsTanda1[0]?.diaEntrega || itemsTanda2[0]?.diaEntrega || diaKey;
    const dDataEj = datos.dias[diaEntregaEjemplo] || {};
    if (dDataEj.especial && dDataEj.corteHora) corteEspecialStr = dDataEj.corteHora;
    // También checar el día siguiente si los items son del propio día
    if (corteEspecialStr === "15:00") {
      // buscar cualquier diaEntrega con especial
      const diaEsp = [...new Set(items.map(x => x.diaEntrega))].find(k => (datos.dias[k] || {}).especial);
      if (diaEsp) corteEspecialStr = datos.dias[diaEsp].corteHora || "15:00";
    }

    let html = `<div class="prod-dia-wrap">`;

    if (itemsTanda1.length) {
      html += `<div class="prod-tanda-header prod-tanda-1">
        <span class="prod-tanda-ico">🟠</span>
        <span class="prod-tanda-titulo">Tanda 1 &mdash; Clientes del d&iacute;a + Cuba hasta las ${esc(corteEspecialStr)}</span>
      </div>`;
      html += _buildCatHTML(_prodAgrupar(itemsTanda1), diaKey + "-t1", "dia", diaKey);
    }

    if (itemsTanda2.length) {
      html += `<div class="prod-tanda-header prod-tanda-2" style="margin-top:18px;">
        <span class="prod-tanda-ico">🔵</span>
        <span class="prod-tanda-titulo">Tanda 2 &mdash; Pedidos del d&iacute;a siguiente hasta las 14hs + Cuba despu&eacute;s de las ${esc(corteEspecialStr)}</span>
      </div>`;
      html += _buildCatHTML(_prodAgrupar(itemsTanda2), diaKey + "-t2", "dia", diaKey);
    }

    if (!itemsTanda1.length && !itemsTanda2.length) {
      html += `<div class="vacio" style="padding:24px 0;">Sin producci&oacute;n para este d&iacute;a.</div>`;
    }

    html += `</div>`;
    return html;
  }

  // ── MODO NORMAL ──

  // ── Warning 1: pedidos de HOY antes del corte ──
  const hoyKey = _prodFechaKey(new Date());
  if (diaKey === hoyKey) {
    const anteCorteHoy = items.filter(x => x.esHoyAnteCorte);
    if (anteCorteHoy.length) {
      const filas = anteCorteHoy.map(({ pedido, producto }) => {
        const nom     = producto.tipo === "catalogo" ? producto.nombre : (producto.libre || "Libre");
        const tam     = producto.tamano ? ` ${producto.tamano}` : "";
        const cliente = pedido.cliente_input || pedido.cliente || "Sin nombre";
        return `<div class="prod-warning-martes-fila">
          <span class="prod-warning-martes-hora">&#128336; ${esc(pedido.hora_entrega || "--:--")}</span>
          <span class="prod-warning-martes-prod">${esc(nom)}${esc(tam)}</span>
          <span class="prod-warning-martes-cli">${esc(cliente)}</span>
        </div>`;
      }).join("");
      warningHTML += `<div class="prod-warning-martes">
        <div class="prod-warning-martes-titulo">&#9888;&#65039; Pedidos de hoy antes de las ${esc(corteStr)} hs &mdash; ¡confirmar separaci&oacute;n!</div>
        ${filas}
      </div>`;
    }
  }

  // ── Warning 2: sábado y domingo → pedidos del martes antes del corte ──
  if (dow === 6 || dow === 0) {
    const pedidosMartes = _prodPedidosWarningMartes(diaKey);
    if (pedidosMartes.length) {
      const filas = pedidosMartes.map(({ pedido, producto }) => {
        const nom     = producto.tipo === "catalogo" ? producto.nombre : (producto.libre || "Libre");
        const tam     = producto.tamano ? ` ${producto.tamano}` : "";
        const cliente = pedido.cliente_input || pedido.cliente || "Sin nombre";
        return `<div class="prod-warning-martes-fila">
          <span class="prod-warning-martes-hora">&#128336; ${esc(pedido.hora_entrega || "--:--")}</span>
          <span class="prod-warning-martes-prod">${esc(nom)}${esc(tam)}</span>
          <span class="prod-warning-martes-cli">${esc(cliente)}</span>
        </div>`;
      }).join("");
      warningHTML += `<div class="prod-warning-martes">
        <div class="prod-warning-martes-titulo">&#9888;&#65039; Pedidos del martes antes de las ${esc(corteStr)} hs</div>
        ${filas}
      </div>`;
    }
  }

  const porCat = _prodAgrupar(items);
  return `<div class="prod-dia-wrap">${warningHTML}${_buildCatHTML(porCat, diaKey, "dia", diaKey)}</div>`;
}


/* ══════════════════════════════════════
   PANEL SEMANAL
   ══════════════════════════════════════ */

function _buildProdSemanal(map) {
  const { martes, domingo } = _prodSemanaActual();
  const [, mm, dm] = martes.split("-").map(Number);
  const [, md, dd] = domingo.split("-").map(Number);
  const MESES_S = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

  const porCat = new Map();
  map.forEach((items, diaKey) => {
    if (diaKey < martes || diaKey > domingo) return;
    items.forEach(({ pedido, producto }) => {
      const nom = producto.tipo === "catalogo" ? producto.nombre : (producto.libre || "Libre");
      const tam = producto.tamano || "";
      const cat = producto.tipo === "catalogo" ? _prodCatDeProducto(producto.nombre) : "otros";
      const cant = Number(producto.cantidad) || 1;
      if (!porCat.has(cat)) porCat.set(cat, new Map());
      const porNom = porCat.get(cat);
      if (!porNom.has(nom)) porNom.set(nom, new Map());
      const porTam = porNom.get(nom);
      if (!porTam.has(tam)) porTam.set(tam, { total: 0, hechos: 0 });
      const g = porTam.get(tam);
      g.total += cant;
      // Cuenta tanto el flag persistido como el tilde efímero de esta sesión
      if (_prodEsHecho(pedido.id, producto.id)) g.hechos += cant;
    });
  });

  if (!porCat.size) return `<div class="vacio" style="padding:24px 0;">Sin producci&oacute;n esta semana. &#127881;</div>`;

  const header = `<div class="prod-semanal-header">
    <div class="prod-semanal-titulo">Producci&oacute;n semanal</div>
    <div class="prod-semanal-rango">Mar ${dm} ${MESES_S[mm-1]} &rarr; Dom ${dd} ${MESES_S[md-1]}</div>
    <div class="prod-semanal-nota">Los &ldquo;Listo&rdquo; en pedidos se descuentan autom&aacute;ticamente.</div>
  </div>`;

  return `<div class="prod-semanal-wrap">${header}${_buildCatHTML(porCat, "sem", "sem")}</div>`;
}


/* ══════════════════════════════════════
   PANEL FUTURO
   ══════════════════════════════════════ */

function _buildProdFuturo(futuros) {
  const MESES_S = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

  if (!futuros.some(x => x.items.length > 0)) {
    return `<div class="prod-futuro-vacio">
      <div class="prod-futuro-ico">&#128302;</div>
      <div class="prod-futuro-txt">Sin pedidos para semanas futuras.</div>
    </div>`;
  }

  const porSemana = new Map();
  futuros.forEach(({ diaKey, items }) => {
    const [y, m, d] = diaKey.split("-").map(Number);
    const f = new Date(y, m - 1, d);
    const dow = f.getDay();
    const mart = new Date(f);
    mart.setDate(f.getDate() - (dow === 0 ? 5 : dow === 1 ? 6 : dow - 2));
    const semKey = _prodFechaKey(mart);
    if (!porSemana.has(semKey)) porSemana.set(semKey, []);
    porSemana.get(semKey).push({ diaKey, items });
  });

  let html = "";
  [...porSemana.keys()].sort().forEach(semKey => {
    const diasSem = porSemana.get(semKey);
    const [y, m, d] = semKey.split("-").map(Number);
    const dom = new Date(y, m - 1, d + 6);
    html += `<div class="prod-futuro-semana-header">Semana del ${d} ${MESES_S[m-1]} al ${dom.getDate()} ${MESES_S[dom.getMonth()]}</div>`;

    const porCat = new Map();
    diasSem.forEach(({ items }) => items.forEach(({ producto }) => {
      const nom = producto.tipo === "catalogo" ? producto.nombre : (producto.libre || "Libre");
      const tam = producto.tamano || "";
      const cat = producto.tipo === "catalogo" ? _prodCatDeProducto(producto.nombre) : "otros";
      if (!porCat.has(cat)) porCat.set(cat, new Map());
      const porNom = porCat.get(cat);
      if (!porNom.has(nom)) porNom.set(nom, new Map());
      const porTam = porNom.get(nom);
      porTam.set(tam, (porTam.get(tam) || 0) + (Number(producto.cantidad) || 1));
    }));

    html += _buildCatHTML(porCat, `fut-${semKey}`, "fut");
  });

  return `<div class="prod-futuro-wrap">${html}</div>`;
}


/* ══════════════════════════════════════
   INTERACCIÓN
   ══════════════════════════════════════ */

// Toggle categoría colapsable
function _prodToggleCat(catKey, catId) {
  const body = document.getElementById(catId);
  if (!body) return;
  if (_prodCatColapsadas.has(catKey)) {
    _prodCatColapsadas.delete(catKey);
    body.style.display = "";
  } else {
    _prodCatColapsadas.add(catKey);
    body.style.display = "none";
  }
  const header = body.previousElementSibling;
  if (header) {
    const chev = header.querySelector(".prod-cat-chevron");
    if (chev) chev.innerHTML = _prodCatColapsadas.has(catKey) ? "&#9654;" : "&#9660;";
  }
}

// Toggle desglose expandible desde pill
function _prodToggleDsg(id, pillEl) {
  const el = document.getElementById(id);
  if (!el) return;
  const visible = el.style.display !== "none";
  el.style.display = visible ? "none" : "block";
  // rotar chevron en la pill
  const chev = pillEl?.querySelector(".prod-pill-chev");
  if (chev) chev.innerHTML = visible ? "&#9660;" : "&#9650;";
  // marcar pill como expandida
  if (pillEl) pillEl.classList.toggle("expandida", !visible);
}

// Toggle efímero individual
function _prodToggleItem(pedidoId, prodId) {
  const key = `${pedidoId}:${prodId}`;
  if (_prodHechos.has(key)) _prodHechos.delete(key); else _prodHechos.add(key);
  renderProduccion();
}

// Toggle efímero de grupo (botón en columna Listo)
function _prodToggleGrupo(keys) {
  if (!keys || !keys.length) return;
  const todosOn = keys.every(k => { const [p, r] = k.split(":"); return _prodEsHecho(p, r); });
  keys.forEach(k => todosOn ? _prodHechos.delete(k) : _prodHechos.add(k));
  renderProduccion();
}

/* ══════════════════════════════════════
   LIBRETA DE VENTA
   ══════════════════════════════════════ */

function renderLibretaVenta() {
  const wrap = document.getElementById("prod-panel-wrap");
  if (!wrap) return;

  // datos.libretaVenta = { "2026-05-18": [ { id, nombre, cantidad, hecho }, ... ] }
  const libreta = datos.libretaVenta || {};
  const hoyKey  = _prodFechaKey(new Date());

  if (_lvTabActiva === null) _lvTabActiva = hoyKey;

  // ── Tabs por día ──
  const diasConItems = Object.keys(libreta)
    .filter(k => (libreta[k] || []).length > 0)
    .sort();
  const tabKeys = [...new Set([hoyKey, ...diasConItems])].sort();

  const tabsHTML = tabKeys.map(k => {
    const items  = libreta[k] || [];
    const activa = k === _lvTabActiva;
    const label  = k === hoyKey ? "Hoy" : _prodLabelDia(k);
    return `<button class="lv-tab${activa ? " lv-tab-activa" : ""}" onclick="_lvSetTab('${k}')">
      ${esc(label)}
      ${items.length ? `<span class="lv-tab-badge">${items.length}</span>` : ""}
    </button>`;
  }).join("");

  // ── Lista del día activo ──
  const items = libreta[_lvTabActiva] || [];
  const listaHTML = items.length
    ? items.map(it => `
        <div class="lv-item${it.hecho ? " hecho" : ""}" id="lv-item-${it.id}">
          <div class="lv-chk${it.hecho ? " on" : ""}" onclick="_lvToggle('${_lvTabActiva}','${it.id}')">&#10003;</div>
          <div class="lv-item-body">
            <span class="lv-item-nom">${esc(it.nombre)}</span>
            <span class="lv-item-cant">&times;${it.cantidad || 1}</span>
          </div>
          <button class="lv-del" onclick="_lvDel('${_lvTabActiva}','${it.id}')" title="Eliminar">&#10005;</button>
        </div>`).join("")
    : `<div class="lv-vacio">Sin ítems para este d&iacute;a.</div>`;

  wrap.innerHTML = `
    <div id="libreta-venta-wrap-inner">
      <div class="lv-header">
        <div class="lv-titulo">&#128221; Libreta de venta</div>
      </div>
      <div class="lv-tabs">${tabsHTML}</div>
      <div class="lv-lista">${listaHTML}</div>
      <div class="lv-form">
        <input id="lv-inp-nom"  class="lv-input lv-input-nom"  type="text"   placeholder="Ej: crema pastelera 3L…">
        <input id="lv-inp-cant" class="lv-input lv-input-cant" type="number" min="1" value="1" placeholder="Cant.">
        <button class="lv-btn-add" onclick="_lvAdd()">+ Agregar</button>
      </div>
    </div>`;
}

function _lvSetTab(key) {
  _lvTabActiva = key;
  renderLibretaVenta();
}

function _lvAdd() {
  const nom  = (document.getElementById("lv-inp-nom")?.value || "").trim();
  if (!nom) return;
  const cant = Math.max(1, parseInt(document.getElementById("lv-inp-cant")?.value) || 1);
  const key  = _lvTabActiva || _prodFechaKey(new Date());

  if (!datos.libretaVenta)      datos.libretaVenta = {};
  if (!datos.libretaVenta[key]) datos.libretaVenta[key] = [];

  datos.libretaVenta[key].push({
    id:       `lv-${Date.now()}`,
    nombre:   nom,
    cantidad: cant,
    hecho:    false,
  });

  guardar();
  renderProduccion();
}

function _lvToggle(diaKey, id) {
  const items = (datos.libretaVenta?.[diaKey] || []);
  const item  = items.find(x => x.id === id);
  if (item) item.hecho = !item.hecho;
  guardar();
  renderLibretaVenta();
}

function _lvDel(diaKey, id) {
  if (!datos.libretaVenta?.[diaKey]) return;
  datos.libretaVenta[diaKey] = datos.libretaVenta[diaKey].filter(x => x.id !== id);
  guardar();
  renderProduccion();
}

/* ══════════════════════════════════════
   RESUMEN DEL DÍA
   Producción de pedidos + Libreta de venta
   ══════════════════════════════════════ */

function _buildProdResumen() {
  const hoyKey = _prodFechaKey(new Date());
  const [y, m, d] = hoyKey.split("-").map(Number);
  const DIAS  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
  const MESES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  const labelFecha = `${DIAS[new Date(y,m-1,d).getDay()]} ${d} ${MESES[m-1]}`;

  // ── Producción de pedidos de hoy ──
  const map = _prodBuildMap();
  const itemsHoy = map.get(hoyKey) || [];
  const prodHTML = itemsHoy.length
    ? _buildProdDia(hoyKey, itemsHoy)
    : `<div class="vacio" style="padding:16px 0;">Sin pedidos para hoy.</div>`;

  // ── Libreta de hoy ──
  const libretaHoy = (datos.libretaVenta || {})[hoyKey] || [];
  let libretaHTML = "";
  if (libretaHoy.length) {
    libretaHTML = `<div class="pres-libreta-bloque">
      <div class="pres-cat-label">&#128221; Libreta de venta</div>
      <div class="pres-libre-lista">
        ${libretaHoy.map(it => `
          <div class="pres-libre-item">
            <span class="pres-libre-nom">${esc(it.nombre)}</span>
            <span class="pres-libre-cant">× ${it.cantidad || 1}</span>
          </div>`).join("")}
      </div>
    </div>`;
  }

  if (!itemsHoy.length && !libretaHoy.length) {
    return `<div class="vacio" style="padding:32px 0;text-align:center;">Sin producción ni libreta para hoy.</div>`;
  }

  return `<div class="pres-wrap">
    <div class="pres-header">
      <div class="pres-titulo">&#128203; Resumen de producción</div>
      <div class="pres-fecha">${labelFecha}</div>
      <button class="pres-btn-export" onclick="exportarResumenXLSX()">&#8595; Exportar Excel</button>
    </div>
    ${prodHTML}
    ${libretaHTML}
  </div>`;
}


/* ══════════════════════════════════════
   EXPORTAR RESUMEN A XLSX — hoja única con formato
   ══════════════════════════════════════ */

function exportarResumenXLSX() {
  if (typeof XLSX === "undefined") { alert("La librería de Excel no está cargada."); return; }

  const hoyKey = _prodFechaKey(new Date());
  const [y, m, d] = hoyKey.split("-").map(Number);
  const DIAS  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
  const MESES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  const labelFecha = `${DIAS[new Date(y,m-1,d).getDay()]} ${d} ${MESES[m-1]} ${y}`;
  const CAT_NOMBRES = { tortas:"Tortas", mousses:"Mousses", bandejas:"Bandejas", cuadrados:"Cuadrados", congelados:"Congelados", otros:"Otros" };

  // Colores
  const COLOR_TITULO  = "2D2250"; // violeta oscuro
  const COLOR_CAT     = "4B3A8A"; // violeta medio
  const COLOR_HEADER  = "6C5BB5"; // violeta claro
  const COLOR_LIBRETA = "B45309"; // ámbar oscuro
  const COLOR_WHITE   = "FFFFFF";
  const COLOR_ROW_ALT = "F3F0FA"; // lavanda muy suave
  const COLOR_TOTAL   = "E8E3F5"; // fila total

  const wb = XLSX.utils.book_new();
  const aoa = []; // array of arrays para la hoja
  const estilos = {}; // { "A1": { style } } — se aplica después

  let fila = 0; // índice 0-based

  const celda = (r, c) => XLSX.utils.encode_cell({ r, c });

  const pushFila = (arr) => { aoa.push(arr); fila++; };

  // ── Título principal ──
  pushFila([`📋 Producción del día — ${labelFecha}`]);
  pushFila([]); // espacio

  // ── Producción de pedidos ──
  const map = _prodBuildMap();
  const itemsHoy = map.get(hoyKey) || [];

  const porCat = new Map();
  itemsHoy.forEach(({ producto }) => {
    const nom  = producto.tipo === "catalogo" ? producto.nombre : (producto.libre || "Libre");
    const tam  = producto.tamano || "Sin talle";
    const cat  = producto.tipo === "catalogo" ? _prodCatDeProducto(producto.nombre) : "otros";
    const cant = Number(producto.cantidad) || 1;
    if (!porCat.has(cat)) porCat.set(cat, new Map());
    const porNom = porCat.get(cat);
    if (!porNom.has(nom)) porNom.set(nom, new Map());
    porNom.get(nom).set(tam, (porNom.get(nom).get(tam) || 0) + cant);
  });

  _PROD_CAT_ORDEN.forEach(cat => {
    if (!porCat.has(cat)) return;
    const porNom = porCat.get(cat);

    // Talles de esta categoría
    const todosT = new Set();
    porNom.forEach(porTam => porTam.forEach((_, t) => todosT.add(t)));
    const talles = _sortTam([...todosT].map(t => [t])).map(([t]) => t);
    const nCols = 1 + talles.length + 1; // Producto + talles + Total

    // Fila categoría
    const filasCat = fila;
    pushFila([CAT_NOMBRES[cat] || cat]);

    // Fila header
    const filasHeader = fila;
    pushFila(["Producto", ...talles, "Total"]);

    // Filas de productos
    let filasPar = true;
    [...porNom.entries()].sort(([a],[b]) => a.localeCompare(b,"es")).forEach(([nom, porTam]) => {
      let total = 0;
      const row = [nom, ...talles.map(t => { const v = porTam.get(t) || 0; total += v; return v || 0; })];
      row.push(total);
      const filaActual = fila;
      pushFila(row);
      filasPar = !filasPar;

      // Estilo filas alternadas
      for (let c = 0; c < nCols; c++) {
        estilos[celda(filaActual, c)] = {
          fill: { fgColor: { rgb: filasPar ? "FFFFFF" : COLOR_ROW_ALT } },
          border: { top:{style:"thin",color:{rgb:"D1C9F0"}}, bottom:{style:"thin",color:{rgb:"D1C9F0"}}, left:{style:"thin",color:{rgb:"D1C9F0"}}, right:{style:"thin",color:{rgb:"D1C9F0"}} },
          font: { name:"Calibri", sz:11 },
          alignment: { horizontal: c === 0 ? "left" : "center" },
        };
      }
      // Total en negrita
      estilos[celda(filaActual, nCols-1)] = {
        ...estilos[celda(filaActual, nCols-1)],
        font: { name:"Calibri", sz:11, bold:true },
        fill: { fgColor: { rgb: COLOR_TOTAL } },
      };
    });

    // Estilo fila categoría
    for (let c = 0; c < nCols; c++) {
      estilos[celda(filasCat, c)] = {
        fill: { fgColor: { rgb: COLOR_CAT } },
        font: { name:"Calibri", sz:12, bold:true, color:{ rgb:COLOR_WHITE } },
        alignment: { horizontal:"left" },
      };
    }
    // Estilo fila header
    for (let c = 0; c < nCols; c++) {
      estilos[celda(filasHeader, c)] = {
        fill: { fgColor: { rgb: COLOR_HEADER } },
        font: { name:"Calibri", sz:10, bold:true, color:{ rgb:COLOR_WHITE } },
        alignment: { horizontal: c === 0 ? "left" : "center" },
        border: { top:{style:"medium",color:{rgb:"2D2250"}}, bottom:{style:"medium",color:{rgb:"2D2250"}} },
      };
    }

    pushFila([]); // espacio entre categorías
  });

  // ── Libreta ──
  const libretaHoy = (datos.libretaVenta || {})[hoyKey] || [];
  if (libretaHoy.length) {
    pushFila([]); // espacio

    const filaLibCat = fila;
    pushFila(["📝 Libreta de venta"]);
    const filaLibHeader = fila;
    pushFila(["Producto", "Cantidad"]);

    libretaHoy.forEach((it, i) => {
      const filaActual = fila;
      pushFila([it.nombre, it.cantidad || 1]);
      for (let c = 0; c < 2; c++) {
        estilos[celda(filaActual, c)] = {
          fill: { fgColor: { rgb: i % 2 === 0 ? "FFFFFF" : "FEF3C7" } },
          border: { top:{style:"thin",color:{rgb:"F59E0B"}}, bottom:{style:"thin",color:{rgb:"F59E0B"}}, left:{style:"thin",color:{rgb:"F59E0B"}}, right:{style:"thin",color:{rgb:"F59E0B"}} },
          font: { name:"Calibri", sz:11 },
          alignment: { horizontal: c === 0 ? "left" : "center" },
        };
      }
    });

    // Estilo cabecera libreta
    for (let c = 0; c < 2; c++) {
      estilos[celda(filaLibCat, c)] = {
        fill: { fgColor: { rgb: COLOR_LIBRETA } },
        font: { name:"Calibri", sz:12, bold:true, color:{ rgb:COLOR_WHITE } },
      };
      estilos[celda(filaLibHeader, c)] = {
        fill: { fgColor: { rgb: "D97706" } },
        font: { name:"Calibri", sz:10, bold:true, color:{ rgb:COLOR_WHITE } },
        alignment: { horizontal: c === 0 ? "left" : "center" },
      };
    }
  }

  // ── Armar hoja ──
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Aplicar estilos
  Object.entries(estilos).forEach(([addr, style]) => {
    if (!ws[addr]) ws[addr] = { v:"", t:"s" };
    ws[addr].s = style;
  });

  // Estilo título
  if (ws["A1"]) ws["A1"].s = {
    font: { name:"Calibri", sz:14, bold:true, color:{ rgb:COLOR_TITULO } },
    alignment: { horizontal:"left" },
  };

  // Anchos de columna
  ws["!cols"] = [{ wch:28 }, { wch:12 }, { wch:12 }, { wch:12 }, { wch:12 }, { wch:10 }];

  // Usar xlsx con estilos (xlsx-js-style si está, sino xlsx normal)
  const wbOut = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wbOut, ws, "Producción");
  XLSX.writeFile(wbOut, `produccion_${hoyKey.replace(/-/g,"")}.xlsx`);
}

