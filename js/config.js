// ── CLIENTES FRECUENTES ──
function guardarFrecuente(){
  const nom=(document.getElementById('frec-nom-input').value||'').trim();
  const tel=(document.getElementById('frec-tel-input').value||'').trim();
  if(!nom)return;
  const existe=datos.clientes.find(c=>c.nombre.toLowerCase()===nom.toLowerCase());
  if(existe){existe.tel=tel||existe.tel;guardar();renderFrecuentes();return;}
  datos.clientes.push({id:uid(),nombre:nom,tel,frecuente:true});
  document.getElementById('frec-nom-input').value='';
  document.getElementById('frec-tel-input').value='';
  guardar();renderFrecuentes();
}
function eliminarFrecuente(id){
  abrirModalGen('¿Eliminar cliente?','Se eliminará de la lista de frecuentes.',()=>{
    datos.clientes=datos.clientes.filter(c=>c.id!==id);
    guardar();renderFrecuentes();
  },'danger');
}
function editarFrecuente(id){
  // toggle edit inline
  const existing=document.getElementById('frec-edit-'+id);
  if(existing){existing.classList.toggle('open');return;}
}
function guardarEditFrecuente(id){
  const c=datos.clientes.find(x=>x.id===id);if(!c)return;
  const nom=(document.getElementById('frec-edit-nom-'+id).value||'').trim();
  const tel=(document.getElementById('frec-edit-tel-'+id).value||'').trim();
  if(!nom)return;
  c.nombre=nom;c.tel=tel;
  guardar();renderFrecuentes();
}
function exportarClientesCSV(){
  const frecs = datos.clientes.filter(c => !esCuba(c.nombre));
  if(!frecs.length){ alert('No hay clientes frecuentes para exportar.'); return; }
  const rows = ['\uFEFFNombre,Teléfono'];
  frecs.forEach(c => rows.push(`"${(c.nombre||'').replace(/"/g,'""')}","${(c.tel||'').replace(/"/g,'""')}"`));
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([rows.join('\n')], {type:'text/csv;charset=utf-8'}));
  a.download = 'clientes_puerto_dulce.csv';
  a.click();
}

function importarClientesCSV(input){
  const file = input.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const lines = e.target.result.replace(/\r/g,'').split('\n').filter(Boolean);
    // saltar encabezado si dice "Nombre"
    const dataLines = lines[0].toLowerCase().includes('nombre') ? lines.slice(1) : lines;
    const nuevos = [];
    dataLines.forEach(line => {
      // parsear CSV simple: quitar comillas, separar por primera coma
      const clean = line.replace(/^"|"$/g,'');
      const parts = line.match(/(".*?"|[^,]+)(?=,|$)/g) || [];
      const nombre = (parts[0]||'').replace(/^"|"$/g,'').trim();
      const tel    = (parts[1]||'').replace(/^"|"$/g,'').trim();
      if(!nombre) return;
      nuevos.push({ nombre, tel });
    });
    if(!nuevos.length){ alert('No se encontraron clientes válidos en el archivo.'); return; }
    let agregados = 0;
    nuevos.forEach(({nombre, tel}) => {
      const existe = datos.clientes.find(c => c.nombre.toLowerCase() === nombre.toLowerCase());
      if(!existe){
        datos.clientes.push({ id: uid(), nombre, tel, frecuente: true });
        agregados++;
      }
    });
    guardar(); renderFrecuentes();
    alert(`✓ ${agregados} clientes importados (${nuevos.length - agregados} ya existían).`);
  };
  reader.readAsText(file, 'utf-8');
  input.value = '';
}

function renderFrecuentes(){
  const wrap=document.getElementById('frec-lista-wrap');
  if(!wrap)return;
  const frecs=datos.clientes.filter(c=>!esCuba(c.nombre));
  if(!frecs.length){
    wrap.innerHTML='<div class="vacio">Sin clientes frecuentes aún.</div>';
    return;
  }
  wrap.innerHTML=frecs.map(c=>`
    <div>
      <div class="frec-item">
        <span class="frec-star">⭐</span>
        <span class="frec-nom">${esc(c.nombre)}</span>
        <span class="frec-tel">${esc(c.tel||'—')}</span>
        <button style="font-size:.65rem;padding:3px 8px;border:1.5px solid var(--border);border-radius:6px;background:transparent;color:var(--ink-mid);cursor:pointer;font-family:'Outfit',sans-serif;" onclick="document.getElementById('frec-edit-${c.id}').classList.toggle('open')">Editar</button>
        <button class="btn-cat-del" onclick="eliminarFrecuente('${c.id}')">✕</button>
      </div>
      <div class="frec-edit-wrap" id="frec-edit-${c.id}">
        <div style="font-size:.62rem;color:var(--ink-light);margin-bottom:4px;">Editar datos:</div>
        <div class="frec-edit-row">
          <input type="text" id="frec-edit-nom-${c.id}" value="${esc(c.nombre)}" placeholder="Nombre...">
          <input type="tel" id="frec-edit-tel-${c.id}" value="${esc(c.tel||'')}" placeholder="Teléfono...">
          <button style="font-family:'Outfit',sans-serif;font-size:.72rem;padding:6px 11px;border:none;border-radius:6px;background:var(--green);color:#fff;cursor:pointer;" onclick="guardarEditFrecuente('${c.id}')">Guardar</button>
        </div>
      </div>
    </div>
  `).join('');
}


let _catTalleOnState=true;
function selCatTipo(tipo){
  _catTipo=tipo;
  document.getElementById('cat-tipo-sin').className=tipo==='sin_tacc'?'sel-sin':'';
  document.getElementById('cat-tipo-com').className=tipo==='con_tacc'?'sel-com':'';
}
function toggleCatTalle(){
  _catTalleOnState=!_catTalleOnState;
  document.getElementById('cat-talle-toggle-wrap').className='cat-tiene-talle'+(_catTalleOnState?' on':'');
}
function agregarProductoCatalogo(){
  const inp=document.getElementById('cat-input');
  const nombre=inp.value.trim();if(!nombre)return;
  const precioRaw=document.getElementById('cat-precio-input').value;
  const precio=parseFloat(precioRaw)||0;
  if(datos.catalogo.some(c=>c.nombre.toLowerCase()===nombre.toLowerCase()&&c.tipo===_catTipo)){alert('Ya existe ese producto en el catálogo.');return;}
  const catSel=document.getElementById('cat-categoria-input');
  const categoria=catSel?catSel.value:'otros';
  datos.catalogo.push({nombre,tipo:_catTipo,tiene_talle:_catTalleOnState,precio,categoria});
  inp.value='';document.getElementById('cat-precio-input').value='';
  guardar();renderCatalogo();
}


function eliminarProductoCatalogo(nombre,tipo){
  abrirModalGen('¿Eliminar producto?',`"${nombre}" se eliminará del catálogo.`,()=>{
    datos.catalogo=datos.catalogo.filter(c=>!(c.nombre===nombre&&c.tipo===tipo));
    guardar();renderCatalogo();
  },'danger');
}
function editarPrecioCatalogo(nombre,tipo,nuevo){
  const cat=datos.catalogo.find(c=>c.nombre===nombre&&c.tipo===tipo);
  if(cat){cat.precio=parseFloat(nuevo)||0;guardar();}
}
function renderCatalogo(){
  const wrap=document.getElementById('catalogo-lista');
  wrap.innerHTML='';
  if(!datos.catalogo.length){wrap.innerHTML='<div class="vacio">Catálogo vacío.</div>';return;}
  function precioStr(c){
    if(c.tiene_talle){
      const partes=[];
      if(c.precio_chico)partes.push(`Ch $${c.precio_chico.toLocaleString('es-AR')}`);
      if(c.precio_mediano)partes.push(`Med $${c.precio_mediano.toLocaleString('es-AR')}`);
      if(c.precio_grande)partes.push(`Gr $${c.precio_grande.toLocaleString('es-AR')}`);
      return partes.length?`<span class="cat-item-precio">${partes.join(' · ')}</span>`:'';
    }
    return c.precio?`<span class="cat-item-precio">$${c.precio.toLocaleString('es-AR')}</span>`:'';
  }
  function renderGrupoCat(items,tacc){
    const porCat={};
    items.forEach(c=>{
      const cat=c.categoria&&CAT_ORDEN.includes(c.categoria)?c.categoria:'otros';
      if(!porCat[cat])porCat[cat]=[];
      porCat[cat].push(c);
    });
    CAT_ORDEN.forEach(cat=>{
      if(!porCat[cat])return;
      const lbl=document.createElement('div');lbl.className='cat-section-label';
      lbl.textContent=(tacc==='s'?'🌿 ST · ':'🌾 C · ')+CAT_LABELS[cat];
      wrap.appendChild(lbl);
      porCat[cat].sort((a,b)=>a.nombre.localeCompare(b.nombre)).forEach(c=>{
        const d=document.createElement('div');d.className='cat-item-row';
        const pill=tacc==='s'?'<span class="tacc-pill s">ST</span>':'<span class="tacc-pill c">C</span>';
        d.innerHTML=`<span class="cat-item-nombre">${esc(c.nombre)}</span>${precioStr(c)}<div class="cat-item-flags">${c.tiene_talle?'<span class="cat-flag tam">talle</span>':''}${pill}</div><button class="btn-cat-del" onclick="eliminarProductoCatalogo('${esc(c.nombre)}','${c.tipo}')">✕</button>`;
        wrap.appendChild(d);
      });
    });
  }
  const sin=datos.catalogo.filter(c=>c.tipo==='sin_tacc');
  const com=datos.catalogo.filter(c=>c.tipo==='con_tacc');
  if(sin.length)renderGrupoCat(sin,'s');
  if(com.length)renderGrupoCat(com,'c');
}

// ── CONFIG SUBPESTAÑAS ──
function showCfgTab(id, el) {
  document.querySelectorAll('.cfg-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.cfg-panel').forEach(p => p.classList.remove('active'));
  if(el) el.classList.add('active');
  const panel = document.getElementById('cfgpanel-' + id);
  if(panel) panel.classList.add('active');
  // Renderizar contenido según panel
  if(id === 'clientes') renderFrecuentes();
  if(id === 'catalogo') renderCatalogo();
  if(id === 'archivos') renderArchivadosGlobal();
  if(id === 'local') renderCfgLocal();
}

// ── TEMAS ──
function setTema(tema) {
  const temas = ['default','girly','neon','pro','dark','pooh'];
  const html = document.documentElement;
  if (tema === 'default') {
    html.removeAttribute('data-theme');
  } else {
    html.setAttribute('data-theme', tema);
  }
  localStorage.setItem('pd_tema', tema);
  temas.forEach(t => {
    const btn = document.getElementById('tema-btn-' + t);
    if (btn) btn.classList.toggle('activo', t === tema);
  });
}
(function() {
  const t = localStorage.getItem('pd_tema') || 'default';
  setTema(t);
})();

// ── LAYOUT (horizontal / vertical) ──
function setLayout(layout) {
  const body = document.body;
  const btnH = document.getElementById('layout-btn-horizontal');
  const btnV = document.getElementById('layout-btn-vertical');
  if (layout === 'vertical') {
    body.classList.add('layout-vertical');
    if (btnH) btnH.classList.remove('activo');
    if (btnV) btnV.classList.add('activo');
  } else {
    body.classList.remove('layout-vertical');
    if (btnH) btnH.classList.add('activo');
    if (btnV) btnV.classList.remove('activo');
  }
  applySidebarCollapseState();
  localStorage.setItem('pd_layout', layout);
}
document.addEventListener('DOMContentLoaded', function() {
  const l = localStorage.getItem('pd_layout') || 'horizontal';
  setLayout(l);
});
function applySidebarCollapseState(){
  const collapsed = localStorage.getItem('pd_sidebar_collapsed') === '1';
  const tabs = document.getElementById('main-tabs');
  const btn = document.getElementById('tabs-collapse-btn');
  if(!tabs || !btn) return;
  tabs.classList.toggle('collapsed', collapsed);
  document.body.classList.toggle('sidebar-collapsed', collapsed); // ← agregar esta línea
  btn.textContent = collapsed ? '⇥' : '⇤';
}
function toggleSidebarCollapse(){
  const tabs = document.getElementById('main-tabs');
  if(!tabs) return;
  const next = !tabs.classList.contains('collapsed');
  localStorage.setItem('pd_sidebar_collapsed', next ? '1' : '0');
  applySidebarCollapseState();
  
  // Cerrar menú usuario
  const menu = document.getElementById('usuario-menu');
  if (menu) menu.style.display = 'none';
}
(function(){
  applySidebarCollapseState();
})();

// ══════════════════════════════════════
// LOCALES — setup y gestión de ID
// ══════════════════════════════════════
const LOCALES_DISPONIBLES = [
  { id: 'matienzo', nombre: 'Puerto Dulce — Matienzo', emoji: '🍮', desc: 'Local original. Produce Sin TACC, recibe productos de Cuba.' },
  { id: 'cuba',     nombre: 'Cuba',                    emoji: '🏪', desc: 'Local vecino. Produce Con TACC, recibe productos de Matienzo.' },
  // Para agregar un nuevo local en el futuro, sumarlo acá:
  // { id: 'nuevo_local', nombre: 'Nombre', emoji: '🏬', desc: 'Descripción.' },
];

function renderBotonesLocales(contenedorId, onSelect){
  const cont = document.getElementById(contenedorId);
  if(!cont) return;
  const esSetup = contenedorId === 'setup-locales-lista';
  cont.innerHTML = LOCALES_DISPONIBLES.map(l => {
    const activo = datos.localId === l.id;
    if(esSetup){
      return `<button onclick="(${onSelect.toString()})('${l.id}')"
        style="font-family:'Outfit',sans-serif;text-align:left;padding:16px 18px;border:2px solid ${activo?'var(--accent)':'var(--border)'};border-radius:var(--radius);background:${activo?'var(--accent-soft)':'var(--paper)'};cursor:pointer;display:flex;align-items:center;gap:14px;width:100%;box-shadow:0 2px 12px var(--shadow);transition:all .15s;">
        <span style="font-size:2rem;line-height:1;">${l.emoji}</span>
        <div style="flex:1;">
          <div style="font-size:.95rem;font-weight:700;color:${activo?'var(--accent)':'var(--ink)'};">${l.nombre}${activo?' ✓':''}</div>
          <div style="font-size:.72rem;color:var(--ink-light);margin-top:2px;">${l.desc}</div>
        </div>
        <span style="font-size:1.1rem;color:var(--accent);opacity:.6;">›</span>
      </button>`;
    } else {
      return `<button onclick="(${onSelect.toString()})('${l.id}')"
        style="font-family:'Outfit',sans-serif;text-align:left;padding:12px 14px;border:2px solid ${activo?'var(--accent)':'var(--border)'};border-radius:var(--radius-sm);background:${activo?'var(--accent-soft)':'var(--paper)'};cursor:pointer;display:flex;align-items:center;gap:12px;width:100%;">
        <span style="font-size:1.4rem;">${l.emoji}</span>
        <div>
          <div style="font-size:.85rem;font-weight:700;color:${activo?'var(--accent)':'var(--ink)'};">${l.nombre}${activo?' ✓':''}</div>
          <div style="font-size:.7rem;color:var(--ink-light);margin-top:1px;">${l.desc}</div>
        </div>
      </button>`;
    }
  }).join('');
}

function setLocal(id){
  const local = LOCALES_DISPONIBLES.find(l=>l.id===id);
  if(!local) return;
  datos.localId = local.id;
  datos.nombre_local = local.nombre;
  guardar();
  // Cerrar modal setup si está abierto
  const modal = document.getElementById('modal-setup-local');
  if(modal) modal.style.display = 'none';
  // Actualizar panel config si está visible
  renderCfgLocal();
  // Toast con mensaje personalizado
  const t = document.getElementById('toast-guardado');
  if(t){ const prev=t.textContent; t.textContent=`🏠 ${local.nombre}`; t.classList.add('visible'); setTimeout(()=>{t.classList.remove('visible');setTimeout(()=>{t.textContent=prev;},400);},2200); }
}

function mostrarSetupLocal(){
  if (typeof abrirModalBienvenida === 'function') {
    abrirModalBienvenida();
  }
}

function renderCfgLocal(){
  const actual = document.getElementById('cfg-local-actual');
  if(actual){
    const l = LOCALES_DISPONIBLES.find(x=>x.id===datos.localId);
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
  // cfg-locales-lista está oculto en modo 1 local — llamamos igual para mantener lógica
  renderBotonesLocales('cfg-locales-lista', setLocal);
  renderHorariosEditor();
}

const DIAS_NOMBRES = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

function renderHorariosEditor(){
  const wrap = document.getElementById('cfg-horarios-wrap');
  if(!wrap) return;
  const localId = datos.localId || 'matienzo';
  const horarios = datos.horariosLocales;
  const horLocal = horarios[localId] || {};
  const corteHoy = (datos.cortePedidosHoy||{})[localId] || '14:00';

  let html = `
    <div style="font-family:'Lora',serif;font-style:italic;font-size:.95rem;color:var(--accent);margin:18px 0 4px;">🕐 Horarios del local</div>
    <div style="font-size:.68rem;color:var(--ink-light);margin-bottom:12px;">Los slots del selector de hora se generan automáticamente a partir de estos rangos.</div>
    <div style="display:flex;flex-direction:column;gap:6px;" id="horarios-dias-list">`;

  for(let d=0; d<7; d++){
    const rango = horLocal[d];
    const cerrado = !rango;
    const open  = rango ? rango.open  : '09:00';
    const close = rango ? rango.close : '18:00';
    html += `
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border:1.5px solid var(--border);border-radius:var(--radius-sm);background:var(--paper);${cerrado?'opacity:.6':''};" id="hor-row-${d}">
        <div style="font-size:.78rem;font-weight:600;color:var(--ink);width:72px;flex-shrink:0;">${DIAS_NOMBRES[d]}</div>
        <label style="display:flex;align-items:center;gap:5px;cursor:pointer;flex-shrink:0;">
          <input type="checkbox" ${cerrado?'':'checked'} onchange="toggleDiaCerrado(${d},this.checked)"
            style="accent-color:var(--accent);width:14px;height:14px;">
          <span style="font-size:.7rem;color:var(--ink-mid);">Abierto</span>
        </label>
        <div id="hor-inputs-${d}" style="display:flex;align-items:center;gap:5px;flex:1;${cerrado?'opacity:.3;pointer-events:none':''}">
          <input type="time" value="${open}" step="900"
            onchange="actualizarHorario(${d},'open',this.value)"
            style="font-family:'Outfit',sans-serif;font-size:.78rem;padding:4px 7px;border:1.5px solid var(--border);border-radius:6px;background:var(--bg);color:var(--ink);flex:1;min-width:0;">
          <span style="font-size:.72rem;color:var(--ink-light);flex-shrink:0;">→</span>
          <input type="time" value="${close}" step="900"
            onchange="actualizarHorario(${d},'close',this.value)"
            style="font-family:'Outfit',sans-serif;font-size:.78rem;padding:4px 7px;border:1.5px solid var(--border);border-radius:6px;background:var(--bg);color:var(--ink);flex:1;min-width:0;">
        </div>
        ${cerrado?`<span style="font-size:.7rem;color:var(--ink-light);font-style:italic;flex:1;">Cerrado</span>`:''}
      </div>`;
  }

  html += `</div>
    <div style="margin-top:14px;">
      <div style="font-family:'Lora',serif;font-style:italic;font-size:.88rem;color:var(--accent);margin-bottom:4px;">⏰ Corte de pedidos para hoy</div>
      <div style="font-size:.68rem;color:var(--ink-light);margin-bottom:8px;">Hasta qué hora se pueden tomar pedidos para el mismo día.</div>
      <div style="display:flex;align-items:center;gap:10px;">
        <input type="time" value="${corteHoy}" step="900"
          onchange="actualizarCorteHoy(this.value)"
          style="font-family:'Outfit',sans-serif;font-size:.82rem;padding:7px 10px;border:1.5px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);color:var(--ink);">
        <span style="font-size:.7rem;color:var(--ink-light);">Los pedidos para hoy se pueden cargar hasta este horario.</span>
      </div>
    </div>
    <div style="margin-top:14px;">
      <div style="font-family:'Lora',serif;font-style:italic;font-size:.88rem;color:var(--cuba-ink,var(--accent));margin-bottom:4px;">🏪 Hora de llegada de Cuba</div>
      <div style="font-size:.68rem;color:var(--ink-light);margin-bottom:8px;">Hora a la que Cuba trae los productos Con TACC. Los pedidos para antes de esta hora se agrupan en el día anterior en "Pedir a Cuba".</div>
      <div style="display:flex;align-items:center;gap:10px;">
        <input type="time" value="${datos.horaLlegadaCuba||'16:00'}" step="900"
          onchange="actualizarHoraLlegadaCuba(this.value)"
          style="font-family:'Outfit',sans-serif;font-size:.82rem;padding:7px 10px;border:1.5px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);color:var(--ink);">
        <span style="font-size:.7rem;color:var(--ink-light);">Actualmente: <strong>${datos.horaLlegadaCuba||'16:00'}</strong></span>
      </div>
    </div>`;

  wrap.innerHTML = html;
}

function toggleDiaCerrado(dia, abierto){
  const localId = datos.localId || 'matienzo';
  if(!datos.horariosLocales[localId]) datos.horariosLocales[localId] = {};
  if(abierto){
    // Restaurar default o poner valor genérico
    const def = HORARIOS_DEFAULT[localId]||{};
    datos.horariosLocales[localId][dia] = def[dia] || { open:'09:00', close:'18:00' };
  } else {
    datos.horariosLocales[localId][dia] = null;
  }
  guardar();
  renderHorariosEditor();
  mostrarToastHorario();
}

function actualizarHorario(dia, campo, valor){
  if(!valor) return;
  const localId = datos.localId || 'matienzo';
  if(!datos.horariosLocales[localId]) datos.horariosLocales[localId] = {};
  if(!datos.horariosLocales[localId][dia]) datos.horariosLocales[localId][dia] = { open:'09:00', close:'18:00' };
  datos.horariosLocales[localId][dia][campo] = valor;
  guardar();
  mostrarToastHorario();
}

function actualizarCorteHoy(valor){
  if(!valor) return;
  const localId = datos.localId || 'matienzo';
  if(!datos.cortePedidosHoy) datos.cortePedidosHoy = {};
  datos.cortePedidosHoy[localId] = valor;
  guardar();
  mostrarToastHorario();
}

function actualizarHoraLlegadaCuba(valor){
  if(!valor) return;
  datos.horaLlegadaCuba = valor;
  guardar();
  mostrarToastHorario();
  // Refrescar la pestaña si está visible
  if(document.getElementById('cubapanel-pedir')&&document.getElementById('cubapanel-pedir').classList.contains('active')){
    renderEncargos();
  }
}

function mostrarToastHorario(){
  const t = document.getElementById('toast-guardado');
  if(!t) return;
  const prev = t.textContent;
  t.textContent = '🕐 Horario guardado';
  t.classList.add('visible');
  clearTimeout(t._timer);
  t._timer = setTimeout(()=>{ t.classList.remove('visible'); setTimeout(()=>{ t.textContent=prev; },400); }, 2000);
}

// Hook para renderizar panel Local cuando se abre la subtab
const _showCfgTabOrig = showCfgTab;
