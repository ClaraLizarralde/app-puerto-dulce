// ── MODAL NUEVO PEDIDO ──

let _npDia='hoy';
let _npDiaKey=null;
let _npPedido=null; // objeto temporal — nunca en datos[] hasta confirmar
let _npPagado=false;
let _npMetodoPago='';
let _npEstado='pendiente';
let _npSeleccionandoAutocomp=false;

// ── Normalización teléfono argentino ──
function npNormalizarTel(raw){
  if(!raw||!raw.trim())return{valido:false,hint:'',tipo:null,normalizado:''};
  // Aceptar literalmente cualquier texto no vacío si tiene al menos 6 dígitos
  const digits=raw.replace(/\D/g,'');
  if(!digits)return{valido:false,hint:'No tiene dígitos',tipo:null,normalizado:''};
  let local=digits;
  // Quitar prefijo internacional argentino
  if(local.startsWith('549'))local=local.slice(3);
  else if(local.startsWith('54'))local=local.slice(2);
  else if(local.startsWith('0'))local=local.slice(1);
  // Celular 15: quitar el "15" si está luego de 2 dígitos de área
  // Aceptamos: 6 dígitos mínimo (línea fija local sin área), hasta 11
  if(local.length<6)return{valido:false,hint:'Faltan dígitos (mínimo 6)',tipo:null,normalizado:''};
  if(local.length>11)return{valido:false,hint:'Formato no reconocido (demasiados dígitos)',tipo:null,normalizado:''};
  let tipo,normalizado;
  if(local.length<=8){
    // Línea fija sin código de área — devolver tal cual con +54
    tipo='linea';normalizado='+54'+local;
  } else if(local.length===9){
    tipo='linea';normalizado='+54'+local;
  } else if(local.length===10){
    // 10 dígitos: código de área + número. Puede ser celular o fijo.
    tipo='linea_o_celular';normalizado='+54'+local;
  } else if(local.length===11){
    // 11 dígitos: posible celular con 15 en el medio
    const area2=local.slice(0,2);
    if(local.slice(2,4)==='15'){
      normalizado='+549'+area2+local.slice(4);
    } else {
      normalizado='+549'+local;
    }
    tipo='celular';
  } else {
    normalizado='+54'+local;tipo='linea';
  }
  return{valido:true,hint:normalizado,tipo,normalizado};
}

function npOnTelInput(){
  const raw=document.getElementById('np-tel').value;
  const hint=document.getElementById('np-tel-hint');
  if(!raw.trim()){hint.textContent='';hint.className='np-hint';return;}
  const r=npNormalizarTel(raw);
  if(r.valido){
    const ico=r.tipo==='celular'?'📱':(r.tipo==='linea_o_celular'?'📞':'☎️');
    hint.textContent=ico+' '+r.normalizado;
    hint.className='np-hint ok';
  } else {
    hint.textContent=r.hint;
    hint.className='np-hint err';
  }
}

function npDiaKeyDesde(cual){
  const hoy=new Date();
  if(cual==='hoy')return fechaKey(hoy);
  if(cual==='manana'){const d=new Date(hoy);d.setDate(hoy.getDate()+1);return fechaKey(d);}
  return null;
}

function npLabels(){
  const hoy=new Date();
  const man=new Date(hoy);man.setDate(hoy.getDate()+1);
  const DIAS_CORTO=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  document.getElementById('np-lbl-hoy').textContent=DIAS_CORTO[hoy.getDay()]+' '+hoy.getDate();
  document.getElementById('np-lbl-man').textContent=DIAS_CORTO[man.getDay()]+' '+man.getDate();
}

function npAbrirCustomDia(){
  const inp=document.getElementById('np-dia-custom');
  if(!inp)return;
  // Mostrar input con tamaño real para que el picker nativo funcione
  inp.style.cssText='position:static;width:100%;height:36px;opacity:1;pointer-events:auto;font-family:Outfit,sans-serif;font-size:.85rem;border:1.5px solid var(--accent);border-radius:var(--radius-sm);padding:4px 8px;background:var(--paper);color:var(--ink);margin-top:6px;display:block;';
  inp.focus();
  // Ocultar de nuevo al elegir o perder foco
  function hide(){
    inp.style.cssText='position:absolute;width:0;height:0;opacity:0;pointer-events:none;';
    inp.removeEventListener('change',hide);
    inp.removeEventListener('blur',hide);
  }
  inp.addEventListener('change',hide);
  inp.addEventListener('blur',hide);
}

function npAbrirOtroDia(){
  // El input date está embebido en el botón (position:absolute, opacity:0).
  // El click en el botón ya abre el picker nativo. Solo necesitamos
  // marcar el botón como activo si ya hay fecha elegida.
  // Si el panel anterior existe, limpiarlo (compatibilidad)
  const panelViejo=document.getElementById('np-otro-dia-panel');
  if(panelViejo)panelViejo.style.display='none';
}

function npOtroSelOpc(cual){
  const panel=document.getElementById('np-otro-dia-panel');
  panel.style.display='none';
  _npDia='otro';
  const hoy=new Date();
  let fecha;
  if(cual==='hoy'){fecha=new Date();}
  else if(cual==='manana'){fecha=new Date();fecha.setDate(fecha.getDate()+1);}
  else return;
  _npDiaKey=fechaKey(fecha);
  const DIAS_CORTO=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  document.getElementById('np-lbl-otro').textContent=DIAS_CORTO[fecha.getDay()]+' '+fecha.getDate()+'/'+String(fecha.getMonth()+1).padStart(2,'0');
  document.querySelectorAll('.modal-np-dia-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('np-dia-hoy').classList.remove('active');
  document.getElementById('np-dia-man').classList.remove('active');
  document.getElementById('np-dia-otro').classList.add('active');
  npActualizarHorario();
}

function npSelDia(cual,el){
  _npDia=cual;
  document.querySelectorAll('.modal-np-dia-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  _npDiaKey=npDiaKeyDesde(cual);
  npActualizarHorario();
}

function npOnCustomDia(){
  const val=document.getElementById('np-dia-custom').value;
  if(!val)return;
  _npDia='otro';_npDiaKey=val;
  const [y,m,d]=val.split('-').map(Number);
  const f=new Date(y,m-1,d);
  const DIAS_CORTO=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const label=DIAS_CORTO[f.getDay()]+' '+d+'/'+m;
  const lblOtro=document.getElementById('np-lbl-otro');
  if(lblOtro)lblOtro.textContent=label;
  document.querySelectorAll('.modal-np-dia-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('np-dia-otro').classList.add('active');
  npActualizarHorario();
}

function npActualizarHorario(){
  const nomEl=document.getElementById('np-nombre');
  const campHora=document.getElementById('np-campo-hora');
  const clockWrap=document.getElementById('np-clock-wrap');
  const turnosWrap=document.getElementById('np-turnos-wrap');
  // si el modal no está abierto, los elementos no existen todavía
  if(!campHora||!turnosWrap) return;
  const val=(nomEl?nomEl.value||'':'').trim();
  const isCuba=val.toLowerCase().includes('cuba');
  if(!_npDiaKey){
    campHora.style.display=isCuba?'none':'';
    if(clockWrap)clockWrap.style.display='';
    turnosWrap.style.display='none';
    return;
  }
  const dd=datos.dias[_npDiaKey];
  const esEspecial=dd&&dd.especial;
  if(isCuba){
    if(esEspecial){
      campHora.style.display='';
      const lbl=document.getElementById('np-hora-label');if(lbl)lbl.textContent='Turno de envío';
      if(clockWrap)clockWrap.style.display='none';
      turnosWrap.style.display='';
      const corte=dd.corteHora||'15:00';
      const t1=document.getElementById('np-t1');if(t1)t1.textContent='🟠 Turno 1 — '+corte;
      const t2=document.getElementById('np-t2');if(t2)t2.textContent='🔵 Turno 2 — 18:00';
    } else {
      campHora.style.display='none';
    }
  } else {
    campHora.style.display='';
    const lbl=document.getElementById('np-hora-label');if(lbl)lbl.textContent='Horario de entrega';
    if(clockWrap)clockWrap.style.display='';
    turnosWrap.style.display='none';
    npTimeSync();
  }
}

// ── TIME PICKER ──
let _npTimeH = null;
let _npTimeM = null;
let _npIsMobile = false;

function npDetectMobile(){
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}

// ── TIME PICKER ──
// Genera lista de horarios según el horario del local activo y el día seleccionado
function getHorariosParaDia(fechaStr){
  // fechaStr: 'YYYY-MM-DD' o null para hoy
  const localId = datos.localId || 'matienzo';
  const horarios = datos.horariosLocales || HORARIOS_DEFAULT;
  const horLocal = horarios[localId] || horarios['matienzo'];
  let diaSemana;
  if(fechaStr){
    // parsear sin timezone (evitar off-by-one)
    const [y,mo,d] = fechaStr.split('-').map(Number);
    diaSemana = new Date(y, mo-1, d).getDay();
  } else {
    diaSemana = new Date().getDay();
  }
  return horLocal[diaSemana] || null; // null = cerrado
}

function getHorarioActual(){
  // Usa _npDiaKey si está disponible (modal abierto), sino hoy
  const fechaStr = (typeof _npDiaKey !== 'undefined' && _npDiaKey) ? _npDiaKey : new Date().toISOString().slice(0,10);
  return getHorariosParaDia(fechaStr);
}

function buildHorarioSlots(horario){
  // Devuelve array de {h,m,label} dentro del rango del horario
  const slots = [];
  if(!horario) return slots;
  const [oh, om] = horario.open.split(':').map(Number);
  const [ch, cm] = horario.close.split(':').map(Number);
  const openMin = oh*60+om;
  const closeMin = ch*60+cm;
  for(let h = 0; h <= 23; h++){
    for(let m of [0,15,30,45]){
      const totalMin = h*60+m;
      if(totalMin >= openMin && totalMin <= closeMin){
        slots.push({ h, m, label: String(h).padStart(2,'0')+':'+String(m).padStart(2,'0') });
      }
    }
  }
  return slots;
}

function npBuildDropdown(){
  const list = document.getElementById('np-tp-list');
  if(!list) return;
  // Siempre rebuildeamos (puede cambiar el día seleccionado)
  list.innerHTML = '';
  const horario = getHorarioActual();
  // Si está cerrado, mostrar mensaje
  if(!horario){
    const div = document.createElement('div');
    div.className = 'tp-dropdown-item tp-closed-msg';
    div.textContent = '🔒 Local cerrado este día';
    div.style.cssText = 'color:var(--ink-light);font-style:italic;cursor:default;text-align:center;padding:12px;';
    list.appendChild(div);
    return;
  }
  const slots = buildHorarioSlots(horario);
  slots.forEach(({h, m, label}) => {
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

function npOpenDropdown(){
  npBuildDropdown();
  const pop = document.getElementById('np-tp-selects');
  const btn = document.getElementById('np-tp-btn');
  if(!pop) return;
  pop.classList.remove('hidden');
  if(btn) btn.classList.add('open');
  // marcar seleccionado y hacer scroll
  const list = document.getElementById('np-tp-list');
  let scrollTarget = null;
  list.querySelectorAll('.tp-dropdown-item').forEach(el => {
    const match = parseInt(el.dataset.h)===_npTimeH && parseInt(el.dataset.m)===_npTimeM;
    el.classList.toggle('selected', match);
    if(match) scrollTarget = el;
  });
  if(scrollTarget) setTimeout(()=>scrollTarget.scrollIntoView({block:'nearest'}), 0);
  // cerrar al click fuera
  setTimeout(()=>{
    function onOutside(e){
      const pop2 = document.getElementById('np-tp-selects');
      const btn2 = document.getElementById('np-tp-btn');
      if(pop2 && btn2 && !pop2.contains(e.target) && !btn2.contains(e.target)){
        npCloseDropdown();
        document.removeEventListener('mousedown', onOutside, true);
      }
    }
    document.addEventListener('mousedown', onOutside, true);
  }, 0);
}

function npCloseDropdown(){
  const pop = document.getElementById('np-tp-selects');
  const btn = document.getElementById('np-tp-btn');
  if(pop) pop.classList.add('hidden');
  if(btn) btn.classList.remove('open');
}

function npOpenTimePicker(){
  _npIsMobile = npDetectMobile();
  if(_npIsMobile){
    const inp = document.getElementById('np-hora-mobile');
    if(!inp) return;
    inp.style.display = 'block';
    if(_npTimeH !== null && _npTimeM !== null){
      inp.value = String(_npTimeH).padStart(2,'0')+':'+String(_npTimeM).padStart(2,'0');
    }
    inp.focus();
    inp.click();
  } else {
    const pop = document.getElementById('np-tp-selects');
    if(pop && !pop.classList.contains('hidden')){ npCloseDropdown(); return; }
    npOpenDropdown();
  }
}

function npOnMobileTimeInput(val){
  if(!val){ _npTimeH=null; _npTimeM=null; }
  else {
    const [h,m] = val.split(':').map(Number);
    _npTimeH = h;
    // snap to nearest quarter
    const quarters = [0,15,30,45];
    _npTimeM = quarters.reduce((prev,cur)=>Math.abs(cur-m)<Math.abs(prev-m)?cur:prev);
  }
  // hide native input after selection
  const inp = document.getElementById('np-hora-mobile');
  if(inp) inp.style.display = 'none';
  npTimeSync();
}

function npClearTime(){
  _npTimeH = null; _npTimeM = null;
  const inp = document.getElementById('np-hora-mobile');
  if(inp){ inp.value=''; inp.style.display='none'; }
  npCloseDropdown();
  npTimeSync();
}

function npTimeSync(){
  // sync hidden input
  const hidden = document.getElementById('np-hora');
  if(hidden){
    if(_npTimeH!==null && _npTimeM!==null){
      hidden.value = String(_npTimeH).padStart(2,'0')+':'+String(_npTimeM).padStart(2,'0');
    } else {
      hidden.value = '';
    }
  }
  // update button
  const btn = document.getElementById('np-tp-btn');
  const valEl = document.getElementById('np-tp-value');
  if(!btn || !valEl) return;
  if(_npTimeH!==null && _npTimeM!==null){
    const label = String(_npTimeH).padStart(2,'0')+':'+String(_npTimeM).padStart(2,'0');
    valEl.textContent = label;
    btn.classList.add('has-value');
    npUpdateClockIcon(_npTimeH, _npTimeM);
  } else {
    valEl.textContent = 'Elegir horario';
    btn.classList.remove('has-value');
    npUpdateClockIcon(null, null);
  }
  // Mostrar advertencia si la hora está fuera del horario del local
  npCheckFueraHorario();
}

function npCheckFueraHorario(){
  let warn = document.getElementById('np-hora-warn');
  if(!warn){
    const campo = document.getElementById('np-campo-hora');
    if(!campo) return;
    warn = document.createElement('div');
    warn.id = 'np-hora-warn';
    warn.style.cssText = 'font-size:.68rem;color:var(--amber);margin-top:4px;display:none;';
    campo.appendChild(warn);
  }
  if(_npTimeH===null){ warn.style.display='none'; return; }
  const horario = getHorarioActual();
  if(!horario){
    warn.textContent = '🌙 El local está cerrado este día — el pedido se guardará igual.';
    warn.style.display = '';
    return;
  }
  const slots = buildHorarioSlots(horario);
  const fuera = !slots.some(s => s.h===_npTimeH && s.m===_npTimeM);
  if(fuera){
    warn.textContent = `🌙 Fuera del horario habitual (${horario.open}–${horario.close}) — se guardará igual.`;
    warn.style.display = '';
  } else {
    warn.style.display = 'none';
  }
}

function npUpdateClockIcon(h, m){
  const handH = document.getElementById('np-tp-hand-h');
  const handM = document.getElementById('np-tp-hand-m');
  if(!handH || !handM) return;
  if(h === null){ handH.style.transform='rotate(-60deg)'; handM.style.transform='rotate(60deg)'; return; }
  const hDeg = ((h % 12) / 12 * 360) + ((m||0) / 60 * 30) - 90;
  const mDeg = ((m||0) / 60 * 360) - 90;
  handH.style.transform = `rotate(${hDeg}deg)`;
  handM.style.transform = `rotate(${mDeg}deg)`;
}

function npClockInit(){
  _npTimeH = null; _npTimeM = null;
  const inp = document.getElementById('np-hora-mobile');
  if(inp){ inp.value=''; inp.style.display='none'; }
  npCloseDropdown();
  npTimeSync();
}
// alias for old calls
function npClockClear(){ npClearTime(); }
function npClockSetHour(h){ _npTimeH=h; npTimeSync(); }
function npClockSetMin(m){ _npTimeM=m; npTimeSync(); }
function npClockSyncHidden(){ npTimeSync(); }
function npClockUpdateDisplay(){ npTimeSync(); }

// ── WHEEL PICKER ──
let _wheelH = 10, _wheelM = 0;
let _wheelCb = null;
let _wheelSlots = []; // slots {h,m,label} actuales

function wheelOpen(initH, initM){
  _wheelH = initH !== null ? initH : 10;
  _wheelM = initM !== null ? initM : 0;
  // Generar slots según horario del local/día
  const horario = getHorarioActual();
  _wheelSlots = horario ? buildHorarioSlots(horario) : [];
  if(!_wheelSlots.length){
    // Si cerrado, no abrir wheel — el dropdown mostrará el mensaje
    return;
  }
  // Clamp valores iniciales al rango disponible
  const firstSlot = _wheelSlots[0];
  const lastSlot  = _wheelSlots[_wheelSlots.length-1];
  const initMin   = _wheelH*60 + _wheelM;
  const openMin   = firstSlot.h*60+firstSlot.m;
  const closeMin  = lastSlot.h*60+lastSlot.m;
  if(initMin < openMin){ _wheelH=firstSlot.h; _wheelM=firstSlot.m; }
  if(initMin > closeMin){ _wheelH=lastSlot.h; _wheelM=lastSlot.m; }

  const hours = [...new Set(_wheelSlots.map(s=>s.h))];
  const mins  = _wheelSlots.filter(s=>s.h===_wheelH).map(s=>s.m);
  wheelBuild('wheel-col-h', hours, _wheelH, (v)=>{
    _wheelH=v;
    // al cambiar hora, actualizar minutos disponibles
    const newMins = _wheelSlots.filter(s=>s.h===v).map(s=>s.m);
    if(!newMins.includes(_wheelM)) _wheelM = newMins[0]||0;
    wheelBuild('wheel-col-m', newMins, _wheelM, (mv)=>{ _wheelM=mv; });
  });
  wheelBuild('wheel-col-m', mins, _wheelM, (v)=>{ _wheelM=v; });
  document.getElementById('wheel-overlay').classList.remove('hidden');
}

function wheelConfirm(){
  _npTimeH = _wheelH;
  _npTimeM = _wheelM;
  npTimeSync();
  document.getElementById('wheel-overlay').classList.add('hidden');
}

function wheelCancel(){
  document.getElementById('wheel-overlay').classList.add('hidden');
}

// close on backdrop click
document.addEventListener('click', e => {
  const overlay = document.getElementById('wheel-overlay');
  if(overlay && !overlay.classList.contains('hidden') && e.target === overlay){
    wheelCancel();
  }
});

function wheelBuild(colId, items, selected, onChange){
  const col = document.getElementById(colId);
  if(!col) return;
  col.innerHTML = '';
  const ITEM_H = 40;

  items.forEach((v,i) => {
    const el = document.createElement('div');
    el.className = 'wheel-item' + (v === selected ? ' selected' : '');
    el.textContent = String(v).padStart(2,'0');
    el.dataset.val = v;
    col.appendChild(el);
  });

  // Scroll to selected
  const selIdx = items.indexOf(selected);
  const wrap = col.parentElement;
  wrap.scrollTop = selIdx * ITEM_H;

  // Snap on scroll
  let snapTimer;
  wrap.onscroll = () => {
    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => {
      const idx = Math.round(wrap.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(items.length-1, idx));
      wrap.scrollTo({top: clamped * ITEM_H, behavior:'smooth'});
      const val = items[clamped];
      onChange(val);
      col.querySelectorAll('.wheel-item').forEach((el,i) => {
        el.classList.toggle('selected', i === clamped);
      });
    }, 80);
  };

  // Touch/mouse drag for desktop
  let isDragging = false, startY = 0, startScroll = 0;
  col.addEventListener('mousedown', e => {
    isDragging = true;
    startY = e.clientY;
    startScroll = wrap.scrollTop;
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if(!isDragging) return;
    wrap.scrollTop = startScroll - (e.clientY - startY);
  });
  document.addEventListener('mouseup', () => { isDragging = false; });
}

function npSelTurno(n){
  const dd=datos.dias[_npDiaKey]||{};
  const corte=dd.corteHora||'15:00';
  document.getElementById('np-t1').classList.toggle('active',n===1);
  document.getElementById('np-t2').classList.toggle('active',n===2);
  const hora=n===1?corte:'18:00';
  document.getElementById('np-hora').value=hora;
}

function npOnHoraInput(){
  document.getElementById('np-t1').classList.remove('active');
  document.getElementById('np-t2').classList.remove('active');
}

function npToggleCuba(){
  const nomInp = document.getElementById('np-nombre');
  const isCubaAhora = (nomInp.value||'').toLowerCase().includes('cuba');
  if(isCubaAhora){
    // Deseleccionar Cuba
    nomInp.value = '';
    npActualizarBotonesCuba(false);
    npActualizarHorario();
  } else {
    // Activar Cuba
    nomInp.value = 'Cuba';
    npActualizarBotonesCuba(true);
    npActualizarHorario();
    document.getElementById('np-autocomp').style.display='none';
  }
}

function npActualizarBotonesCuba(isCuba){
  document.getElementById('np-cuba-badge').style.display = isCuba?'':'none';
  document.getElementById('np-campo-tel').style.display  = isCuba?'none':'';
  document.getElementById('np-campo-pago').style.display = isCuba?'none':'';
  const btn = document.getElementById('np-btn-cuba');
  if(btn){
    btn.style.background   = isCuba ? 'var(--cuba-ink,var(--accent))' : 'var(--paper)';
    btn.style.color        = isCuba ? '#fff' : 'var(--ink-mid)';
    btn.style.borderColor  = isCuba ? 'var(--cuba-ink,var(--accent))' : 'var(--border)';
  }
}

function npOnNombreInput(){
  const val=(document.getElementById('np-nombre').value||'').trim();
  const isCuba=val.toLowerCase().includes('cuba');
  npActualizarBotonesCuba(isCuba);
  npActualizarHorario();
  const q=val.toLowerCase();
  const ac=document.getElementById('np-autocomp');
  if(!q||q.length<2||isCuba){ac.style.display='none';return;}
  const matches=datos.clientes.filter(c=>c.nombre.toLowerCase().includes(q)&&!esCuba(c.nombre)).slice(0,6);
  if(!matches.length){ac.style.display='none';return;}
  // Frecuentes primero
  const sorted=[...matches].sort((a,b)=>(b.frecuente?1:0)-(a.frecuente?1:0));
  ac.innerHTML=sorted.map(c=>`
    <div style="padding:9px 12px;border-bottom:1px solid var(--border);font-size:.82rem;cursor:pointer;display:flex;align-items:center;justify-content:space-between;"
      onmousedown="event.preventDefault();_npSeleccionandoAutocomp=true;npSelAutocompById('${c.id}')"
      ontouchstart="event.preventDefault();_npSeleccionandoAutocomp=true;npSelAutocompById('${c.id}')">
      <span>${c.frecuente?'⭐ ':''}<strong>${esc(c.nombre)}</strong></span>
      <span style="font-size:.68rem;color:var(--ink-light)">${esc(c.tel||'')}</span>
    </div>
  `).join('');
  ac.style.display='';
}

function npSelAutocompById(clienteId){
  const c=datos.clientes.find(x=>x.id===clienteId);
  if(!c)return;
  npSelAutocomp(c.nombre,c.tel||'');
}

function npSelAutocomp(nombre,tel){
  _npSeleccionandoAutocomp=false;
  const nomInp=document.getElementById('np-nombre');
  const telInp=document.getElementById('np-tel');
  nomInp.value=nombre;
  if(tel){telInp.value=tel;npOnTelInput();}
  document.getElementById('np-autocomp').style.display='none';
  // Actualizar estado visual (cuba badge, etc) sin reabrir el autocompletado
  const isCuba=nombre.toLowerCase().includes('cuba');
  npActualizarBotonesCuba(isCuba);
  npActualizarHorario();
}

function npOcultarAutocomp(){
  const ac=document.getElementById('np-autocomp');
  if(ac)ac.style.display='none';
}

// ── Productos temporales ──
function npRenderProds(){
  const wrap=document.getElementById('np-prods-wrap');
  if(!_npPedido||!_npPedido.productos.length){wrap.innerHTML='';npRenderTotal();return;}
  wrap.innerHTML=_npPedido.productos.map((r,i)=>{
    const nom=r.tipo==='catalogo'?r.nombre:r.libre;
    const cat=datos.catalogo.find(c=>c.nombre===r.nombre&&c.tipo===(r.tacc==='s'?'sin_tacc':'con_tacc'));
    const tieneTalle=r.tipo==='catalogo'?(cat?cat.tiene_talle:true):true;
    const precioBase=r.tipo==='libre'?(r.precio_libre||0):getPrecioCat(cat,r.tamano);
    const precioStr=precioBase?`<span class="prod-precio">$${precioBase.toLocaleString('es-AR')}</span>`:'';
    const pill=r.tacc==='s'?'<span class="tacc-pill s">ST</span>':'<span class="tacc-pill c">C</span>';
    const TAMANIOS_LOCAL=['Chico','Mediano','Grande'];
    const libreActivo=r._tamLibre||(!!(r.tamano)&&!TAMANIOS_LOCAL.includes(r.tamano));
    const sinTalleWarn=tieneTalle&&!(r.tamano||'').trim()?'<span style="font-size:.58rem;color:var(--red);font-weight:700;margin-left:4px;">⚠ TALLE</span>':'';
    const extrasHTML=(r.extras||[]).map((ex,ei)=>`
      <div class="prod-extra-row" id="np-extra-${r.id}-${ei}">
        <div style="display:flex;flex-direction:column;gap:2px;flex:1;">
          <span style="font-size:.55rem;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-light);font-weight:600;">Descripción extra</span>
          <input class="prod-extra-desc" type="text" value="${esc(ex.desc||'')}" placeholder="ej: extra frutilla, baño chocolate" oninput="npSetExtraDesc('${r.id}',${ei},this.value)">
        </div>
        <div style="display:flex;flex-direction:column;gap:2px;">
          <span style="font-size:.55rem;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-light);font-weight:600;">Precio</span>
          <div style="display:flex;align-items:center;gap:3px;">
            <span class="prod-extra-sep">$</span>
            <input class="prod-extra-precio" type="number" min="0" value="${ex.precio||''}" placeholder="0" oninput="npSetExtraPrecio('${r.id}',${ei},this.value)">
          </div>
        </div>
        <button class="prod-extra-del" onclick="npEliminarExtra('${r.id}',${ei})" style="align-self:flex-end;padding-bottom:4px;">✕</button>
      </div>`).join('');
    return`<div class="prod-edit-fila" id="np-prod-${r.id}">
      <div class="prod-edit-top">
        <div class="prod-listo-chk${r.listo?' on':''}" onclick="npToggleProdListo('${r.id}')">✓</div>
        <div class="prod-edit-nombre${r.tipo==='libre'?' libre':''}">${esc(nom||'(sin nombre)')}</div>
        ${precioStr}${pill}
        <button class="btn-cambiar-prod" onclick="npCambiarProd('${r.id}')">Cambiar</button>
        <button class="btn-remove-prod" onclick="npEliminarProd('${r.id}')">✕</button>
      </div>
      <div class="prod-mid-row">
        <div class="prod-mid-cant">
          <button class="cant-btn" onclick="npAjustarCant('${r.id}',-1)">−</button>
          <span style="font-size:.88rem;min-width:20px;text-align:center;">${(()=>{const _n=Number(r.cantidad);return isNaN(_n)?1:_n;})()}</span>
          <button class="cant-btn" onclick="npAjustarCant('${r.id}',1)">＋</button>
        </div>
        ${tieneTalle?`<div class="prod-mid-talle">
          ${TAMANIOS_LOCAL.map(t=>`<button class="tam-btn${!libreActivo&&r.tamano===t?' active':''}" onclick="npSetTamano('${r.id}','${t}')">${t}</button>`).join('')}
          <button class="tam-btn tam-btn-libre${libreActivo?' active':''}" onclick="npSetTamano('${r.id}','__libre__')">Libre</button>
        </div>`:''}
        ${sinTalleWarn}
      </div>
      ${tieneTalle?`<input type="text" class="tam-libre-input${libreActivo?' visible':''}" value="${esc(libreActivo&&r.tamano?r.tamano:'')}" placeholder="ej: 2kg, bandeja..." oninput="npSetTamanoLibre('${r.id}',this.value)" style="margin-top:4px;">` :''}
      ${r.tipo==='libre'?`<div class="prod-precio-libre-row">
        <span class="prod-precio-libre-lbl">$ precio</span>
        <input class="prod-precio-libre-input" type="number" min="0" value="${r.precio_libre||''}" placeholder="0" oninput="npSetPrecioLibre('${r.id}',this.value)">
      </div>`:''}
      <div style="padding-top:4px;">
        <button class="prod-nota-toggle" onclick="npToggleNotaProd('${r.id}')">${r.nota_prod?'✏️ '+esc(r.nota_prod):'＋ Nota del producto'}</button>
        <textarea class="prod-nota-textarea${r.nota_prod?' visible':''}" id="np-nota-prod-${r.id}" placeholder="ej: sin glaseado, con fruta..." oninput="npSetNotaProd('${r.id}',this.value)">${esc(r.nota_prod||'')}</textarea>
      </div>
      <div class="prod-extras-wrap">
        ${extrasHTML}
        <button class="prod-extra-add" onclick="npAgregarExtra('${r.id}')">＋ extra</button>
      </div>
    </div>`;
  }).join('');
  npRenderTotal();
}

function npAgregarProducto(){
  if(!_npPedido)_npPedido={id:'__np__',productos:[]};
  // Reusar el selector existente apuntando al pedido temporal
  _selectorPedidoId='__np__';_selectorProdId=null;
  document.getElementById('selector-search').value='';
  renderSelectorLista();
  document.getElementById('selector-overlay').classList.remove('hidden');
}

function npCambiarProd(rId){
  _selectorPedidoId='__np__';_selectorProdId=rId;
  document.getElementById('selector-search').value='';
  renderSelectorLista();
  document.getElementById('selector-overlay').classList.remove('hidden');
}

function npEliminarProd(rId){
  if(!_npPedido)return;
  _npPedido.productos=_npPedido.productos.filter(r=>r.id!==rId);
  npRenderProds();
}

function npToggleProdListo(rId){
  const r=_npPedido&&_npPedido.productos.find(x=>x.id===rId);
  if(!r)return;
  r.listo=!r.listo;
  npRenderProds();
}

function npAjustarCant(rId,delta){
  const r=_npPedido&&_npPedido.productos.find(x=>x.id===rId);
  if(!r)return;
  r.cantidad=Math.max(1,(()=>{const _n=Number(r.cantidad);return isNaN(_n)?1:_n;})()+delta);
  npRenderProds();
}

function npSetTamano(rId,tam){
  const r=_npPedido&&_npPedido.productos.find(x=>x.id===rId);
  if(!r)return;
  if(tam==='__libre__'){r._tamLibre=true;}
  else{r.tamano=tam;r._tamLibre=false;}
  npRenderProds();
}

function npSetTamanoLibre(rId,val){
  const r=_npPedido&&_npPedido.productos.find(x=>x.id===rId);
  if(!r)return;
  r.tamano=val;
}

function npToggleNotaProd(rId){
  const ta=document.getElementById('np-nota-prod-'+rId);
  if(!ta)return;
  const visible=ta.classList.contains('visible');
  ta.classList.toggle('visible',!visible);
  if(!visible)ta.focus();
  // Actualizar botón
  const r=_npPedido&&_npPedido.productos.find(x=>x.id===rId);
  const btn=ta.previousElementSibling;
  if(btn&&r)btn.textContent=(r.nota_prod?'✏️ '+r.nota_prod:'＋ Nota del producto');
}

function npSetNotaProd(rId,val){
  const r=_npPedido&&_npPedido.productos.find(x=>x.id===rId);
  if(!r)return;
  r.nota_prod=val;
  const btn=document.getElementById('np-nota-prod-'+rId);
  if(btn&&btn.previousElementSibling)btn.previousElementSibling.textContent=val?'✏️ '+val:'＋ Nota del producto';
}
function npSetPrecioLibre(rId,val){
  const r=_npPedido&&_npPedido.productos.find(x=>x.id===rId);
  if(!r)return;
  r.precio_libre=parseFloat(val)||0;
  npRenderTotal();
}
function npAgregarExtra(rId){
  const r=_npPedido&&_npPedido.productos.find(x=>x.id===rId);
  if(!r)return;
  if(!r.extras)r.extras=[];
  r.extras.push({desc:'',precio:0});
  npRenderProds();
}
function npEliminarExtra(rId,ei){
  const r=_npPedido&&_npPedido.productos.find(x=>x.id===rId);
  if(!r||!r.extras)return;
  r.extras.splice(ei,1);
  npRenderProds();
}
function npSetExtraDesc(rId,ei,val){
  const r=_npPedido&&_npPedido.productos.find(x=>x.id===rId);
  if(!r||!r.extras||!r.extras[ei])return;
  r.extras[ei].desc=val;
}
function npSetExtraPrecio(rId,ei,val){
  const r=_npPedido&&_npPedido.productos.find(x=>x.id===rId);
  if(!r||!r.extras||!r.extras[ei])return;
  r.extras[ei].precio=parseFloat(val)||0;
  npRenderTotal();
}
function calcTotalPedido(pedido){
  if(!pedido||!pedido.productos)return 0;
  return pedido.productos.reduce((sum,r)=>{
    const cant=Number(r.cantidad)||1;
    const cat=datos.catalogo.find(c=>c.nombre===r.nombre&&c.tipo===(r.tacc==='s'?'sin_tacc':'con_tacc'));
    const base=r.tipo==='libre'?(r.precio_libre||0):getPrecioCat(cat,r.tamano);
    const extras=(r.extras||[]).reduce((s,ex)=>s+(parseFloat(ex.precio)||0),0);
    return sum+(base*cant)+extras;
  },0);
}
function npRenderTotal(){
  const wrap=document.getElementById('np-total-wrap');
  if(!wrap)return;
  const total=calcTotalPedido(_npPedido);
  if(!total){wrap.style.display='none';return;}
  wrap.style.display='';
  const efectivo=Math.round(total*0.9);
  wrap.innerHTML=`<span class="np-total-label">Total</span>
    <span class="np-total-num">$${total.toLocaleString('es-AR')}</span>
    <span class="np-total-ef">💵 efectivo $${efectivo.toLocaleString('es-AR')}</span>`;
}

// ── Estado / Pago / Nota ──
function npSelEstado(estado,el){
  _npEstado=estado;
  document.querySelectorAll('#np-estado-sel .estado-opt').forEach(b=>{
    b.className='estado-opt';
  });
  el.className='estado-opt active-'+estado;
}

function npTogglePago(){
  if(!_npPagado){
    // Abrir modal de métodos en vez de togglear directo
    _pagoId='__np__';_pagoDeshacer=false;_pagoMetodo=null;
    document.querySelectorAll('.modal-metodo').forEach(m=>m.classList.remove('selected'));
    document.getElementById('modal-pago-titulo').textContent='Confirmar pago';
    document.getElementById('modal-pago-desc').textContent='Seleccioná el método de pago.';
    document.getElementById('modal-pago').classList.remove('hidden');
  } else {
    _npPagado=false;_npMetodoPago='';
    const bar=document.getElementById('np-pago-bar');
    bar.className='pago-bar no';
    bar.innerHTML='💳 Sin confirmar pago <button class="btn-pagar pagar" onclick="npTogglePago()">Confirmar</button>';
  }
}

function npToggleNota(){
  const wrap=document.getElementById('np-nota-wrap');
  const visible=wrap.style.display!=='none';
  wrap.style.display=visible?'none':'block';
  if(!visible)document.getElementById('np-nota').focus();
}

// ── Abrir / Cerrar ──
function abrirModalNP(){
  _npDia=null;
  _npDiaKey=null;
  _npPedido={id:'__np__',productos:[]};
  _npPagado=false;
  _npMetodoPago='';
  _npEstado='pendiente';
  document.querySelectorAll('.modal-np-dia-btn').forEach(b=>b.classList.remove('active'));
  const customInput=document.getElementById('np-dia-custom');
  if(customInput)customInput.value='';
  const lblOtro=document.getElementById('np-lbl-otro');
  if(lblOtro)lblOtro.textContent='Otro día';
  document.getElementById('np-nombre').value='';
  document.getElementById('np-tel').value='';
  document.getElementById('np-tel-hint').textContent='';
  document.getElementById('np-tel-hint').className='np-hint';
  document.getElementById('np-hora').value='';
  _npTimeH=null;_npTimeM=null;
  setTimeout(()=>{npClockInit();},30);
  document.getElementById('np-error').style.display='none';
  document.getElementById('np-error').textContent='';
  document.getElementById('np-cuba-badge').style.display='none';
  document.getElementById('np-campo-tel').style.display='';
  document.getElementById('np-campo-pago').style.display='';
  npActualizarBotonesCuba(false);
  document.getElementById('np-t1').classList.remove('active');
  document.getElementById('np-t2').classList.remove('active');
  // Reset estado
  document.querySelectorAll('#np-estado-sel .estado-opt').forEach(b=>b.className='estado-opt');
  document.querySelector('#np-estado-sel .estado-opt').className='estado-opt active-pendiente';
  // Reset pago
  const bar=document.getElementById('np-pago-bar');
  bar.className='pago-bar no';
  bar.innerHTML='💳 Sin confirmar pago <button class="btn-pagar pagar" onclick="npTogglePago()">Confirmar</button>';
  // Reset nota
  document.getElementById('np-nota').value='';
  document.getElementById('np-nota-wrap').style.display='none';
  npRenderProds();
  npLabels();
  npActualizarHorario();
  document.getElementById('modal-np').classList.remove('hidden');
  setTimeout(()=>{document.getElementById('np-dia-hoy').focus();npClockInit();},80);
}

function cerrarModalNP(){
  document.getElementById('modal-np').classList.add('hidden');
  _npPedido=null;
}

function confirmarNP(){
  const nombreRaw=(document.getElementById('np-nombre').value||'').trim();
  const cliente=normalizarCliente(nombreRaw);
  const isCuba=esCuba(cliente);
  const hora=document.getElementById('np-hora').value||'';
  const nota=(document.getElementById('np-nota').value||'').trim();
  const errDiv=document.getElementById('np-error');
  function npError(msg){
    errDiv.innerHTML=msg;errDiv.style.display='';
    const modal=document.getElementById('modal-np');
    modal.classList.remove('shake');
    void modal.offsetWidth;
    modal.classList.add('shake');
    setTimeout(()=>modal.classList.remove('shake'),300);
  }

  if(!_npDiaKey){npError('⚠️ Seleccioná un día de entrega.');return;}
  if(!isCuba&&!nombreRaw){npError('⚠️ Ingresá el nombre del cliente.');document.getElementById('np-nombre').focus();return;}
  let telNormalizado='',telTipo=null;
  if(!isCuba){
    const telRaw=document.getElementById('np-tel').value||'';
    if(!telRaw.trim()){npError('⚠️ Ingresá el teléfono del cliente.');document.getElementById('np-tel').focus();return;}
    const telResult=npNormalizarTel(telRaw);
    if(!telResult.valido){npError('⚠️ Teléfono inválido: '+telResult.hint);document.getElementById('np-tel').focus();return;}
    telNormalizado=telResult.normalizado;telTipo=telResult.tipo;
  }
  if(!isCuba&&!hora){npError('⚠️ Ingresá el horario de entrega.');document.getElementById('np-hora').focus();return;}
  // Validar productos
  const productos=(_npPedido&&_npPedido.productos)||[];
  if(!productos.length){npError('⚠️ Agregá al menos un producto.');return;}
  // Validar talles obligatorios
  const sinTalle=productos.filter(r=>{
    const cat=datos.catalogo.find(c=>c.nombre===r.nombre&&c.tipo===(r.tacc==='s'?'sin_tacc':'con_tacc'));
    const obliga=r.tipo==='catalogo'?(cat?cat.tiene_talle:false):false;
    return obliga&&!(r.tamano||'').trim();
  });
  if(sinTalle.length){
    const noms=sinTalle.map(r=>r.nombre).join(', ');
    npError('⚠️ Completá el talle de: <strong>'+esc(noms)+'</strong>');return;
  }
  errDiv.style.display='none';

  if(!datos.dias[_npDiaKey])datos.dias[_npDiaKey]={pedidos:[],ventas:[]};
  const diaAnterior=diaActual;
  diaActual=_npDiaKey;

  const id=uid();
  // Limpiar campo interno _tamLibre antes de guardar
  productos.forEach(r=>{delete r._tamLibre;});

  // Detectar si la hora está fuera del horario del local
  let fueraHorario = false;
  if(hora && !isCuba){
    const horario = getHorariosParaDia(_npDiaKey);
    if(!horario){
      fueraHorario = true; // día cerrado
    } else {
      const slots = buildHorarioSlots(horario);
      const [hh,mm] = hora.split(':').map(Number);
      fueraHorario = !slots.some(s => s.h===hh && s.m===mm);
    }
  }

  const nuevoPedido={
    id,
    cliente:isCuba?'cuba':nombreRaw,
    cliente_input:isCuba?'Cuba':nombreRaw,
    tel:telNormalizado,tel_tipo:telTipo,
    hora_entrega:hora,
    fuera_horario: fueraHorario||undefined,
    estado:_npEstado,
    pagado:_npPagado,metodoPago:_npPagado?(_npMetodoPago||'Confirmado'):'',
    notas:nota,
    productos,
    historial:[{estado:_npEstado,ts:Date.now()}],
    creado:Date.now(),
  };

  datos.dias[_npDiaKey].pedidos.unshift(nuevoPedido);
  guardar();
  mostrarToastGuardado();
  cerrarModalNP();
  if(diaAnterior!==_npDiaKey){renderDiasNav();renderAll();}
  else{renderPedidos();}
  setTimeout(()=>{const w=document.getElementById('planilla-wrap');if(w)w.scrollIntoView({behavior:'smooth'});},80);
}
// ── NUEVO PEDIDO (alias) ──
function agregarPedido(){abrirModalNP();}

// ── SELECTOR PRODUCTO ──
let _selectorPedidoId=null,_selectorProdId=null;
function abrirSelector(pedidoId,prodId){
  _selectorPedidoId=pedidoId;_selectorProdId=prodId;
  document.getElementById('selector-search').value='';
  renderSelectorLista();
  document.getElementById('selector-overlay').classList.remove('hidden');
}
function cerrarSelector(){document.getElementById('selector-overlay').classList.add('hidden');}
let _libreTipo='s';
function selLibreTipo(tipo){
  _libreTipo=tipo;
  document.getElementById('libre-btn-s').style.cssText=`flex:1;padding:8px;border-radius:8px;font-size:.75rem;font-weight:600;cursor:pointer;border:1.5px solid ${tipo==='s'?'var(--tacc-s)':'var(--border)'};background:${tipo==='s'?'var(--tacc-s-soft)':'var(--bg)'};color:${tipo==='s'?'var(--tacc-s)':'var(--ink-mid)'};`;
  document.getElementById('libre-btn-c').style.cssText=`flex:1;padding:8px;border-radius:8px;font-size:.75rem;font-weight:600;cursor:pointer;border:1.5px solid ${tipo==='c'?'var(--tacc-c)':'var(--border)'};background:${tipo==='c'?'var(--tacc-c-soft)':'var(--bg)'};color:${tipo==='c'?'var(--tacc-c)':'var(--ink-mid)'};`;
}
function confirmarLibre(){
  const q=(document.getElementById('selector-search').value||'').trim();
  if(!q)return;
  seleccionarProducto({nombre:q,tiene_talle:true,precio:0},'libre',_libreTipo);
}
const CAT_ORDEN=['tortas','mousses','bandejas','cuadrados','congelados','otros'];
const CAT_LABELS={tortas:'🎂 Tortas',mousses:'🍮 Mousses',bandejas:'🍫 Bandejas',cuadrados:'🟫 Cuadrados',congelados:'❄️ Congelados',otros:'✨ Otros'};
function renderSelectorLista(){
  const q=(document.getElementById('selector-search').value||'').toLowerCase().trim();
  const lista=document.getElementById('selector-lista');
  const libreWrap=document.getElementById('selector-libre-wrap');
  lista.innerHTML='';
  function renderGrupo(items,tacc,pillHtml){
    if(!items.length)return;
    // agrupar por categoria
    const porCat={};
    items.forEach(c=>{
      const cat=c.categoria&&CAT_ORDEN.includes(c.categoria)?c.categoria:'otros';
      if(!porCat[cat])porCat[cat]=[];
      porCat[cat].push(c);
    });
    CAT_ORDEN.forEach(cat=>{
      if(!porCat[cat])return;
      const sep=document.createElement('div');sep.className='selector-sep';
      sep.textContent=(tacc==='s'?'ST · ':'C · ')+CAT_LABELS[cat];
      lista.appendChild(sep);
      porCat[cat].sort((a,b)=>a.nombre.localeCompare(b.nombre)).forEach(c=>{
        const d=document.createElement('div');d.className='selector-item';
        const pStr=c.precio?`<span class="sel-precio">$${c.precio.toLocaleString('es-AR')}</span>`:'';
        d.innerHTML=`<span>${esc(c.nombre)}</span><div style="display:flex;gap:6px;align-items:center;">${pStr}${pillHtml}</div>`;
        d.onclick=()=>seleccionarProducto(c,'catalogo',tacc);lista.appendChild(d);
      });
    });
  }
  const sinTacc=datos.catalogo.filter(c=>c.tipo==='sin_tacc'&&(!q||c.nombre.toLowerCase().includes(q)));
  const conTacc=datos.catalogo.filter(c=>c.tipo==='con_tacc'&&(!q||c.nombre.toLowerCase().includes(q)));
  renderGrupo(sinTacc,'s','<span class="tacc-pill s">ST</span>');
  renderGrupo(conTacc,'c','<span class="tacc-pill c">C</span>');
  const hayMatchExacto=datos.catalogo.some(c=>c.nombre.toLowerCase()===q);
  libreWrap.style.display=(q&&!hayMatchExacto)?'':'none';
  if(typeof kbClearHighlight==='function') kbClearHighlight();
}
function seleccionarProducto(cat,tipo,tacc){
  const pedidoId=_selectorPedidoId;
  // Pedido en edición
  if(pedidoId==='__ed__'){
    if(!_edPedido)return;
    const prodId=_selectorProdId;
    if(prodId){
      const r=_edPedido.productos.find(x=>x.id===prodId);
      if(r){r.nombre=cat.nombre;r.tipo=tipo;r.tacc=tacc;r.libre=tipo==='libre'?cat.nombre:undefined;r.tamano='';r.listo=false;r.pedido_cuba=false;r.separado_cuba=false;}
    } else {
      _edPedido.productos.push({id:uid(),nombre:cat.nombre,tipo,tacc,libre:tipo==='libre'?cat.nombre:undefined,tamano:'',cantidad:1,listo:false,pedido_cuba:false,separado_cuba:false,precio_libre:0,extras:[]});
    }
    cerrarSelector();
    edRenderProds();
    return;
  }
  // Pedido temporal del modal nuevo
  if(pedidoId==='__np__'){
    if(!_npPedido)_npPedido={id:'__np__',productos:[]};
    const prodId=_selectorProdId;
    if(prodId){
      const r=_npPedido.productos.find(x=>x.id===prodId);
      if(r){r.nombre=cat.nombre;r.tipo=tipo;r.tacc=tacc;r.libre=tipo==='libre'?cat.nombre:undefined;r.tamano='';r.listo=false;r.pedido_cuba=false;r.separado_cuba=false;}
    } else {
      _npPedido.productos.push({id:uid(),nombre:cat.nombre,tipo,tacc,libre:tipo==='libre'?cat.nombre:undefined,tamano:'',cantidad:1,listo:false,pedido_cuba:false,separado_cuba:false,precio_libre:0,extras:[]});
    }
    cerrarSelector();
    npRenderProds();
    return;
  }
  const p=getAllPedidos().find(x=>x.id===pedidoId);if(!p)return;
  const prodId=_selectorProdId;
  if(prodId){
    const r=p.productos.find(x=>x.id===prodId);
    if(r){r.nombre=cat.nombre;r.tipo=tipo;r.tacc=tacc;r.libre=tipo==='libre'?cat.nombre:undefined;r.tamano='';r.listo=false;r.pedido_cuba=false;r.separado_cuba=false;}
  } else {
    p.productos.push({id:uid(),nombre:cat.nombre,tipo,tacc,libre:tipo==='libre'?cat.nombre:undefined,tamano:'',cantidad:1,listo:false,pedido_cuba:false,separado_cuba:false});
  }
  cerrarSelector();guardar();renderPedidos();
}

// ── PAGO ──
function abrirModalPago(id,deshacer){
  _pagoId=id;_pagoDeshacer=deshacer;_pagoMetodo=null;
  document.querySelectorAll('.modal-metodo').forEach(m=>m.classList.remove('selected'));
  document.getElementById('modal-pago-titulo').textContent=deshacer?'Deshacer pago':'Confirmar pago';
  document.getElementById('modal-pago-desc').textContent=deshacer?'¿Estás segura de deshacer el pago?':'Seleccioná el método de pago.';
  document.getElementById('modal-pago').classList.remove('hidden');
}
function cerrarModalPago(){document.getElementById('modal-pago').classList.add('hidden');}
function selMetodo(m,el){
  _pagoMetodo=m;
  document.querySelectorAll('.modal-metodo').forEach(x=>x.classList.remove('selected'));
  el.classList.add('selected');
}
function confirmarPago(){
  if(_pagoId==='__np__'){
    if(!_pagoMetodo){alert('Seleccioná un método de pago.');return;}
    _npPagado=true;_npMetodoPago=_pagoMetodo;
    const bar=document.getElementById('np-pago-bar');
    if(bar){
      bar.className='pago-bar si';
      bar.innerHTML='✅ Pagado · '+esc(_pagoMetodo)+' <button class="btn-pagar despagar" onclick="npTogglePago()">Deshacer</button>';
    }
    cerrarModalPago();return;
  }
  if(_pagoId==='__ed__'){
    if(!_pagoMetodo){alert('Seleccioná un método de pago.');return;}
    if(_edPedido){_edPedido.pagado=true;_edPedido.metodoPago=_pagoMetodo;}
    const bar=document.getElementById('ed-pago-bar');
    if(bar){
      bar.className='pago-bar si';
      bar.innerHTML='✅ Pagado · '+esc(_pagoMetodo)+' <button class="btn-pagar despagar" onclick="edTogglePago()">Deshacer</button>';
    }
    cerrarModalPago();return;
  }
  const p=getAllPedidos().find(x=>x.id===_pagoId);if(!p)return;
  if(_pagoDeshacer){p.pagado=false;p.metodoPago='';}
  else{if(!_pagoMetodo){alert('Seleccioná un método de pago.');return;}p.pagado=true;p.metodoPago=_pagoMetodo;}
  cerrarModalPago();guardar();renderPedidos();
}

// ── MODAL GENÉRICO ──
function abrirModalGen(titulo,desc,cb,tipo='danger'){
  _genCb=cb;
  document.getElementById('modal-gen-titulo').textContent=titulo;
  document.getElementById('modal-gen-desc').textContent=desc;
  const btn=document.getElementById('modal-gen-ok');
  btn.className=tipo==='danger'?'modal-btn-danger':'modal-btn-confirm';
  document.getElementById('modal-gen').classList.remove('hidden');
}
function cerrarModalGen(){document.getElementById('modal-gen').classList.add('hidden');}
document.getElementById('modal-gen-ok').onclick=()=>{cerrarModalGen();if(_genCb)_genCb();};

// ── MODAL EDICIÓN PEDIDO ──
let _edPedidoId=null;
let _edPedido=null; // copia de trabajo del pedido durante edición
let _edModo='vista'; // 'vista' | 'edicion'

// Abre el modal en modo VISTA (nuevo comportamiento del botón +)
function abrirModalVista(pedidoId){
  const pOrig=getAllPedidos().find(x=>x.id===pedidoId);
  if(!pOrig)return;
  _edPedidoId=pedidoId;
  _edModo='vista';
  _edPedido=JSON.parse(JSON.stringify(pOrig));
  edRenderBody();
  document.getElementById('ed-footer-vista').style.display='';
  document.getElementById('ed-footer-edicion').style.display='none';
  document.getElementById('modal-edicion').classList.remove('hidden');
}

// Abre directo en modo edición (por compatibilidad, aunque ya no se usa desde la row)
function abrirModalEdicion(pedidoId){
  const pOrig=getAllPedidos().find(x=>x.id===pedidoId);
  if(!pOrig)return;
  _edPedidoId=pedidoId;
  _edModo='edicion';
  _edPedido=JSON.parse(JSON.stringify(pOrig));
  edRenderBody();
  document.getElementById('ed-footer-vista').style.display='none';
  document.getElementById('ed-footer-edicion').style.display='';
  document.getElementById('modal-edicion').classList.remove('hidden');
}

function activarModoEdicion(){
  _edModo='edicion';
  document.getElementById('ed-footer-vista').style.display='none';
  document.getElementById('ed-footer-edicion').style.display='';
  edRenderBody();
}

function volverModoVista(){
  // Descartar cambios y volver a datos originales
  const pOrig=getAllPedidos().find(x=>x.id===_edPedidoId);
  if(pOrig)_edPedido=JSON.parse(JSON.stringify(pOrig));
  _edModo='vista';
  document.getElementById('ed-footer-vista').style.display='';
  document.getElementById('ed-footer-edicion').style.display='none';
  edRenderBody();
}

function cerrarModalEdicion(){
  document.getElementById('modal-edicion').classList.add('hidden');
  _edPedidoId=null;_edPedido=null;_edModo='vista';
}

// Toggle "pedido a Cuba" desde el checkbox circular de la row colapsada
function toggleCubaPedido(pedidoId,prodId){
  const p=getAllPedidos().find(x=>x.id===pedidoId);if(!p)return;
  const r=p.productos.find(x=>x.id===prodId);if(!r)return;
  r.pedido_cuba=!r.pedido_cuba;
  guardar();renderPedidos();
  // Si Cuba tab está activo, re-renderizarlo
  const cubaTab=document.getElementById('tab-cuba');
  if(cubaTab&&cubaTab.classList.contains('active'))renderCuba();
}

function edRenderBody(){
  if(!_edPedido)return;
  if(_edModo==='vista') edRenderVista();
  else edRenderEdicion();
}

function edRenderVista(){
  const p=_edPedido;
  const isCuba=esCuba(p.cliente);
  const dd=diaData();
  const especial=dd.especial||false;
  const corte=dd.corteHora||'15:00';
  const estadoLabels={pendiente:'⏳ Pendiente',prod:'🔧 En producción',listo:'✅ Listo',entregado:'📦 Retirado'};
  const estadoLabel=estadoLabels[p.estado||'pendiente']||'⏳ Pendiente';
  const turnoLabel=isCuba&&especial
    ?((p.hora_entrega||'')>corte?'🔵 Turno 2 — 18:00':'🟠 Turno 1 — '+esc(corte))
    :(p.hora_entrega||'--:--');

  document.getElementById('ed-titulo').textContent=isCuba?'🏪 Pedido Cuba':'📋 Pedido';

  const body=document.getElementById('ed-body');
  body.innerHTML='';

  // ── Cabecera ──
  if(isCuba){
    const cuba=document.createElement('div');
    cuba.style.cssText='background:var(--cuba-bg);border:1.5px solid var(--cuba-border);border-radius:var(--radius-sm);padding:7px 12px;font-size:.78rem;color:var(--cuba-ink);font-weight:500;margin-bottom:12px;';
    cuba.textContent='🏪 Pedido de Cuba';
    body.appendChild(cuba);
  } else {
    const hdr=document.createElement('div');
    hdr.style.cssText='display:flex;gap:5px;margin-bottom:12px;align-items:flex-start;';
    const left=document.createElement('div');left.style.flex='1';
    const lblCli=document.createElement('div');lblCli.style.cssText='font-size:.52rem;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-light);font-weight:600;margin-bottom:2px;';lblCli.textContent='Cliente';
    const valCli=document.createElement('div');valCli.style.cssText='font-size:.98rem;font-weight:600;';valCli.textContent=p.cliente_input||p.cliente||'Sin nombre';
    left.appendChild(lblCli);left.appendChild(valCli);
    if(p.tel){const tel=document.createElement('div');tel.style.cssText='font-size:.75rem;color:var(--ink-light);margin-top:1px;';tel.textContent='📞 '+p.tel;left.appendChild(tel);}
    const right=document.createElement('div');right.style.cssText='text-align:right;flex-shrink:0;';
    const lblH=document.createElement('div');lblH.style.cssText='font-size:.52rem;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-light);font-weight:600;margin-bottom:2px;';lblH.textContent='Hora';
    const valH=document.createElement('div');valH.style.cssText='font-size:.95rem;font-weight:600;color:var(--accent);';valH.textContent=turnoLabel;
    right.appendChild(lblH);right.appendChild(valH);
    hdr.appendChild(left);hdr.appendChild(right);
    body.appendChild(hdr);
  }
  if(isCuba&&especial){
    const tr=document.createElement('div');tr.style.cssText='margin-bottom:12px;';
    tr.innerHTML='<div style="font-size:.52rem;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-light);font-weight:600;margin-bottom:4px;">Turno</div><div style="font-size:.9rem;font-weight:600;color:var(--accent);">'+turnoLabel+'</div>';
    body.appendChild(tr);
  }

  // ── Productos ──
  const prodLbl=document.createElement('div');
  prodLbl.style.cssText='font-size:.52rem;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-light);font-weight:600;margin-bottom:4px;';
  prodLbl.textContent='Productos';
  body.appendChild(prodLbl);
  const prodWrap=document.createElement('div');prodWrap.style.marginBottom='12px';
  if(!p.productos||!p.productos.length){
    prodWrap.innerHTML='<div style="color:var(--ink-light);font-style:italic;font-size:.8rem;">Sin productos</div>';
  } else {
    p.productos.forEach(r=>{
      const nom=r.tipo==='catalogo'?r.nombre:r.libre;
      const _cantN=Number(r.cantidad);const cant=isNaN(_cantN)?1:_cantN;
      const tam=r.tamano?' · '+r.tamano:'';
      const row=document.createElement('div');
      row.style.cssText='display:flex;align-items:center;gap:7px;padding:7px 0;border-bottom:1px solid var(--border);';
      // listo check
      const lstChk=document.createElement('div');
      lstChk.style.cssText='width:18px;height:18px;border-radius:4px;border:1.5px solid '+(r.listo?'var(--green)':'var(--border)')+';background:'+(r.listo?'var(--green)':'transparent')+';display:flex;align-items:center;justify-content:center;font-size:10px;color:'+(r.listo?'#fff':'transparent')+';flex-shrink:0;';
      lstChk.textContent='✓';
      // pill
      const pill=document.createElement('span');
      pill.className='tacc-pill '+(r.tacc==='s'?'s':'c');
      pill.textContent=r.tacc==='s'?'ST':'C';
      // nombre
      const nomEl=document.createElement('span');
      nomEl.style.cssText='flex:1;font-size:.85rem;'+(r.listo?'color:var(--green-mid);text-decoration:line-through;':'');
      nomEl.innerHTML=esc(nom||'(sin nombre)')+esc(tam)+' <strong>x'+cant+'</strong>';
      row.appendChild(lstChk);row.appendChild(pill);row.appendChild(nomEl);
      // checkbox circular rojo para Cuba (solo prod comunes)
      if(r.tacc==='c'){
        const cubaBtn=document.createElement('div');
        const on=r.pedido_cuba;
        cubaBtn.style.cssText='width:20px;height:20px;border-radius:50%;border:2px solid '+(on?'var(--accent)':'var(--border)')+';background:'+(on?'var(--accent)':'transparent')+';display:flex;align-items:center;justify-content:center;font-size:10px;color:'+(on?'#fff':'transparent')+';flex-shrink:0;cursor:pointer;transition:all .15s;';
        cubaBtn.textContent='✓';
        cubaBtn.title=on?'Pedido a Cuba ✓':'Marcar como pedido a Cuba';
        const rid=r.id;
        cubaBtn.onclick=function(){vistaToggleCuba(rid);};
        row.appendChild(cubaBtn);
      }
      prodWrap.appendChild(row);
      // nota por producto
      if(r.nota_prod&&r.nota_prod.trim()){
        const notaRow=document.createElement('div');
        notaRow.style.cssText='font-size:.68rem;color:var(--ink-light);font-style:italic;padding:1px 0 3px 44px;';
        notaRow.textContent='↳ '+r.nota_prod;
        prodWrap.appendChild(notaRow);
      }
      // extras del producto
      if(r.extras&&r.extras.length){
        r.extras.forEach(ex=>{
          if(!ex.precio&&!ex.desc)return;
          const exRow=document.createElement('div');
          exRow.style.cssText='font-size:.68rem;color:var(--amber);padding:1px 0 3px 44px;display:flex;align-items:center;gap:5px;';
          exRow.innerHTML='<span>➕</span><span style="flex:1;">'+(ex.desc?esc(ex.desc):'extra')+'</span>'+(ex.precio?'<strong>$'+Number(ex.precio).toLocaleString('es-AR')+'</strong>':'');
          prodWrap.appendChild(exRow);
        });
      }
    });
  }
  body.appendChild(prodWrap);

  // ── Precios, total y efectivo ──
  const totalPedido=calcularTotalPedido(p);
  if(totalPedido>0){
    const efectivo=Math.round(totalPedido*0.9);
    // Desglose por producto
    const desgloseDivs=[];
    (p.productos||[]).forEach(r=>{
      const cat=datos.catalogo.find(c=>c.nombre===r.nombre&&((r.tacc==='s'&&c.tipo==='sin_tacc')||(r.tacc==='c'&&c.tipo==='con_tacc')));
      const cant=Number(r.cantidad)||1;
      const baseU=r.tipo==='libre'?(r.precio_libre||0):getPrecioCat(cat,r.tamano);
      const extrasTotal=(r.extras||[]).reduce((s,ex)=>s+(parseFloat(ex.precio)||0),0);
      const totalR=(baseU*cant)+extrasTotal;
      if(!totalR)return;
      const nom=r.tipo==='catalogo'?r.nombre:r.libre;
      const tam=r.tamano?' · '+r.tamano:'';
      desgloseDivs.push(`<div style="display:flex;justify-content:space-between;font-size:.72rem;color:var(--ink-mid);margin-bottom:2px;">
        <span>${esc(nom||'')}${esc(tam)}${cant>1?' x'+cant:''}</span>
        <span>$${totalR.toLocaleString('es-AR')}</span>
      </div>`);
    });
    const totalBar=document.createElement('div');
    totalBar.style.cssText='background:var(--green-soft,#eaf4ed);border:1.5px solid var(--green-mid,#4a8c5c);border-radius:var(--radius-sm);padding:10px 14px;margin-bottom:12px;';
    totalBar.innerHTML=(desgloseDivs.length>1?`<div style="margin-bottom:7px;padding-bottom:7px;border-bottom:1px dashed var(--green-mid,#4a8c5c);">${desgloseDivs.join('')}</div>`:'')
      +`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <span style="font-size:.62rem;text-transform:uppercase;letter-spacing:.08em;color:var(--green-mid,#4a8c5c);font-weight:700;">Total</span>
          <span style="font-size:1.1rem;font-weight:700;color:var(--green-mid,#4a8c5c);font-family:'Lora',serif;">$${totalPedido.toLocaleString('es-AR')}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:.68rem;color:var(--ink-light);">💵 Efectivo (−10%)</span>
          <span style="font-size:.82rem;font-weight:600;color:var(--ink-mid);">$${efectivo.toLocaleString('es-AR')}</span>
        </div>`;
    body.appendChild(totalBar);
  }

  // ── Estado + Pago ──
  const estPago=document.createElement('div');
  estPago.style.cssText='display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;';
  const estDiv=document.createElement('div');
  const estLbl=document.createElement('div');estLbl.style.cssText='font-size:.52rem;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-light);font-weight:600;margin-bottom:3px;';estLbl.textContent='Estado';
  const estVal=document.createElement('div');estVal.style.cssText='font-size:.85rem;font-weight:500;';estVal.textContent=estadoLabel;
  estDiv.appendChild(estLbl);estDiv.appendChild(estVal);estPago.appendChild(estDiv);
  if(!isCuba){
    const pagoDiv=document.createElement('div');
    pagoDiv.style.cssText='font-size:.82rem;font-weight:500;'+(p.pagado?'color:var(--green);':'color:var(--ink-light);');
    pagoDiv.textContent=p.pagado?'✅ Pagado '+(p.metodoPago||''):'💳 Sin confirmar pago';
    estPago.appendChild(pagoDiv);
  }
  body.appendChild(estPago);

  // ── Nota ──
  if(p.notas){
    const nota=document.createElement('div');
    nota.style.cssText='background:var(--amber-soft);border:1.5px solid var(--amber);border-radius:var(--radius-sm);padding:8px 11px;font-size:.78rem;color:var(--amber);';
    nota.textContent='📝 '+p.notas;
    body.appendChild(nota);
  }
}


function vistaToggleCuba(prodId){
  const r=(_edPedido.productos||[]).find(x=>x.id===prodId);if(!r)return;
  r.pedido_cuba=!r.pedido_cuba;
  // Guardar en el pedido real también
  const pReal=getAllPedidos().find(x=>x.id===_edPedidoId);
  if(pReal){const rReal=(pReal.productos||[]).find(x=>x.id===prodId);if(rReal)rReal.pedido_cuba=r.pedido_cuba;}
  guardar();
  edRenderVista();
  renderPedidos();
  const cubaTab=document.getElementById('tab-cuba');
  if(cubaTab&&cubaTab.classList.contains('active'))renderCuba();
}

function edRenderEdicion(){
  const p=_edPedido;
  const isCuba=esCuba(p.cliente);
  const dd=diaData();
  const especial=dd.especial||false;
  const corte=dd.corteHora||'15:00';
  const estado=p.estado||'pendiente';
  const estadoOpts=['pendiente','prod','listo','entregado'];
  const estadoLabels={pendiente:'Pendiente',prod:'En producción',listo:'Listo',entregado:'Retirado'};

  const prodsHTML=p.productos.map((r,i)=>edBuildProdRow(r,i)).join('');

  const pagadoBar=p.pagado
    ?'<div class="pago-bar si" id="ed-pago-bar">✅ Pagado · '+esc(p.metodoPago||'')+' <button class="btn-pagar despagar" onclick="edTogglePago()">Deshacer</button></div>'
    :'<div class="pago-bar no" id="ed-pago-bar">💳 Sin confirmar pago <button class="btn-pagar pagar" onclick="edTogglePago()">Confirmar</button></div>';

  const horaField=isCuba&&especial
    ?'<div class="modal-np-campo"><label id="ed-hora-label">Turno de envío</label>'
      +'<div class="modal-np-turno-opts">'
        +'<div class="modal-np-turno-btn t1'+((p.hora_entrega||'')<=corte&&p.hora_entrega?' active':'')+'" id="ed-t1" onclick="edSelTurno(1,&quot;'+corte+'&quot;)">🟠 Turno 1 — '+esc(corte)+'</div>'
        +'<div class="modal-np-turno-btn t2'+((p.hora_entrega||'')>corte?' active':'')+'" id="ed-t2" onclick="edSelTurno(2,&quot;18:00&quot;)">🔵 Turno 2 — 18:00</div>'
      +'</div></div>'
    : isCuba ? ''
    : '<div class="modal-np-campo"><label>Hora de entrega</label>'
        +'<input type="time" id="ed-hora" value="'+esc(p.hora_entrega||'')+'" oninput="_edPedido.hora_entrega=this.value">'
      +'</div>';

  document.getElementById('ed-titulo').textContent=isCuba?'✏️ Editar pedido Cuba':'✏️ Editar pedido';

  document.getElementById('ed-body').innerHTML=
    (isCuba
      ?'<div class="modal-np-campo"><div style="background:var(--cuba-bg);border:1.5px solid var(--cuba-border);border-radius:var(--radius-sm);padding:7px 12px;font-size:.78rem;color:var(--cuba-ink);font-weight:500;">🏪 Pedido de Cuba</div></div>'
      :'<div class="modal-np-campo">'
        +'<label>Cliente</label>'
        +'<div style="display:flex;gap:8px;">'
          +'<input type="text" id="ed-nombre" value="'+esc(p.cliente_input||p.cliente||'')+'" placeholder="Nombre..." style="flex:1.2;" oninput="_edPedido.cliente_input=this.value;_edPedido.cliente=normalizarCliente(this.value)" autocomplete="off">'
          +'<input type="tel" id="ed-tel" value="'+esc(p.tel||'')+'" placeholder="Teléfono..." style="flex:1;" oninput="_edPedido.tel=this.value">'
        +'</div>'
      +'</div>'
    )
    +horaField
    +'<div class="modal-np-campo">'
      +'<label>Productos</label>'
      +'<div id="ed-prods-wrap">'+prodsHTML+'</div>'
      +'<button class="btn-add-prod" onclick="edAgregarProducto()" style="margin-top:4px;">＋ Agregar producto</button>'
    +'</div>'
    +'<div style="height:1px;background:var(--border);margin:2px 0 12px;"></div>'
    +'<div class="modal-np-campo">'
      +'<label>Estado</label>'
      +'<div class="estado-sel" id="ed-estado-sel">'
        +estadoOpts.map(e=>'<div class="estado-opt'+(estado===e?' active-'+e:'')+'" onclick="edSelEstado(&quot;'+e+'&quot;,this)">'+estadoLabels[e]+'</div>').join('')
      +'</div>'
    +'</div>'
    +(isCuba ? '' : '<div class="modal-np-campo" id="ed-campo-pago">'+pagadoBar+'</div>')
    +'<div class="modal-np-campo">'
      +'<button class="nota-general-toggle" id="ed-nota-btn" onclick="edToggleNota()">📝 '+(p.notas?'Nota: '+esc(p.notas.slice(0,40))+(p.notas.length>40?'…':''):'Agregar nota')+'</button>'
      +'<div id="ed-nota-wrap" style="'+(p.notas?'display:block':'display:none')+';margin-top:6px;">'
        +'<textarea class="notas-input" id="ed-nota" placeholder="Sin dulce de leche...">'+esc(p.notas||'')+'</textarea>'
      +'</div>'
    +'</div>'
    +'<div class="modal-np-campo">'
      +'<div style="font-size:.56rem;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-light);font-weight:500;margin-bottom:6px;">Mover a otro día</div>'
      +'<div style="display:flex;gap:6px;flex-wrap:wrap;">'+buildMoverOptsEd(_edPedidoId)+'</div>'
    +'</div>'
    +'<div class="modal-np-error" id="ed-error"></div>';
}

function edBuildProdRow(r,i){
  const cat=datos.catalogo.find(c=>c.nombre===r.nombre&&c.tipo===(r.tacc==='s'?'sin_tacc':'con_tacc'));
  const tieneTalle=r.tipo==='catalogo'?(cat?cat.tiene_talle:true):true;
  const nom=r.tipo==='catalogo'?r.nombre:r.libre;
  const pill=r.tacc==='s'?'<span class="tacc-pill s">ST</span>':'<span class="tacc-pill c">C</span>';
  const libreActivo=r._tamLibre||(!!(r.tamano)&&!['Chico','Mediano','Grande'].includes(r.tamano));
  const sinTalleWarn=tieneTalle&&!(r.tamano||'').trim()?'<span style="font-size:.58rem;color:var(--red);font-weight:700;margin-left:4px;">⚠ TALLE</span>':'';
  const tamHTML=tieneTalle?`<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:5px;">
    ${['Chico','Mediano','Grande'].map(t=>`<button class="tam-btn${!libreActivo&&r.tamano===t?' active':''}" onclick="edSetTamano('${r.id}','${t}')">${t}</button>`).join('')}
    <button class="tam-btn tam-btn-libre${libreActivo?' active':''}" onclick="edSetTamano('${r.id}','__libre__')">Libre</button>
  </div>
  <input type="text" class="tam-libre-input${libreActivo?' visible':''}" value="${esc(libreActivo&&r.tamano?r.tamano:'')}" placeholder="ej: 2kg..." oninput="edSetTamanoLibre('${r.id}',this.value)">`:'';
  return`<div class="prod-edit-fila" id="ed-prod-${r.id}">
    <div class="prod-edit-top">
      <div class="prod-listo-chk${r.listo?' on':''}" onclick="edToggleProdListo('${r.id}')">✓</div>
      <div class="prod-edit-nombre${r.tipo==='libre'?' libre':''}">${esc(nom||'(sin nombre)')}</div>
      ${pill}
      <button class="btn-cambiar-prod" onclick="edCambiarProd('${r.id}')">Cambiar</button>
      <button class="btn-remove-prod" onclick="edEliminarProd('${r.id}')">✕</button>
    </div>
    <div class="prod-mid-row">
      <div class="prod-mid-cant">
        <button class="cant-btn" onclick="edAjustarCant('${r.id}',-1)">−</button>
        <span style="font-size:.88rem;min-width:20px;text-align:center;">${(()=>{const _n=Number(r.cantidad);return isNaN(_n)?1:_n;})()}</span>
        <button class="cant-btn" onclick="edAjustarCant('${r.id}',1)">＋</button>
      </div>
      ${tieneTalle?`<div class="prod-mid-talle">
        ${['Chico','Mediano','Grande'].map(t=>`<button class="tam-btn${!libreActivo&&r.tamano===t?' active':''}" onclick="edSetTamano('${r.id}','${t}')">${t}</button>`).join('')}
        <button class="tam-btn tam-btn-libre${libreActivo?' active':''}" onclick="edSetTamano('${r.id}','__libre__')">Libre</button>
      </div>`:''}
      ${sinTalleWarn}
    </div>
    ${tieneTalle?`<input type="text" class="tam-libre-input${libreActivo?' visible':''}" value="${esc(libreActivo&&r.tamano?r.tamano:'')}" placeholder="ej: 2kg..." oninput="edSetTamanoLibre('${r.id}',this.value)" style="margin-top:4px;">`:''}
    <div style="padding-top:4px;">
      <button class="prod-nota-toggle" onclick="edToggleNotaProd('${r.id}')">${r.nota_prod?'✏️ '+esc(r.nota_prod):'＋ Nota del producto'}</button>
      <textarea class="prod-nota-textarea${r.nota_prod?' visible':''}" id="ed-nota-prod-${r.id}" placeholder="ej: sin glaseado, con fruta..." oninput="edSetNotaProd('${r.id}',this.value)">${esc(r.nota_prod||'')}</textarea>
    </div>
  </div>`;
}

function edSelEstado(estado,el){
  _edPedido.estado=estado;
  document.querySelectorAll('#ed-estado-sel .estado-opt').forEach(b=>b.className='estado-opt');
  el.className='estado-opt active-'+estado;
}
function edTogglePago(){
  if(!_edPedido.pagado){
    // Abrir modal de métodos
    _pagoId='__ed__';_pagoDeshacer=false;_pagoMetodo=null;
    document.querySelectorAll('.modal-metodo').forEach(m=>m.classList.remove('selected'));
    document.getElementById('modal-pago-titulo').textContent='Confirmar pago';
    document.getElementById('modal-pago-desc').textContent='Seleccioná el método de pago.';
    document.getElementById('modal-pago').classList.remove('hidden');
  } else {
    _edPedido.pagado=false;_edPedido.metodoPago='';
    const bar=document.getElementById('ed-pago-bar');
    if(bar){
      bar.className='pago-bar no';
      bar.innerHTML='💳 Sin confirmar pago <button class="btn-pagar pagar" onclick="edTogglePago()">Confirmar</button>';
    }
  }
}
function edToggleNota(){
  const wrap=document.getElementById('ed-nota-wrap');
  const visible=wrap.style.display!=='none';
  wrap.style.display=visible?'none':'block';
  if(!visible)document.getElementById('ed-nota').focus();
}
function edSelTurno(n,hora){
  _edPedido.hora_entrega=hora;
  document.getElementById('ed-t1').classList.toggle('active',n===1);
  document.getElementById('ed-t2').classList.toggle('active',n===2);
}
function edToggleProdListo(rId){
  const r=_edPedido.productos.find(x=>x.id===rId);if(!r)return;
  r.listo=!r.listo;edRenderProds();
}
function edAjustarCant(rId,delta){
  const r=_edPedido.productos.find(x=>x.id===rId);if(!r)return;
  r.cantidad=Math.max(1,(()=>{const _n=Number(r.cantidad);return isNaN(_n)?1:_n;})()+delta);
  edRenderProds();
}
function edSetTamano(rId,tam){
  const r=_edPedido.productos.find(x=>x.id===rId);if(!r)return;
  if(tam==='__libre__'){r._tamLibre=true;}
  else{r.tamano=tam;r._tamLibre=false;}
  edRenderProds();
}
function edSetTamanoLibre(rId,val){
  const r=_edPedido.productos.find(x=>x.id===rId);if(!r)return;
  r.tamano=val;r._tamLibre=true;
}
function edToggleNotaProd(rId){
  const ta=document.getElementById('ed-nota-prod-'+rId);if(!ta)return;
  const visible=ta.classList.contains('visible');
  ta.classList.toggle('visible',!visible);
  if(!visible)ta.focus();
  const r=_edPedido.productos.find(x=>x.id===rId);
  const btn=ta.previousElementSibling;
  if(btn&&r)btn.textContent=r.nota_prod?'✏️ '+r.nota_prod:'＋ Nota del producto';
}
function edSetNotaProd(rId,val){
  const r=_edPedido.productos.find(x=>x.id===rId);if(!r)return;
  r.nota_prod=val;
  const ta=document.getElementById('ed-nota-prod-'+rId);
  if(ta&&ta.previousElementSibling)ta.previousElementSibling.textContent=val?'✏️ '+val:'＋ Nota del producto';
}
function edEliminarProd(rId){
  _edPedido.productos=_edPedido.productos.filter(x=>x.id!==rId);
  edRenderProds();
}
function edCambiarProd(rId){
  _selectorPedidoId='__ed__';_selectorProdId=rId;
  document.getElementById('selector-search').value='';
  renderSelectorLista();
  document.getElementById('selector-overlay').classList.remove('hidden');
}
function edAgregarProducto(){
  _selectorPedidoId='__ed__';_selectorProdId=null;
  document.getElementById('selector-search').value='';
  renderSelectorLista();
  document.getElementById('selector-overlay').classList.remove('hidden');
}
function edRenderProds(){
  const wrap=document.getElementById('ed-prods-wrap');
  if(!wrap)return;
  wrap.innerHTML=_edPedido.productos.map((r,i)=>edBuildProdRow(r,i)).join('');
}
function buildMoverOptsEd(pedidoId){
  const otrosDias=Object.keys(datos.dias).filter(k=>k!==diaActual).sort();
  if(!otrosDias.length)return'<span style="font-size:.7rem;color:var(--ink-light);font-style:italic;">No hay otros días.</span>';
  const hoy=fechaKey(new Date());
  return otrosDias.map(k=>{
    const[y,m,d]=k.split('-').map(Number);
    const f=new Date(y,m-1,d);
    const label=k===hoy?`Hoy ${d}/${m}`:`${DIAS_S[f.getDay()]} ${d}/${m}`;
    return`<div class="mover-dia-opt" onclick="moverPedidoDesdeEdicion('${pedidoId}','${k}')">${label}</div>`;
  }).join('');
}
function moverPedidoDesdeEdicion(pedidoId,diaDestino){
  cerrarModalEdicion();
  moverPedido(pedidoId,diaDestino);
}
function confirmarEliminarDesdeEdicion(){
  cerrarModalEdicion();
  confirmarEliminar(_edPedidoId||'');
}

function guardarEdicion(){
  if(!_edPedido||!_edPedidoId)return;
  const isCuba=esCuba(_edPedido.cliente);
  const errDiv=document.getElementById('ed-error');
  // Tomar nota del textarea si fue editada
  const notaTA=document.getElementById('ed-nota');
  if(notaTA)_edPedido.notas=notaTA.value;
  // Validar
  const errores=[];
  if(!isCuba&&!(_edPedido.cliente_input||_edPedido.cliente||'').trim())errores.push('Falta el nombre del cliente');
  if(!isCuba&&!(_edPedido.hora_entrega||'').trim())errores.push('Falta la hora de entrega');
  if(!_edPedido.productos||!_edPedido.productos.length)errores.push('Agregá al menos un producto');
  if(errores.length){
    errDiv.innerHTML='⚠️ '+errores.join(' · ');errDiv.style.display='';
    return;
  }
  // Validar talles obligatorios
  const sinTalleEd=(_edPedido.productos||[]).filter(r=>{
    const cat=datos.catalogo.find(c=>c.nombre===r.nombre&&c.tipo===(r.tacc==='s'?'sin_tacc':'con_tacc'));
    const obliga=r.tipo==='catalogo'?(cat?cat.tiene_talle:false):false;
    return obliga&&!(r.tamano||'').trim();
  });
  if(sinTalleEd.length){
    const noms=sinTalleEd.map(r=>r.nombre).join(', ');
    errDiv.innerHTML='⚠️ Completá el talle de: <strong>'+esc(noms)+'</strong>';
    errDiv.style.display='';return;
  }
  // Limpiar _tamLibre
  _edPedido.productos.forEach(r=>{delete r._tamLibre;});
  // Aplicar al pedido real — buscar en cualquier día
  let guardadoOk=false;
  Object.values(datos.dias).forEach(dData=>{
    if(guardadoOk)return;
    const ps=dData.pedidos||[];
    const idx=ps.findIndex(x=>x.id===_edPedidoId);
    if(idx>=0){ps[idx]={...ps[idx],..._edPedido};guardadoOk=true;}
  });
  guardar();
  mostrarToastGuardado();
  cerrarModalEdicion();
  renderPedidos();
  // Refrescar producción si está activa
  const prodTab=document.getElementById('tab-produccion');
  if(prodTab&&prodTab.classList.contains('active'))renderProduccion();
}

