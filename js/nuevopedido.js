/**
 * ================================================================
 * ÍNDICE DE FUNCIONES (MODAL NUEVO PEDIDO + EDICIÓN + SELECTOR)
 * ================================================================
 * 
 * === NORMALIZACIÓN TELEFÓNICA ===
 * - npNormalizarTel(raw)         → Normaliza número telefónico argentino
 * - npOnTelInput()               → Valida teléfono en tiempo real y muestra hint
 * 
 * === DÍAS Y HORARIOS ===
 * - npDiaKeyDesde(cual)          → Retorna fechaKey para 'hoy' o 'mañana'
 * - npLabels()                   → Actualiza etiquetas de días en modal
 * - npAbrirCustomDia()           → Muestra input date para seleccionar día personalizado
 * - npAbrirOtroDia()             → Abre panel para seleccionar otro día
 * - npOtroSelOpc(cual)           → Selecciona 'hoy' o 'mañana' desde panel otro día
 * - npSelDia(cual, el)           → Cambia día seleccionado (hoy/mañana/otro)
 * - npOnCustomDia()              → Procesa fecha seleccionada en input custom
 * - npActualizarHorario()        → Actualiza campos según día y si es Cuba
 * 
 * === TIME PICKER (selector de hora) ===
 * - getHorariosParaDia(fechaStr) → Retorna horario del local para una fecha
 * - getHorarioActual()           → Retorna horario según _npDiaKey
 * - buildHorarioSlots(horario)   → Genera slots de 15 min dentro del horario
 * - npBuildDropdown()            → Construye dropdown de horarios
 * - npOpenDropdown()             → Abre dropdown de horarios
 * - npCloseDropdown()            → Cierra dropdown de horarios
 * - npOpenTimePicker()           → Abre selector de hora (dropdown o nativo mobile)
 * - npOnMobileTimeInput(val)     → Procesa input desde selector nativo mobile
 * - npClearTime()                → Limpia hora seleccionada
 * - npTimeSync()                 → Sincroniza UI y campo oculto con hora seleccionada
 * - npCheckFueraHorario()        → Muestra warning si hora está fuera del horario del local
 * - npUpdateClockIcon(h, m)      → Actualiza icono de reloj analógico
 * - npClockInit()                → Inicializa reloj (limpieza)
 * - npClockClear()               → Alias de npClearTime
 * - npClockSetHour(h)            → Setea hora manualmente
 * - npClockSetMin(m)             → Setea minuto manualmente
 * - npClockSyncHidden()          → Alias de npTimeSync
 * - npClockUpdateDisplay()       → Alias de npTimeSync
 * 
 *
 * === WHEEL PICKER (selector ruleta, legacy) ===
 * - wheelOpen(initH, initM)      → Abre selector tipo ruleta
 * - wheelConfirm()               → Confirma selección del wheel
 * - wheelCancel()                → Cancela wheel
 * - wheelBuild(colId, items, selected, onChange) → Construye columna del wheel
 * 
 * === SELECCIÓN DE TURNO (Cuba especial) ===
 * - npSelTurno(n)                → Selecciona turno 1 o 2 para Cuba
 * - npOnHoraInput()              → Desactiva turnos al editar hora manualmente
 * 
 * === CLIENTE / CUBA ===
 * - npToggleCuba()               → Activa/desactiva modo Cuba en nuevo pedido
 * - npActualizarBotonesCuba(isCuba) → Actualiza UI según modo Cuba
 * - npOnNombreInput()            → Autocompleta clientes al escribir nombre
 * - npSelAutocompById(clienteId) → Selecciona cliente por ID desde autocompletado
 * - npSelAutocomp(nombre, tel)   → Completa campos con cliente seleccionado
 * - npOcultarAutocomp()          → Oculta sugerencias de autocompletado
 * 
 * === PRODUCTOS DEL PEDIDO ===
 * - npRenderProds()              → Renderiza lista de productos en nuevo pedido
 * - npAgregarProducto()          → Abre selector para agregar producto
 * - npCambiarProd(rId)           → Cambia producto existente
 * - npEliminarProd(rId)          → Elimina producto del pedido
 * - npToggleProdListo(rId)       → Marca/desmarca producto como listo
 * - npAjustarCant(rId, delta)    → Ajusta cantidad de producto (+/-)
 * - npSetTamano(rId, tam)        → Cambia talle (Chico/Mediano/Grande)
 * - npSetTamanoLibre(rId, val)   → Cambia talle libre (texto)
 * - npToggleNotaProd(rId)        → Muestra/oculta textarea de nota por producto
 * - npSetNotaProd(rId, val)      → Guarda nota del producto
 * - npSetPrecioLibre(rId, val)   → Setea precio para producto libre
 * - npAgregarExtra(rId)          → Agrega extra a producto
 * - npEliminarExtra(rId, ei)     → Elimina extra de producto
 * - npSetExtraDesc(rId, ei, val) → Setea descripción de extra
 * - npSetExtraPrecio(rId, ei, val) → Setea precio de extra
 * - calcTotalPedido(pedido)      → Calcula total del pedido
 * - npRenderTotal()              → Muestra total y efectivo sugerido
 * 
 * === ESTADO / PAGO / NOTA ===
 * - npSelEstado(estado, el)      → Selecciona estado del pedido
 * - npTogglePago()               → Abre modal para confirmar pago
 * - npToggleNota()               → Muestra/oculta campo de nota general
 * 
 * === ABRIR / CERRAR MODAL NUEVO PEDIDO ===
 * - abrirModalNP()               → Abre modal de nuevo pedido
 * - cerrarModalNP()              → Cierra modal de nuevo pedido
 * - confirmarNP()                → Guarda el nuevo pedido
 * - agregarPedido()              → Alias de abrirModalNP
 * 
 * === SELECTOR DE PRODUCTOS (catálogo / libre) ===
 * - cerrarSelector()             → Cierra selector
 * - selLibreTipo(tipo)           → Selecciona tipo libre (s/c)
 * - confirmarLibre()             → Confirma producto libre
 * - CAT_ORDEN / CAT_LABELS       → Constantes de orden y etiquetas de categorías
 * - renderSelectorLista()        → Renderiza lista de productos del catálogo
 * - seleccionarProducto(cat, tipo, tacc) → Agrega/cambia producto en pedido
 * 
 * === MODAL DE PAGO ===
 * - abrirModalPago(id, deshacer) → Abre modal para confirmar/deshacer pago
 * - cerrarModalPago()            → Cierra modal de pago
 * - selMetodo(m, el)             → Selecciona método de pago
 * - confirmarPago()              → Aplica pago al pedido (nuevo, edición o real)
 * 
 * === MODAL GENÉRICO ===
 * - abrirModalGen(titulo, desc, cb, tipo) → Abre modal de confirmación
 * - cerrarModalGen()             → Cierra modal genérico
 * 
 * === MODAL DE EDICIÓN DE PEDIDO ===
 * - abrirModalVista(pedidoId)    → Abre modal en modo vista
 * - abrirModalEdicion(pedidoId)  → Abre modal en modo edición
 * - activarModoEdicion()         → Cambia de vista a edición
 * - volverModoVista()            → Vuelve a vista descartando cambios
 * - cerrarModalEdicion()         → Cierra modal de edición
 * - toggleCubaPedido(pedidoId, prodId) → Marca producto para llevar a Cuba
 * - edRenderBody()               → Renderiza cuerpo según modo (vista/edición)
 * - edRenderVista()              → Renderiza modo vista
 * - vistaToggleCuba(prodId)      → Toggle Cuba desde vista
 * - edRenderEdicion()            → Renderiza modo edición
 * - edBuildProdRow(r, i)         → Construye fila de producto en edición
 * - edSelEstado(estado, el)      → Cambia estado en edición
 * - edTogglePago()               → Toggle pago en edición
 * - edToggleNota()               → Muestra/oculta nota en edición
 * - edSelTurno(n, hora)          → Selecciona turno en edición
 * - edToggleProdListo(rId)       → Toggle listo en edición
 * - edAjustarCant(rId, delta)    → Ajusta cantidad en edición
 * - edSetTamano(rId, tam)        → Cambia talle en edición
 * - edSetTamanoLibre(rId, val)   → Talle libre en edición
 * - edToggleNotaProd(rId)        → Toggle nota de producto en edición
 * - edSetNotaProd(rId, val)      → Setea nota de producto en edición
 * - edEliminarProd(rId)          → Elimina producto en edición
 * - edCambiarProd(rId)           → Cambia producto en edición
 * - edAgregarProducto()          → Agrega producto en edición
 * - edRenderProds()              → Renderiza productos en edición
 * - buildMoverOptsEd(pedidoId)   → Construye opciones para mover pedido
 * - moverPedidoDesdeEdicion(pedidoId, diaDestino) → Mueve pedido y cierra modal
 * - confirmarEliminarDesdeEdicion() → Elimina pedido desde edición
 * - guardarEdicion()             → Guarda cambios del pedido editado
 * 
 * ================================================================
 */


// ── MODAL NUEVO PEDIDO ──

let _npDia    = 'hoy';
let _npDiaKey = null;
let _npPedido = null;
let _npPagado = false;
let _npMetodoPago = '';
let _npEstado = 'pendiente';
let _npEsEdicion        = false;
let _npPedidoIdOriginal = null;
let _npSeleccionandoAutocomp = false;
let _npSearchClicking = false; // protege blur del buscador de productos

// Etiquetas para el pill de estado
const NP_ESTADO_LABELS = {
  pendiente: '⏳ Pendiente',
  prod:      '🔧 En producción',
  listo:     '✅ Listo',
  entregado: '📦 Retirado',
};


// ══════════════════════════════════════════════════
//  TELÉFONO
// ══════════════════════════════════════════════════

function npNormalizarTel(raw) {
  if (!raw || !raw.trim()) return { valido: false, hint: '', tipo: null, normalizado: '' };
  const digits = raw.replace(/\D/g, '');
  if (!digits) return { valido: false, hint: 'No tiene dígitos', tipo: null, normalizado: '' };
  let local = digits;
  if (local.startsWith('549'))      local = local.slice(3);
  else if (local.startsWith('54'))  local = local.slice(2);
  else if (local.startsWith('0'))   local = local.slice(1);
  if (local.length < 6)  return { valido: false, hint: 'Faltan dígitos (mínimo 6)', tipo: null, normalizado: '' };
  if (local.length > 11) return { valido: false, hint: 'Formato no reconocido (demasiados dígitos)', tipo: null, normalizado: '' };
  let tipo, normalizado;
  if (local.length <= 10) {
    tipo = local.length === 10 ? 'linea_o_celular' : 'linea';
    normalizado = '+54' + local;
  } else {
    const area2 = local.slice(0, 2);
    normalizado = local.slice(2, 4) === '15'
      ? '+549' + area2 + local.slice(4)
      : '+549' + local;
    tipo = 'celular';
  }
  return { valido: true, hint: normalizado, tipo, normalizado };
}

function npOnTelInput() {
  const raw  = document.getElementById('np-tel').value;
  const hint = document.getElementById('np-tel-hint');
  if (!raw.trim()) { hint.textContent = ''; hint.className = 'np-hint'; return; }
  const r = npNormalizarTel(raw);
  if (r.valido) {
    const ico = r.tipo === 'celular' ? '📱' : (r.tipo === 'linea_o_celular' ? '📞' : '☎️');
    hint.textContent = ico + ' ' + r.normalizado;
    hint.className = 'np-hint ok';
  } else {
    hint.textContent = r.hint;
    hint.className = 'np-hint err';
  }
}


// ══════════════════════════════════════════════════
//  DÍAS
// ══════════════════════════════════════════════════

function npDiaKeyDesde(cual) {
  const hoy = new Date();
  if (cual === 'hoy') return fechaKey(hoy);
  if (cual === 'manana') {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() + 1);
    return fechaKey(d);
  }
  return null;
}

function npLabels() {
  const hoy = new Date();
  const man = new Date(hoy);
  man.setDate(hoy.getDate() + 1);
  const DIAS_CORTO = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  document.getElementById('np-lbl-hoy').textContent = DIAS_CORTO[hoy.getDay()] + ' ' + hoy.getDate();
  document.getElementById('np-lbl-man').textContent = DIAS_CORTO[man.getDay()] + ' ' + man.getDate();
}

function npSelDia(cual, el, keyOverride) {
  _npDia    = cual;
  _npDiaKey = keyOverride || npDiaKeyDesde(cual);
  document.querySelectorAll('.modal-np-dia-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  npActualizarHorario();
  npActualizarBtnGuardar();
}

function npAbrirCustomDia() {
  const inp = document.getElementById('np-dia-custom');
  if (!inp) return;
  inp.style.cssText = 'position:static;width:100%;height:36px;opacity:1;pointer-events:auto;' +
    'font-family:Outfit,sans-serif;font-size:.85rem;border:1.5px solid var(--accent);' +
    'border-radius:var(--radius-sm);padding:4px 8px;background:var(--paper);color:var(--ink);' +
    'margin-top:6px;display:block;';
  inp.focus();
  function hide() {
    inp.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none;';
    inp.removeEventListener('change', hide);
    inp.removeEventListener('blur', hide);
  }
  inp.addEventListener('change', hide);
  inp.addEventListener('blur', hide);
}

function npOnCustomDia() {
  const val = document.getElementById('np-dia-custom').value;
  if (!val) return;
  _npDia    = 'otro';
  _npDiaKey = val;
  const [y, m, d] = val.split('-').map(Number);
  const f = new Date(y, m - 1, d);
  const DIAS_CORTO = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const label = DIAS_CORTO[f.getDay()] + ' ' + d + '/' + m;
  const lblOtro = document.getElementById('np-lbl-otro');
  if (lblOtro) lblOtro.textContent = label;
  document.querySelectorAll('.modal-np-dia-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('np-dia-otro').classList.add('active');
  npActualizarHorario();
  npActualizarBtnGuardar();
}

function npActualizarHorario() {
  const nomEl      = document.getElementById('np-nombre');
  const campHora   = document.getElementById('np-campo-hora');
  const clockWrap  = document.getElementById('np-clock-wrap');
  const turnosWrap = document.getElementById('np-turnos-wrap');
  if (!campHora || !turnosWrap) return;

  const val    = (nomEl ? nomEl.value || '' : '').trim();
  const isCuba = val.toLowerCase().includes('cuba');

  if (!_npDiaKey) {
    campHora.style.display  = isCuba ? 'none' : '';
    if (clockWrap) clockWrap.style.display = '';
    turnosWrap.style.display = 'none';
    return;
  }

  const dd       = datos.dias[_npDiaKey];
  const esEspecial = dd && dd.especial;

  if (isCuba) {
    if (esEspecial) {
      campHora.style.display = '';
      const lbl = document.getElementById('np-hora-label');
      if (lbl) lbl.textContent = 'Turno de envío';
      if (clockWrap) clockWrap.style.display = 'none';
      turnosWrap.style.display = '';
      const corte = dd.corteHora || '15:00';
      const t1 = document.getElementById('np-t1');
      if (t1) t1.textContent = '🟠 Turno 1 — ' + corte;
      const t2 = document.getElementById('np-t2');
      if (t2) t2.textContent = '🔵 Turno 2 — 18:00';
    } else {
      campHora.style.display = 'none';
    }
  } else {
    campHora.style.display = '';
    const lbl = document.getElementById('np-hora-label');
    if (lbl) lbl.textContent = 'Horario';
    if (clockWrap) clockWrap.style.display = '';
    turnosWrap.style.display = 'none';
    npTimeSync();
  }
}


// ══════════════════════════════════════════════════
//  TIME PICKER
// ══════════════════════════════════════════════════

let _npTimeH  = null;
let _npTimeM  = null;
let _npIsMobile = false;

function npDetectMobile() {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}

function getHorariosParaDia(fechaStr) {
  const localId  = datos.localId || 'matienzo';
  const horarios = datos.horariosLocales || HORARIOS_DEFAULT;
  const horLocal = horarios[localId] || horarios['matienzo'];
  let diaSemana;
  if (fechaStr) {
    const [y, mo, d] = fechaStr.split('-').map(Number);
    diaSemana = new Date(y, mo - 1, d).getDay();
  } else {
    diaSemana = new Date().getDay();
  }
  return horLocal[diaSemana] || null;
}

function getHorarioActual() {
  const fechaStr = (_npDiaKey) ? _npDiaKey : new Date().toISOString().slice(0, 10);
  return getHorariosParaDia(fechaStr);
}

function buildHorarioSlots(horario) {
  const slots = [];
  if (!horario) return slots;
  const [oh, om] = horario.open.split(':').map(Number);
  const [ch, cm] = horario.close.split(':').map(Number);
  const openMin  = oh * 60 + om;
  const closeMin = ch * 60 + cm;
  for (let h = 0; h <= 23; h++) {
    for (let m of [0, 15, 30, 45]) {
      const t = h * 60 + m;
      if (t >= openMin && t <= closeMin)
        slots.push({ h, m, label: String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') });
    }
  }
  return slots;
}

function npBuildDropdown() {
  const list = document.getElementById('np-tp-list');
  if (!list) return;
  list.innerHTML = '';
  const horario = getHorarioActual();
  if (!horario) {
    const div = document.createElement('div');
    div.className = 'tp-dropdown-item tp-closed-msg';
    div.textContent = '🔒 Local cerrado este día';
    div.style.cssText = 'color:var(--ink-light);font-style:italic;cursor:default;text-align:center;padding:12px;';
    list.appendChild(div);
    return;
  }
  buildHorarioSlots(horario).forEach(({ h, m, label }) => {
    const div = document.createElement('div');
    div.className = 'tp-dropdown-item';
    div.textContent = label;
    div.dataset.h = h;
    div.dataset.m = m;
    div.addEventListener('mousedown', e => {
      e.preventDefault();
      _npTimeH = h; _npTimeM = m;
      npTimeSync();
      npCloseDropdown();
    });
    list.appendChild(div);
  });
}

function npOpenDropdown() {
  npBuildDropdown();
  const pop = document.getElementById('np-tp-selects');
  const btn = document.getElementById('np-tp-btn');
  if (!pop) return;
  pop.classList.remove('hidden');
  if (btn) btn.classList.add('open');
  const list = document.getElementById('np-tp-list');
  let scrollTarget = null;
  list.querySelectorAll('.tp-dropdown-item').forEach(el => {
    const match = parseInt(el.dataset.h) === _npTimeH && parseInt(el.dataset.m) === _npTimeM;
    el.classList.toggle('selected', match);
    if (match) scrollTarget = el;
  });
  if (scrollTarget) setTimeout(() => scrollTarget.scrollIntoView({ block: 'nearest' }), 0);
  setTimeout(() => {
    function onOutside(e) {
      const pop2 = document.getElementById('np-tp-selects');
      const btn2 = document.getElementById('np-tp-btn');
      if (pop2 && btn2 && !pop2.contains(e.target) && !btn2.contains(e.target)) {
        npCloseDropdown();
        document.removeEventListener('mousedown', onOutside, true);
      }
    }
    document.addEventListener('mousedown', onOutside, true);
  }, 0);
}

function npCloseDropdown() {
  const pop = document.getElementById('np-tp-selects');
  const btn = document.getElementById('np-tp-btn');
  if (pop) pop.classList.add('hidden');
  if (btn) btn.classList.remove('open');
}

function npOpenTimePicker() {
  const pop = document.getElementById('np-tp-selects');
  if (pop && !pop.classList.contains('hidden')) { npCloseDropdown(); return; }
  npOpenDropdown();
}

function npOnMobileTimeInput(val) {
  if (!val) { _npTimeH = null; _npTimeM = null; }
  else {
    const [h, m] = val.split(':').map(Number);
    _npTimeH = h;
    const quarters = [0, 15, 30, 45];
    _npTimeM = quarters.reduce((prev, cur) => Math.abs(cur - m) < Math.abs(prev - m) ? cur : prev);
  }
  const inp = document.getElementById('np-hora-mobile');
  if (inp) inp.style.display = 'none';
  npTimeSync();
}

function npClearTime() {
  _npTimeH = null; _npTimeM = null;
  const inp = document.getElementById('np-hora-mobile');
  if (inp) { inp.value = ''; inp.style.display = 'none'; }
  npCloseDropdown();
  npTimeSync();
}

function npTimeSync() {
  const hidden = document.getElementById('np-hora');
  if (hidden) {
    hidden.value = (_npTimeH !== null && _npTimeM !== null)
      ? String(_npTimeH).padStart(2,'0') + ':' + String(_npTimeM).padStart(2,'0')
      : '';
  }
  const btn   = document.getElementById('np-tp-btn');
  const valEl = document.getElementById('np-tp-value');
  if (!btn || !valEl) return;
  if (_npTimeH !== null && _npTimeM !== null) {
    const label = String(_npTimeH).padStart(2,'0') + ':' + String(_npTimeM).padStart(2,'0');
    valEl.textContent = label;
    btn.classList.add('has-value');
    npUpdateClockIcon(_npTimeH, _npTimeM);
  } else {
    valEl.textContent = 'Elegir horario';
    btn.classList.remove('has-value');
    npUpdateClockIcon(null, null);
  }
  npCheckFueraHorario();
}

function npCheckFueraHorario() {
  let warn = document.getElementById('np-hora-warn');
  if (!warn) {
    const campo = document.getElementById('np-campo-hora');
    if (!campo) return;
    warn = document.createElement('div');
    warn.id = 'np-hora-warn';
    warn.style.cssText = 'font-size:.68rem;color:var(--amber);margin-top:4px;display:none;';
    campo.appendChild(warn);
  }
  if (_npTimeH === null) { warn.style.display = 'none'; return; }
  const horario = getHorarioActual();
  if (!horario) {
    warn.textContent = '🌙 El local está cerrado este día — el pedido se guardará igual.';
    warn.style.display = '';
    return;
  }
  const slots = buildHorarioSlots(horario);
  const fuera = !slots.some(s => s.h === _npTimeH && s.m === _npTimeM);
  if (fuera) {
    warn.textContent = `🌙 Fuera del horario habitual (${horario.open}–${horario.close}) — se guardará igual.`;
    warn.style.display = '';
  } else {
    warn.style.display = 'none';
  }
}

function npUpdateClockIcon(h, m) {
  const handH = document.getElementById('np-tp-hand-h');
  const handM = document.getElementById('np-tp-hand-m');
  if (!handH || !handM) return;
  if (h === null) {
    handH.style.transform = 'rotate(-60deg)';
    handM.style.transform = 'rotate(60deg)';
    return;
  }
  const hDeg = ((h % 12) / 12 * 360) + ((m || 0) / 60 * 30) - 90;
  const mDeg = ((m || 0) / 60 * 360) - 90;
  handH.style.transform = `rotate(${hDeg}deg)`;
  handM.style.transform = `rotate(${mDeg}deg)`;
}

function npClockInit() {
  _npTimeH = null; _npTimeM = null;
  const inp = document.getElementById('np-hora-mobile');
  if (inp) { inp.value = ''; inp.style.display = 'none'; }
  npCloseDropdown();
  npTimeSync();
}

// aliases legacy
function npClockClear()         { npClearTime(); }
function npClockSetHour(h)      { _npTimeH = h; npTimeSync(); }
function npClockSetMin(m)       { _npTimeM = m; npTimeSync(); }
function npClockSyncHidden()    { npTimeSync(); }
function npClockUpdateDisplay() { npTimeSync(); }


// ══════════════════════════════════════════════════
//  TURNOS CUBA
// ══════════════════════════════════════════════════

function npSelTurno(n) {
  const dd    = datos.dias[_npDiaKey] || {};
  const corte = dd.corteHora || '15:00';
  document.getElementById('np-t1').classList.toggle('active', n === 1);
  document.getElementById('np-t2').classList.toggle('active', n === 2);
  document.getElementById('np-hora').value = n === 1 ? corte : '18:00';
}


// ══════════════════════════════════════════════════
//  TOGGLE CLIENTE / CUBA
// ══════════════════════════════════════════════════

function npUiModoCliente() {
  const nomInp = document.getElementById('np-nombre');
  if ((nomInp.value || '').toLowerCase().includes('cuba')) {
    nomInp.value = '';
    npActualizarBotonesCuba(false);
    npActualizarHorario();
  }
  document.getElementById('np-btn-cliente-ui').classList.add('active-cliente');
  document.getElementById('np-btn-cuba').classList.remove('active-cuba');
}

function npToggleCuba() {
  const nomInp    = document.getElementById('np-nombre');
  const isCubaAhora = (nomInp.value || '').toLowerCase().includes('cuba');
  if (isCubaAhora) {
    nomInp.value = '';
    npActualizarBotonesCuba(false);
    npActualizarHorario();
    document.getElementById('np-btn-cliente-ui').classList.add('active-cliente');
    document.getElementById('np-btn-cuba').classList.remove('active-cuba');
  } else {
    nomInp.value = 'Cuba';
    npActualizarBotonesCuba(true);
    npActualizarHorario();
    document.getElementById('np-autocomp').style.display = 'none';
    document.getElementById('np-btn-cliente-ui').classList.remove('active-cliente');
    document.getElementById('np-btn-cuba').classList.add('active-cuba');
  }
}

function npActualizarBotonesCuba(isCuba) {
  document.getElementById('np-cuba-badge').style.display = isCuba ? '' : 'none';
  const filaNombre = document.getElementById('np-fila-nombre');
  if (filaNombre) filaNombre.style.display = isCuba ? 'none' : '';
  document.getElementById('np-campo-tel').style.display = isCuba ? 'none' : '';
  const optPago = document.getElementById('np-opt-pago');
  if (optPago) optPago.style.display = isCuba ? 'none' : '';
}


// ══════════════════════════════════════════════════
//  AUTOCOMPLETADO CLIENTE
// ══════════════════════════════════════════════════

function npOnNombreInput() {
  const val    = (document.getElementById('np-nombre').value || '').trim();
  const isCuba = val.toLowerCase().includes('cuba');
  npActualizarBotonesCuba(isCuba);
  // sincronizar clases del toggle
  if (isCuba) {
    document.getElementById('np-btn-cliente-ui').classList.remove('active-cliente');
    document.getElementById('np-btn-cuba').classList.add('active-cuba');
  } else {
    document.getElementById('np-btn-cliente-ui').classList.add('active-cliente');
    document.getElementById('np-btn-cuba').classList.remove('active-cuba');
  }
  npActualizarHorario();
  const q  = val.toLowerCase();
  const ac = document.getElementById('np-autocomp');
  if (!q || q.length < 2 || isCuba) { ac.style.display = 'none'; return; }
  const matches = datos.clientes
    .filter(c => c.nombre.toLowerCase().includes(q) && !esCuba(c.nombre))
    .slice(0, 6);
  if (!matches.length) { ac.style.display = 'none'; return; }
  const sorted = [...matches].sort((a, b) => (b.frecuente ? 1 : 0) - (a.frecuente ? 1 : 0));
  ac.innerHTML = sorted.map(c => `
    <div style="padding:9px 12px;border-bottom:1px solid var(--border);font-size:.82rem;
                cursor:pointer;display:flex;align-items:center;justify-content:space-between;"
      onmousedown="event.preventDefault();_npSeleccionandoAutocomp=true;npSelAutocompById('${c.id}')"
      ontouchstart="event.preventDefault();_npSeleccionandoAutocomp=true;npSelAutocompById('${c.id}')">
      <span>${c.frecuente ? '⭐ ' : ''}<strong>${esc(c.nombre)}</strong></span>
      <span style="font-size:.68rem;color:var(--ink-light)">${esc(c.tel || '')}</span>
    </div>
  `).join('');
  ac.style.display = '';
}

function npSelAutocompById(clienteId) {
  const c = datos.clientes.find(x => x.id === clienteId);
  if (!c) return;
  npSelAutocomp(c.nombre, c.tel || '');
}

function npSelAutocomp(nombre, tel) {
  _npSeleccionandoAutocomp = false;
  document.getElementById('np-nombre').value = nombre;
  if (tel) {
    document.getElementById('np-tel').value = tel;
    npOnTelInput();
  }
  document.getElementById('np-autocomp').style.display = 'none';
  const isCuba = nombre.toLowerCase().includes('cuba');
  npActualizarBotonesCuba(isCuba);
  npActualizarHorario();
}

function npOcultarAutocomp() {
  const ac = document.getElementById('np-autocomp');
  if (ac) ac.style.display = 'none';
}


// ══════════════════════════════════════════════════
//  PILLS: PAGO / NOTA / ESTADO
// ══════════════════════════════════════════════════

// ── PAGO ──
function npUiTogglePago() {
  if (!_npPagado) {
    _pagoId       = '__np__';
    _pagoDeshacer = false;
    _pagoMetodo   = null;
    document.querySelectorAll('.modal-metodo').forEach(m => m.classList.remove('selected'));
    document.getElementById('modal-pago-titulo').textContent = 'Confirmar pago';
    document.getElementById('modal-pago-desc').textContent   = 'Seleccioná el método de pago.';
    document.getElementById('modal-pago').classList.remove('hidden');
  } else {
    _npPagado     = false;
    _npMetodoPago = '';
    npUiActualizarPagoPill();
  }
}

function npUiActualizarPagoPill() {
  const pill = document.getElementById('np-opt-pago');
  if (!pill) return;
  if (_npPagado) {
    pill.textContent = '✅ Pagado · ' + (_npMetodoPago || '');
    pill.classList.add('active');
  } else {
    pill.textContent = '💳 Confirmar pago';
    pill.classList.remove('active');
  }
}

// ── NOTA ──
function npUiToggleNota() {
  const wrap    = document.getElementById('np-nota-wrap');
  const pill    = document.getElementById('np-opt-nota');
  const visible = wrap.style.display !== 'none';

  // cerrar estado si estaba abierto
  document.getElementById('np-estado-wrap').style.display = 'none';

  wrap.style.display = visible ? 'none' : 'block';
  if (!visible) {
    document.getElementById('np-nota').focus();
    pill.classList.add('active');
  } else {
    const val = (document.getElementById('np-nota').value || '').trim();
    if (!val) pill.classList.remove('active');
  }
}

function npUiNotaInput() {
  const val  = (document.getElementById('np-nota').value || '').trim();
  const pill = document.getElementById('np-opt-nota');
  if (val) {
    pill.textContent = '📝 ' + val.slice(0, 22) + (val.length > 22 ? '…' : '');
    pill.classList.add('active');
  } else {
    pill.textContent = '📝 Nota';
    pill.classList.remove('active');
  }
}

// ── ESTADO ──
function npUiToggleEstado() {
  const wrap    = document.getElementById('np-estado-wrap');
  const visible = wrap.style.display !== 'none';

  // cerrar nota si estaba abierto
  document.getElementById('np-nota-wrap').style.display = 'none';
  const notaPill = document.getElementById('np-opt-nota');
  const notaVal  = (document.getElementById('np-nota').value || '').trim();
  if (!notaVal) notaPill.classList.remove('active');

  wrap.style.display = visible ? 'none' : 'block';
}

function npSelEstadoUi(estado, el) {
  _npEstado = estado;
  document.querySelectorAll('#np-estado-sel .estado-opt').forEach(b => b.className = 'estado-opt');
  el.className = 'estado-opt active-' + estado;
  const pill = document.getElementById('np-opt-estado');
  if (pill) {
    pill.textContent = NP_ESTADO_LABELS[estado] || '⏳ Pendiente';
    pill.classList.toggle('active', estado !== 'pendiente');
  }
  document.getElementById('np-estado-wrap').style.display = 'none';
}

// alias para compatibilidad con código viejo que llame npSelEstado
function npSelEstado(estado, el) { npSelEstadoUi(estado, el); }
// alias viejo npToggleNota → nuevo
function npToggleNota() { npUiToggleNota(); }


// ══════════════════════════════════════════════════
//  PRODUCTOS DEL PEDIDO
// ══════════════════════════════════════════════════

function npRenderProds() {
  const wrap = document.getElementById('np-prods-wrap');
  if (!_npPedido || !_npPedido.productos.length) {
    wrap.innerHTML = '';
    npRenderTotal();
    return;
  }
  const TAMS = ['Chico', 'Mediano', 'Grande'];

  wrap.innerHTML = _npPedido.productos.map(r => {
    const esLibre     = r.tipo === 'libre';
    const nom         = esLibre ? (r.libre || r.nombre || '') : r.nombre;
    const cat         = !esLibre && datos.catalogo.find(c =>
      c.nombre === r.nombre && c.tipo === (r.tacc === 's' ? 'sin_tacc' : 'con_tacc'));
    const tieneTalle  = esLibre ? true : (cat ? cat.tiene_talle : true);
    const libreActivo = tieneTalle && (r._tamLibre || (r.tamano && !TAMS.includes(r.tamano)));
    const precioBase  = esLibre
      ? (r.precio_libre || 0)
      : (cat && !cat.tiene_talle ? (cat.precio || 0) : getPrecioCat(cat, r.tamano));

    // Precio junto al nombre
    const sinTalleElegido = !esLibre && tieneTalle && !libreActivo && !(r.tamano || '').trim();
    let precioDisplay = '';
    if (esLibre || libreActivo) {
      precioDisplay = precioBase > 0
        ? `<span class="pe-precio-val">$${precioBase.toLocaleString('es-AR')} c/u</span>`
        : `<span class="pe-precio-sin">sin precio</span>`;
    } else if (sinTalleElegido) {
      precioDisplay = `<span class="pe-precio-sin">elegir talle</span>`;
    } else if (precioBase > 0) {
      precioDisplay = `<span class="pe-precio-val">$${precioBase.toLocaleString('es-AR')} c/u</span>`;
    }

    // Tag TACC pequeño
    const taccTag = `<span class="pe-tacc-tag ${r.tacc === 's' ? 'st' : 'com'}">${r.tacc === 's' ? 'ST' : 'C'}</span>`;

    // Pills de tamaño — siempre visible para libres y catálogo con talle
    let filaTamano = '';
    if (tieneTalle) {
      const pillsTam = TAMS.map(t =>
        `<button class="pe-size-pill ${!libreActivo && r.tamano === t ? 'active' : ''}"
                 onclick="npSetTamano('${r.id}','${t}')">${t}</button>`
      ).join('');
      const pillLibre = `<button class="pe-size-pill ${libreActivo ? 'active' : ''}"
              onclick="npSetTamano('${r.id}','__libre__')">Libre</button>`;
      const inputLibre = libreActivo ? `
        <input type="text" class="pe-talle-libre-input"
               placeholder="ej: 2kg, bandeja..."
               value="${esc(r.tamano && !TAMS.includes(r.tamano) ? r.tamano : '')}"
               oninput="npSetTamanoLibre('${r.id}',this.value)">` : '';
      const sinTalleWarn = !libreActivo && !(r.tamano || '').trim()
        ? `<span class="pe-talle-warn">⚠ TALLE</span>` : '';

      filaTamano = `
        <div class="pe-sub-row">
          <span class="pe-sub-label">Tamaño</span>
          <div class="pe-sub-body pe-size-pills">
            ${pillsTam}${pillLibre}${inputLibre}${sinTalleWarn}
          </div>
        </div>`;
    }

    // Fila TACC — solo para productos libres
    const filaTacc = esLibre ? `
      <div class="pe-sub-row">
        <span class="pe-sub-label">TACC</span>
        <div class="pe-sub-body pe-size-pills">
          <button class="pe-size-pill com ${r.tacc === 'c' ? 'active' : ''}"
                  onclick="npSetTaccLibre('${r.id}','c')">Con TACC</button>
          <button class="pe-size-pill sin-tacc ${r.tacc === 's' ? 'active' : ''}"
                  onclick="npSetTaccLibre('${r.id}','s')">Sin TACC</button>
        </div>
      </div>` : '';

    // Fila precio libre
    const filaPrecioLibre = esLibre ? `
      <div class="pe-sub-row">
        <span class="pe-sub-label">Precio</span>
        <div class="pe-sub-body">
          <input type="number" class="np-precio-libre-input"
                 placeholder="ej: 15000" min="0"
                 value="${r.precio_libre || ''}"
                 oninput="npSetPrecioLibre('${r.id}',this.value)">
        </div>
      </div>` : '';

    // Extras colapsable
    const extrasHTML = (r.extras || []).map((ex, ei) => `
      <div class="pe-sub-row">
        <span class="pe-sub-label">Extra</span>
        <div class="pe-sub-body" style="gap:6px;">
          <input type="text" class="pe-nota-input" style="flex:1;"
                 placeholder="ej: extra frutilla"
                 value="${esc(ex.desc || '')}"
                 oninput="npSetExtraDesc('${r.id}',${ei},this.value)">
          <input type="number" min="0"
                 style="width:72px;background:var(--bg);border:1px solid var(--amber);border-radius:5px;
                        color:var(--amber);font-family:'Lora',serif;font-size:.78rem;font-weight:600;
                        padding:4px 6px;outline:none;text-align:right;"
                 placeholder="precio"
                 value="${ex.precio || ''}"
                 oninput="npSetExtraPrecio('${r.id}',${ei},this.value)">
          <button class="pe-remove-btn" onclick="npEliminarExtra('${r.id}',${ei})">✕</button>
        </div>
      </div>`).join('');

    // Bloque colapsable nota + extras
    const bloqueDetalle = `
      <div class="pe-detalle-block" id="np-detalle-${r.id}" style="display:none;">
        <div class="pe-sub-row">
          <span class="pe-sub-label">Nota</span>
          <div class="pe-sub-body">
            <input type="text" class="pe-nota-input"
                   id="np-nota-prod-${r.id}"
                   placeholder="ej: sin azúcar, extra crema..."
                   value="${esc(r.nota_prod || '')}"
                   oninput="npSetNotaProd('${r.id}',this.value)">
          </div>
        </div>
        ${extrasHTML}
        <div class="pe-sub-row" style="border-top:none;padding-top:2px;">
          <span class="pe-sub-label"></span>
          <div class="pe-sub-body">
            <button class="pe-expand-btn" onclick="npAgregarExtra('${r.id}')">＋ extra</button>
          </div>
        </div>
      </div>`;

    const tieneDetalle = r.nota_prod || (r.extras && r.extras.length);

    return `
      <div class="pe-prod-wrap" id="np-prod-${r.id}">
        <div class="pe-header-row">
          <div class="pe-emoji-box">${r.emoji || (esLibre ? '✏️' : '🎂')}</div>
          <div class="pe-info">
            <span class="pe-nombre">${esc(nom || '(sin nombre)')}</span>
            <div class="pe-info-sub">
              ${taccTag}
              ${precioDisplay ? `<span class="pe-precio">${precioDisplay}</span>` : ''}
            </div>
          </div>
          <div class="pe-right-controls">
            <div class="pe-qty-group">
              <button class="pe-qty-btn" onclick="npAjustarCant('${r.id}',-1)">−</button>
              <span class="pe-qty-num">${Math.max(1, Number(r.cantidad) || 1)}</span>
              <button class="pe-qty-btn" onclick="npAjustarCant('${r.id}',1)">+</button>
            </div>
            <button class="pe-expand-btn ${tieneDetalle ? 'open' : ''}"
                    id="np-expand-btn-${r.id}"
                    onclick="npToggleNotaProd('${r.id}')">
              ${tieneDetalle ? '− nota' : '+ detalle'}
            </button>

            <button class="pe-remove-btn" onclick="npEliminarProd('${r.id}')">✕</button>
          </div>
        </div>
        ${filaTacc}
        ${filaTamano}
        ${filaPrecioLibre}
        ${bloqueDetalle}
      </div>`;
  }).join('');

  npRenderTotal();
}
// npCambiarProd abre el selector overlay (se mantiene por si se necesita cambiar desde la card)
function npCambiarProd(rId) {
  _selectorPedidoId = '__np__';
  _selectorProdId   = rId;
  document.getElementById('selector-search').value = '';
  renderSelectorLista();
  document.getElementById('selector-overlay').classList.remove('hidden');
}

function npEliminarProd(rId) {
  if (!_npPedido) return;
  _npPedido.productos = _npPedido.productos.filter(r => r.id !== rId);
  npRenderProds();
}

function npToggleProdListo(rId) {
  const r = _npPedido && _npPedido.productos.find(x => x.id === rId);
  if (!r) return;
  r.listo = !r.listo;
  npRenderProds();
}

function npAjustarCant(rId, delta) {
  const r = _npPedido && _npPedido.productos.find(x => x.id === rId);
  if (!r) return;
  r.cantidad = Math.max(1, (Number(r.cantidad) || 1) + delta);
  npRenderProds();
}

function npSetTalleLibreToggle(rId, val) {
  const r = _npPedido && _npPedido.productos.find(x => x.id === rId);
  if (!r) return;
  r._tienetalleLibre = val;
  if (!val) { r.tamano = ''; r._tamLibre = false; }
  npRenderProds();
}

function npSetTaccLibre(rId, val) {
  const r = _npPedido && _npPedido.productos.find(x => x.id === rId);
  if (!r) return;
  r.tacc = val;
  npRenderProds();
}

function npSetTamano(rId, tam) {
  const r = _npPedido && _npPedido.productos.find(x => x.id === rId);
  if (!r) return;
  if (tam === '__libre__') { r._tamLibre = true; }
  else { r.tamano = tam; r._tamLibre = false; }
  npRenderProds();
}

function npSetTamanoLibre(rId, val) {
  const r = _npPedido && _npPedido.productos.find(x => x.id === rId);
  if (!r) return;
  r.tamano = val;
}

function npToggleNotaProd(rId) {
  const bloque = document.getElementById('np-detalle-' + rId);
  const btn    = document.getElementById('np-expand-btn-' + rId);
  if (!bloque) return;
  const abierto = bloque.style.display !== 'none';
  bloque.style.display = abierto ? 'none' : '';
  if (btn) {
    btn.textContent = abierto ? '+ detalle' : '− nota';
    btn.classList.toggle('open', !abierto);
  }
}

function npSetNotaProd(rId, val) {
  const r = _npPedido && _npPedido.productos.find(x => x.id === rId);
  if (!r) return;
  r.nota_prod = val;
  const ta = document.getElementById('np-nota-prod-' + rId);
  if (ta && ta.previousElementSibling)
    ta.previousElementSibling.textContent = val ? '✏️ ' + val : '＋ Nota del producto';
}

function npSetPrecioLibre(rId, val) {
  const r = _npPedido && _npPedido.productos.find(x => x.id === rId);
  if (!r) return;
  r.precio_libre = parseFloat(val) || 0;
  npRenderTotal();
}

function npAgregarExtra(rId) {
  const r = _npPedido && _npPedido.productos.find(x => x.id === rId);
  if (!r) return;
  if (!r.extras) r.extras = [];
  r.extras.push({ desc: '', precio: 0 });
  npRenderProds();
}

function npEliminarExtra(rId, ei) {
  const r = _npPedido && _npPedido.productos.find(x => x.id === rId);
  if (!r || !r.extras) return;
  r.extras.splice(ei, 1);
  npRenderProds();
}

function npSetExtraDesc(rId, ei, val) {
  const r = _npPedido && _npPedido.productos.find(x => x.id === rId);
  if (!r || !r.extras || !r.extras[ei]) return;
  r.extras[ei].desc = val;
}

function npSetExtraPrecio(rId, ei, val) {
  const r = _npPedido && _npPedido.productos.find(x => x.id === rId);
  if (!r || !r.extras || !r.extras[ei]) return;
  r.extras[ei].precio = parseFloat(val) || 0;
  npRenderTotal();
}

function calcTotalPedido(pedido) { return totalDePedido(pedido); }

function npRenderTotal() {
  const wrap = document.getElementById('np-total-wrap');
  if (!wrap) return;
  const total = calcTotalPedido(_npPedido);
  if (!total) { wrap.style.display = 'none'; return; }
  wrap.style.display = '';
  const efectivo = Math.round(total * 0.9);
  wrap.innerHTML = `
    <div>
      <span class="np-total-label">Total</span>
      <span class="np-total-ef">💵 efectivo $${efectivo.toLocaleString('es-AR')}</span>
    </div>
    <span class="np-total-num">$${total.toLocaleString('es-AR')}</span>`;
  npActualizarBtnGuardar();
}

function npActualizarBtnGuardar() {
  const btn = document.getElementById('np-btn-guardar-header');
  if (!btn) return;
  const tieneDia   = !!_npDiaKey;
  const tieneProds = _npPedido && _npPedido.productos && _npPedido.productos.length > 0;
  const listo      = tieneDia && tieneProds;
  btn.style.opacity = listo ? '1' : '0.38';
  btn.style.cursor  = listo ? 'pointer' : 'default';
  btn.style.filter  = listo ? 'none' : 'grayscale(60%)';
  btn.title         = listo ? '' : (!tieneDia ? 'Falta elegir el día' : 'Falta agregar productos');
}


// ══════════════════════════════════════════════════
//  BUSCADOR INLINE DE PRODUCTOS
// ══════════════════════════════════════════════════

const NP_CAT_ORDEN  = ['tortas','mousses','bandejas','cuadrados','congelados','otros'];
const NP_CAT_LABELS = {
  tortas:    '🎂 Tortas',
  mousses:   '🍮 Mousses',
  bandejas:  '🍫 Bandejas',
  cuadrados: '🟫 Cuadrados',
  congelados:'❄️ Congelados',
  otros:     '✨ Otros',
};

let _npSearchHighlight = -1;

// Categorías abiertas en el accordion del catálogo
let _npCatsAbiertas = new Set();

function npSearchFocus() {
  const inp = document.getElementById('np-search-prod-input');
  if (inp && !inp.value.trim()) npSearchMostrarTodo();
}

// onclick del input: toggle dropdown
// Si blur acaba de correr (dentro de 200ms) significa que el dropdown
// ya fue cerrado por blur — en ese caso no reabrimos.
let _npSearchBlurTs = 0;
function npSearchClick() {
  const results = document.getElementById('np-search-prod-results');
  const inp     = document.getElementById('np-search-prod-input');
  if (!inp) return;
  const recienBlur = (Date.now() - _npSearchBlurTs) < 200;
  if (results && results.style.display !== 'none' && !inp.value.trim()) {
    // Dropdown abierto → cerrar
    results.style.display = 'none';
    npSearchActualizarFlecha(false);
  } else if (!recienBlur && !inp.value.trim()) {
    // Cerrado pero NO por blur inmediato → abrir
    npSearchMostrarTodo();
  }
}

// Actualiza la flechita del input según estado del dropdown
function npSearchActualizarFlecha(abierto) {
  const arrow = document.getElementById('np-search-arrow');
  if (arrow) arrow.classList.toggle('open', abierto);
}

// Reabre el dropdown después de agregar un producto (sin mover foco)
function npSearchReabrir() {
  const inp = document.getElementById('np-search-prod-input');
  if (inp && !inp.value.trim()) {
    npSearchMostrarTodo();
  }
}

function npSearchMostrarTodo() {
  const results = document.getElementById('np-search-prod-results');
  if (!results) return;

  const catalogo = datos.catalogo || [];
  if (!catalogo.length) return;
  npSearchActualizarFlecha(true);

  // Agrupar por categoría (mezcla ST y C dentro de cada cat)
  const porCat = {};
  catalogo.forEach(c => {
    const cat = NP_CAT_ORDEN.includes(c.categoria) ? c.categoria : 'otros';
    if (!porCat[cat]) porCat[cat] = [];
    porCat[cat].push(c);
  });

  const fragment = document.createDocumentFragment();

  NP_CAT_ORDEN.forEach(cat => {
    const items = porCat[cat];
    if (!items || !items.length) return;

    const abierta = _npCatsAbiertas.has(cat);

    // Header de categoría (clickeable)
    const header = document.createElement('div');
    header.className = 'np-cat-header';
    header.dataset.cat = cat;
    const count = items.length;
    header.innerHTML =
      '<span class="np-cat-header-label">' + NP_CAT_LABELS[cat] + '</span>' +
      '<span class="np-cat-header-meta">' + count + ' productos</span>' +
      '<span class="np-cat-header-arrow">' + (abierta ? '▴' : '▾') + '</span>';

    header.addEventListener('mousedown', e => {
      e.preventDefault();
      _npSearchClicking = true;
      if (_npCatsAbiertas.has(cat)) {
        _npCatsAbiertas.delete(cat);
      } else {
        _npCatsAbiertas.add(cat);
      }
      npSearchMostrarTodo();
    });
    fragment.appendChild(header);

    // Items de la categoría (colapsables)
    if (abierta) {
      items.sort((a,b) => a.nombre.localeCompare(b.nombre)).forEach(c => {
        const tacc = c.tipo === 'sin_tacc' ? 's' : 'c';
        const item = document.createElement('div');
        item.className = 'np-search-prod-item np-cat-item';

        const pill = document.createElement('span');
        pill.className   = 'tacc-pill ' + tacc;
        pill.textContent = tacc === 's' ? 'ST' : 'C';

        const nomSpan = document.createElement('span');
        nomSpan.className   = 'np-search-prod-nombre';
        nomSpan.textContent = c.nombre;

        const precioSpan = document.createElement('span');
        precioSpan.className = 'np-search-prod-precio';
        if (c.precio) precioSpan.textContent = '$' + Number(c.precio).toLocaleString('es-AR');

        item.appendChild(pill);
        item.appendChild(nomSpan);
        item.appendChild(precioSpan);

        item.addEventListener('mousedown', e => { e.preventDefault(); _npSearchClicking = true; npSearchSeleccionar(c, 'catalogo', tacc); });
        item.onclick = () => { if (_npSearchClicking) { _npSearchClicking = false; return; } npSearchSeleccionar(c, 'catalogo', tacc); };
        item.addEventListener('touchstart', e => { e.preventDefault(); _npSearchClicking = true; npSearchSeleccionar(c, 'catalogo', tacc); }, { passive: false });

        fragment.appendChild(item);
      });
    }
  });

  results.innerHTML = '';
  results.appendChild(fragment);
  results.style.display = '';
  _npSearchHighlight = -1;
}

function npSearchProd(query) {
  const q       = (query || '').trim().toLowerCase();
  const results = document.getElementById('np-search-prod-results');
  const clearBtn = document.getElementById('np-search-prod-clear');
  if (!results) return;

  if (clearBtn) clearBtn.style.display = q ? '' : 'none';

  if (!q) {
    npSearchMostrarTodo();
    return;
  }

  const matches = (datos.catalogo || []).filter(c => c.nombre.toLowerCase().includes(q));

  if (!matches.length) {
    const noRes = document.createElement('div');
    noRes.className = 'np-search-no-results';
    noRes.innerHTML = 'Sin resultados para "<strong>' + esc(q) + '</strong>"';

    const libreBtn = document.createElement('div');
    libreBtn.className = 'np-search-prod-item np-search-libre';
    libreBtn.style.cssText = 'border-top:1px solid var(--border);color:var(--accent);font-style:italic;cursor:pointer;';
    libreBtn.innerHTML = '<span style="font-size:.82rem;">＋ Agregar \"<strong>' + esc(query.trim()) + '</strong>\" como producto libre</span>';
    libreBtn.addEventListener('mousedown', e => { e.preventDefault(); _npSearchClicking = true; npSearchSeleccionarLibre(query.trim()); });
    libreBtn.addEventListener('touchstart', e => { e.preventDefault(); _npSearchClicking = true; npSearchSeleccionarLibre(query.trim()); }, { passive: false });

    results.innerHTML = '';
    results.appendChild(noRes);
    results.appendChild(libreBtn);
    results.style.display = '';
    _npSearchHighlight = -1;
    return;
  }

  const grupos = { s: {}, c: {} };
  matches.forEach(c => {
    const tacc = c.tipo === 'sin_tacc' ? 's' : 'c';
    const cat  = NP_CAT_ORDEN.includes(c.categoria) ? c.categoria : 'otros';
    if (!grupos[tacc][cat]) grupos[tacc][cat] = [];
    grupos[tacc][cat].push(c);
  });

  const fragment  = document.createDocumentFragment();
  let   itemIndex = 0;

  ['s','c'].forEach(tacc => {
    NP_CAT_ORDEN.forEach(cat => {
      const items = grupos[tacc][cat];
      if (!items || !items.length) return;

      const sep = document.createElement('div');
      sep.className   = 'np-search-cat-sep';
      sep.textContent = (tacc === 's' ? 'SIN TACC · ' : 'CON TACC · ') + NP_CAT_LABELS[cat];
      fragment.appendChild(sep);

      items.sort((a,b) => a.nombre.localeCompare(b.nombre)).forEach(c => {
        const item = document.createElement('div');
        item.className    = 'np-search-prod-item';
        item.dataset.index = itemIndex++;

        const pill = document.createElement('span');
        pill.className   = 'tacc-pill ' + tacc;
        pill.textContent = tacc === 's' ? 'ST' : 'C';

        const nomSpan = document.createElement('span');
        nomSpan.className = 'np-search-prod-nombre';
        const idx = c.nombre.toLowerCase().indexOf(q);
        if (idx >= 0) {
          nomSpan.innerHTML =
            esc(c.nombre.slice(0, idx)) +
            `<mark>${esc(c.nombre.slice(idx, idx + q.length))}</mark>` +
            esc(c.nombre.slice(idx + q.length));
        } else {
          nomSpan.textContent = c.nombre;
        }

        const precioSpan = document.createElement('span');
        precioSpan.className = 'np-search-prod-precio';
        if (c.precio) precioSpan.textContent = '$' + Number(c.precio).toLocaleString('es-AR');

        item.appendChild(pill);
        item.appendChild(nomSpan);
        item.appendChild(precioSpan);

        item.addEventListener('mousedown', e => { e.preventDefault(); _npSearchClicking = true; npSearchSeleccionar(c, 'catalogo', tacc); });
        item.onclick = () => { if (_npSearchClicking) { _npSearchClicking = false; return; } npSearchSeleccionar(c, 'catalogo', tacc); };
        item.addEventListener('touchstart', e => { e.preventDefault(); _npSearchClicking = true; npSearchSeleccionar(c, 'catalogo', tacc); }, { passive: false });

        fragment.appendChild(item);
      });
    });
  });

  // Opción libre si no hay match exacto
  const hayExacto = (datos.catalogo || []).some(c => c.nombre.toLowerCase() === q);
  if (!hayExacto) {
    const libreItem = document.createElement('div');
    libreItem.className = 'np-search-prod-item np-search-libre';
    libreItem.style.cssText = 'border-top:2px dashed var(--border);color:var(--accent);font-style:italic;';
    libreItem.innerHTML = `<span style="font-size:.85rem;">＋ Agregar "<strong>${esc(query.trim())}</strong>" como producto libre</span>`;
    libreItem.addEventListener('mousedown', e => { e.preventDefault(); _npSearchClicking = true; npSearchSeleccionarLibre(query.trim()); });
    libreItem.addEventListener('touchstart', e => { e.preventDefault(); _npSearchClicking = true; npSearchSeleccionarLibre(query.trim()); }, { passive: false });
    fragment.appendChild(libreItem);
  }

  results.innerHTML = '';
  results.appendChild(fragment);
  results.style.display = '';
  _npSearchHighlight = -1;
}

function npSearchSeleccionar(cat, tipo, tacc) {
  if (!_npPedido) _npPedido = { id: '__np__', productos: [] };
  _npPedido.productos.push(crearProductoBase({
    nombre: cat.nombre, tipo, tacc,
    libre:  tipo === 'libre' ? cat.nombre : undefined,
  }));
  // Cerrar dropdown y limpiar input
  const results = document.getElementById('np-search-prod-results');
  const inp = document.getElementById('np-search-prod-input');
  const clearBtn = document.getElementById('np-search-prod-clear');
  if (results) { results.style.display = 'none'; results.innerHTML = ''; }
  npSearchActualizarFlecha(false);
  if (inp) inp.value = '';
  if (clearBtn) clearBtn.style.display = 'none';
  npRenderProds();
  setTimeout(() => {
    const wrap = document.getElementById('np-prods-wrap');
    if (wrap) wrap.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 60);
}

function npSearchSeleccionarLibre(nombre) {
  if (!nombre) return;
  if (!_npPedido) _npPedido = { id: '__np__', productos: [] };
  _npPedido.productos.push(crearProductoBase({
    nombre, tipo: 'libre', tacc: 'c', libre: nombre,
  }));
  // Cerrar dropdown y limpiar input
  const results = document.getElementById('np-search-prod-results');
  const inp = document.getElementById('np-search-prod-input');
  const clearBtn = document.getElementById('np-search-prod-clear');
  if (results) { results.style.display = 'none'; results.innerHTML = ''; }
  if (inp) inp.value = '';
  if (clearBtn) clearBtn.style.display = 'none';
  npRenderProds();
  setTimeout(() => {
    const wrap = document.getElementById('np-prods-wrap');
    if (wrap) wrap.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 60);
}

function npSearchProdClear() {
  const inp     = document.getElementById('np-search-prod-input');
  const results = document.getElementById('np-search-prod-results');
  const clearBtn = document.getElementById('np-search-prod-clear');
  if (inp)     inp.value = '';
  if (results) { results.style.display = 'none'; results.innerHTML = ''; }
  if (clearBtn) clearBtn.style.display = 'none';
  _npSearchHighlight = -1;
}

// Cierra los resultados del buscador salvo que haya un click en curso
function npSearchBlur() {
  if (_npSearchClicking) { _npSearchClicking = false; return; }
  _npSearchBlurTs = Date.now();
  setTimeout(() => {
    if (_npSearchClicking) { _npSearchClicking = false; return; }
    const results = document.getElementById('np-search-prod-results');
    if (results) results.style.display = 'none';
    npSearchActualizarFlecha(false);
  }, 150);
}

function npSearchKeydown(e) {
  const results = document.getElementById('np-search-prod-results');
  if (!results || results.style.display === 'none') return;
  const items = results.querySelectorAll('.np-search-prod-item');
  if (!items.length) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    _npSearchHighlight = Math.min(_npSearchHighlight + 1, items.length - 1);
    npSearchUpdateHighlight(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    _npSearchHighlight = Math.max(_npSearchHighlight - 1, 0);
    npSearchUpdateHighlight(items);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (_npSearchHighlight >= 0 && items[_npSearchHighlight])
      items[_npSearchHighlight].dispatchEvent(new MouseEvent('mousedown'));
  } else if (e.key === 'Escape') {
    npSearchProdClear();
  }
}

function npSearchUpdateHighlight(items) {
  items.forEach((el, i) => el.classList.toggle('np-search-highlighted', i === _npSearchHighlight));
  if (_npSearchHighlight >= 0) items[_npSearchHighlight].scrollIntoView({ block: 'nearest' });
}

// Cerrar resultados al hacer click fuera
document.addEventListener('click', function(e) {
  const wrap = document.getElementById('np-search-prod-wrap');
  if (wrap && !wrap.contains(e.target)) {
    const results = document.getElementById('np-search-prod-results');
    if (results) results.style.display = 'none';
  }
});


// ══════════════════════════════════════════════════
//  ABRIR / CERRAR / GUARDAR
// ══════════════════════════════════════════════════

let _npTabAnterior = 'tab-pedidos';


function npSearchIniciarUI() {
  const inp = document.getElementById('np-search-prod-input');
  if (!inp || inp._npClickInited) return;
  inp._npClickInited = true;
  inp.addEventListener('click', npSearchClick);
}
function abrirModalNP() {
  // Reset panel pago inline
const pagoWrap = document.getElementById('np-pago-wrap');
if (pagoWrap) pagoWrap.style.display = 'none';
document.querySelectorAll('.np-pago-opt').forEach(b => b.classList.remove('active'));

  const activo = document.querySelector('.tab-content.active');
  if (activo) _npTabAnterior = activo.id;

  // Reset estado interno
  _npDia              = null;
  _npDiaKey           = null;
  _npPedido           = { id: '__np__', productos: [] };
  _npPagado           = false;
  _npMetodoPago       = '';
  _npEstado           = 'pendiente';
  _npEsEdicion        = false;
  _npPedidoIdOriginal = null;

  // Reset días
  document.querySelectorAll('.modal-np-dia-btn').forEach(b => b.classList.remove('active'));
  const customInput = document.getElementById('np-dia-custom');
  if (customInput) customInput.value = '';
  const lblOtro = document.getElementById('np-lbl-otro');
  if (lblOtro) lblOtro.textContent = 'Otro día';

  // Reset campos de texto
  document.getElementById('np-nombre').value = '';
  document.getElementById('np-tel').value    = '';
  document.getElementById('np-tel-hint').textContent = '';
  document.getElementById('np-tel-hint').className   = 'np-hint';
  document.getElementById('np-hora').value   = '';
  _npTimeH = null; _npTimeM = null;
  setTimeout(() => { npClockInit(); }, 30);

  // Reset error
  const errDiv = document.getElementById('np-error');
  errDiv.style.display = 'none';
  errDiv.textContent   = '';

  // Reset modo Cuba — volver a Cliente
  document.getElementById('np-cuba-badge').style.display = 'none';
  const filaNombre = document.getElementById('np-fila-nombre');
  if (filaNombre) filaNombre.style.display = '';
  document.getElementById('np-campo-tel').style.display = '';
  document.getElementById('np-btn-cliente-ui').classList.add('active-cliente');
  document.getElementById('np-btn-cuba').classList.remove('active-cuba');

  // Reset turnos Cuba
  document.getElementById('np-t1').classList.remove('active');
  document.getElementById('np-t2').classList.remove('active');

  // Reset pills
  const optPago = document.getElementById('np-opt-pago');
  if (optPago)   { optPago.textContent = '💳 Confirmar pago'; optPago.classList.remove('active'); optPago.style.display = ''; }
  const optNota = document.getElementById('np-opt-nota');
  if (optNota)   { optNota.textContent = '📝 Nota'; optNota.classList.remove('active'); }
  const optEstado = document.getElementById('np-opt-estado');
  if (optEstado) { optEstado.textContent = '⏳ Pendiente'; optEstado.classList.remove('active'); }

  // Reset paneles expandidos
  document.getElementById('np-nota-wrap').style.display   = 'none';
  document.getElementById('np-estado-wrap').style.display = 'none';
  document.getElementById('np-nota').value = '';

  // Reset selector de estado
  document.querySelectorAll('#np-estado-sel .estado-opt').forEach(b => b.className = 'estado-opt');
  const firstOpt = document.querySelector('#np-estado-sel .estado-opt');
  if (firstOpt) firstOpt.className = 'estado-opt active-pendiente';

  // Reset buscador
  npSearchProdClear();
  npSearchIniciarUI();

  // Render inicial
  npRenderProds();
  npLabels();
  npActualizarHorario();

  // Mostrar página
  document.getElementById('tab-contents').style.display   = 'none';
  document.getElementById('tab-np-page').style.display = 'flex';

  setTimeout(() => { document.getElementById('np-dia-hoy')?.focus(); npClockInit(); }, 80);
  npActualizarBtnGuardar();
}

// Devuelve true si el usuario ya empezó a cargar algo
// ── MODAL WARNING "SALIR SIN GUARDAR" ──────────────────────────────
// Se inyecta en el DOM una sola vez al cargar
(function () {
  if (document.getElementById('np-warn-overlay')) return;
  const el = document.createElement('div');
  el.id = 'np-warn-overlay';
  el.innerHTML = `
    <div id="np-warn-box">
      <div id="np-warn-icon">⚠️</div>
      <h3 id="np-warn-titulo"></h3>
      <p  id="np-warn-desc"></p>
      <div id="np-warn-btns">
        <button id="np-warn-cancel">Volver al pedido</button>
        <button id="np-warn-ok">Salir igual</button>
      </div>
    </div>`;
  Object.assign(el.style, {
    position: 'fixed', inset: '0',
    background: 'rgba(0,0,0,.6)',
    backdropFilter: 'blur(4px)',
    display: 'none', alignItems: 'center', justifyContent: 'center',
    zIndex: '9999',
  });
  const box = el.querySelector('#np-warn-box');
  Object.assign(box.style, {
    background: 'var(--paper, #1a1a2e)',
    border: '1.5px solid var(--border, #333)',
    borderRadius: '20px',
    padding: '32px 28px 26px',
    maxWidth: '320px', width: '88%',
    textAlign: 'center',
    boxShadow: '0 24px 64px rgba(0,0,0,.55)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
  });
  Object.assign(el.querySelector('#np-warn-icon').style, {
    fontSize: '2rem', lineHeight: '1', marginBottom: '2px',
  });
  const titulo = el.querySelector('#np-warn-titulo');
  Object.assign(titulo.style, {
    fontFamily: "'Outfit', sans-serif", fontSize: '1.05rem', fontWeight: '700',
    color: 'var(--ink, #eee)', margin: '0',
  });
  const desc = el.querySelector('#np-warn-desc');
  Object.assign(desc.style, {
    fontFamily: "'Outfit', sans-serif", fontSize: '.82rem',
    color: 'var(--ink-mid, #aaa)', margin: '0 0 4px', lineHeight: '1.5',
  });
  Object.assign(el.querySelector('#np-warn-btns').style, {
    display: 'flex', flexDirection: 'column', gap: '8px',
    width: '100%', marginTop: '4px',
  });
  // Boton primario: VOLVER (accion segura, acento fuerte)
  const btnCancel = el.querySelector('#np-warn-cancel');
  Object.assign(btnCancel.style, {
    fontFamily: "'Outfit', sans-serif", fontSize: '.87rem', fontWeight: '700',
    padding: '12px', borderRadius: '50px', border: 'none',
    background: 'var(--accent, #00e5a0)', color: 'var(--accent-fg, #0a0a0a)',
    cursor: 'pointer', transition: 'opacity .15s', width: '100%',
  });
  btnCancel.onmouseover = () => { btnCancel.style.opacity = '.85'; };
  btnCancel.onmouseout  = () => { btnCancel.style.opacity = '1'; };
  // Boton secundario: SALIR (accion destructiva, tono apagado)
  const btnOk = el.querySelector('#np-warn-ok');
  Object.assign(btnOk.style, {
    fontFamily: "'Outfit', sans-serif", fontSize: '.78rem', fontWeight: '500',
    padding: '9px', borderRadius: '50px',
    border: '1px solid var(--border, #444)', background: 'transparent',
    color: 'var(--ink-light, #777)', cursor: 'pointer',
    transition: 'color .15s, border-color .15s', width: '100%',
  });
  btnOk.onmouseover = () => { btnOk.style.color = 'var(--ink,#eee)'; btnOk.style.borderColor = 'var(--ink-mid,#999)'; };
  btnOk.onmouseout  = () => { btnOk.style.color = 'var(--ink-light,#777)'; btnOk.style.borderColor = 'var(--border,#444)'; };

  document.body.appendChild(el);
})();

function _npAbrirWarnSalir(cb) {
  const overlay = document.getElementById('np-warn-overlay');
  document.getElementById('np-warn-titulo').textContent = '¿Salir sin guardar?';
  document.getElementById('np-warn-desc').textContent   = 'Tenés datos cargados. Si salís ahora se van a perder.';
  overlay.style.display = 'flex';
  document.getElementById('np-warn-ok').onclick = () => {
    overlay.style.display = 'none';
    if (cb) cb();
  };
  document.getElementById('np-warn-cancel').onclick = () => {
    overlay.style.display = 'none';
  };
}

function _npTieneDatos() {
  const nombre = (document.getElementById('np-nombre')?.value || '').trim();
  const tel    = (document.getElementById('np-tel')?.value    || '').trim();
  const nota   = (document.getElementById('np-nota')?.value   || '').trim();
  const prods  = _npPedido && _npPedido.productos && _npPedido.productos.length > 0;
  const dia    = !!_npDiaKey;
  return !!(nombre || tel || nota || prods || dia);
}

function _npCerrarSinGuardar() {
  document.getElementById('tab-np-page').style.display    = 'none';
  document.getElementById('tab-contents').style.display   = '';
  document.getElementById(_npTabAnterior)?.classList.add('active');
  _npPedido           = null;
  _npEsEdicion        = false;
  _npPedidoIdOriginal = null;
  const btnGuardar = document.getElementById('np-btn-guardar-header');
  if (btnGuardar) btnGuardar.textContent = '💾 Guardar pedido';
}

function cerrarModalNP() {
  if (_npTieneDatos()) {
    _npAbrirWarnSalir(_npCerrarSinGuardar);
    return;
  }
  _npCerrarSinGuardar();
}

function confirmarNP() {
  const errDiv = document.getElementById('np-error');
  errDiv.textContent = '';
  errDiv.style.display = 'none';

  const nombre = (document.getElementById('np-nombre').value || '').trim();
  const tel    = (document.getElementById('np-tel').value    || '').trim();
  const hora   = (document.getElementById('np-hora').value   || '').trim();
  const nota   = (document.getElementById('np-nota').value   || '').trim();
  const isCuba = nombre.toLowerCase().includes('cuba');

  const errores = [];
  if (!_npDiaKey)                                errores.push('Seleccioná un día de entrega');
  if (!isCuba && !nombre)                        errores.push('Falta el nombre del cliente');
  if (!isCuba && !hora)                          errores.push('Falta el horario de entrega');
  if (!_npPedido || !_npPedido.productos.length) errores.push('Agregá al menos un producto');

  if (errores.length) {
    errDiv.textContent = '⚠️ ' + errores.join(' · ');
    errDiv.style.display = '';
    return;
  }

  const sinTalle = (_npPedido.productos || []).filter(r => {
    const cat    = datos.catalogo.find(c => c.nombre === r.nombre && c.tipo === (r.tacc === 's' ? 'sin_tacc' : 'con_tacc'));
    const obliga = r.tipo === 'catalogo' ? (cat ? cat.tiene_talle : false) : false;
    return obliga && !(r.tamano || '').trim();
  });
  if (sinTalle.length) {
    errDiv.innerHTML = '⚠️ Completá el talle de: <strong>' + sinTalle.map(r => esc(r.nombre)).join(', ') + '</strong>';
    errDiv.style.display = '';
    return;
  }

  _npPedido.productos.forEach(r => { delete r._tamLibre; });

  const clienteNorm = normalizarCliente(nombre);
  if (!isCuba && nombre) {
    const yaExiste = datos.clientes.find(c => c.nombre.toLowerCase() === clienteNorm.toLowerCase());
    if (!yaExiste) datos.clientes.push({ id: uid(), nombre: clienteNorm, tel: tel || '', frecuente: false });
  }

  // ── Modo EDICIÓN ──────────────────────────────────────────────
  if (_npEsEdicion) {
    const diaKeyOriginal = _poGetDiaDePedido(_npPedidoIdOriginal);
    if (!diaKeyOriginal) {
      errDiv.textContent = '⚠️ No se encontró el pedido original. Intentá de nuevo.';
      errDiv.style.display = '';
      return;
    }
    const pedidosDelDia = datos.dias[diaKeyOriginal].pedidos;
    const idx = pedidosDelDia.findIndex(p => p.id === _npPedidoIdOriginal);
    if (idx === -1) {
      errDiv.textContent = '⚠️ No se encontró el pedido original. Intentá de nuevo.';
      errDiv.style.display = '';
      return;
    }
    const pedidoActualizado = Object.assign({}, pedidosDelDia[idx], {
      cliente:       clienteNorm,
      cliente_input: nombre,
      tel:           isCuba ? '' : tel,
      hora_entrega:  hora,
      productos:     _npPedido.productos,
      estado:        _npEstado || pedidosDelDia[idx].estado,
      pagado:        _npPagado,
      metodoPago:    _npMetodoPago || '',
      notas:         nota,
    });
    if (diaKeyOriginal === _npDiaKey) {
      datos.dias[diaKeyOriginal].pedidos[idx] = pedidoActualizado;
    } else {
      pedidosDelDia.splice(idx, 1);
      if (!datos.dias[_npDiaKey])         datos.dias[_npDiaKey] = { pedidos: [] };
      if (!datos.dias[_npDiaKey].pedidos) datos.dias[_npDiaKey].pedidos = [];
      datos.dias[_npDiaKey].pedidos.push(pedidoActualizado);
    }
    guardar();
    mostrarToastGuardado();
    _npCerrarSinGuardar();
    renderPedidos();
    const prodTabEd = document.getElementById('tab-produccion');
    if (prodTabEd && prodTabEd.classList.contains('active')) renderProduccion();
    return;
  }
  // ── Fin modo EDICIÓN ─────────────────────────────────────────

  // ── Modo CREACIÓN (igual que antes) ──────────────────────────
const pedido = crearPedidoBase({
    cliente:       clienteNorm,
    cliente_input: nombre,
    tel:           isCuba ? '' : tel,
    hora_entrega:  hora,
    productos:     _npPedido.productos,
    estado:        _npEstado || ESTADOS.PENDIENTE,
    pagado:        _npPagado,
    metodoPago:    _npMetodoPago || '',
    notas:         nota,
    _creadoPor:    (typeof usuarioActivo !== 'undefined' && usuarioActivo.nombre) ? usuarioActivo.nombre : '—',
  });

  if (!datos.dias[_npDiaKey])          datos.dias[_npDiaKey] = { pedidos: [] };
  if (!datos.dias[_npDiaKey].pedidos)  datos.dias[_npDiaKey].pedidos = [];
  datos.dias[_npDiaKey].pedidos.push(pedido);

  guardar();
  mostrarToastGuardado();
  _npCerrarSinGuardar();
  renderPedidos();

  const prodTab = document.getElementById('tab-produccion');
  if (prodTab && prodTab.classList.contains('active')) renderProduccion();
}

function abrirModalNP_edicion(pedidoId) {
 
  // Buscar el pedido en todos los días
  const diaKey = _poGetDiaDePedido(pedidoId);
  if (!diaKey) {
    console.warn('[NP edición] No se encontró el pedido:', pedidoId);
    return;
  }
  const pedidoOriginal = (datos.dias[diaKey].pedidos || []).find(p => p.id === pedidoId);
  if (!pedidoOriginal) {
    console.warn('[NP edición] Pedido no encontrado en el día:', diaKey, pedidoId);
    return;
  }
 
  // Abrir el modal limpio primero (reset completo vía abrirModalNP)
  abrirModalNP();
 
  // Marcar modo edición DESPUÉS del reset (el wrapper de arriba ya corrió)
  _npEsEdicion        = true;
  _npPedidoIdOriginal = pedidoId;
 
  // ── Día ──────────────────────────────────────────────────────
  _npDiaKey = diaKey;
  _npDia    = 'otro'; // tratamos siempre como "otro" para simplificar
 
  // Resaltar el botón de día correcto si coincide con hoy/mañana,
  // o bien marcar el botón "Otro" con la fecha.
  const hoyKey  = npDiaKeyDesde('hoy');
  const manKey  = npDiaKeyDesde('manana');
  document.querySelectorAll('.modal-np-dia-btn').forEach(b => b.classList.remove('active'));
 
  if (diaKey === hoyKey) {
    _npDia = 'hoy';
    document.getElementById('np-dia-hoy')?.classList.add('active');
  } else if (diaKey === manKey) {
    _npDia = 'manana';
    document.getElementById('np-dia-man')?.classList.add('active');
  } else {
    // Mostrar fecha en el botón "Otro día"
    const [y, m, d] = diaKey.split('-').map(Number);
    const f = new Date(y, m - 1, d);
    const DIAS_CORTO = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    const label = DIAS_CORTO[f.getDay()] + ' ' + d + '/' + m;
    const lblOtro = document.getElementById('np-lbl-otro');
    if (lblOtro) lblOtro.textContent = label;
    document.getElementById('np-dia-otro')?.classList.add('active');
  }
 
  npActualizarHorario();
 
  // ── Cliente / Cuba ────────────────────────────────────────────
  const isCuba = (pedidoOriginal.cliente || '').toLowerCase().includes('cuba');
 
  if (isCuba) {
    // Activar modo Cuba en la UI
    const nomInp = document.getElementById('np-nombre');
    if (nomInp) nomInp.value = pedidoOriginal.cliente_input || pedidoOriginal.cliente || 'Cuba';
    npActualizarBotonesCuba(true);
    npActualizarHorario();
    const autocomp = document.getElementById('np-autocomp');
    if (autocomp) autocomp.style.display = 'none';
    document.getElementById('np-btn-cliente-ui')?.classList.remove('active-cliente');
    document.getElementById('np-btn-cuba')?.classList.add('active-cuba');
  } else {
    document.getElementById('np-nombre').value = pedidoOriginal.cliente_input || pedidoOriginal.cliente || '';
    document.getElementById('np-tel').value    = pedidoOriginal.tel || '';
    npOnTelInput(); // re-validar hint del teléfono
  }
 
  // ── Hora ──────────────────────────────────────────────────────
  const hora = pedidoOriginal.hora_entrega || '';
  document.getElementById('np-hora').value = hora;
  if (hora && hora.includes(':')) {
    const [h, m] = hora.split(':').map(Number);
    _npTimeH = h;
    _npTimeM = m;
  } else {
    _npTimeH = null;
    _npTimeM = null;
  }
  npTimeSync();
 
  // Si es Cuba con turnos, intentar marcar el turno correcto
  if (isCuba && hora) {
    const dd    = datos.dias[diaKey] || {};
    const corte = dd.corteHora || '15:00';
    if (hora === corte) {
      document.getElementById('np-t1')?.classList.add('active');
    } else if (hora === '18:00') {
      document.getElementById('np-t2')?.classList.add('active');
    }
  }
 
  // ── Productos ─────────────────────────────────────────────────
  // Clonar los productos para no mutar el original hasta guardar
  _npPedido = {
    id:       '__np__',
    productos: JSON.parse(JSON.stringify(pedidoOriginal.productos || [])),
  };
  npRenderProds();
  npRenderTotal();
 
  // ── Estado ────────────────────────────────────────────────────
  _npEstado = pedidoOriginal.estado || 'pendiente';
  const optEstado = document.getElementById('np-opt-estado');
  if (optEstado) {
    optEstado.textContent = NP_ESTADO_LABELS[_npEstado] || _npEstado;
    if (_npEstado !== 'pendiente') optEstado.classList.add('active');
  }
  // Marcar el botón correcto dentro del selector de estado
  document.querySelectorAll('#np-estado-sel .estado-opt').forEach(b => {
    b.className = 'estado-opt';
    if (b.dataset && b.dataset.estado === _npEstado) {
      b.className = 'estado-opt active-' + _npEstado;
    }
  });
 
  // ── Pago ─────────────────────────────────────────────────────
  _npPagado     = !!pedidoOriginal.pagado;
  _npMetodoPago = pedidoOriginal.metodoPago || '';
  npUiActualizarPagoPill();
 
  // Si hay método de pago, marcar el botón inline correspondiente
  if (_npPagado && _npMetodoPago) {
    const map = {
      '💵 Efectivo':      'np-pago-efectivo',
      '🏦 Transferencia': 'np-pago-transferencia',
      '💳 Otro':          'np-pago-otro',
    };
    const btnId = map[_npMetodoPago];
    if (btnId) document.getElementById(btnId)?.classList.add('active');
  }
 
  // ── Nota ─────────────────────────────────────────────────────
  const nota = pedidoOriginal.notas || '';
  const notaEl = document.getElementById('np-nota');
  if (notaEl) notaEl.value = nota;
  const optNota = document.getElementById('np-opt-nota');
  if (optNota) {
    if (nota) {
      optNota.textContent = '📝 ' + nota.slice(0, 22) + (nota.length > 22 ? '…' : '');
      optNota.classList.add('active');
    } else {
      optNota.textContent = '📝 Nota';
      optNota.classList.remove('active');
    }
  }
 
  // ── Título / botón guardar ────────────────────────────────────
  // Cambiar el texto del botón para que diga "Guardar cambios"
  const btnGuardar = document.getElementById('np-btn-guardar-header');
  if (btnGuardar) btnGuardar.textContent = '💾 Guardar cambios';
 
  npActualizarBtnGuardar();
}

// alias
function agregarPedido() { abrirModalNP(); }

function cerrarSelector() { document.getElementById("selector-overlay").classList.add("hidden"); }
let _libreTipo = "s";
function selLibreTipo(tipo) {
  _libreTipo = tipo;
  document.getElementById("libre-btn-s").style.cssText = `flex:1;padding:8px;border-radius:8px;font-size:.75rem;font-weight:600;cursor:pointer;border:1.5px solid ${tipo === "s" ? "var(--tacc-s)" : "var(--border)"};background:${tipo === "s" ? "var(--tacc-s-soft)" : "var(--bg)"};color:${tipo === "s" ? "var(--tacc-s)" : "var(--ink-mid)"};`;
  document.getElementById("libre-btn-c").style.cssText = `flex:1;padding:8px;border-radius:8px;font-size:.75rem;font-weight:600;cursor:pointer;border:1.5px solid ${tipo === "c" ? "var(--tacc-c)" : "var(--border)"};background:${tipo === "c" ? "var(--tacc-c-soft)" : "var(--bg)"};color:${tipo === "c" ? "var(--tacc-c)" : "var(--ink-mid)"};`;
}
function confirmarLibre() {
  const q = (document.getElementById("selector-search").value || "").trim();
  if (!q) return;
  seleccionarProducto({ nombre: q, tiene_talle: true, precio: 0 }, "libre", _libreTipo);
}
const CAT_ORDEN = ["tortas", "mousses", "bandejas", "cuadrados", "congelados", "otros"];
const CAT_LABELS = { tortas: "🎂 Tortas", mousses: "🍮 Mousses", bandejas: "🍫 Bandejas", cuadrados: "🟫 Cuadrados", congelados: "❄️ Congelados", otros: "✨ Otros" };
function renderSelectorLista() {
  const q = (document.getElementById("selector-search").value || "").toLowerCase().trim();
  const lista = document.getElementById("selector-lista");
  const libreWrap = document.getElementById("selector-libre-wrap");
  lista.innerHTML = "";
  function renderGrupo(items, tacc, pillHtml) {
    if (!items.length) return;
    const porCat = {};
    items.forEach(c => {
      const cat = c.categoria && CAT_ORDEN.includes(c.categoria) ? c.categoria : "otros";
      if (!porCat[cat]) porCat[cat] = [];
      porCat[cat].push(c);
    });
    CAT_ORDEN.forEach(cat => {
      if (!porCat[cat]) return;
      const sep = document.createElement("div");
      sep.className = "selector-sep";
      sep.textContent = (tacc === "s" ? "ST · " : "C · ") + CAT_LABELS[cat];
      lista.appendChild(sep);
      porCat[cat].sort((a, b) => a.nombre.localeCompare(b.nombre)).forEach(c => {
        const d = document.createElement("div");
        d.className = "selector-item";
        const pStr = c.precio ? `<span class="sel-precio">$${c.precio.toLocaleString("es-AR")}</span>` : "";
        d.innerHTML = `<span>${esc(c.nombre)}</span><div style="display:flex;gap:6px;align-items:center;">${pStr}${pillHtml}</div>`;
        d.onclick = () => seleccionarProducto(c, "catalogo", tacc);
        lista.appendChild(d);
      });
    });
  }
  const sinTacc = datos.catalogo.filter(c => c.tipo === "sin_tacc" && (!q || c.nombre.toLowerCase().includes(q)));
  const conTacc = datos.catalogo.filter(c => c.tipo === "con_tacc" && (!q || c.nombre.toLowerCase().includes(q)));
  renderGrupo(sinTacc, "s", '<span class="tacc-pill s">ST</span>');
  renderGrupo(conTacc, "c", '<span class="tacc-pill c">C</span>');
  const hayMatchExacto = datos.catalogo.some(c => c.nombre.toLowerCase() === q);
  libreWrap.style.display = (q && !hayMatchExacto) ? "" : "none";
  if (typeof kbClearHighlight === "function") kbClearHighlight();
}

function seleccionarProducto(cat, tipo, tacc) {
  const pedidoId = _selectorPedidoId;

  if (pedidoId === "__ed__") {
    if (!_edPedido) return;
    const prodId = _selectorProdId;
    if (prodId) {
      const r = _edPedido.productos.find(x => x.id === prodId);
      if (r) { r.nombre = cat.nombre; r.tipo = tipo; r.tacc = tacc; r.libre = tipo === "libre" ? cat.nombre : undefined; r.tamano = ""; r.listo = false; r.pedido_cuba = false; r.separado_cuba = false; }
    } else {
      _edPedido.productos.push(crearProductoBase({
        nombre: cat.nombre, tipo, tacc,
        libre: tipo === "libre" ? cat.nombre : undefined,
      }));
    }
    cerrarSelector();
    edRenderProds();
    return;
  }

  if (pedidoId === "__np__") {
    if (!_npPedido) _npPedido = { id: "__np__", productos: [] };
    const prodId = _selectorProdId;
    if (prodId) {
      const r = _npPedido.productos.find(x => x.id === prodId);
      if (r) { r.nombre = cat.nombre; r.tipo = tipo; r.tacc = tacc; r.libre = tipo === "libre" ? cat.nombre : undefined; r.tamano = ""; r.listo = false; r.pedido_cuba = false; r.separado_cuba = false; }
    } else {
      _npPedido.productos.push(crearProductoBase({
        nombre: cat.nombre, tipo, tacc,
        libre: tipo === "libre" ? cat.nombre : undefined,
      }));
    }
    cerrarSelector();
    npRenderProds();
    return;
  }

  const p = getAllPedidos().find(x => x.id === pedidoId);
  if (!p) return;
  const prodId = _selectorProdId;
  if (prodId) {
    const r = p.productos.find(x => x.id === prodId);
    if (r) { r.nombre = cat.nombre; r.tipo = tipo; r.tacc = tacc; r.libre = tipo === "libre" ? cat.nombre : undefined; r.tamano = ""; r.listo = false; r.pedido_cuba = false; r.separado_cuba = false; }
  } else {
    p.productos.push(crearProductoBase({
      nombre: cat.nombre, tipo, tacc,
      libre: tipo === "libre" ? cat.nombre : undefined,
    }));
  }
  cerrarSelector();
  guardar();
  renderPedidos();
}

// ── PAGO ──
function abrirModalPago(id, deshacer) {
  _pagoId = id;
  _pagoDeshacer = deshacer;
  _pagoMetodo = null;
  document.querySelectorAll(".modal-metodo").forEach(m => m.classList.remove("selected"));
  document.getElementById("modal-pago-titulo").textContent = deshacer ? "Deshacer pago" : "Confirmar pago";
  document.getElementById("modal-pago-desc").textContent = deshacer ? "¿Estás segura de deshacer el pago?" : "Seleccioná el método de pago.";
  document.getElementById("modal-pago").classList.remove("hidden");
}
function cerrarModalPago() { document.getElementById("modal-pago").classList.add("hidden"); }
function selMetodo(m, el) {
  _pagoMetodo = m;
  document.querySelectorAll(".modal-metodo").forEach(x => x.classList.remove("selected"));
  el.classList.add("selected");
}
function confirmarPago() {
  if (_pagoId === '__np__') {
    if (!_pagoMetodo) { alert('Seleccioná un método de pago.'); return; }
    _npPagado     = true;
    _npMetodoPago = _pagoMetodo;
    npUiActualizarPagoPill();   // ← única línea nueva
    cerrarModalPago();
    return;
  }
  if (_pagoId === "__ed__") {
    if (!_pagoMetodo) { alert("Seleccioná un método de pago."); return; }
    if (_edPedido) { _edPedido.pagado = true; _edPedido.metodoPago = _pagoMetodo; }
    const bar = document.getElementById("ed-pago-bar");
    if (bar) {
      bar.className = "pago-bar si";
      bar.innerHTML = "✅ Pagado · " + esc(_pagoMetodo) + " <button class=\"btn-pagar despagar\" onclick=\"edTogglePago()\">Deshacer</button>";
    }
    cerrarModalPago();
    return;
  }
  const p = getAllPedidos().find(x => x.id === _pagoId);
  if (!p) return;
  if (_pagoDeshacer) { p.pagado = false; p.metodoPago = ""; }
  else { if (!_pagoMetodo) { alert("Seleccioná un método de pago."); return; } p.pagado = true; p.metodoPago = _pagoMetodo; }
  cerrarModalPago();
  guardar();
  renderPedidos();
}

// ── MODAL GENÉRICO ──
function abrirModalGen(titulo, desc, cb, tipo = "danger") {
  _genCb = cb;
  document.getElementById("modal-gen-titulo").textContent = titulo;
  document.getElementById("modal-gen-desc").textContent = desc;
  const btn = document.getElementById("modal-gen-ok");
  btn.className = tipo === "danger" ? "modal-btn-danger" : "modal-btn-confirm";
  document.getElementById("modal-gen").classList.remove("hidden");
}
function cerrarModalGen() { document.getElementById("modal-gen").classList.add("hidden"); }
document.getElementById("modal-gen-ok").onclick = () => { cerrarModalGen(); if (_genCb) _genCb(); };

// ── MODAL EDICIÓN PEDIDO ──
let _edPedidoId = null;
let _edPedido = null;
let _edModo = "vista";

function abrirModalVista(pedidoId) {
  const pOrig = getAllPedidos().find(x => x.id === pedidoId);
  if (!pOrig) return;
  _edPedidoId = pedidoId;
  _edModo = "vista";
  _edPedido = JSON.parse(JSON.stringify(pOrig));
  edRenderBody();
  document.getElementById("ed-footer-vista").style.display = "";
  document.getElementById("ed-footer-edicion").style.display = "none";
  document.getElementById("modal-edicion").classList.remove("hidden");
}

function abrirModalEdicion(pedidoId) {
  const pOrig = getAllPedidos().find(x => x.id === pedidoId);
  if (!pOrig) return;
  _edPedidoId = pedidoId;
  _edModo = "edicion";
  _edPedido = JSON.parse(JSON.stringify(pOrig));
  edRenderBody();
  document.getElementById("ed-footer-vista").style.display = "none";
  document.getElementById("ed-footer-edicion").style.display = "";
  document.getElementById("modal-edicion").classList.remove("hidden");
}

function activarModoEdicion() {
  _edModo = "edicion";
  document.getElementById("ed-footer-vista").style.display = "none";
  document.getElementById("ed-footer-edicion").style.display = "";
  edRenderBody();
}

function volverModoVista() {
  const pOrig = getAllPedidos().find(x => x.id === _edPedidoId);
  if (pOrig) _edPedido = JSON.parse(JSON.stringify(pOrig));
  _edModo = "vista";
  document.getElementById("ed-footer-vista").style.display = "";
  document.getElementById("ed-footer-edicion").style.display = "none";
  edRenderBody();
}

function cerrarModalEdicion() {
  document.getElementById("modal-edicion").classList.add("hidden");
  _edPedidoId = null;
  _edPedido = null;
  _edModo = "vista";
}

function toggleCubaPedido(pedidoId, prodId) {
  const p = getAllPedidos().find(x => x.id === pedidoId);
  if (!p) return;
  const r = p.productos.find(x => x.id === prodId);
  if (!r) return;
  r.pedido_cuba = !r.pedido_cuba;
  guardar();
  renderPedidos();
  const cubaTab = document.getElementById("tab-cuba");
  if (cubaTab && cubaTab.classList.contains("active")) renderCuba();
}

function edRenderBody() {
  if (!_edPedido) return;
  if (_edModo === "vista") edRenderVista();
  else edRenderEdicion();
}

function edRenderVista() {
  const p = _edPedido;
  const isCuba = esCuba(p.cliente);
  const dd = diaData();
  const especial = dd.especial || false;
  const corte = dd.corteHora || "15:00";
  const estadoLabels = { pendiente: "⏳ Pendiente", prod: "🔧 En producción", listo: "✅ Listo", entregado: "📦 Retirado" };
  const estadoLabel = estadoLabels[p.estado || "pendiente"] || "⏳ Pendiente";
  const turnoLabel = isCuba && especial
    ? ((p.hora_entrega || "") > corte ? "🔵 Turno 2 — 18:00" : "🟠 Turno 1 — " + esc(corte))
    : (p.hora_entrega || "--:--");
  document.getElementById("ed-titulo").textContent = isCuba ? "🏪 Pedido Cuba" : "📋 Pedido";
  const body = document.getElementById("ed-body");
  body.innerHTML = "";
  if (isCuba) {
    const cuba = document.createElement("div");
    cuba.style.cssText = "background:var(--cuba-bg);border:1.5px solid var(--cuba-border);border-radius:var(--radius-sm);padding:7px 12px;font-size:.78rem;color:var(--cuba-ink);font-weight:500;margin-bottom:12px;";
    cuba.textContent = "🏪 Pedido de Cuba";
    body.appendChild(cuba);
  } else {
    const hdr = document.createElement("div");
    hdr.style.cssText = "display:flex;gap:5px;margin-bottom:12px;align-items:flex-start;";
    const left = document.createElement("div");
    left.style.flex = "1";
    const lblCli = document.createElement("div");
    lblCli.style.cssText = "font-size:.52rem;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-light);font-weight:600;margin-bottom:2px;";
    lblCli.textContent = "Cliente";
    const valCli = document.createElement("div");
    valCli.style.cssText = "font-size:.98rem;font-weight:600;";
    valCli.textContent = p.cliente_input || p.cliente || "Sin nombre";
    left.appendChild(lblCli);
    left.appendChild(valCli);
    if (p.tel) {
      const tel = document.createElement("div");
      tel.style.cssText = "font-size:.75rem;color:var(--ink-light);margin-top:1px;";
      tel.textContent = "📞 " + p.tel;
      left.appendChild(tel);
    }
    const right = document.createElement("div");
    right.style.cssText = "text-align:right;flex-shrink:0;";
    const lblH = document.createElement("div");
    lblH.style.cssText = "font-size:.52rem;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-light);font-weight:600;margin-bottom:2px;";
    lblH.textContent = "Hora";
    const valH = document.createElement("div");
    valH.style.cssText = "font-size:.95rem;font-weight:600;color:var(--accent);";
    valH.textContent = turnoLabel;
    right.appendChild(lblH);
    right.appendChild(valH);
    hdr.appendChild(left);
    hdr.appendChild(right);
    body.appendChild(hdr);
  }
  if (isCuba && especial) {
    const tr = document.createElement("div");
    tr.style.cssText = "margin-bottom:12px;";
    tr.innerHTML = '<div style="font-size:.52rem;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-light);font-weight:600;margin-bottom:4px;">Turno</div><div style="font-size:.9rem;font-weight:600;color:var(--accent);">' + turnoLabel + "</div>";
    body.appendChild(tr);
  }
  const prodLbl = document.createElement("div");
  prodLbl.style.cssText = "font-size:.52rem;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-light);font-weight:600;margin-bottom:4px;";
  prodLbl.textContent = "Productos";
  body.appendChild(prodLbl);
  const prodWrap = document.createElement("div");
  prodWrap.style.marginBottom = "12px";
  if (!p.productos || !p.productos.length) {
    prodWrap.innerHTML = '<div style="color:var(--ink-light);font-style:italic;font-size:.8rem;">Sin productos</div>';
  } else {
    p.productos.forEach(r => {
      const nom = r.tipo === "catalogo" ? r.nombre : r.libre;
      const _cantN = Number(r.cantidad);
      const cant = isNaN(_cantN) ? 1 : _cantN;
      const tam = r.tamano ? " · " + r.tamano : "";
      const row = document.createElement("div");
      row.style.cssText = "display:flex;align-items:center;gap:7px;padding:7px 0;border-bottom:1px solid var(--border);";
      const lstChk = document.createElement("div");
      lstChk.style.cssText = "width:18px;height:18px;border-radius:4px;border:1.5px solid " + (r.listo ? "var(--green)" : "var(--border)") + ";background:" + (r.listo ? "var(--green)" : "transparent") + ";display:flex;align-items:center;justify-content:center;font-size:10px;color:" + (r.listo ? "#fff" : "transparent") + ";flex-shrink:0;";
      lstChk.textContent = "✓";
      const pill = document.createElement("span");
      pill.className = "tacc-pill " + (r.tacc === "s" ? "s" : "c");
      pill.textContent = r.tacc === "s" ? "ST" : "C";
      const nomEl = document.createElement("span");
      nomEl.style.cssText = "flex:1;font-size:.85rem;" + (r.listo ? "color:var(--green-mid);text-decoration:line-through;" : "");
      nomEl.innerHTML = esc(nom || "(sin nombre)") + esc(tam) + " <strong>x" + cant + "</strong>";
      row.appendChild(lstChk);
      row.appendChild(pill);
      row.appendChild(nomEl);
      if (r.tacc === "c") {
        const cubaBtn = document.createElement("div");
        const on = r.pedido_cuba;
        cubaBtn.style.cssText = "width:20px;height:20px;border-radius:50%;border:2px solid " + (on ? "var(--accent)" : "var(--border)") + ";background:" + (on ? "var(--accent)" : "transparent") + ";display:flex;align-items:center;justify-content:center;font-size:10px;color:" + (on ? "#fff" : "transparent") + ";flex-shrink:0;cursor:pointer;transition:all .15s;";
        cubaBtn.textContent = "✓";
        cubaBtn.title = on ? "Pedido a Cuba ✓" : "Marcar como pedido a Cuba";
        const rid = r.id;
        cubaBtn.onclick = function () { vistaToggleCuba(rid); };
        row.appendChild(cubaBtn);
      }
      prodWrap.appendChild(row);
      if (r.nota_prod && r.nota_prod.trim()) {
        const notaRow = document.createElement("div");
        notaRow.style.cssText = "font-size:.68rem;color:var(--ink-light);font-style:italic;padding:1px 0 3px 44px;";
        notaRow.textContent = "↳ " + r.nota_prod;
        prodWrap.appendChild(notaRow);
      }
      if (r.extras && r.extras.length) {
        r.extras.forEach(ex => {
          if (!ex.precio && !ex.desc) return;
          const exRow = document.createElement("div");
          exRow.style.cssText = "font-size:.68rem;color:var(--amber);padding:1px 0 3px 44px;display:flex;align-items:center;gap:5px;";
          exRow.innerHTML = '<span>➕</span><span style="flex:1;">' + (ex.desc ? esc(ex.desc) : "extra") + "</span>" + (ex.precio ? "<strong>$" + Number(ex.precio).toLocaleString("es-AR") + "</strong>" : "");
          prodWrap.appendChild(exRow);
        });
      }
    });
  }
  body.appendChild(prodWrap);
  const totalPedido = calcularTotalPedido(p);
  if (totalPedido > 0) {
    const efectivo = Math.round(totalPedido * 0.9);
    const desgloseDivs = [];
    (p.productos || []).forEach(r => {
      const cat = datos.catalogo.find(c => c.nombre === r.nombre && ((r.tacc === "s" && c.tipo === "sin_tacc") || (r.tacc === "c" && c.tipo === "con_tacc")));
      const cant = Number(r.cantidad) || 1;
      const baseU = r.tipo === "libre" ? (r.precio_libre || 0) : getPrecioCat(cat, r.tamano);
      const extrasTotal = (r.extras || []).reduce((s, ex) => s + (parseFloat(ex.precio) || 0), 0);
      const totalR = (baseU * cant) + extrasTotal;
      if (!totalR) return;
      const nom = r.tipo === "catalogo" ? r.nombre : r.libre;
      const tam = r.tamano ? " · " + r.tamano : "";
      desgloseDivs.push(`<div style="display:flex;justify-content:space-between;font-size:.72rem;color:var(--ink-mid);margin-bottom:2px;">
        <span>${esc(nom || "")}${esc(tam)}${cant > 1 ? " x" + cant : ""}</span>
        <span>$${totalR.toLocaleString("es-AR")}</span>
      </div>`);
    });
    const totalBar = document.createElement("div");
    totalBar.style.cssText = "background:var(--green-soft,#eaf4ed);border:1.5px solid var(--green-mid,#4a8c5c);border-radius:var(--radius-sm);padding:10px 14px;margin-bottom:12px;";
    totalBar.innerHTML = (desgloseDivs.length > 1 ? `<div style="margin-bottom:7px;padding-bottom:7px;border-bottom:1px dashed var(--green-mid,#4a8c5c);">${desgloseDivs.join("")}</div>` : "") +
      `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <span style="font-size:.62rem;text-transform:uppercase;letter-spacing:.08em;color:var(--green-mid,#4a8c5c);font-weight:700;">Total</span>
          <span style="font-size:1.1rem;font-weight:700;color:var(--green-mid,#4a8c5c);font-family:'Lora',serif;">$${totalPedido.toLocaleString("es-AR")}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:.68rem;color:var(--ink-light);">💵 Efectivo (−10%)</span>
          <span style="font-size:.82rem;font-weight:600;color:var(--ink-mid);">$${efectivo.toLocaleString("es-AR")}</span>
        </div>`;
    body.appendChild(totalBar);
  }
  const estPago = document.createElement("div");
  estPago.style.cssText = "display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;";
  const estDiv = document.createElement("div");
  const estLbl = document.createElement("div");
  estLbl.style.cssText = "font-size:.52rem;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-light);font-weight:600;margin-bottom:3px;";
  estLbl.textContent = "Estado";
  const estVal = document.createElement("div");
  estVal.style.cssText = "font-size:.85rem;font-weight:500;";
  estVal.textContent = estadoLabel;
  estDiv.appendChild(estLbl);
  estDiv.appendChild(estVal);
  estPago.appendChild(estDiv);
  if (!isCuba) {
    const pagoDiv = document.createElement("div");
    pagoDiv.style.cssText = "font-size:.82rem;font-weight:500;" + (p.pagado ? "color:var(--green);" : "color:var(--ink-light);");
    pagoDiv.textContent = p.pagado ? "✅ Pagado " + (p.metodoPago || "") : "💳 Sin confirmar pago";
    estPago.appendChild(pagoDiv);
  }
  body.appendChild(estPago);
  if (p.notas) {
    const nota = document.createElement("div");
    nota.style.cssText = "background:var(--amber-soft);border:1.5px solid var(--amber);border-radius:var(--radius-sm);padding:8px 11px;font-size:.78rem;color:var(--amber);";
    nota.textContent = "📝 " + p.notas;
    body.appendChild(nota);
  }
}

function vistaToggleCuba(prodId) {
  const r = (_edPedido.productos || []).find(x => x.id === prodId);
  if (!r) return;
  r.pedido_cuba = !r.pedido_cuba;
  const pReal = getAllPedidos().find(x => x.id === _edPedidoId);
  if (pReal) {
    const rReal = (pReal.productos || []).find(x => x.id === prodId);
    if (rReal) rReal.pedido_cuba = r.pedido_cuba;
  }
  guardar();
  edRenderVista();
  renderPedidos();
  const cubaTab = document.getElementById("tab-cuba");
  if (cubaTab && cubaTab.classList.contains("active")) renderCuba();
}

function edRenderEdicion() {
  const p = _edPedido;
  const isCuba = esCuba(p.cliente);
  const dd = diaData();
  const especial = dd.especial || false;
  const corte = dd.corteHora || "15:00";
  const estado = p.estado || "pendiente";
  const estadoOpts = ["pendiente", "prod", "listo", "entregado"];
  const estadoLabels = { pendiente: "Pendiente", prod: "En producción", listo: "Listo", entregado: "Retirado" };
  const prodsHTML = p.productos.map((r, i) => edBuildProdRow(r, i)).join("");
  const pagadoBar = p.pagado
    ? '<div class="pago-bar si" id="ed-pago-bar">✅ Pagado · ' + esc(p.metodoPago || "") + ' <button class="btn-pagar despagar" onclick="edTogglePago()">Deshacer</button></div>'
    : '<div class="pago-bar no" id="ed-pago-bar">💳 Sin confirmar pago <button class="btn-pagar pagar" onclick="edTogglePago()">Confirmar</button></div>';
  const horaField = isCuba && especial
    ? '<div class="modal-np-campo"><label id="ed-hora-label">Turno de envío</label>'
      + '<div class="modal-np-turno-opts">'
      + '<div class="modal-np-turno-btn t1' + ((p.hora_entrega || "") <= corte && p.hora_entrega ? " active" : "") + '" id="ed-t1" onclick="edSelTurno(1,&quot;' + corte + '&quot;)">🟠 Turno 1 — ' + esc(corte) + '</div>'
      + '<div class="modal-np-turno-btn t2' + ((p.hora_entrega || "") > corte ? " active" : "") + '" id="ed-t2" onclick="edSelTurno(2,&quot;18:00&quot;)">🔵 Turno 2 — 18:00</div>'
      + '</div></div>'
    : isCuba ? ""
      : '<div class="modal-np-campo"><label>Hora de entrega</label>'
      + '<input type="time" id="ed-hora" value="' + esc(p.hora_entrega || "") + '" oninput="_edPedido.hora_entrega=this.value">'
      + '</div>';
  
  document.getElementById("ed-titulo").textContent = isCuba ? "✏️ Editar pedido Cuba" : "✏️ Editar pedido";
  document.getElementById("ed-body").innerHTML = 
    (isCuba
      ? '<div class="modal-np-campo"><div style="background:var(--cuba-bg);border:1.5px solid var(--cuba-border);border-radius:var(--radius-sm);padding:7px 12px;font-size:.78rem;color:var(--cuba-ink);font-weight:500;">🏪 Pedido de Cuba</div></div>'
      : '<div class="modal-np-campo">'
      + '<label>Cliente</label>'
      + '<div style="display:flex;gap:8px;">'
      + '<input type="text" id="ed-nombre" value="' + esc(p.cliente_input || p.cliente || "") + '" placeholder="Nombre..." style="flex:1.2;" oninput="_edPedido.cliente_input=this.value;_edPedido.cliente=normalizarCliente(this.value)" autocomplete="off">'
      + '<input type="tel" id="ed-tel" value="' + esc(p.tel || "") + '" placeholder="Teléfono..." style="flex:1;" oninput="_edPedido.tel=this.value">'
      + '</div>'
      + '</div>'
    )
    + horaField
    + '<div class="modal-np-campo">'
    + '<label>Productos</label>'
    + '<div id="ed-prods-wrap">' + prodsHTML + '</div>'
    + '<button class="btn-add-prod" onclick="edAgregarProducto()" style="margin-top:4px;">＋ Agregar producto</button>'
    + '</div>'
    + '<div style="height:1px;background:var(--border);margin:2px 0 12px;"></div>'
    + '<div class="modal-np-campo">'
    + '<label>Estado</label>'
    + '<div class="estado-sel" id="ed-estado-sel">'
    + estadoOpts.map(e => '<div class="estado-opt' + (estado === e ? " active-" + e : "") + '" onclick="edSelEstado(&quot;' + e + '&quot;,this)">' + estadoLabels[e] + '</div>').join("")
    + '</div>'
    + '</div>'
    + (isCuba ? "" : '<div class="modal-np-campo" id="ed-campo-pago">' + pagadoBar + '</div>')
    + '<div class="modal-np-campo">'
    + '<button class="nota-general-toggle" id="ed-nota-btn" onclick="edToggleNota()">📝 ' + (p.notas ? "Nota: " + esc(p.notas.slice(0, 40)) + (p.notas.length > 40 ? "…" : "") : "Agregar nota") + '</button>'
    + '<div id="ed-nota-wrap" style="' + (p.notas ? "display:block" : "display:none") + ';margin-top:6px;">'
    + '<textarea class="notas-input" id="ed-nota" placeholder="Sin dulce de leche...">' + esc(p.notas || "") + '</textarea>'
    + '</div>'
    + '</div>'
    + '<div class="modal-np-campo">'
    + '<div style="font-size:.56rem;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-light);font-weight:500;margin-bottom:6px;">Mover a otro día</div>'
    + '<div style="display:flex;gap:6px;flex-wrap:wrap;">' + buildMoverOptsEd(_edPedidoId) + '</div>'
    + '</div>'
    + '<div class="modal-np-error" id="ed-error"></div>';
}

function edBuildProdRow(r, i) {
  const cat = datos.catalogo.find(c => c.nombre === r.nombre && c.tipo === (r.tacc === "s" ? "sin_tacc" : "con_tacc"));
  const tieneTalle = r.tipo === "catalogo" ? (cat ? cat.tiene_talle : true) : true;
  const nom = r.tipo === "catalogo" ? r.nombre : r.libre;
  const pill = r.tacc === "s" ? '<span class="tacc-pill s">ST</span>' : '<span class="tacc-pill c">C</span>';
  const libreActivo = r._tamLibre || (!!(r.tamano) && !["Chico", "Mediano", "Grande"].includes(r.tamano));
  const sinTalleWarn = tieneTalle && !(r.tamano || "").trim() ? '<span style="font-size:.58rem;color:var(--red);font-weight:700;margin-left:4px;">⚠ TALLE</span>' : "";
  const tamHTML = tieneTalle ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:5px;">
    ${["Chico", "Mediano", "Grande"].map(t => `<button class="tam-btn${!libreActivo && r.tamano === t ? " active" : ""}" onclick="edSetTamano('${r.id}','${t}')">${t}</button>`).join("")}
    <button class="tam-btn tam-btn-libre${libreActivo ? " active" : ""}" onclick="edSetTamano('${r.id}','__libre__')">Libre</button>
  </div>
  <input type="text" class="tam-libre-input${libreActivo ? " visible" : ""}" value="${esc(libreActivo && r.tamano ? r.tamano : "")}" placeholder="ej: 2kg..." oninput="edSetTamanoLibre('${r.id}',this.value)">` : "";
  return `<div class="prod-edit-fila" id="ed-prod-${r.id}">
    <div class="prod-edit-top">
      <div class="prod-listo-chk${r.listo ? " on" : ""}" onclick="edToggleProdListo('${r.id}')">✓</div>
      <div class="prod-edit-nombre${r.tipo === "libre" ? " libre" : ""}">${esc(nom || "(sin nombre)")}</div>
      ${pill}

      <button class="btn-remove-prod" onclick="edEliminarProd('${r.id}')">✕</button>
    </div>
    <div class="prod-mid-row">
      <div class="prod-mid-cant">
        <button class="cant-btn" onclick="edAjustarCant('${r.id}',-1)">−</button>
        <span style="font-size:.88rem;min-width:20px;text-align:center;">${(() => { const _n = Number(r.cantidad); return isNaN(_n) ? 1 : _n; })()}</span>
        <button class="cant-btn" onclick="edAjustarCant('${r.id}',1)">＋</button>
      </div>
      ${tieneTalle ? `<div class="prod-mid-talle">
        ${["Chico", "Mediano", "Grande"].map(t => `<button class="tam-btn${!libreActivo && r.tamano === t ? " active" : ""}" onclick="edSetTamano('${r.id}','${t}')">${t}</button>`).join("")}
        <button class="tam-btn tam-btn-libre${libreActivo ? " active" : ""}" onclick="edSetTamano('${r.id}','__libre__')">Libre</button>
      </div>` : ""}
      ${sinTalleWarn}
    </div>
    ${tieneTalle ? `<input type="text" class="tam-libre-input${libreActivo ? " visible" : ""}" value="${esc(libreActivo && r.tamano ? r.tamano : "")}" placeholder="ej: 2kg..." oninput="edSetTamanoLibre('${r.id}',this.value)" style="margin-top:4px;">` : ""}
    <div style="padding-top:4px;">
      <button class="prod-nota-toggle" onclick="edToggleNotaProd('${r.id}')">${r.nota_prod ? "✏️ " + esc(r.nota_prod) : "＋ Nota del producto"}</button>
      <textarea class="prod-nota-textarea${r.nota_prod ? " visible" : ""}" id="ed-nota-prod-${r.id}" placeholder="ej: sin glaseado, con fruta..." oninput="edSetNotaProd('${r.id}',this.value)">${esc(r.nota_prod || "")}</textarea>
    </div>
  </div>`;
}

function edSelEstado(estado, el) {
  _edPedido.estado = estado;
  document.querySelectorAll("#ed-estado-sel .estado-opt").forEach(b => b.className = "estado-opt");
  el.className = "estado-opt active-" + estado;
}

function edTogglePago() {
  if (!_edPedido.pagado) {
    _pagoId = "__ed__";
    _pagoDeshacer = false;
    _pagoMetodo = null;
    document.querySelectorAll(".modal-metodo").forEach(m => m.classList.remove("selected"));
    document.getElementById("modal-pago-titulo").textContent = "Confirmar pago";
    document.getElementById("modal-pago-desc").textContent = "Seleccioná el método de pago.";
    document.getElementById("modal-pago").classList.remove("hidden");
  } else {
    _edPedido.pagado = false;
    _edPedido.metodoPago = "";
    const bar = document.getElementById("ed-pago-bar");
    if (bar) {
      bar.className = "pago-bar no";
      bar.innerHTML = "💳 Sin confirmar pago <button class=\"btn-pagar pagar\" onclick=\"edTogglePago()\">Confirmar</button>";
    }
  }
}

function edToggleNota() {
  const wrap = document.getElementById("ed-nota-wrap");
  const visible = wrap.style.display !== "none";
  wrap.style.display = visible ? "none" : "block";
  if (!visible) document.getElementById("ed-nota").focus();
}

function edSelTurno(n, hora) {
  _edPedido.hora_entrega = hora;
  document.getElementById("ed-t1").classList.toggle("active", n === 1);
  document.getElementById("ed-t2").classList.toggle("active", n === 2);
}

function edToggleProdListo(rId) {
  const r = _edPedido.productos.find(x => x.id === rId);
  if (!r) return;
  r.listo = !r.listo;
  edRenderProds();
}

function edAjustarCant(rId, delta) {
  const r = _edPedido.productos.find(x => x.id === rId);
  if (!r) return;
  r.cantidad = Math.max(1, (() => { const _n = Number(r.cantidad); return isNaN(_n) ? 1 : _n; })() + delta);
  edRenderProds();
}

function edSetTamano(rId, tam) {
  const r = _edPedido.productos.find(x => x.id === rId);
  if (!r) return;
  if (tam === "__libre__") {
    r._tamLibre = true;
  } else {
    r.tamano = tam;
    r._tamLibre = false;
  }
  edRenderProds();
}

function edSetTamanoLibre(rId, val) {
  const r = _edPedido.productos.find(x => x.id === rId);
  if (!r) return;
  r.tamano = val;
  r._tamLibre = true;
}

function edToggleNotaProd(rId) {
  const ta = document.getElementById("ed-nota-prod-" + rId);
  if (!ta) return;
  const visible = ta.classList.contains("visible");
  ta.classList.toggle("visible", !visible);
  if (!visible) ta.focus();
  const r = _edPedido.productos.find(x => x.id === rId);
  const btn = ta.previousElementSibling;
  if (btn && r) btn.textContent = r.nota_prod ? "✏️ " + r.nota_prod : "＋ Nota del producto";
}

function edSetNotaProd(rId, val) {
  const r = _edPedido.productos.find(x => x.id === rId);
  if (!r) return;
  r.nota_prod = val;
  const ta = document.getElementById("ed-nota-prod-" + rId);
  if (ta && ta.previousElementSibling) ta.previousElementSibling.textContent = val ? "✏️ " + val : "＋ Nota del producto";
}

function edEliminarProd(rId) {
  _edPedido.productos = _edPedido.productos.filter(x => x.id !== rId);
  edRenderProds();
}

function edCambiarProd(rId) {
  _selectorPedidoId = "__ed__";
  _selectorProdId = rId;
  document.getElementById("selector-search").value = "";
  renderSelectorLista();
  document.getElementById("selector-overlay").classList.remove("hidden");
}

function edAgregarProducto() {
  _selectorPedidoId = "__ed__";
  _selectorProdId = null;
  document.getElementById("selector-search").value = "";
  renderSelectorLista();
  document.getElementById("selector-overlay").classList.remove("hidden");
}

function edRenderProds() {
  const wrap = document.getElementById("ed-prods-wrap");
  if (!wrap) return;
  wrap.innerHTML = _edPedido.productos.map((r, i) => edBuildProdRow(r, i)).join("");
}

function buildMoverOptsEd(pedidoId) {
  const otrosDias = Object.keys(datos.dias).filter(k => k !== diaActual).sort();
  if (!otrosDias.length) return '<span style="font-size:.7rem;color:var(--ink-light);font-style:italic;">No hay otros días.</span>';
  const hoy = fechaKey(new Date());
  return otrosDias.map(k => {
    const [y, m, d] = k.split("-").map(Number);
    const f = new Date(y, m - 1, d);
    const label = k === hoy ? `Hoy ${d}/${m}` : `${DIAS_S[f.getDay()]} ${d}/${m}`;
    return `<div class="mover-dia-opt" onclick="moverPedidoDesdeEdicion('${pedidoId}','${k}')">${label}</div>`;
  }).join("");
}

function moverPedidoDesdeEdicion(pedidoId, diaDestino) {
  cerrarModalEdicion();
  moverPedido(pedidoId, diaDestino);
}

function confirmarEliminarDesdeEdicion() {
  cerrarModalEdicion();
  confirmarEliminar(_edPedidoId || "");
}

function guardarEdicion() {
  if (!_edPedido || !_edPedidoId) return;
  const isCuba = esCuba(_edPedido.cliente);
  const errDiv = document.getElementById("ed-error");
  const notaTA = document.getElementById("ed-nota");
  if (notaTA) _edPedido.notas = notaTA.value;
  const errores = [];
  if (!isCuba && !(_edPedido.cliente_input || _edPedido.cliente || "").trim()) errores.push("Falta el nombre del cliente");
  if (!isCuba && !(_edPedido.hora_entrega || "").trim()) errores.push("Falta la hora de entrega");
  if (!_edPedido.productos || !_edPedido.productos.length) errores.push("Agregá al menos un producto");
  if (errores.length) {
    errDiv.innerHTML = "⚠️ " + errores.join(" · ");
    errDiv.style.display = "";
    return;
  }
  const sinTalleEd = (_edPedido.productos || []).filter(r => {
    const cat = datos.catalogo.find(c => c.nombre === r.nombre && c.tipo === (r.tacc === "s" ? "sin_tacc" : "con_tacc"));
    const obliga = r.tipo === "catalogo" ? (cat ? cat.tiene_talle : false) : false;
    return obliga && !(r.tamano || "").trim();
  });
  if (sinTalleEd.length) {
    const noms = sinTalleEd.map(r => r.nombre).join(", ");
    errDiv.innerHTML = "⚠️ Completá el talle de: <strong>" + esc(noms) + "</strong>";
    errDiv.style.display = "";
    return;
  }
  _edPedido.productos.forEach(r => { delete r._tamLibre; });
  guardarPedido(_edPedido);
  mostrarToastGuardado();
  cerrarModalEdicion();
  renderPedidos();
  const prodTab = document.getElementById("tab-produccion");
  if (prodTab && prodTab.classList.contains("active")) renderProduccion();
}

// ABRE CALENDARIO 

/* ── CALENDARIO "OTRO DÍA" ── */
let _npCalViewDate = null;
let _npCalCustomDate = null;

function npAbrirCalendario() {
  if (!_npCalViewDate) {
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    _npCalViewDate = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  }
  const btn = document.getElementById('np-dia-otro');
  const pop = document.getElementById('np-cal-popover');
  if (!pop || !btn) return;
  const rect = btn.getBoundingClientRect();
  const popW = 256;
  let left = rect.left;
  if (left + popW > window.innerWidth - 8) left = window.innerWidth - popW - 8;
  pop.style.top  = (rect.bottom + 6) + 'px';
  pop.style.left = left + 'px';
  _npRenderCalendario();
  pop.style.display = '';
}
function _npCerrarCalendario() {
  const pop = document.getElementById('np-cal-popover');
  if (pop) { pop.style.display = 'none'; pop.style.visibility = ''; }
}

function _npRenderCalendario() {
  const pop = document.getElementById('np-cal-popover');
  if (!pop) return;
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const y = _npCalViewDate.getFullYear();
  const m = _npCalViewDate.getMonth();
  const DIAS_S_CAL = ['Lu','Ma','Mi','Ju','Vi','Sá','Do'];
  const MESES_CAL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                     'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const primerDia = new Date(y, m, 1);
  const startDow = (primerDia.getDay() + 6) % 7; // Lunes = 0
  const diasEnMes = new Date(y, m + 1, 0).getDate();

  let cells = DIAS_S_CAL.map(d =>
    `<div class="np-cal-dow">${d}</div>`).join('');

  for (let i = 0; i < startDow; i++)
    cells += `<div class="np-cal-day empty"></div>`;

  for (let d = 1; d <= diasEnMes; d++) {
    const fecha = new Date(y, m, d);
    const isPast = fecha < hoy;
    const isToday = fecha.getTime() === hoy.getTime();
    const isSel = _npCalCustomDate && fecha.getTime() === _npCalCustomDate.getTime();
    let cls = 'np-cal-day';
    if (isPast) cls += ' past';
    if (isToday) cls += ' today';
    if (isSel) cls += ' selected';
    const onclick = isPast ? '' : `onclick="_npSelFecha(${y},${m},${d})"`;
    cells += `<div class="${cls}" ${onclick}>${d}</div>`;
  }

  pop.innerHTML = `
    <div class="np-cal-header">
      <button class="np-cal-nav" onclick="_npNavCal(-1)">◀</button>
      <span class="np-cal-month-title">${MESES_CAL[m]} ${y}</span>
      <button class="np-cal-nav" onclick="_npNavCal(1)">▶</button>
    </div>
    <div class="np-cal-grid">${cells}</div>
  `;
}

function _npNavCal(delta) {
  _npCalViewDate = new Date(
    _npCalViewDate.getFullYear(),
    _npCalViewDate.getMonth() + delta, 1);
  _npRenderCalendario();
}

function _npSelFecha(y, m, d) {
  _npCalCustomDate = new Date(y, m, d);
  const DIAS_S_CAL = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const MESES_S = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const label = `${DIAS_S_CAL[_npCalCustomDate.getDay()]} ${d} ${MESES_S[m]}`;

  // Construir la fecha key YYYY-MM-DD
  const key = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  // Asegurarse de que el día existe en datos
  if (!datos.dias[key]) { datos.dias[key] = { pedidos: [], ventas: [] }; guardar(); }

  // Actualizar pill
  const pill = document.getElementById('np-dia-otro');
  if (pill) {
    const span = pill.querySelector('#np-lbl-otro') || pill.querySelector('span');
    if (span) span.textContent = label;
    pill.classList.add('sel');
  }

  // Marcar como día seleccionado en la lógica de NP
  npSelDia('otro', document.getElementById('np-dia-otro'), key);
  _npCerrarCalendario();
}

// Cerrar buscador de productos al hacer click fuera del área de búsqueda
document.addEventListener('click', function(e) {
  const wrap = document.getElementById('np-search-prod-wrap');
  if (!wrap || wrap.contains(e.target)) return;
  const results = document.getElementById('np-search-prod-results');
  if (results) results.style.display = 'none';
  npSearchActualizarFlecha(false);
});

// Cerrar calendario al hacer click afuera
document.addEventListener('click', function(e) {
  const pop = document.getElementById('np-cal-popover');
  if (!pop || pop.style.display === 'none') return;
  if (!e.target.closest('#np-cal-popover') && !e.target.closest('#np-dia-otro')) {
    _npCerrarCalendario();
  }
});

// ================================================================
//  PARCHES — nuevopedido-patches.js
//  Cargar DESPUÉS de nuevopedido.js
//  Tareas: 1 (frecuentes), 3 (pago inline), 4 (nota guardar), 5 (suspendido)
// ================================================================


// ── TAREA 1: Clientes frecuentes ─────────────────────────────────

function npToggleFrecuentes() {
  const list = document.getElementById('np-frecuentes-list');
  const ac   = document.getElementById('np-autocomp');

  // Si ya está visible, cerrarlo
  if (list.style.display !== 'none') {
    list.style.display = 'none';
    return;
  }

  // Cerrar autocompletado si estaba abierto
  ac.style.display = 'none';

  const frecuentes = (datos.clientes || [])
    .filter(c => c.frecuente && !esCuba(c.nombre))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  if (!frecuentes.length) {
    list.innerHTML = `<div style="padding:10px 12px;font-size:.78rem;
                       color:var(--ink-light);font-style:italic;">
                       Sin clientes frecuentes aún.</div>`;
  } else {
    list.innerHTML = frecuentes.map(c => `
      <div style="padding:9px 12px;border-bottom:1px solid var(--border);
                  font-size:.82rem;cursor:pointer;display:flex;
                  align-items:center;justify-content:space-between;
                  transition:background .1s;"
           onmouseover="this.style.background='var(--accent-soft,rgba(0,229,160,.08))'"
           onmouseout="this.style.background=''"
           onmousedown="event.preventDefault();
                        _npSeleccionandoAutocomp=true;
                        npSelAutocompById('${c.id}');
                        document.getElementById('np-frecuentes-list').style.display='none';"
           ontouchstart="event.preventDefault();
                         _npSeleccionandoAutocomp=true;
                         npSelAutocompById('${c.id}');
                         document.getElementById('np-frecuentes-list').style.display='none';">
        <span>⭐ <strong>${esc(c.nombre)}</strong></span>
        <span style="font-size:.68rem;color:var(--ink-light)">${esc(c.tel || '')}</span>
      </div>`).join('');
  }

  list.style.display = '';
}

// Cerrar lista frecuentes al hacer click fuera
document.addEventListener('click', function(e) {
  const list = document.getElementById('np-frecuentes-list');
  const btn  = document.getElementById('np-btn-frecuentes');
  if (!list || !btn) return;
  if (!list.contains(e.target) && e.target !== btn) {
    list.style.display = 'none';
  }
});


// ── TAREA 3: Pago inline (reemplaza npUiTogglePago que abría modal) ──

function npInlineTogglePago() {
  const wrap = document.getElementById('np-pago-wrap');

  // Si ya estaba pagado: click en la pill lo deshace
  if (_npPagado) {
    _npPagado     = false;
    _npMetodoPago = '';
    document.querySelectorAll('.np-pago-opt').forEach(b => b.classList.remove('active'));
    npUiActualizarPagoPill();
    wrap.style.display = 'none';
    return;
  }

  // Cerrar nota/estado si están abiertos
  document.getElementById('np-nota-wrap').style.display   = 'none';
  document.getElementById('np-estado-wrap').style.display = 'none';

  // Toggle del panel
  const visible = wrap.style.display !== 'none';
  wrap.style.display = visible ? 'none' : '';
}

function npInlineSelPago(metodo) {
  _npPagado     = true;
  _npMetodoPago = metodo;

  // Marcar la pill elegida
  document.querySelectorAll('.np-pago-opt').forEach(b => b.classList.remove('active'));
  const map = {
    '💵 Efectivo':      'np-pago-efectivo',
    '🏦 Transferencia': 'np-pago-transferencia',
    '💳 Otro':          'np-pago-otro',
  };
  const btn = document.getElementById(map[metodo]);
  if (btn) btn.classList.add('active');

  npUiActualizarPagoPill();
  document.getElementById('np-pago-wrap').style.display = 'none';
}

// También hay que resetear el panel de pago al abrir modal NP.
// Wrapeamos abrirModalNP para hacer el reset adicional.
(function() {
  const _orig = abrirModalNP;
  abrirModalNP = function() {
    _orig.apply(this, arguments);
    // Reset panel pago inline
    const wrap = document.getElementById('np-pago-wrap');
    if (wrap) wrap.style.display = 'none';
    document.querySelectorAll('.np-pago-opt').forEach(b => b.classList.remove('active'));
    // Reset lista frecuentes
    const fl = document.getElementById('np-frecuentes-list');
    if (fl) fl.style.display = 'none';
  };
})();


// ── TAREA 4: Guardar nota con confirmación visual ─────────────────

function npGuardarNota() {
  const val  = (document.getElementById('np-nota').value || '').trim();
  const pill = document.getElementById('np-opt-nota');

  // Actualizar pill (la nota se leerá realmente en confirmarNP)
  if (val) {
    pill.textContent = '📝 ' + val.slice(0, 22) + (val.length > 22 ? '…' : '');
    pill.classList.add('active');
  } else {
    pill.textContent = '📝 Nota';
    pill.classList.remove('active');
  }

  document.getElementById('np-nota-wrap').style.display = 'none';
}


// ── TAREA 5: Agregar 'suspendido' al mapa de labels ───────────────
// (por si no estaba en la versión de nuevopedido.js cargada)

if (typeof NP_ESTADO_LABELS !== 'undefined' && !NP_ESTADO_LABELS.suspendido) {
  NP_ESTADO_LABELS.suspendido = '🚫 Suspendido';
}