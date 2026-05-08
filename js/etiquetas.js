/**
 * ================================================================
 * ÍNDICE DE FUNCIONES (ETIQUETAS.JS)
 * ================================================================
 * 
 * === CONSTANTES Y HELPERS ===
 * - DIAS_FULL_ES, MESES_ES      → Arrays para nombres en español
 * - formatFechaEtiq(fechaKey)   → Convierte fechaKey a formato legible (ej: "Lunes 15 de enero")
 * 
 * === CONSTRUCCIÓN DE ETIQUETAS ===
 * - buildEtiquetas(pedidos, fechaKey) → Genera array de etiquetas a partir de pedidos
 *   - Separa productos CON talle (una etiqueta por unidad)
 *   - Agrupa productos SIN talle (máx 4 por etiqueta)
 * 
 * === SELECCIÓN Y FILTRO ===
 * - etiqSelAll(val)              → Selecciona/deselecciona todos los días
 * - etiqToggleDia(k)             → Alterna día en la selección
 * - etiqToggleCard(uid)          → Alterna etiqueta individual (incluir/excluir)
 * 
 * === RENDER ===
 * - renderEtiquetas()            → Renderiza checkboxes de días y preview de etiquetas
 * 
 * === IMPRESIÓN ===
 * - imprimirEtiquetas()          → Imprime solo las etiquetas seleccionadas
 * 
 * ================================================================
 */

// ── ETIQUETAS ──
const DIAS_FULL_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MESES_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

// Convierte fechaKey a formato legible (ej: "Lunes 15 de enero")
function formatFechaEtiq(fechaKey) {
  const [y, m, d] = fechaKey.split("-").map(Number);
  const f = new Date(y, m - 1, d);
  return `${DIAS_FULL_ES[f.getDay()]} ${d} de ${MESES_ES[m - 1]}`;
}

// Genera array de etiquetas a partir de pedidos
function buildEtiquetas(pedidos, fechaKey) {
  const etiquetas = [];
  pedidos.forEach(p => {
    if (!p.productos || !p.productos.length) return;
    const nombre = p.cliente_input || p.cliente || "Sin nombre";
    const hora = p.hora_entrega || "";
    const fecha = formatFechaEtiq(fechaKey);

    const conTalle = [];
    const sinTalle = [];

    p.productos.forEach(r => {
      const cat = datos.catalogo.find(c =>
        c.nombre === r.nombre && c.tipo === (r.tacc === "s" ? "sin_tacc" : "con_tacc")
      );
      const tieneTalle = r.tipo === "catalogo" ? (cat ? cat.tiene_talle : false) : false;
      const cant = Number(r.cantidad) || 1;
      const nomProd = r.tipo === "catalogo" ? r.nombre : (r.libre || r.nombre);
      const talle = r.tamano || "";
      const nota = r.nota_prod || "";

      if (tieneTalle) {
        for (let i = 0; i < cant; i++) {
          conTalle.push({ nombre, hora, fecha, producto: nomProd, talle, nota, conTalle: true });
        }
      } else {
        sinTalle.push({ nomProd, cant, nota });
      }
    });

    // Agregar etiquetas individuales de con-talle
    etiquetas.push(...conTalle);

    // Agregar etiqueta agrupada del resto (si hay) — máximo 4 productos por etiqueta
    if (sinTalle.length) {
      const lineas = sinTalle.map(r => `${r.cant > 1 ? r.cant + "× " : ""}${r.nomProd}${r.nota ? " (" + r.nota + ")" : ""}`);
      const CHUNK = 4;
      for (let i = 0; i < lineas.length; i += CHUNK) {
        const parte = lineas.slice(i, i + CHUNK);
        const totalPartes = Math.ceil(lineas.length / CHUNK);
        const sufijo = totalPartes > 1 ? ` (${Math.floor(i / CHUNK) + 1}/${totalPartes})` : "";
        etiquetas.push({
          nombre: nombre + sufijo,
          hora,
          fecha,
          producto: parte.join("\n"),
          talle: "",
          nota: "",
          conTalle: false,
          agrupada: true
        });
      }
    }
  });
  return etiquetas;
}

// ── ETIQUETAS: estado global de selección ──
let _etiqDiasActivos = new Set(); // días activos (checkboxes de días)
let _etiqExcluidas = new Set();   // IDs de etiquetas individuales excluidas

// Selecciona/deselecciona todos los días
function etiqSelAll(val) {
  const dias = Object.keys(datos.dias).filter(k => datos.dias[k].pedidos && datos.dias[k].pedidos.length).sort();
  if (val) {
    _etiqDiasActivos = new Set(dias);
  } else {
    _etiqDiasActivos = new Set();
  }
  _etiqExcluidas = new Set();
  renderEtiquetas();
}

// Alterna día en la selección
function etiqToggleDia(k) {
  if (_etiqDiasActivos.has(k)) {
    _etiqDiasActivos.delete(k);
  } else {
    _etiqDiasActivos.add(k);
  }
  _etiqExcluidas = new Set(); // resetear exclusiones al cambiar días
  renderEtiquetas();
}

// Alterna etiqueta individual (incluir/excluir)
function etiqToggleCard(uid) {
  if (_etiqExcluidas.has(uid)) {
    _etiqExcluidas.delete(uid);
  } else {
    _etiqExcluidas.add(uid);
  }
  renderEtiquetas();
}

// Renderiza checkboxes de días y preview de etiquetas
function renderEtiquetas() {
  const hoy = fechaKey(new Date());
  const dias = Object.keys(datos.dias).filter(k => datos.dias[k].pedidos && datos.dias[k].pedidos.length).sort();

  // Inicializar días activos si está vacío: default = hoy (o primer día)
  if (_etiqDiasActivos.size === 0 && dias.length) {
    _etiqDiasActivos = new Set(dias.includes(hoy) ? [hoy] : [dias[0]]);
  }
  // Limpiar días que ya no existen
  for (const k of _etiqDiasActivos) {
    if (!dias.includes(k)) _etiqDiasActivos.delete(k);
  }

  // Renderizar checkboxes de días
  const checksEl = document.getElementById("etiq-dias-checks");
  if (checksEl) {
    checksEl.innerHTML = dias.map(k => {
      const [y, m, d] = k.split("-").map(Number);
      const f = new Date(y, m - 1, d);
      const label = k === hoy ? `Hoy ${d}/${m}` : `${DIAS_S[f.getDay()]} ${d}/${m}`;
      const activo = _etiqDiasActivos.has(k);
      return `<button onclick="etiqToggleDia('${k}')" style="font-family:'Outfit',sans-serif;font-size:.75rem;font-weight:600;padding:5px 10px;border:2px solid ${activo ? "var(--accent)" : "var(--border)"};border-radius:var(--radius-sm);background:${activo ? "var(--accent-soft)" : "var(--paper)"};color:${activo ? "var(--accent)" : "var(--ink-mid)"};cursor:pointer;transition:all .15s;">${activo ? "✓ " : ""} ${label}</button>`;
    }).join("");
  }

  // Recolectar todas las etiquetas de los días activos
  let todasEtiquetas = [];
  for (const k of [..._etiqDiasActivos].sort()) {
    if (!datos.dias[k]) continue;
    const pedidos = datos.dias[k].pedidos || [];
    const etqs = buildEtiquetas(pedidos, k);
    etqs.forEach((e, i) => { e._uid = `${k}__${i}`; });
    todasEtiquetas = todasEtiquetas.concat(etqs);
  }

  const preview = document.getElementById("etiq-preview");
  const selectorWrap = document.getElementById("etiq-selector-wrap");

  if (!todasEtiquetas.length) {
    if (selectorWrap) selectorWrap.innerHTML = "";
    if (preview) preview.innerHTML = '<div class="etiq-vacio">Sin pedidos para los días seleccionados.</div>';
    return;
  }

  // Selector de etiquetas individuales
  const activas = todasEtiquetas.filter(e => !_etiqExcluidas.has(e._uid));
  const count = activas.length;
  if (selectorWrap) {
    selectorWrap.innerHTML = `
      <div style="font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-light);font-weight:600;margin-bottom:6px;">
        Etiquetas (${count} de ${todasEtiquetas.length} seleccionadas) — hacé click para quitar/agregar
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:5px;">
        ${todasEtiquetas.map(e => {
          const excl = _etiqExcluidas.has(e._uid);
          return `<button onclick="etiqToggleCard('${e._uid}')" title="${excl ? "Click para incluir" : "Click para excluir"}" style="font-family:'Outfit',sans-serif;font-size:.72rem;padding:4px 9px;border:1.5px solid ${excl ? "var(--border)" : "var(--accent)"};border-radius:20px;background:${excl ? "transparent" : "var(--accent-soft)"};color:${excl ? "var(--ink-light)" : "var(--accent)"};cursor:pointer;text-decoration:${excl ? "line-through" : "none"};opacity:${excl ? ".5" : "1"};transition:all .15s;">${esc(e.nombre)} · ${esc(e.producto.split("\n")[0])}</button>`;
        }).join("")}
      </div>`;
  }

  // Preview visual
  if (preview) {
    preview.innerHTML = `<div class="etiq-grid">${todasEtiquetas.map(e => {
      const excl = _etiqExcluidas.has(e._uid);
      return `<div class="etiq-card${e.conTalle ? " etiq-con-talle" : ""}" style="opacity:${excl ? ".35" : "1"};position:relative;cursor:pointer;" onclick="etiqToggleCard('${e._uid}')" title="${excl ? "Click para incluir" : "Click para excluir"}">
        ${excl ? `<div style="position:absolute;top:6px;right:8px;font-size:.65rem;color:var(--ink-light);">✕</div>` : ""}
        <div class="etiq-nombre">${esc(e.nombre)}</div>
        <div class="etiq-producto">${e.agrupada ? e.producto.split("\n").map(l => `<div>${esc(l)}</div>`).join("") : esc(e.producto)}</div>
        ${e.talle ? `<div class="etiq-talle">${esc(e.talle)}</div>` : ""}
        ${e.nota && !e.agrupada ? `<div class="etiq-nota">📝 ${esc(e.nota)}</div>` : ""}
        <div class="etiq-meta">${esc(e.fecha)}${e.hora ? " · " + esc(e.hora) : ""}</div>
      </div>`;
    }).join("")}</div>`;
  }
}

// Imprime solo las etiquetas seleccionadas
function imprimirEtiquetas() {
  let todasEtiquetas = [];
  for (const k of [..._etiqDiasActivos].sort()) {
    if (!datos.dias[k]) continue;
    const pedidos = datos.dias[k].pedidos || [];
    const etqs = buildEtiquetas(pedidos, k);
    etqs.forEach((e, i) => { e._uid = `${k}__${i}`; });
    todasEtiquetas = todasEtiquetas.concat(etqs);
  }
  const etiquetas = todasEtiquetas.filter(e => !_etiqExcluidas.has(e._uid));
  if (!etiquetas.length) {
    alert("No hay etiquetas seleccionadas para imprimir.");
    return;
  }

  let area = document.getElementById("etiq-print-area");
  if (area) area.remove();
  area = document.createElement("div");
  area.id = "etiq-print-area";
  area.style.display = "none";
  area.innerHTML = `<div class="etiq-print-grid">${etiquetas.map(e => {
    const lineas = e.agrupada ? e.producto.split("\n").length : 1;
    const pClass = lineas >= 4 ? "p4" : lineas === 3 ? "p3" : lineas === 2 ? "p2" : "p1";
    return `<div class="etiq-print-card${e.conTalle ? " etiq-con-talle" : ""}">
      <div class="etiq-print-nombre">${esc(e.nombre)}</div>
      <div class="etiq-print-producto ${pClass}">${e.agrupada ? e.producto.split("\n").map(l => `<div>${esc(l)}</div>`).join("") : esc(e.producto)}</div>
      ${e.talle ? `<div class="etiq-print-talle">${esc(e.talle)}</div>` : ""}
      ${e.nota && !e.agrupada ? `<div class="etiq-print-nota">📝 ${esc(e.nota)}</div>` : ""}
      <div class="etiq-print-meta">${esc(e.fecha)}${e.hora ? " · " + esc(e.hora) : ""}</div>
    </div>`;
  }).join("")}</div>`;
  document.body.appendChild(area);
  window.print();
}