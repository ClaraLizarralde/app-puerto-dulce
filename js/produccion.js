
// ── PRODUCCIÓN v18 ──
// Estado visual "hecho" (no persiste, se limpia al recargar/cambiar de día)
// Se guarda en window._hechoSet = Set de cardId
if(!window._hechoSet)window._hechoSet={hoy:new Set(),manana:new Set()};

// Subpestaña activa de Producción
let _prodTabActiva='hoy';

function showProdTab(id, el){
  document.querySelectorAll('.prod-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.prod-panel').forEach(p=>p.classList.remove('active'));
  if(el)el.classList.add('active');
  const panel=document.getElementById('prodpanel-'+id);
  if(panel)panel.classList.add('active');
  _prodTabActiva=id;
  // Renderizar el panel correcto si aún no tiene contenido
  if(id==='hoy')renderProduccionHoy();
  else if(id==='manana')renderProduccionManana();
  else if(id==='semana')renderProduccionSemanal();
}

function getItemKey(pedidoId,rId,idx){return `${pedidoId}_${rId}_${idx}`;}

function getItemEstado(pedidoId,rId,idx){
  if(!datos.itemEstados)datos.itemEstados={};
  return datos.itemEstados[getItemKey(pedidoId,rId,idx)]||'pendiente';
}
function setItemEstado(pedidoId,rId,idx,estado){
  if(!datos.itemEstados)datos.itemEstados={};
  datos.itemEstados[getItemKey(pedidoId,rId,idx)]=estado;
  guardar();
}

function esSabadoDomingo(){
  const dow=new Date().getDay();
  return dow===6||dow===0;
}

// ── Rangos de producción ──
// HOY: pedidos sin TACC desde 00:00 de hoy hasta 14:00 de mañana
// MAÑANA: pedidos sin TACC desde 14:00 de mañana hasta 14:00 de pasado mañana
function getDiaOffset(offsetDias){
  const d=new Date();d.setDate(d.getDate()+offsetDias);return fechaKey(d);
}

function getPedidosRangoHoy(){
  const hoyKey=getDiaOffset(0);
  const manKey=getDiaOffset(1);
  const hoy=new Date();
  const dowHoy=hoy.getDay(); // 0=dom,1=lun,...,6=sab
  const result=[];
  Object.entries(datos.dias).forEach(([dKey,dData])=>{
    (dData.pedidos||[]).forEach(p=>{
      if(p.estado==='entregado'||p.estado==='listo')return;
      if(!(p.productos||[]).some(r=>r.tacc==='s'))return;
      const hora=p.hora_entrega||'00:00';
      // Incluir: pedidos de hoy (cualquier hora) + pedidos de mañana antes de 14:00
      if(dKey===hoyKey){
        result.push({...p,_diaKey:dKey,_anticipado:false});
      } else if(dKey===manKey && hora<'14:00'){
        // anticipado: solo si mañana es martes Y hoy es sábado o domingo
        const manDate=new Date(hoy);manDate.setDate(hoy.getDate()+1);
        const dowMan=manDate.getDay();
        const esAnticipado=dowMan===2&&(dowHoy===6||dowHoy===0);
        result.push({...p,_diaKey:dKey,_anticipado:esAnticipado});
      }
    });
  });
  return result;
}

function getPedidosRangoManana(){
  const manKey=getDiaOffset(1);
  const pasadoKey=getDiaOffset(2);
  const hoy=new Date();
  const dowHoy=hoy.getDay();
  const result=[];
  Object.entries(datos.dias).forEach(([dKey,dData])=>{
    (dData.pedidos||[]).forEach(p=>{
      if(p.estado==='entregado'||p.estado==='listo')return;
      if(!(p.productos||[]).some(r=>r.tacc==='s'))return;
      const hora=p.hora_entrega||'00:00';
      // Incluir: pedidos de mañana desde 14:00 + pedidos de pasado mañana antes de 14:00
      if(dKey===manKey && hora>='14:00'){
        result.push({...p,_diaKey:dKey,_anticipado:false});
      } else if(dKey===pasadoKey && hora<'14:00'){
        // anticipado: solo si pasado mañana es martes Y hoy es viernes
        const pasadoDate=new Date(hoy);pasadoDate.setDate(hoy.getDate()+2);
        const dowPasado=pasadoDate.getDay();
        const esAnticipado=dowPasado===2&&dowHoy===5;
        result.push({...p,_diaKey:dKey,_anticipado:esAnticipado});
      }
    });
  });
  return result;
}

// Agrupa ítems individuales por nombre+talle para la vista producción
function buildItemsProduccion(pedidos){
  const grupos={};
  pedidos.forEach(p=>{
    (p.productos||[]).filter(r=>r.tacc==='s').forEach(r=>{
      const nom=r.tipo==='catalogo'?r.nombre:r.libre;
      if(!nom||!nom.trim())return;
      const _cantN=Number(r.cantidad);const cant=isNaN(_cantN)?1:_cantN;
      const tam=r.tamano||'';
      const key=nom.trim().toLowerCase()+'||'+tam.toLowerCase();
      const label=nom.trim()+(tam?' · '+tam:'');
      if(!grupos[key]){
        const catEntry=datos.catalogo.find(c=>c.nombre===nom.trim());
        const cat=catEntry&&catEntry.categoria?catEntry.categoria:'otros';
        grupos[key]={nombre:nom.trim(),talle:tam,label,total:0,estados:{pendiente:0,en_proceso:0,listo:0},unidades:[],notas:[],categoria:cat};
      }
      for(let i=0;i<cant;i++){
        const estado=getItemEstado(p.id,r.id,i);
        grupos[key].total++;
        if(estado==='listo')grupos[key].estados.listo++;
        else if(estado==='en_proceso')grupos[key].estados.en_proceso++;
        else grupos[key].estados.pendiente++;
        grupos[key].unidades.push({pedidoId:p.id,rId:r.id,idx:i,cliente:p.cliente_input||p.cliente||'Sin nombre',nota:r.nota_prod||'',estado,anticipado:p._anticipado||false});
      }
      if(r.nota_prod&&r.nota_prod.trim()&&!grupos[key].notas.includes(r.nota_prod.trim())){
        grupos[key].notas.push(r.nota_prod.trim());
      }
    });
  });
  return grupos;
}

function buildProdCard(g, hechoSet, panelId){
  const porCliente={};
  g.unidades.forEach(u=>{
    const k=u.cliente||'Sin nombre';
    if(!porCliente[k])porCliente[k]=0;
    porCliente[k]++;
  });
  const desgloseRows=Object.entries(porCliente).map(([cli,qty])=>`
    <div class="prod-desglose-row">
      <span class="prod-desglose-cliente">${esc(cli)}</span>
      <span class="prod-desglose-qty">${qty}</span>
    </div>`).join('');

  const notasHTML=(()=>{
    if(!g.notas.length)return'';
    const lines=g.notas.map(n=>{
      const cnt=g.unidades.filter(u=>u.nota===n).length;
      return`<div class="prod-nota-line">${cnt} -- ${esc(n)}</div>`;
    }).join('');
    return`<div class="prod-nota-detalle">${lines}</div>`;
  })();

  const totalStr=g.estados.listo>0?`${g.estados.listo}/${g.total}`:`${g.total}`;
  const anticipadoBadge=g.unidades.some(u=>u.anticipado)?'<span class="badge-anticipada">Anticipada</span>':'';

  const cacheKey=g.nombre.trim().toLowerCase()+'||'+(g.talle||'').toLowerCase();
  if(!window._prodCache)window._prodCache={};
  window._prodCache[cacheKey]=g;

  const cardId='pcard-'+panelId+'-'+cacheKey.replace(/[^a-z0-9]/g,'_');
  const esHecho=hechoSet&&hechoSet.has(cardId);
  const desgloseId='desglose-'+cardId.replace(/[^a-z0-9]/g,'_');

  return`<div class="prod-card${esHecho?' card-hecho':''}" id="${cardId}">
    <div class="prod-card-header">
      <div class="prod-chk${esHecho?' on':''}" onclick="toggleProdChkHecho(this,'${cardId}','${panelId}')">✓</div>
      <div class="prod-card-nombre${esHecho?' tachado':''}">${esc(g.label||g.nombre)}</div>
      ${anticipadoBadge}
      <div class="prod-card-qty">${totalStr}</div>
      <button class="prod-desglose-toggle" onclick="event.stopPropagation();const d=document.getElementById('${desgloseId}');const open=d.style.display!=='none'&&d.style.display!=='';d.style.display=open?'none':'block';this.textContent=open?'▶ Ver':'▼ Ocultar'">▶ Ver</button>
    </div>
    ${notasHTML}
    <div class="prod-desglose-content" id="${desgloseId}" style="display:none">${desgloseRows}</div>
  </div>`;
}

function buildSeccionProd(titulo,emoji,cls,items,hechoSet,panelId){
  if(!items.length)return'';
  const CAT_PROD_ORDEN=['tortas','cuadrados','bandejas','congelados','mousses','otros'];
  const CAT_PROD_LABELS={tortas:'🎂 Tortas',cuadrados:'🟫 Cuadrados',bandejas:'🍫 Bandejas',congelados:'❄️ Congelados',mousses:'🍮 Mousses',otros:'✨ Otros'};
  const totalUnidades=items.reduce((s,g)=>s+g.total,0);
  // Group by category
  const porCat={};
  items.forEach(g=>{const c=g.categoria||'otros';if(!porCat[c])porCat[c]=[];porCat[c].push(g);});
  const hasMixedCats=Object.keys(porCat).length>1;
  let cardsHTML='';
  if(hasMixedCats){
    CAT_PROD_ORDEN.forEach(cat=>{
      if(!porCat[cat]||!porCat[cat].length)return;
      cardsHTML+=`<div class="prod-cat-sep">${CAT_PROD_LABELS[cat]||cat}</div>`;
      cardsHTML+=porCat[cat].map(g=>buildProdCard(g,hechoSet,panelId)).join('');
    });
  } else {
    cardsHTML=items.map(g=>buildProdCard(g,hechoSet,panelId)).join('');
  }
  return`<div class="prod-estado-section">
    <div class="prod-estado-header ${cls}">${emoji} ${titulo}<span class="prod-estado-count">${totalUnidades} u.</span></div>
    ${cardsHTML}
  </div>`;
}

function renderPanelProduccion(pedidos, wrapId, vacioId, bannerAntId, panelId){
  const wrap=document.getElementById(wrapId);
  const vacio=document.getElementById(vacioId);
  if(!wrap)return;

  if(!pedidos.length){
    vacio&&(vacio.style.display='');
    wrap.innerHTML='';
    if(bannerAntId){const b=document.getElementById(bannerAntId);if(b)b.style.display='none';}
    return;
  }
  vacio&&(vacio.style.display='none');

  if(bannerAntId){
    const b=document.getElementById(bannerAntId);
    if(b)b.style.display=pedidos.some(p=>p._anticipado)?'':'none';
  }

  const CAT_PROD_ORDEN=['tortas','cuadrados','bandejas','congelados','mousses','otros'];
  const grupos=buildItemsProduccion(pedidos);
  const items=Object.values(grupos).sort((a,b)=>{
    const ca=CAT_PROD_ORDEN.indexOf(a.categoria||'otros');
    const cb=CAT_PROD_ORDEN.indexOf(b.categoria||'otros');
    if(ca!==cb)return ca-cb;
    return a.nombre.localeCompare(b.nombre);
  });

  const hechoSet=window._hechoSet[panelId]||new Set();

  // Separar: hecho (visual), pendiente, en_proceso, listo
  const hechos=items.filter(g=>{
    const cacheKey=g.nombre.trim().toLowerCase()+'||'+(g.talle||'').toLowerCase();
    const cardId='pcard-'+panelId+'-'+cacheKey.replace(/[^a-z0-9]/g,'_');
    return hechoSet.has(cardId);
  });
  const noHechos=items.filter(g=>{
    const cacheKey=g.nombre.trim().toLowerCase()+'||'+(g.talle||'').toLowerCase();
    const cardId='pcard-'+panelId+'-'+cacheKey.replace(/[^a-z0-9]/g,'_');
    return !hechoSet.has(cardId);
  });

  const pendientes=noHechos.filter(g=>g.estados.pendiente>0&&g.estados.listo<g.total);
  const enProceso=noHechos.filter(g=>g.estados.en_proceso>0&&g.estados.pendiente===0&&g.estados.listo<g.total);
  const listos=noHechos.filter(g=>g.total>0&&g.estados.listo===g.total);

  wrap.innerHTML=
    buildSeccionProd('Pendiente','🟡','pendiente',pendientes,hechoSet,panelId)+
    buildSeccionProd('En proceso','🟠','en_proceso',enProceso,hechoSet,panelId)+
    buildSeccionProd('Listo','🟢','listo',listos,hechoSet,panelId)+
    (hechos.length?buildSeccionProd('✅ HECHO','','hecho',hechos,hechoSet,panelId):'');
}

function renderProduccionHoy(){
  const pedidos=getPedidosRangoHoy();
  renderPanelProduccion(pedidos,'prod-diaria-wrap','vacio-prod','prod-anticipada-banner','hoy');
}

function renderProduccionManana(){
  const pedidos=getPedidosRangoManana();
  renderPanelProduccion(pedidos,'prod-manana-wrap','vacio-prod-manana',null,'manana');
}

// Toggle HECHO visual — mueve card a sección HECHO sin tocar estado real
function toggleProdChkHecho(chkEl, cardId, panelId){
  if(!window._hechoSet)window._hechoSet={hoy:new Set(),manana:new Set()};
  const set=window._hechoSet[panelId]||(window._hechoSet[panelId]=new Set());
  if(set.has(cardId)){
    set.delete(cardId);
  } else {
    set.add(cardId);
  }
  // Re-renderizar el panel correspondiente
  if(panelId==='hoy')renderProduccionHoy();
  else if(panelId==='manana')renderProduccionManana();
}

// Función principal que despacha al panel activo
function renderProduccion(){
  if(_prodTabActiva==='hoy')renderProduccionHoy();
  else if(_prodTabActiva==='manana')renderProduccionManana();
  else if(_prodTabActiva==='semana')renderProduccionSemanal();
  // Siempre renderizar el panel hoy aunque no esté activo (para que tenga datos al cambiar)
  if(_prodTabActiva!=='hoy')renderProduccionHoy();
}

// Modal detalle por unidades
function abrirDetalleProduccion(cacheKey){
  const g=window._prodCache&&window._prodCache[cacheKey];
  if(!g){console.error('prod cache miss',cacheKey);return;}
  document.getElementById('detalle-titulo').textContent=g.label||g.nombre;
  document.getElementById('detalle-subtitle').textContent=`${g.total} unidades · tocá cada una para cambiar estado`;
  document.getElementById('detalle-overlay').dataset.cacheKey=cacheKey;
  const lista=document.getElementById('detalle-lista');
  lista.innerHTML='';
  g.unidades.forEach((u,i)=>{
    const div=document.createElement('div');
    div.className='det-unidad';
    div.innerHTML=`
      <div class="det-unidad-info">
        <div class="det-cliente">${esc(u.cliente)}</div>
        ${u.nota?`<div class="det-nota">⚠️ ${esc(u.nota)}</div>`:''}
        ${u.anticipado?'<div style="font-size:.62rem;color:var(--blue);margin-top:2px;">📅 Anticipado</div>':''}
        <div class="det-estado-sel">
          <button class="det-est-btn pendiente${u.estado==='pendiente'?' active':''}" onclick="cambiarEstadoItem('${u.pedidoId}','${u.rId}',${u.idx},'pendiente',this)">Pendiente</button>
          <button class="det-est-btn en_proceso${u.estado==='en_proceso'?' active':''}" onclick="cambiarEstadoItem('${u.pedidoId}','${u.rId}',${u.idx},'en_proceso',this)">En proceso</button>
          <button class="det-est-btn listo${u.estado==='listo'?' active':''}" onclick="cambiarEstadoItem('${u.pedidoId}','${u.rId}',${u.idx},'listo',this)">Listo ✓</button>
        </div>
      </div>
    `;
    lista.appendChild(div);
  });
  document.getElementById('detalle-overlay').classList.remove('hidden');
}

function marcarTodoHecho(cacheKey){
  const key=cacheKey||document.getElementById('detalle-overlay').dataset.cacheKey;
  const g=window._prodCache&&window._prodCache[key];
  if(!g)return;
  g.unidades.forEach(u=>setItemEstado(u.pedidoId,u.rId,u.idx,'listo'));
  document.querySelectorAll('#detalle-lista .det-est-btn').forEach(b=>{
    b.classList.remove('active');
    if(b.classList.contains('listo'))b.classList.add('active');
  });
}
function cerrarDetalle(){
  document.getElementById('detalle-overlay').classList.add('hidden');
  renderProduccion();
}
function cambiarEstadoItem(pedidoId,rId,idx,estado,btn){
  setItemEstado(pedidoId,rId,idx,estado);
  const fila=btn.closest('.det-estado-sel');
  fila.querySelectorAll('.det-est-btn').forEach(b=>{
    b.classList.remove('active');
    if(b.classList.contains(estado))b.classList.add('active');
  });
}

function renderProduccionSemanal(){
  const hoy=new Date();
  const diaSemana=hoy.getDay();
  const diasDesdelLunes=diaSemana===0?6:diaSemana-1;
  const lunes=new Date(hoy);lunes.setDate(hoy.getDate()-diasDesdelLunes);
  const domingo=new Date(lunes);domingo.setDate(lunes.getDate()+6);
  const lunesKey=fechaKey(lunes);
  const domingoKey=fechaKey(domingo);
  document.getElementById('sem-rango-txt').textContent=`Semana: ${lunes.getDate()} ${MESES[lunes.getMonth()]} → ${domingo.getDate()} ${MESES[domingo.getMonth()]}`;

  // Fuente de verdad: r.listo en cada producto (separado en pestaña Pedidos)
  const grupos={};
  Object.entries(datos.dias).forEach(([dKey,dData])=>{
    if(dKey<lunesKey||dKey>domingoKey)return;
    (dData.pedidos||[]).filter(p=>p.estado!=='entregado').forEach(p=>{
      (p.productos||[]).filter(r=>r.tacc==='s').forEach(r=>{
        const nom=r.tipo==='catalogo'?r.nombre:r.libre;
        if(!nom||!nom.trim())return;
        const _cantN=Number(r.cantidad);const cant=isNaN(_cantN)?1:_cantN;
        const tam=r.tamano||'(sin talle)';
        const key=nom.trim().toLowerCase()+'||'+tam.toLowerCase();
        if(!grupos[key])grupos[key]={nombre:nom.trim(),tamano:tam,qty:0};
        if(!r.listo)grupos[key].qty+=cant;
      });
    });
  });
  // Solo mostrar items con qty > 0 (separados no se cuentan)
  const items=Object.values(grupos).filter(i=>i.qty>0).sort((a,b)=>b.qty-a.qty||a.nombre.localeCompare(b.nombre));
  const wrap=document.getElementById('prod-semanal-wrap');
  if(!items.length){wrap.innerHTML='<div class="vacio" style="padding:16px">Sin pedidos Sin TACC pendientes esta semana. 🎉</div>';return;}
  const totalSem=items.reduce((s,i)=>s+i.qty,0);
  wrap.innerHTML=`<div class="sem-section">
    <div class="sem-header">
      <div class="sem-titulo">Total semanal Sin TACC</div>
      <div class="sem-total">${totalSem} u. por hacer</div>
    </div>
    ${items.map(i=>{
      return`<div class="sem-row">
        <div>
          <div class="sem-prod">${esc(i.nombre)}</div>
          <div class="sem-tam">${esc(i.tamano)}</div>
        </div>
        <div class="sem-qty">${i.qty}</div>
      </div>`;
    }).join('')}
  </div>`;
}
