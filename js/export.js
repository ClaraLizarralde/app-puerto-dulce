/**
 * ================================================================
 * ÍNDICE DE FUNCIONES (EXPORT.JS)
 * ================================================================
 * 
 * === CSV SIMPLE ===
 * - mostrarCSVModal()             → Abre modal de exportación CSV
 * - cerrarCSVModal()              → Cierra modal de exportación CSV
 * - exportarCSV(tipo)             → Exporta pedidos o producción a CSV simple
 * 
 * === EXPORTAR EXCEL (XLSX) - PEDIDOS Y PRODUCCIÓN ===
 * - exportarExcel(soloDia)        → Función principal: exporta todo o día actual a XLSX
 * - buildPedidosSheet(pedidos, fechaStr, diaNom) → Construye hoja de pedidos
 * - buildProduccionSheet(pedidosTodos, fechaStr, diaNom) → Construye hoja de producción
 * - applyStyles(ws, aoa, estilos, merges) → Aplica estilos a hoja de Excel
 * 
 * === EXPORTAR CUBA (XLSX y CSV) ===
 * - buildCubaExportData(diaKey)   → Extrae datos de pedidos Cuba + ventas
 * - buildCubaXlsx(diaKeys)        → Construye libro XLSX de Cuba
 * - buildCubaCsvContent(diaKeys)  → Construye contenido CSV de Cuba
 * - exportarCubaConFormato(diaKeys, fmt) → Exporta Cuba en formato XLSX o CSV
 * - exportarCubaHoy(fmt)          → Exporta Cuba del día actual
 * - exportarCubaTodos(fmt)        → Exporta Cuba de todos los días
 * - exportarCubaDiaSeleccionado(fmt) → Exporta Cuba de día seleccionado en selector
 * - renderCubaExportSelector()    → Renderiza selector de días para exportar Cuba
 * - exportarCuba(tipo, fmt)       → Exporta Cuba en TXT (egreso/ambos)
 * 
 * === REMITO DE EGRESO ===
 * - buildRemitoXlsx(diaKey)       → Construye remito unificado (Cuba + ventas)
 * - exportarRemitoEgreso()        → Exporta remito de egreso del día actual
 * 
 * === CATÁLOGO - IMPORTAR/EXPORTAR ===
 * - exportarPlantillaXlsx()       → Genera plantilla de catálogo para importar
 * - importarCatalogoXlsx(input)   → Importa catálogo desde XLSX
 * - exportarCatalogo()            → Exporta catálogo a JSON
 * - importarCatalogo(input)       → Importa catálogo desde JSON
 * 
 * === ARCHIVADOS ===
 * - restaurarArchivado(id)        → Restaura pedido archivado al día original
 * - eliminarArchivado(id)         → Elimina pedido archivado permanentemente
 * - exportarArchivadosXlsx()      → Exporta historial de pedidos archivados a XLSX
 * 
 * === BACKUP COMPLETO ===
 * - exportarTodoJSON()            → Exporta todos los datos a JSON (backup completo)
 * 
 * === CONSTANTES Y HELPERS ===
 * - XL                            → Paleta de colores para Excel
 * - ORDEN_TALLE                   → Orden de talles para sorting
 * - esCubaCliente(c)              → Detecta si cliente es Cuba
 * - prodNombre(r)                 → Obtiene nombre de producto
 * - prodCant(r)                   → Obtiene cantidad de producto
 * - estadoRetirado(p)             → Retorna "R" si retirado, "S" si suspendido
 * - fechaLegible(key)             → Convierte fechaKey a formato legible
 * - celStyle(opts)                → Genera objeto de estilo para SheetJS
 * 
 * ================================================================
 */

// ── CSV ──
function mostrarCSVModal() {
  document.getElementById("modal-csv").classList.remove("hidden");
}

// ══════════════════════════════════════════════════════════════════════════════
//  EXPORTAR EXCEL — Puerto Dulce
//  Requiere SheetJS (ya incluido en la app como XLSX)
//  Genera un .xlsx con hojas por día: Matienzo, Cuba, Producción
// ══════════════════════════════════════════════════════════════════════════════

// ── Paleta de colores (ARGB para SheetJS) ────────────────────────────────────
const XL = {
  TERRACOTA: "FFC95D3F",
  TERRACOTA_BG: "FFFDECD8",
  CUBA_ORO: "FFD4A843",
  CUBA_BG: "FFFEF9ED",
  CUBA_INK: "FF7A5A10",
  VERDE: "FF4A8C5C",
  VERDE_BG: "FFEAF4ED",
  HEADER_BG: "FF1E1410",
  HEADER_TXT: "FFFFFFFF",
  GRAY_ALT: "FFFAF7F4",
  GRAY_LINE: "FFE8D8CC",
  INK_MID: "FF6B4F3A",
  PROD_H: "FF4A7FA5",
  PROD_BG: "FFE8F2F9",
  BLANCO: "FFFFFFFF",
};

const ORDEN_TALLE = { ch: 0, chico: 0, "pequeño": 0, md: 1, med: 1, mediano: 1, gr: 2, grande: 2 };
function talleSortKey(t) { return ORDEN_TALLE[(t || "").toLowerCase().trim()] ?? 3; }
function esCubaCliente(c) { return (c || "").toLowerCase().includes("cuba"); }
function prodNombre(r) { return r.tipo === "catalogo" ? (r.nombre || "") : (r.libre || r.nombre || ""); }
function prodCant(r) { const n = Number(r.cantidad); return isNaN(n) ? 1 : n; }
function estadoRetirado(p) {
  const e = p.estado || "pendiente";
  if (e === "entregado") return "R";
  if (e === "suspendido") return "S";
  return "";
}
function fechaLegible(key) {
  const meses = ["", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  try {
    const [y, m, d] = key.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return { diaNom: dias[dt.getDay()], str: `${d} ${meses[m]} ${y}` };
  } catch (e) { return { diaNom: key, str: key }; }
}

// ── Helpers de estilo SheetJS ─────────────────────────────────────────────────
function celStyle(opts = {}) {
  const borderColor = (opts.borderColor || XL.GRAY_LINE).replace("#", "");
  const thinBorder = { style: "thin", color: { rgb: borderColor } };
  const fullBorder = opts.fullBorder !== false && opts.border !== false ? {
    top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder,
  } : opts.border !== false ? {
    bottom: thinBorder,
  } : undefined;
  return {
    font: {
      name: "Arial",
      sz: opts.sz || 9,
      bold: opts.bold || false,
      color: { rgb: (opts.color || "FF1E1410").replace("#", "") },
    },
    fill: opts.fill ? { patternType: "solid", fgColor: { rgb: opts.fill.replace("#", "") } } : undefined,
    alignment: {
      horizontal: opts.h || "center",
      vertical: "center",
      wrapText: true,
    },
    border: fullBorder,
  };
}

// ── Hoja PEDIDOS ──────────────────────────────────────────────────────────────
const COLS_PEDIDO = [
  { header: "✓", wch: 4, ci_center: true },   // Check manual (hecho)
  { header: "●", wch: 4, ci_center: true },   // Pedido a Cuba
  { header: "Hora", wch: 7, ci_center: true }, // Hora entrega
  { header: "Nombre", wch: 24, ci_center: false }, // Cliente
  { header: "Teléfono", wch: 14, ci_center: false }, // Tel
  { header: "Producto", wch: 28, ci_center: false }, // Nombre del producto
  { header: "Tamaño", wch: 8, ci_center: true }, // Talle: ch / md / gr
  { header: "Pago", wch: 6, ci_center: true }, // ✓ o vacío
  { header: "Estado", wch: 8, ci_center: true }, // Retirado / Separado / vacío
];

function buildPedidosSheet(pedidos, fechaStr, diaNom) {
  const aoa = [];
  const estilos = [];
  const merges = [];
  const rowHeights = [];
  const NC = COLS_PEDIDO.length;

  // Fila 0 — título
  const tituloRow = new Array(NC).fill("");
  tituloRow[0] = `Puerto Dulce — ${diaNom}  ·  ${fechaStr}`;
  aoa.push(tituloRow);
  estilos.push(COLS_PEDIDO.map(() => celStyle({
    sz: 13, bold: true, color: XL.TERRACOTA, fill: XL.TERRACOTA_BG, h: "center", border: false,
  })));
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: NC - 1 } });

  // Fila 1 — encabezados con bordes completos
  aoa.push(COLS_PEDIDO.map(c => c.header));
  estilos.push(COLS_PEDIDO.map((c) => ({
    font: { name: "Arial", sz: 9, bold: true, color: { rgb: XL.HEADER_TXT } },
    fill: { patternType: "solid", fgColor: { rgb: XL.HEADER_BG } },
    alignment: { horizontal: c.ci_center ? "center" : "left", vertical: "center" },
    border: {
      top: { style: "medium", color: { rgb: XL.HEADER_BG } },
      bottom: { style: "medium", color: { rgb: XL.TERRACOTA } },
      left: { style: "thin", color: { rgb: "FFD0C4BC" } },
      right: { style: "thin", color: { rgb: "FFD0C4BC" } },
    },
  })));

  const pedMat = pedidos.filter(p => !esCubaCliente(p.cliente))
    .sort((a, b) => (a.hora_entrega || "99:99").localeCompare(b.hora_entrega || "99:99"));
  const pedCuba = pedidos.filter(p => esCubaCliente(p.cliente))
    .sort((a, b) => (a.hora_entrega || "99:99").localeCompare(b.hora_entrega || "99:99"));

  const renderPedido = (p, colorCuba) => {
    const prods = p.productos && p.productos.length ? p.productos : [{}];
    const pagado = p.pagado ? "✓" : "";
    const nombre = p.cliente_input || p.cliente || "";
    const tel = p.tel || "";
    const hora = p.hora_entrega || "";
    const borderColor = colorCuba ? XL.CUBA_ORO : XL.GRAY_LINE;

    const estadoApp = p.estado || "pendiente";
    const checkVal = estadoApp === "listo" ? "✓" : (estadoApp === "prod" ? "●" : "");
    const checkColor = estadoApp === "listo" ? XL.VERDE : XL.CUBA_ORO;

    prods.forEach((r) => {
      const alt = aoa.length % 2 === 0;
      const rowBg = colorCuba ? XL.CUBA_BG : (alt ? XL.GRAY_ALT : XL.BLANCO);
      const cubaChk = r.pedido_cuba ? "●" : "";
      const nom = prodNombre(r);
      const tam = r.tamano || "";
      const cant = prodCant(r);

      const notaProd = (r.nota_prod || "").trim();
      const notaGeneral = (p.notas || "").trim();
      const notaInline = notaProd || notaGeneral;

      const prodBase = cant > 1 ? `${nom} x${cant}` : nom;
      const prodStr = notaInline ? `${prodBase}\n📝 ${notaInline}` : prodBase;

      const row = [
        checkVal,
        cubaChk,
        hora,
        nombre,
        tel,
        prodStr,
        tam,
        pagado,
        estadoApp === "entregado" ? "R" : "",
      ];
      aoa.push(row);

      const rowH = notaInline ? 32 : 18;

      const rowEstilos = COLS_PEDIDO.map((c, ci) => {
        const base = celStyle({
          sz: 9, fill: rowBg,
          h: c.ci_center ? "center" : "left",
          borderColor, fullBorder: true,
        });
        if (ci === 0 && checkVal) { base.font.color = { rgb: checkColor }; base.font.bold = true; base.font.sz = 10; }
        if (ci === 1 && cubaChk) { base.font.color = { rgb: XL.CUBA_ORO }; base.font.bold = true; }
        if (ci === 2) { base.font.bold = true; base.font.color = { rgb: colorCuba ? XL.CUBA_INK : XL.TERRACOTA }; }
        if (ci === 3) base.font.bold = true;
        if (ci === 7 && pagado) { base.font.color = { rgb: XL.VERDE }; base.font.bold = true; }
        if (ci === 8 && estadoApp === "entregado") { base.font.color = { rgb: XL.VERDE }; base.font.bold = true; }
        return base;
      });
      estilos.push(rowEstilos);
      rowHeights.push(rowH);
    });
  };

  pedMat.forEach(p => renderPedido(p, false));

  if (pedCuba.length) {
    const sepRow = new Array(NC).fill("");
    sepRow[0] = "🏪 Pedidos Cuba";
    aoa.push(sepRow);
    estilos.push(COLS_PEDIDO.map(() => celStyle({
      sz: 9, bold: true, color: XL.CUBA_INK, fill: XL.CUBA_BG, h: "left", border: false,
    })));
    merges.push({ s: { r: aoa.length - 1, c: 0 }, e: { r: aoa.length - 1, c: NC - 1 } });
    pedCuba.forEach(p => renderPedido(p, true));
  }

  const totalRow = new Array(NC).fill("");
  totalRow[3] = `Total: ${pedMat.length + pedCuba.length} pedidos` +
    (pedCuba.length ? ` (${pedMat.length} Matienzo + ${pedCuba.length} Cuba)` : "");
  aoa.push(totalRow);
  estilos.push(COLS_PEDIDO.map((_, ci) => celStyle({
    sz: 9, bold: ci === 3, fill: XL.BLANCO,
    color: ci === 3 ? XL.INK_MID : "FFC0C0C0", border: false,
  })));
  merges.push({ s: { r: aoa.length - 1, c: 3 }, e: { r: aoa.length - 1, c: 6 } });

  return { aoa, estilos, merges, cols: COLS_PEDIDO.map(c => ({ wch: c.wch })), rowHeights };
}

function buildProduccionSheet(pedidosTodos, fechaStr, diaNom) {
  const aoa = [];
  const estilos = [];

  aoa.push([`Producción — ${diaNom}  ${fechaStr}`, "", ""]);
  estilos.push([
    celStyle({ sz: 13, bold: true, color: XL.PROD_H, fill: XL.PROD_BG, h: "center", border: false }),
    celStyle({ fill: XL.PROD_BG, border: false }),
    celStyle({ fill: XL.PROD_BG, border: false }),
  ]);

  aoa.push(["Producto", "Talle", "Cantidad"]);
  estilos.push([
    celStyle({ sz: 9, bold: true, color: XL.HEADER_TXT, fill: XL.HEADER_BG, h: "left", border: false }),
    celStyle({ sz: 9, bold: true, color: XL.HEADER_TXT, fill: XL.HEADER_BG, h: "center", border: false }),
    celStyle({ sz: 9, bold: true, color: XL.HEADER_TXT, fill: XL.HEADER_BG, h: "center", border: false }),
  ]);

  const grupos = {};
  pedidosTodos.forEach(p => {
    (p.productos || []).forEach(r => {
      const nom = prodNombre(r); if (!nom) return;
      const tam = r.tamano || "";
      const key = nom + "|||" + tam;
      if (!grupos[key]) grupos[key] = { nom, tam, cant: 0 };
      grupos[key].cant += prodCant(r);
    });
  });

  const items = Object.values(grupos).sort((a, b) => {
    const nc = a.nom.localeCompare(b.nom, "es");
    return nc !== 0 ? nc : talleSortKey(a.tam) - talleSortKey(b.tam);
  });

  const porNombre = {};
  items.forEach(it => {
    if (!porNombre[it.nom]) porNombre[it.nom] = [];
    porNombre[it.nom].push(it);
  });

  let fila = 2;
  Object.entries(porNombre).forEach(([nom, talles]) => {
    talles.forEach((it, i) => {
      const alt = fila % 2 === 0;
      const rowBg = alt ? XL.GRAY_ALT : XL.BLANCO;
      const isLast = i === talles.length - 1;
      const borderColor = isLast ? "FFC0A08A" : XL.GRAY_LINE;

      aoa.push([i === 0 ? it.nom : "", it.tam, it.cant]);
      estilos.push([
        celStyle({ sz: 10, bold: i === 0, fill: rowBg, h: "left", borderColor }),
        celStyle({ sz: 10, color: XL.INK_MID, fill: rowBg, h: "center", borderColor }),
        celStyle({ sz: 11, bold: true, color: XL.TERRACOTA, fill: rowBg, h: "right", borderColor }),
      ]);
      fila++;
    });
  });

  const totalCant = items.reduce((s, it) => s + it.cant, 0);
  aoa.push(["TOTAL", "", totalCant]);
  estilos.push([
    celStyle({ sz: 10, bold: true, fill: XL.TERRACOTA_BG, h: "left", border: false }),
    celStyle({ fill: XL.TERRACOTA_BG, border: false }),
    celStyle({ sz: 11, bold: true, color: XL.TERRACOTA, fill: XL.TERRACOTA_BG, h: "right", border: false }),
  ]);

  return {
    aoa, estilos,
    cols: [{ wch: 28 }, { wch: 12 }, { wch: 10 }]
  };
}

// ── Aplicar estilos a hoja SheetJS ────────────────────────────────────────────
function applyStyles(ws, aoa, estilos, merges) {
  if (merges) ws["!merges"] = merges;
  aoa.forEach((row, ri) => {
    row.forEach((val, ci) => {
      const addr = XLSX.utils.encode_cell({ r: ri, c: ci });
      if (!ws[addr]) ws[addr] = { t: typeof val === "number" ? "n" : "s", v: val };
      if (estilos[ri]?.[ci]) ws[addr].s = estilos[ri][ci];
    });
  });
}

// ── Función principal exportar ────────────────────────────────────────────────
function exportarExcel(soloDia) {
  const wb = XLSX.utils.book_new();
  const diasKeys = soloDia
    ? [diaActual]
    : Object.keys(datos.dias).sort();

  let totalHojas = 0;

  diasKeys.forEach(key => {
    const dia = datos.dias[key];
    if (!dia) return;
    const pedidos = dia.pedidos || [];
    if (!pedidos.length) return;

    const { diaNom, str: fechaStr } = fechaLegible(key);
    const prefijo = diaNom.slice(0, 3);

    // Hoja de pedidos
    {
      const { aoa, estilos, merges, cols, rowHeights } = buildPedidosSheet(pedidos, fechaStr, diaNom);
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      ws["!cols"] = cols;
      ws["!rows"] = [{ hpx: 24 }, { hpx: 30 }, ...rowHeights.map(h => ({ hpx: h }))];
      ws["!merges"] = merges;
      ws["!pageSetup"] = { orientation: "landscape", paperSize: 9, fitToPage: true, fitToWidth: 1 };
      applyStyles(ws, aoa, estilos);
      XLSX.utils.book_append_sheet(wb, ws, `${prefijo}-Pedidos`);
      totalHojas++;
    }

    // Hoja Producción
    {
      const { aoa, estilos, merges, cols } = buildProduccionSheet(pedidos, fechaStr, diaNom);
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      ws["!cols"] = cols;
      ws["!rows"] = [{ hpx: 24 }, { hpx: 22 }, ...aoa.slice(2).map(() => ({ hpx: 20 }))];
      ws["!merges"] = merges || [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
      ws["!pageSetup"] = { orientation: "portrait", paperSize: 9, fitToPage: true, fitToWidth: 1 };
      applyStyles(ws, aoa, estilos);
      XLSX.utils.book_append_sheet(wb, ws, `${prefijo}-Produccion`);
      totalHojas++;
    }
  });

  if (!totalHojas) {
    alert("No hay pedidos para exportar en este día.");
    return;
  }

  const nombreArchivo = soloDia
    ? `PuertoDulce_${diaActual}.xlsx`
    : `PuertoDulce_Completo_${new Date().toISOString().slice(0, 10)}.xlsx`;

  XLSX.writeFile(wb, nombreArchivo);
}

function cerrarCSVModal() { document.getElementById("modal-csv").classList.add("hidden"); }

function exportarCSV(tipo) {
  const [y, m, d] = diaActual.split("-");
  if (tipo === "pedidos") {
    const cols = ["Hora entrega", "Estado", "Cliente", "Teléfono", "Productos", "Pagado", "Método", "Total ($)", "Notas"];
    const filas = getPedidos().map(p => [
      p.hora_entrega, p.estado, p.cliente, p.tel,
      (p.productos || []).map(r => [r.tipo === "catalogo" ? r.nombre : r.libre, r.tamano, "x" + (() => { const _n = Number(r.cantidad); return isNaN(_n) ? 1 : _n; })(), r.tacc === "s" ? "Sin TACC" : "Común"].filter(Boolean).join(" ")).join(" | "),
      p.pagado ? "Sí" : "No", p.metodoPago || "",
      calcularTotalPedido(p) || "",
      p.notas || ""
    ].map(v => `"${(v || "").toString().replace(/"/g, '""')}"`).join(","));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\uFEFF" + [cols.join(","), ...filas].join("\n")], { type: "text/csv;charset=utf-8" }));
    a.download = `pedidos_${diaActual}.csv`;
    a.click();
  } else {
    const grupos = {};
    getPedidos().forEach(p => {
      (p.productos || []).filter(r => r.tacc === "s").forEach(r => {
        const nom = r.tipo === "catalogo" ? r.nombre : r.libre;
        if (!nom) return;
        const tam = r.tamano || "(sin talle)";
        const key = (nom + " " + tam).toLowerCase();
        if (!grupos[key]) grupos[key] = { producto: nom, talle: tam, cantidad: 0 };
        const _n = Number(r.cantidad);
        grupos[key].cantidad += isNaN(_n) ? 1 : _n;
      });
    });
    const cols = ["Producto", "Talle", "Cantidad"];
    const filas = Object.values(grupos).sort((a, b) => a.producto.localeCompare(b.producto))
      .map(g => [g.producto, g.talle, g.cantidad].map(v => `"${(v || "").toString().replace(/"/g, '""')}"`).join(","));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\uFEFF" + [cols.join(","), ...filas].join("\n")], { type: "text/csv;charset=utf-8" }));
    a.download = `produccion_${diaActual}.csv`;
    a.click();
  }
}

// ── EXPORTAR CUBA — XLSX y CSV con formato estructurado por producto ──────────
function buildCubaExportData(diaKey) {
  const dData = datos.dias[diaKey];
  if (!dData) return null;

  const pedidos = dData.pedidos || [];
  const ventas = dData.ventas || [];

  const pedCuba = pedidos.filter(p => esCubaCliente(p.cliente));

  const pedMap = {};
  pedCuba.forEach(p => {
    (p.productos || []).forEach(r => {
      const nom = prodNombre(r); if (!nom) return;
      if (!pedMap[nom]) pedMap[nom] = { ch: 0, m: 0, g: 0, sinTalle: 0 };
      const cant = prodCant(r);
      const t = (r.tamano || "").toLowerCase();
      if (t === "chico" || t === "ch") pedMap[nom].ch += cant;
      else if (t === "mediano" || t === "med" || t === "m") pedMap[nom].m += cant;
      else if (t === "grande" || t === "gr" || t === "g") pedMap[nom].g += cant;
      else pedMap[nom].sinTalle += cant;
    });
  });

  const ventMap = {};
  ventas.forEach(v => {
    if (!v.nombre) return;
    const llevada = Number(v.llevada || v.cantidad || 0);
    if (!llevada) return;
    const nom = v.nombre;
    if (!ventMap[nom]) ventMap[nom] = { ch: 0, m: 0, g: 0, sinTalle: 0 };
    ventMap[nom].sinTalle += llevada;
  });

  return { pedMap, ventMap };
}

function buildCubaXlsx(diaKeys) {
  const wb = XLSX.utils.book_new();
  let hojas = 0;

  diaKeys.forEach(key => {
    const parsed = buildCubaExportData(key);
    if (!parsed) return;
    const { pedMap, ventMap } = parsed;
    if (!Object.keys(pedMap).length && !Object.keys(ventMap).length) return;

    const { diaNom, str: fechaStr } = fechaLegible(key);
    const NC = 5;
    const COLS = [
      { h: "Producto", wch: 28, center: false },
      { h: "Ch", wch: 6, center: true },
      { h: "M", wch: 6, center: true },
      { h: "G", wch: 6, center: true },
      { h: "Sin talle", wch: 10, center: true },
    ];

    const aoa = [], ests = [], mgs = [];

    aoa.push([`Cuba — ${diaNom} · ${fechaStr}`, "", "", "", ""]);
    ests.push(COLS.map(() => celStyle({ sz: 13, bold: true, color: XL.CUBA_INK, fill: XL.CUBA_BG, h: "center", border: false })));
    mgs.push({ s: { r: 0, c: 0 }, e: { r: 0, c: NC - 1 } });

    function addSection(label, map) {
      if (!Object.keys(map).length) return;
      aoa.push([label, "", "", "", ""]);
      ests.push(COLS.map(() => ({
        font: { name: "Arial", sz: 9, bold: true, color: { rgb: XL.HEADER_TXT } },
        fill: { patternType: "solid", fgColor: { rgb: XL.HEADER_BG } },
        alignment: { horizontal: "left", vertical: "center" },
        border: { top: { style: "thin", color: { rgb: XL.GRAY_LINE } }, bottom: { style: "thin", color: { rgb: XL.GRAY_LINE } }, left: { style: "thin", color: { rgb: XL.GRAY_LINE } }, right: { style: "thin", color: { rgb: XL.GRAY_LINE } } },
      })));
      mgs.push({ s: { r: aoa.length - 1, c: 0 }, e: { r: aoa.length - 1, c: NC - 1 } });

      aoa.push(COLS.map(c => c.h));
      ests.push(COLS.map((c, ci) => ({
        font: { name: "Arial", sz: 9, bold: true, color: { rgb: XL.HEADER_TXT } },
        fill: { patternType: "solid", fgColor: { rgb: XL.HEADER_BG } },
        alignment: { horizontal: c.center ? "center" : "left", vertical: "center" },
        border: { top: { style: "thin", color: { rgb: XL.CUBA_ORO } }, bottom: { style: "medium", color: { rgb: XL.CUBA_ORO } }, left: { style: "thin", color: { rgb: XL.GRAY_LINE } }, right: { style: "thin", color: { rgb: XL.GRAY_LINE } } },
      })));

      const items = Object.entries(map).sort((a, b) => a[0].localeCompare(b[0], "es"));
      items.forEach(([nom, v], i) => {
        const alt = i % 2 === 0;
        const bg = alt ? XL.CUBA_BG : XL.BLANCO;
        aoa.push([nom, v.ch || "", v.m || "", v.g || "", v.sinTalle || ""]);
        ests.push(COLS.map((c, ci) => {
          const s = celStyle({ sz: 9, fill: bg, h: c.center ? "center" : "left", borderColor: XL.CUBA_ORO, fullBorder: true });
          if (ci === 0) { s.font.bold = true; }
          if (ci > 0 && aoa[aoa.length - 1][ci]) { s.font.color = { rgb: XL.CUBA_INK }; s.font.bold = true; }
          return s;
        }));
      });

      const totRow = ["TOTAL",
        items.reduce((s, [, v]) => s + (v.ch || 0), 0) || "",
        items.reduce((s, [, v]) => s + (v.m || 0), 0) || "",
        items.reduce((s, [, v]) => s + (v.g || 0), 0) || "",
        items.reduce((s, [, v]) => s + (v.sinTalle || 0), 0) || "",
      ];
      aoa.push(totRow);
      ests.push(COLS.map(c => celStyle({ sz: 9, bold: true, fill: XL.TERRACOTA_BG, h: c.center ? "center" : "left", borderColor: XL.TERRACOTA, fullBorder: true, color: XL.TERRACOTA })));

      aoa.push(["", "", "", "", ""]);
      ests.push(COLS.map(() => celStyle({ border: false, fill: XL.BLANCO })));
    }

    addSection("PEDIDOS A CUBA", pedMap);
    addSection("VENTAS", ventMap);

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = COLS.map(c => ({ wch: c.wch }));
    ws["!rows"] = [{ hpx: 24 }, ...aoa.slice(1).map(() => ({ hpx: 20 }))];
    ws["!merges"] = mgs;
    ws["!pageSetup"] = { orientation: "portrait", paperSize: 9, fitToPage: true, fitToWidth: 1 };
    applyStyles(ws, aoa, ests);
    const prefijo = fechaLegible(key).diaNom.slice(0, 3);
    XLSX.utils.book_append_sheet(wb, ws, `${prefijo}-${key.slice(5)}`);
    hojas++;
  });

  return hojas > 0 ? wb : null;
}

function buildCubaCsvContent(diaKeys) {
  const rows = ["\uFEFF" + "Sección,Día,Producto,Ch,M,G,Sin talle"];
  diaKeys.forEach(key => {
    const parsed = buildCubaExportData(key);
    if (!parsed) return;
    const { pedMap, ventMap } = parsed;
    const { diaNom } = fechaLegible(key);
    const diaStr = `${diaNom} ${key.slice(8)}/${key.slice(5, 7)}`;

    const addMapCsv = (label, map) => {
      Object.entries(map).sort((a, b) => a[0].localeCompare(b[0], "es")).forEach(([nom, v]) => {
        rows.push([
          `"${label}"`,
          `"${diaStr}"`,
          `"${nom.replace(/"/g, '""')}"`,
          v.ch || 0, v.m || 0, v.g || 0, v.sinTalle || 0
        ].join(","));
      });
    };
    addMapCsv("PEDIDOS A CUBA", pedMap);
    addMapCsv("VENTAS", ventMap);
  });
  return rows.join("\n");
}

function exportarCubaConFormato(diaKeys, fmt) {
  if (!diaKeys.length) { alert("No hay días para exportar."); return; }

  if (fmt === "xlsx") {
    const wb = buildCubaXlsx(diaKeys);
    if (!wb) { alert("No hay datos para exportar."); return; }
    const nombre = diaKeys.length === 1 ? `cuba_${diaKeys[0]}.xlsx` : `cuba_todos_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, nombre);
  } else {
    const csv = buildCubaCsvContent(diaKeys);
    const a = document.createElement("a");
    const nombre = diaKeys.length === 1 ? `cuba_${diaKeys[0]}.csv` : `cuba_todos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = nombre;
    a.click();
  }
}

// FIX 11: exporta diaActual (el día seleccionado en la UI, no necesariamente hoy).
// Si el usuario está viendo un día distinto a hoy, se le avisa antes de exportar.
function exportarCubaHoy(fmt) {
  const hoy = fechaKey(new Date());
  if (diaActual !== hoy) {
    const [y, m, d] = diaActual.split("-").map(Number);
    const f = new Date(y, m - 1, d);
    const label = `${DIAS_FULL[f.getDay()]} ${d}/${m}/${y}`;
    if (!confirm(`Vas a exportar el día activo: ${label}\n¿Continuar?`)) return;
  }
  exportarCubaConFormato([diaActual], fmt);
}
function exportarCubaTodos(fmt) { const keys = Object.keys(datos.dias).sort(); exportarCubaConFormato(keys, fmt); }
function exportarCubaDiaSeleccionado(fmt) {
  const sel = document.getElementById("cuba-export-dia-sel");
  if (!sel || !sel.value) { alert("Seleccioná un día."); return; }
  exportarCubaConFormato([sel.value], fmt);
}

function renderCubaExportSelector() {
  const wrap = document.getElementById("cuba-export-dias-wrap");
  if (!wrap) return;
  const keys = Object.keys(datos.dias).sort().reverse();
  const hoy = fechaKey(new Date());
  const opts = keys.map(k => {
    const { diaNom, str } = fechaLegible(k);
    const label = k === hoy ? `HOY — ${diaNom} ${str}` : `${diaNom} ${str}`;
    return `<option value="${k}">${label}</option>`;
  }).join("");
  wrap.innerHTML = `
    <div class="cexp-dias-row">
      <select id="cuba-export-dia-sel" class="cexp-dias-select">${opts}</select>
      <button onclick="exportarCubaDiaSeleccionado('xlsx')" class="cexp-btn cexp-btn-outline">⬇ XLSX</button>
      <button onclick="exportarCubaDiaSeleccionado('csv')"  class="cexp-btn cexp-btn-outline">⬇ CSV</button>
    </div>
  `;
}

function exportarCuba(tipo, fmt) {
  const [y, m, d] = diaActual.split("-");
  const fechaStr = `${d}/${m}/${y}`;
  fmt = fmt || "txt";

  const pedCuba = getPedidos().filter(p => esCubaCliente(p.cliente));
  const encargos = getPedidos().filter(p => !esCubaCliente(p.cliente) && (p.productos || []).some(r => r.tacc !== "s"));
  const ventas = getVentas().filter(v => v.nombre);

  function agruparProductos(lista) {
    const map = {};
    lista.forEach(({ nom, tam, cant }) => {
      const key = (nom + (tam ? " " + tam : "")).trim().toLowerCase();
      const label = (nom + (tam ? " · " + tam : "")).trim();
      if (!map[key]) map[key] = { label, cant: 0 };
      map[key].cant += cant;
    });
    return Object.values(map).sort((a, b) => a.label.localeCompare(b.label));
  }

  function prodItems(p, soloComunes) {
    return (p.productos || [])
      .filter(r => soloComunes ? r.tacc !== "s" : true)
      .map(r => {
        const nom = r.tipo === "catalogo" ? r.nombre : r.libre;
        const _n = Number(r.cantidad);
        const cant = isNaN(_n) ? 1 : _n;
        return { nom, tam: r.tamano || "", cant };
      });
  }

  function buildTxt() {
    const lineas = [];
    if (tipo === "egreso" || tipo === "ambos") {
      lineas.push(`PEDIDO A CUBA — ${fechaStr}`, "═══════════════════════════", "");
      if (pedCuba.length) {
        lineas.push("PEDIDOS DE CUBA (cliente Cuba):");
        pedCuba.forEach(p => {
          const prods = prodItems(p, false).map(r => [r.nom, r.tam, "x" + r.cant].filter(Boolean).join(" ")).join(", ");
          lineas.push(`  ${p.hora_entrega || "--:--"} → ${prods}`);
        });
        lineas.push("");
      }
      if (encargos.length) {
        lineas.push("ENCARGOS (clientes normales con productos comunes):");
        encargos.forEach(p => {
          const prods = prodItems(p, true).map(r => [r.nom, r.tam, "x" + r.cant].filter(Boolean).join(" ")).join(", ");
          lineas.push(`  ${p.cliente_input || p.cliente || "?"} (${p.hora_entrega || "--:--"}): ${prods}`);
        });
        lineas.push("");
      }
      const todosItems = [...pedCuba, ...encargos].flatMap(p => prodItems(p, !esCubaCliente(p.cliente)));
      const agrupado = agruparProductos(todosItems);
      if (agrupado.length) {
        lineas.push("RESUMEN AGRUPADO:");
        agrupado.forEach(i => lineas.push(`  ${i.label}: ${i.cant}`));
        lineas.push("");
      }
    }
    if (tipo === "ambos") lineas.push("─────────────────────────────", "");
    if (tipo === "ambos" || tipo === "egreso") {
      const ventasConLlevada = ventas.filter(v => v.nombre && (v.llevada || v.cantidad));
      if (ventasConLlevada.length) {
        lineas.push("VENTAS MOSTRADOR:");
        ventasConLlevada.forEach(v => {
          const cant = v.llevada || v.cantidad || "?";
          lineas.push(`  ${v.nombre}: ${cant}`);
        });
        lineas.push("");
      }
    }
    return lineas.join("\n");
  }

  const datos_str = buildTxt();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([datos_str], { type: "text/plain;charset=utf-8" }));
  a.download = `cuba_${tipo}_${diaActual}.txt`;
  a.click();
}

// ── REMITO DE EGRESO — pedidos a Cuba + ventas sumados en una sola tabla ──────
function buildRemitoXlsx(diaKey) {
  const parsed = buildCubaExportData(diaKey);
  if (!parsed) return null;
  const { pedMap, ventMap } = parsed;

  const merged = {};
  const addMap = (map) => {
    Object.entries(map).forEach(([nom, v]) => {
      if (!merged[nom]) merged[nom] = { ch: 0, m: 0, g: 0, sinTalle: 0 };
      merged[nom].ch += v.ch || 0;
      merged[nom].m += v.m || 0;
      merged[nom].g += v.g || 0;
      merged[nom].sinTalle += v.sinTalle || 0;
    });
  };
  addMap(pedMap);
  addMap(ventMap);

  if (!Object.keys(merged).length) return null;

  const { diaNom, str: fechaStr } = fechaLegible(diaKey);
  const NC = 5;
  const COLS = [
    { h: "Producto", wch: 28, center: false },
    { h: "Ch", wch: 6, center: true },
    { h: "M", wch: 6, center: true },
    { h: "G", wch: 6, center: true },
    { h: "Sin talle", wch: 10, center: true },
  ];

  const aoa = [], ests = [], mgs = [];

  aoa.push([`Remito de egreso — ${diaNom} · ${fechaStr}`, "", "", "", ""]);
  ests.push(COLS.map(() => celStyle({ sz: 13, bold: true, color: XL.CUBA_INK, fill: XL.CUBA_BG, h: "center", border: false })));
  mgs.push({ s: { r: 0, c: 0 }, e: { r: 0, c: NC - 1 } });

  aoa.push(["Pedidos a Cuba + Ventas (llevado) · unificado", "", "", "", ""]);
  ests.push(COLS.map(() => celStyle({ sz: 8, bold: false, color: XL.INK_MID, fill: XL.CUBA_BG, h: "center", border: false })));
  mgs.push({ s: { r: 1, c: 0 }, e: { r: 1, c: NC - 1 } });

  aoa.push(COLS.map(c => c.h));
  ests.push(COLS.map(c => ({
    font: { name: "Arial", sz: 9, bold: true, color: { rgb: XL.HEADER_TXT } },
    fill: { patternType: "solid", fgColor: { rgb: XL.HEADER_BG } },
    alignment: { horizontal: c.center ? "center" : "left", vertical: "center" },
    border: { top: { style: "medium", color: { rgb: XL.CUBA_ORO } }, bottom: { style: "medium", color: { rgb: XL.CUBA_ORO } }, left: { style: "thin", color: { rgb: XL.GRAY_LINE } }, right: { style: "thin", color: { rgb: XL.GRAY_LINE } } },
  })));

  const items = Object.entries(merged).sort((a, b) => a[0].localeCompare(b[0], "es"));
  items.forEach(([nom, v], i) => {
    const bg = i % 2 === 0 ? XL.CUBA_BG : XL.BLANCO;
    aoa.push([nom, v.ch || "", v.m || "", v.g || "", v.sinTalle || ""]);
    ests.push(COLS.map((c, ci) => {
      const s = celStyle({ sz: 10, fill: bg, h: c.center ? "center" : "left", borderColor: XL.CUBA_ORO, fullBorder: true });
      if (ci === 0) { s.font.bold = true; }
      if (ci > 0 && aoa[aoa.length - 1][ci]) { s.font.color = { rgb: XL.CUBA_INK }; s.font.bold = true; s.font.sz = 11; }
      return s;
    }));
  });

  aoa.push(["TOTAL",
    items.reduce((s, [, v]) => s + (v.ch || 0), 0) || "",
    items.reduce((s, [, v]) => s + (v.m || 0), 0) || "",
    items.reduce((s, [, v]) => s + (v.g || 0), 0) || "",
    items.reduce((s, [, v]) => s + (v.sinTalle || 0), 0) || "",
  ]);
  ests.push(COLS.map(c => celStyle({ sz: 10, bold: true, fill: XL.TERRACOTA_BG, h: c.center ? "center" : "left", borderColor: XL.TERRACOTA, fullBorder: true, color: XL.TERRACOTA })));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = COLS.map(c => ({ wch: c.wch }));
  ws["!rows"] = [{ hpx: 26 }, { hpx: 16 }, ...aoa.slice(2).map(() => ({ hpx: 20 }))];
  ws["!merges"] = mgs;
  ws["!pageSetup"] = { orientation: "portrait", paperSize: 9, fitToPage: true, fitToWidth: 1 };
  applyStyles(ws, aoa, ests);
  XLSX.utils.book_append_sheet(wb, ws, "Remito egreso");
  return wb;
}

function exportarRemitoEgreso() {
  const hoy = fechaKey(new Date());
  if (diaActual !== hoy) {
    const [y, m, d] = diaActual.split("-").map(Number);
    const f = new Date(y, m - 1, d);
    const label = `${DIAS_FULL[f.getDay()]} ${d}/${m}/${y}`;
    if (!confirm(`Vas a exportar el remito del día activo: ${label}\n¿Continuar?`)) return;
  }
  const wb = buildRemitoXlsx(diaActual);
  if (!wb) { alert("No hay datos de pedidos a Cuba ni ventas para este día."); return; }
  XLSX.writeFile(wb, `remito_egreso_${diaActual}.xlsx`);
}

// ── CATÁLOGO ──
function exportarPlantillaXlsx() {
  const encabezado = [["nombre", "tipo", "tiene_talle", "precio_chico", "precio_mediano", "precio_grande", "precio_unico", "categoria"]];
  const ejemplos = [
    ["Marquisse", "sin_tacc", "SI", 3500, 5000, 7000, "", "tortas"],
    ["Lemon Pie", "sin_tacc", "SI", 3200, 4800, 6500, "", "tortas"],
    ["Mousse de maracuyá", "sin_tacc", "SI", 2800, 4200, 6000, "", "mousses"],
    ["Budín de pan", "sin_tacc", "NO", "", "", "", 1200, "cuadrados"],
    ["Medialuna", "con_tacc", "NO", "", "", "", 350, "otros"],
  ];
  const instrucciones = [
    [],
    ["--- INSTRUCCIONES ---"],
    ["tipo: sin_tacc o con_tacc"],
    ["tiene_talle: SI o NO"],
    ["Si tiene_talle=SI: completar precio_chico, precio_mediano, precio_grande"],
    ["Si tiene_talle=NO: completar solo precio_unico"],
    ["categoria: tortas | mousses | bandejas | cuadrados | congelados | otros"],
    ["No borrar la fila de encabezado"],
  ];
  const ws = XLSX.utils.aoa_to_sheet([...encabezado, ...ejemplos, ...instrucciones]);
  ws["!cols"] = [{ wch: 22 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 15 }, { wch: 14 }, { wch: 13 }, { wch: 12 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Catálogo");
  XLSX.writeFile(wb, "plantilla_catalogo_puerto_dulce.xlsx");
}

function importarCatalogoXlsx(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const wb = XLSX.read(e.target.result, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
      const nuevos = [];
      const errores = [];
      rows.forEach((row, i) => {
        const nombre = (row["nombre"] || "").toString().trim();
        const tipoRaw = (row["tipo"] || "").toString().trim().toLowerCase();
        const tieneTalleRaw = (row["tiene_talle"] || "").toString().trim().toUpperCase();
        if (!nombre) return;
        if (nombre.startsWith("---")) return;
        const tipo = normalizarTipo(tipoRaw);
        if (!["sin_tacc", "con_tacc"].includes(tipo)) {
          errores.push(`Fila ${i + 2}: tipo inválido "${tipoRaw}" (${nombre})`);
          return;
        }
        const tieneTalle = tieneTalleRaw === "SI";
        const precioChico = parseFloat(row["precio_chico"]) || 0;
        const precioMediano = parseFloat(row["precio_mediano"]) || 0;
        const precioGrande = parseFloat(row["precio_grande"]) || 0;
        const precioUnico = parseFloat(row["precio_unico"]) || 0;
        const CATS_VALIDAS = ["tortas", "mousses", "bandejas", "cuadrados", "congelados", "otros"];
        const categoriaRaw = (row["categoria"] || "").toString().trim().toLowerCase();
        const categoria = CATS_VALIDAS.includes(categoriaRaw) ? categoriaRaw : "otros";
        nuevos.push({
          nombre, tipo, tiene_talle: tieneTalle,
          precio: tieneTalle ? 0 : precioUnico,
          precio_chico: tieneTalle ? precioChico : 0,
          precio_mediano: tieneTalle ? precioMediano : 0,
          precio_grande: tieneTalle ? precioGrande : 0,
          categoria,
        });
      });
      if (!nuevos.length) {
        const detalle = errores.length ? ("\n\nFilas con error:\n" + errores.slice(0, 5).join("\n")) : "";
        alert("El archivo no tiene productos válidos." + detalle);
        return;
      }
      if (errores.length) {
        alert("⚠️ Se saltaron " + errores.length + " fila(s) con tipo inválido:\n" + errores.slice(0, 5).join("\n"));
      }
      if (!confirm("¿Reemplazar el catálogo con " + nuevos.length + " productos del archivo?")) return;
      datos.catalogo = nuevos;
      guardar();
      renderCatalogo();
      mostrarToastGuardado();
    } catch (err) {
      alert("Error al leer el archivo: " + err.message);
    }
    input.value = "";
  };
  reader.readAsArrayBuffer(file);
}

function exportarCatalogo() {
  if (!datos.catalogo.length) { alert("El catálogo está vacío."); return; }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(datos.catalogo, null, 2)], { type: "application/json;charset=utf-8" }));
  a.download = `catalogo_puerto_dulce.json`;
  a.click();
}

function importarCatalogo(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Formato inválido");
      const validos = imported.filter(c => c.nombre && c.tipo);
      if (!validos.length) { alert("No se encontraron productos válidos."); return; }
      abrirModalGen(`Importar ${validos.length} productos`, "Esto va a reemplazar el catálogo actual. ¿Continuás?", () => {
        const CATS = ["tortas", "mousses", "bandejas", "cuadrados", "congelados", "otros"];
        datos.catalogo = validos.map(c => ({
          nombre: c.nombre,
          tipo: normalizarTipo(c.tipo || "sin_tacc"),
          tiene_talle: c.tiene_talle !== false,
          precio: c.precio || 0,
          precio_chico: c.precio_chico || 0,
          precio_mediano: c.precio_mediano || 0,
          precio_grande: c.precio_grande || 0,
          categoria: (c.categoria && CATS.includes(c.categoria)) ? c.categoria : "otros",
        }));
        guardar();
        renderCatalogo();
        alert(`✅ ${validos.length} productos importados.`);
      }, "confirm");
    } catch (err) { alert("El archivo no es válido."); }
    input.value = "";
  };
  reader.readAsText(file);
}

// ── ARCHIVADOS ──
function restaurarArchivado(id) {
  const idx = datos.archivados.findIndex(a => a.id === id);
  if (idx < 0) return;
  const a = datos.archivados[idx];
  const diaDestino = a._fecha || fechaKey(new Date());
  if (!datos.dias[diaDestino]) datos.dias[diaDestino] = { pedidos: [], ventas: [] };
  const { _fecha, _nomDia, _archivadoTs, _autoArchivado, ...pedido } = a;
  datos.dias[diaDestino].pedidos.unshift(pedido);
  datos.archivados.splice(idx, 1);
  guardar();
  renderArchivadosGlobal();
  renderArchivadosGlobalContent();
  renderDiasNav();
  renderAll();
}

function eliminarArchivado(id) {
  abrirModalGen("¿Eliminar archivado?", "El pedido se eliminará definitivamente.", () => {
    datos.archivados = datos.archivados.filter(a => a.id !== id);
    guardar();
    renderArchivadosGlobal();
    renderArchivadosGlobalContent();
  }, "danger");
}

// ── BACKUP COMPLETO ──
function exportarTodoJSON() {
  const json = JSON.stringify(datos, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const fecha = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = "puerto_dulce_backup_" + fecha + ".json";
  a.click();
  URL.revokeObjectURL(url);
}

// ── Exportar historial de pedidos archivados como .xlsx ──
function exportarArchivadosXlsx() {
  if (!datos.archivados || !datos.archivados.length) {
    alert("No hay pedidos archivados para exportar.");
    return;
  }
  const porFecha = {};
  datos.archivados.forEach(a => {
    const key = a._fecha || "sin-fecha";
    if (!porFecha[key]) porFecha[key] = [];
    porFecha[key].push(a);
  });

  const wb = XLSX.utils.book_new();
  let totalHojas = 0;

  Object.keys(porFecha).sort().forEach(key => {
    const pedidos = porFecha[key];
    if (!pedidos.length) return;

    let diaNom = "Archivado", fechaStr = key;
    try {
      const f = fechaLegible(key);
      diaNom = f.diaNom;
      fechaStr = f.str;
    } catch (e) { }

    const prefijo = diaNom.slice(0, 3);
    const { aoa, estilos, merges, cols, rowHeights } = buildPedidosSheet(pedidos, fechaStr, diaNom);
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = cols;
    ws["!rows"] = [{ hpx: 24 }, { hpx: 30 }, ...rowHeights.map(h => ({ hpx: h }))];
    ws["!merges"] = merges;
    ws["!pageSetup"] = { orientation: "landscape", paperSize: 9, fitToPage: true, fitToWidth: 1 };
    applyStyles(ws, aoa, estilos);
    XLSX.utils.book_append_sheet(wb, ws, `${prefijo}-${key.slice(5) || key.slice(0, 5)}`);
    totalHojas++;
  });

  if (!totalHojas) { alert("No hay datos para exportar."); return; }
  XLSX.writeFile(wb, `historial_pedidos_${new Date().toISOString().slice(0, 10)}.xlsx`);
}