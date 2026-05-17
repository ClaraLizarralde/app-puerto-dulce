/**
 * ================================================================
 * PRODUCCIÓN — v6
 * ================================================================
 * Lógica idéntica a v5. Solo cambia _buildCatHTML:
 * tabla por categoría con columnas Producto | Cantidad/Talle | Notas | Listo
 * Pills de talle expandibles, check efímero por talle (modo día).
 * ================================================================
 */

/* ══════════════════════════════════════
   ESTADO
   ══════════════════════════════════════ */

let _prodTabActiva = null;
const _prodHechos = new Set();
window._prodGrupoKeys = {};
const _prodCatColapsadas = new Set();


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

function _prodCorteMin(diaKey) {
  const dd = datos.dias[diaKey] || {};
  let corteStr;
  if (dd.especial && dd.corteHora) {
    corteStr = dd.corteHora;
  } else {
    const localId = datos.localId || "matienzo";
    corteStr = ((datos.cortePedidosHoy || {})[localId]) || "14:00";
  }
  const [h, m] = corteStr.split(":").map(Number);
  return h * 60 + m;
}

function _prodDiaDeProduccion(diaEntregaKey, horaEntrega) {
  if (!horaEntrega) return diaEntregaKey;
  const [h, m] = horaEntrega.split(":").map(Number);
  if (h * 60 + m > _prodCorteMin(diaEntregaKey)) return diaEntregaKey;

  const [y, mo, d] = diaEntregaKey.split("-").map(Number);
  const f = new Date(y, mo - 1, d);
  f.setDate(f.getDate() - 1);
  const localId = datos.localId || "matienzo";
  const horarios = datos.horariosLocales ||
    (typeof HORARIOS_DEFAULT !== "undefined" ? HORARIOS_DEFAULT : {});
  const horLocal = horarios[localId] || {};
  for (let i = 0; i < 7; i++) {
    if (horLocal[f.getDay()]) return _prodFechaKey(f);
    f.setDate(f.getDate() - 1);
  }
  return diaEntregaKey;
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
  const map = new Map();
  Object.entries(datos.dias).forEach(([diaEntregaKey, dData]) => {
    (dData.pedidos || []).forEach(p => {
      if (p.estado === "entregado") return;
      (p.productos || []).forEach(r => {
        if (r.tacc !== "s") return;
        const diaProd = _prodDiaDeProduccion(diaEntregaKey, p.hora_entrega);
        if (!map.has(diaProd)) map.set(diaProd, []);
        map.get(diaProd).push({
          pedido: p, producto: r,
          diaEntrega: diaEntregaKey,
          esAnticipada: diaProd !== diaEntregaKey,
        });
      });
    });
  });
  return map;
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

  bar.innerHTML = html;
  setTimeout(() => {
    const a = bar.querySelector(".prod-tab-btn.active");
    if (a) a.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, 50);
}

function _prodSetTab(key) {
  _prodTabActiva = key;
  renderProduccion();
}


/* ══════════════════════════════════════
   DISPATCH DE PANEL
   ══════════════════════════════════════ */

function _renderProdPanel(map, activos, futuros) {
  const wrap = document.getElementById("prod-panel-wrap");
  if (!wrap) return;
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
            <span class="prod-td-nom">${esc(nom)}</span>
            <span class="prod-td-total">${totalProd - hechosProd > 0 ? totalProd - hechosProd : "&#10003;"}</span>
          </td>
          <td class="prod-td-cant" colspan="2">
            <div class="prod-pills-wrap">${pillsSem}</div>
          </td>
        </tr>`;
      }
    });

    html += `</tbody></table>
      </div>
    </div>`; // cierra prod-cat-body + prod-cat-bloque
  });

  return html;
}


/* ══════════════════════════════════════
   PANEL DE DÍA
   ══════════════════════════════════════ */

function _buildProdDia(diaKey, items) {
  if (!items.length) return `<div class="vacio" style="padding:24px 0;">Sin producci&oacute;n para este d&iacute;a.</div>`;

  const normales    = items.filter(x => !x.esAnticipada);
  const anticipados = items.filter(x => x.esAnticipada);

  let html = "";

  if (normales.length) {
    const porCat = _prodAgrupar(normales);
    html += _buildCatHTML(porCat, diaKey, "dia", diaKey);
  }

  if (anticipados.length) {
    const porCat = _prodAgrupar(anticipados);
    html += `<div class="prod-anticipada-aviso">&#128197; Producci&oacute;n anticipada &mdash; pedidos del martes antes del corte</div>`;
    html += _buildCatHTML(porCat, `ant-${diaKey}`, "dia", diaKey);
  }

  return `<div class="prod-dia-wrap">${html}</div>`;
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
    items.forEach(({ producto }) => {
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
      if (producto.listo) g.hechos += cant;
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