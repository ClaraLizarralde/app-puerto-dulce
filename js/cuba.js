
// ── CUBA ──
// ── CUBA SUBPESTAÑAS ──
let _cubaTabActiva = 'pedidos';
function showCubaTab(id, el){
  _cubaTabActiva = id;
  document.querySelectorAll('#cuba-subtabs .prod-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('#tab-cuba .prod-panel').forEach(p=>p.classList.remove('active'));
  if(el) el.classList.add('active');
  const panel = document.getElementById('cubapanel-'+id);
  if(panel) panel.classList.add('active');
  if(id==='pedidos') renderCubaResumen();
  else if(id==='pedir') renderEncargos();
  else if(id==='ventas') renderVentas();
  else if(id==='exportar') renderCubaExportSelector();

  document.querySelectorAll('#sidebar-subtabs-cuba .sidebar-subtab')
    .forEach(b => b.classList.remove('active'));
  const ssBtn = document.getElementById('ss-cubatab-' + id);
  if (ssBtn) ssBtn.classList.add('active');
}



function renderCuba(){
  renderEncargos();renderVentas();renderCubaResumen();renderMateriaPrima();
  // show/hide subpanels based on active tab
  const activeTab = _cubaTabActiva||'pedidos';
  document.querySelectorAll('#tab-cuba .prod-panel').forEach(p=>p.classList.remove('active'));
  const activePanel = document.getElementById('cubapanel-'+activeTab);
  if(activePanel) activePanel.classList.add('active');
}

function buildEncargoCard(p){
  const div=document.createElement('div');div.className='cuba-encargo';
  const top=document.createElement('div');top.className='cuba-enc-top';
  const nomSpanH=document.createElement('span');nomSpanH.className='cuba-enc-nombre';
  nomSpanH.textContent=p.cliente_input||p.cliente||'(sin nombre)';
  const horaSpanH=document.createElement('span');horaSpanH.className='cuba-enc-hora';
  horaSpanH.textContent=p.hora_entrega||'--:--';
  top.appendChild(nomSpanH);top.appendChild(horaSpanH);
  div.appendChild(top);
  const prodsFiltrados=(p.productos||[]).filter(r=>r.tacc!=='s');
  if(!prodsFiltrados.length){
    const empty=document.createElement('div');
    empty.style.cssText='font-size:.72rem;color:var(--ink-light);font-style:italic;';
    empty.textContent='Sin productos';
    div.appendChild(empty);
  } else {
    prodsFiltrados.forEach(r=>{
      const nom=r.tipo==='catalogo'?r.nombre:r.libre;
      const _cantN=Number(r.cantidad);const cant=isNaN(_cantN)?1:_cantN;
      if(!nom)return;
      const row=document.createElement('div');
      row.style.cssText='display:flex;align-items:center;gap:7px;padding:5px 0;border-bottom:1px solid var(--border);';
      const nomSpan=document.createElement('span');
      nomSpan.style.cssText='flex:1;font-size:.8rem;color:var(--ink);';
      nomSpan.innerHTML=esc(nom)+(r.tamano?' · '+esc(r.tamano):'')+' <strong>x'+cant+'</strong>';
      row.appendChild(nomSpan);
      const pedOn=r.pedido_cuba;
      const pedCircle=document.createElement('div');
      pedCircle.style.cssText='display:flex;align-items:center;gap:4px;cursor:pointer;';
      const pedDot=document.createElement('div');
      pedDot.style.cssText='width:18px;height:18px;border-radius:50%;border:2px solid '+(pedOn?'var(--accent)':'var(--border)')+';background:'+(pedOn?'var(--accent)':'transparent')+';display:flex;align-items:center;justify-content:center;font-size:9px;color:'+(pedOn?'#fff':'transparent')+';transition:all .15s;';
      pedDot.textContent='✓';
      const pedLbl=document.createElement('span');
      pedLbl.style.cssText='font-size:.6rem;color:'+(pedOn?'var(--accent)':'var(--ink-light)')+';';
      pedLbl.textContent='pedido';
      pedCircle.appendChild(pedDot);pedCircle.appendChild(pedLbl);
      (function(pid,rid){pedCircle.onclick=function(){encargoCubaPedido(pid,rid);};})(p.id,r.id);
      row.appendChild(pedCircle);
      const sepOn=r.separado_cuba;
      const sepBox=document.createElement('div');
      sepBox.style.cssText='display:flex;align-items:center;gap:4px;cursor:pointer;';
      const sepDot=document.createElement('div');
      sepDot.style.cssText='width:18px;height:18px;border-radius:4px;border:2px solid '+(sepOn?'var(--green)':'var(--border)')+';background:'+(sepOn?'var(--green)':'transparent')+';display:flex;align-items:center;justify-content:center;font-size:9px;color:'+(sepOn?'#fff':'transparent')+';transition:all .15s;';
      sepDot.textContent='✓';
      const sepLbl=document.createElement('span');
      sepLbl.style.cssText='font-size:.6rem;color:'+(sepOn?'var(--green)':'var(--ink-light)')+';';
      sepLbl.textContent='sep.';
      sepBox.appendChild(sepDot);sepBox.appendChild(sepLbl);
      (function(pid,rid){sepBox.onclick=function(){encargoCubaSeparado(pid,rid);};})(p.id,r.id);
      row.appendChild(sepBox);
      div.appendChild(row);
    });
  }
  return div;
}

function renderEncargos(){
  const cont=document.getElementById('cuba-encargos');
  const vacio=document.getElementById('vacio-encargos');
  cont.innerHTML='';

  const hoyKey=getDiaOffset(0);
  const manKey=getDiaOffset(1);

  // Hora en que Cuba trae los productos (configurable en datos.horaLlegadaCuba)
  const HORA_CUBA = datos.horaLlegadaCuba || '16:00';

  // Recolectar todos los pedidos con productos Con TACC de días >= hoy
  const pedidosConTacc=[];
  Object.entries(datos.dias).forEach(([dKey,dData])=>{
    if(dKey<hoyKey)return;
    (dData.pedidos||[])
      .filter(p=>p.estado!=='entregado'&&(p.productos||[]).some(r=>r.tacc!=='s'))
      .forEach(p=>pedidosConTacc.push({...p, _diaKey:dKey}));
  });

  if(!pedidosConTacc.length){vacio.style.display='';return;}
  vacio.style.display='none';

  // Para cada pedido, calcular cuándo hay que pedirlo a Cuba:
  // Si hora_entrega < HORA_CUBA → Cuba lo trae el día ANTERIOR al de entrega
  // Si hora_entrega >= HORA_CUBA (o sin hora) → Cuba lo trae el mismo día de entrega
  function diaPedidoACuba(diaEntregaKey, horaEntrega){
    const hora = horaEntrega || '99:99';
    if(hora < HORA_CUBA){
      // necesario el día anterior
      const [y,m,d] = diaEntregaKey.split('-').map(Number);
      const prev = new Date(y, m-1, d);
      prev.setDate(prev.getDate()-1);
      return fechaKey(prev);
    }
    return diaEntregaKey;
  }

  // Agrupar por "día en que hay que pedirlo a Cuba"
  const porDiaPedido={};
  pedidosConTacc.forEach(p=>{
    const cuandoPedir = diaPedidoACuba(p._diaKey, p.hora_entrega);
    if(!porDiaPedido[cuandoPedir]) porDiaPedido[cuandoPedir]=[];
    porDiaPedido[cuandoPedir].push(p);
  });

  const diasOrdenados=Object.keys(porDiaPedido).sort();

  diasOrdenados.forEach(dPedirKey=>{
    const pedidos=porDiaPedido[dPedirKey].sort((a,b)=>(a.hora_entrega||'99:99').localeCompare(b.hora_entrega||'99:99'));

    // Título del grupo
    let tituloTxt;
    if(dPedirKey===hoyKey)       tituloTxt='Pedir HOY a Cuba';
    else if(dPedirKey===manKey)  tituloTxt='Pedir MAÑANA a Cuba';
    else if(dPedirKey<hoyKey)    tituloTxt='Pedir URGENTE (ya pasó)';
    else {
      const f=new Date(dPedirKey+'T12:00:00');
      tituloTxt='Pedir el '+DIAS_FULL[f.getDay()]+' '+f.getDate()+' '+MESES[f.getMonth()];
    }

    // Sub-info: "para entregas del día X"
    const diasEntrega=[...new Set(pedidos.map(p=>p._diaKey))].sort();
    const subtxt = diasEntrega.map(dk=>{
      if(dk===hoyKey) return 'hoy';
      if(dk===manKey) return 'mañana';
      const f=new Date(dk+'T12:00:00');
      return DIAS_FULL[f.getDay()]+' '+f.getDate();
    }).join(', ');

    const esUrgente = dPedirKey < hoyKey;
    const esHoy = dPedirKey === hoyKey;

    const header=document.createElement('div');
    header.style.cssText=`
      display:flex;align-items:baseline;gap:8px;
      font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;
      color:${esUrgente?'var(--accent)':esHoy?'var(--cuba-ink,var(--accent))':'var(--ink-light)'};
      padding:10px 0 4px;
      border-bottom:1.5px solid ${esUrgente?'var(--accent)':esHoy?'var(--cuba-border,var(--border))':'var(--border)'};
      margin-bottom:6px;margin-top:${dPedirKey===diasOrdenados[0]?'0':'16px'};
    `;
    header.innerHTML=`${esUrgente?'⚠️ ':''}${tituloTxt}
      <span style="font-size:.6rem;font-weight:400;text-transform:none;letter-spacing:0;opacity:.7;font-style:italic;">
        para entregas: ${subtxt}
      </span>`;
    cont.appendChild(header);

    pedidos.forEach(p=>{
      const card=buildEncargoCard(p);
      // Agregar sub-etiqueta de día de entrega si hay varios días distintos
      if(diasEntrega.length>1){
        const dk=p._diaKey;
        const dLabel=dk===hoyKey?'hoy':dk===manKey?'mañana':(()=>{const f=new Date(dk+'T12:00:00');return DIAS_FULL[f.getDay()]+' '+f.getDate();})();
        const tag=document.createElement('div');
        tag.style.cssText='font-size:.58rem;color:var(--ink-light);margin:-4px 0 4px 4px;font-style:italic;';
        tag.textContent='📦 entrega: '+dLabel+(p.hora_entrega?' a las '+p.hora_entrega:'');
        card.insertBefore(tag, card.firstChild);
      }
      cont.appendChild(card);
    });
  });

  // Nota explicativa del horario de corte
  const nota=document.createElement('div');
  nota.style.cssText='font-size:.62rem;color:var(--ink-light);font-style:italic;margin-top:14px;padding-top:8px;border-top:1px dashed var(--border);';
  nota.innerHTML=`🕐 Cuba trae los productos a las <strong>${HORA_CUBA}</strong>. Pedidos para antes de esa hora se agrupan el día anterior.`;
  cont.appendChild(nota);
}

function getPedidoGlobal(pedidoId){
  for(const dData of Object.values(datos.dias)){
    const p=(dData.pedidos||[]).find(x=>x.id===pedidoId);
    if(p)return p;
  }
  return null;
}
function agregarItemMateriaPrima(){
  const input=document.getElementById('cuba-mp-input');
  const txt=(input.value||'').trim();
  if(!txt)return;
  if(!datos.notasCuba||!Array.isArray(datos.notasCuba))datos.notasCuba=[];
  datos.notasCuba.push({id:uid(),txt,hecho:false});
  guardar();
  input.value='';
  renderMateriaPrima();
}
function toggleItemMateriaPrima(id){
  if(!Array.isArray(datos.notasCuba))return;
  const item=datos.notasCuba.find(x=>x.id===id);
  if(item)item.hecho=!item.hecho;
  guardar();renderMateriaPrima();
}
function eliminarItemMateriaPrima(id){
  if(!Array.isArray(datos.notasCuba))return;
  datos.notasCuba=datos.notasCuba.filter(x=>x.id!==id);
  guardar();renderMateriaPrima();
}
function renderMateriaPrima(){
  const lista=document.getElementById('cuba-mp-lista');
  if(!lista)return;
  if(!Array.isArray(datos.notasCuba)||!datos.notasCuba.length){
    lista.innerHTML='<div class="cuba-mp-empty">Sin ítems aún.</div>';return;
  }
  lista.innerHTML=datos.notasCuba.map(item=>`
    <div class="cuba-mp-item${item.hecho?' tachado':''}">
      <div class="cuba-mp-chk${item.hecho?' on':''}" onclick="toggleItemMateriaPrima('${item.id}')">✓</div>
      <span class="cuba-mp-item-txt">${esc(item.txt)}</span>
      <button class="cuba-mp-del" onclick="eliminarItemMateriaPrima('${item.id}')">✕</button>
    </div>`).join('');
}
function encargoCubaPedido(pedidoId,prodId){
  const p=getPedidoGlobal(pedidoId);if(!p)return;
  const r=(p.productos||[]).find(x=>x.id===prodId);if(!r)return;
  r.pedido_cuba=!r.pedido_cuba;
  guardar();renderEncargos();renderPedidos();
}
function encargoCubaSeparado(pedidoId,prodId){
  const p=getPedidoGlobal(pedidoId);if(!p)return;
  const r=(p.productos||[]).find(x=>x.id===prodId);if(!r)return;
  r.separado_cuba=!r.separado_cuba;
  // sincronizar con listo del producto en pestaña pedidos
  r.listo=r.separado_cuba;
  // si todos los productos del pedido están listos, marcar pedido como listo
  const todosListos=(p.productos||[]).every(x=>x.listo);
  if(todosListos&&(p.estado==='pendiente'||p.estado==='prod'))p.estado='listo';
  guardar();renderEncargos();renderPedidos();
  if(_prodTabActiva==='semana')renderProduccionSemanal();
}

function renderCubaResumen(){
  const dd=diaData();
  const especial=dd.especial||false;
  const corte=dd.corteHora||'15:00';
  const pedidosCuba=getPedidos().filter(p=>esCuba(p.cliente));

  function acumular(pedidos){
    const totales={};
    pedidos.forEach(p=>{
      (p.productos||[]).forEach(r=>{
        const nom=r.tipo==='catalogo'?r.nombre:r.libre;if(!nom||!nom.trim())return;
        const _cantN=Number(r.cantidad);const cant=isNaN(_cantN)?1:_cantN;
        const key=[nom,r.tamano].filter(Boolean).join(' ').trim().toLowerCase();
        const label=[nom,r.tamano].filter(Boolean).join(' ').trim();
        if(!totales[key])totales[key]={label,qty:0,notas:[]};
        totales[key].qty+=cant;
        if(r.nota_prod&&r.nota_prod.trim()){
          const nota=r.nota_prod.trim();
          // guardar nota con su cantidad
          const existing=totales[key].notas.find(n=>n.texto===nota);
          if(existing)existing.qty+=cant;
          else totales[key].notas.push({texto:nota,qty:cant});
        }
      });
    });
    return totales;
  }
  const TALLES_ORD=['chico','mediano','grande'];
  // Usar la categoría real del catálogo, con heurística solo como fallback
  function clasificar(label){
    const l=label.toLowerCase();
    // Buscar en catálogo por nombre exacto o prefix (el label puede incluir el talle al final)
    const cat=datos.catalogo.find(c=>{
      const cn=c.nombre.toLowerCase();
      return l===cn || l.startsWith(cn+' ') || l.startsWith(cn+' ·');
    });
    if(cat&&cat.categoria&&cat.categoria!=='otros') return cat.categoria;
    // Fallback heurístico
    if(l.includes('mousse'))return'mousses';
    if(TALLES_ORD.some(t=>l.endsWith(t)))return'tortas';
    return'otros';
  }
  function sortItems(items){
    return items.slice().sort((a,b)=>{
      const partsA=a.label.trim().split(' ');const partsB=b.label.trim().split(' ');
      const talleA=TALLES_ORD.indexOf((partsA[partsA.length-1]||'').toLowerCase());
      const talleB=TALLES_ORD.indexOf((partsB[partsB.length-1]||'').toLowerCase());
      const nomA=partsA.slice(0,talleA>=0?partsA.length-1:partsA.length).join(' ').toLowerCase();
      const nomB=partsB.slice(0,talleB>=0?partsB.length-1:partsB.length).join(' ').toLowerCase();
      if(nomA!==nomB)return nomA.localeCompare(nomB,'es');
      return(talleA===-1?99:talleA)-(talleB===-1?99:talleB);
    });
  }
  const CAT_EMOJI_RES={tortas:'🎂',mousses:'🍮',bandejas:'🍫',cuadrados:'🟫',congelados:'❄️',otros:'✨'};
  function buildListaHTML(totales){
    const keys=Object.keys(totales);
    if(!keys.length)return'<div style="color:var(--ink-light);font-size:.76rem;font-style:italic;">Sin productos.</div>';
    // Agrupar por categoría real
    const porCategoria={};
    keys.forEach(k=>{
      const cat=clasificar(totales[k].label);
      if(!porCategoria[cat])porCategoria[cat]=[];
      porCategoria[cat].push({...totales[k]});
    });
    // Mostrar en orden CAT_ORDEN
    const ordenado=[...CAT_ORDEN,'otros'].filter((c,i,a)=>a.indexOf(c)===i);
    let html='';
    ordenado.forEach(cat=>{
      const items=porCategoria[cat];
      if(!items||!items.length)return;
      const emoji=CAT_EMOJI_RES[cat]||'✨';
      html+=`<div class="cuba-grupo-titulo">${emoji} ${cat.charAt(0).toUpperCase()+cat.slice(1)}</div>`;
      html+=sortItems(items).map(i=>{
        const notasHTML=(i.notas&&i.notas.length)?i.notas.map(n=>`<div class="cuba-item-nota">${n.qty} x ${esc(n.texto)}</div>`).join(''):'';
        // Checkbox visual — solo marca visualmente, no cambia datos
        const cbId='cb_res_'+Math.random().toString(36).slice(2,7);
        return`<div class="cuba-item" style="gap:8px;">
          <div onclick="this.classList.toggle('cuba-cb-on')" class="cuba-cb" title="Marcar como separado" style="width:16px;height:16px;border-radius:4px;border:1.5px solid var(--cuba-border);flex-shrink:0;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:9px;color:transparent;transition:all .15s;background:transparent;">✓</div>
          <span style="flex:1;">${esc(i.label)}</span>
          <span class="cqty">${i.qty}</span>
        </div>${notasHTML}`;
      }).join('');
    });
    return html;
  }

  const cont=document.getElementById('cuba-resumen-lista');
  if(!especial){
    const totales=acumular(pedidosCuba);
    // ── Las ventas de mostrador van SOLO a la pestaña "Ventas", no acá ──
    const keys=Object.keys(totales);
    if(!keys.length){cont.innerHTML='<div style="color:var(--ink-light);font-size:.76rem;font-style:italic;">Sin pedidos de Cuba para hoy.</div>';return;}
    cont.innerHTML=buildListaHTML(totales);
  } else {
    const t1=pedidosCuba.filter(p=>(p.hora_entrega||'99:99')<=corte);
    const t2=pedidosCuba.filter(p=>(p.hora_entrega||'99:99')>corte);
    cont.innerHTML=`
      <div style="font-size:.6rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--amber);margin-bottom:4px;">🟠 Envío — hasta las ${esc(corte)}</div>
      ${buildListaHTML(acumular(t1))}
      <div style="font-size:.6rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--blue);margin-top:10px;margin-bottom:4px;">🔵 Envío — después de las ${esc(corte)}</div>
      ${buildListaHTML(acumular(t2))}
    `;
  }
}

function agregarVenta(){
  if(!diaData().ventas)diaData().ventas=[];
  diaData().ventas.push({id:uid(),nombre:'',cantidad:'',llevada:'',_deCatalogo:false});
  guardar();renderVentas();
}
function agregarVentaManual(){
  const inp=document.getElementById('venta-nueva-nombre');
  const nombre=(inp?inp.value:'').trim();
  if(!nombre)return;
  if(!diaData().ventas)diaData().ventas=[];
  diaData().ventas.push({id:uid(),nombre,cantidad:'',llevada:'',_deCatalogo:false});
  guardar();renderVentas();
  // foco al input de nuevo después del re-render
  setTimeout(()=>{const i=document.getElementById('venta-nueva-nombre');if(i){i.value='';i.focus();}},50);
}
function updateVentaTalle(ventaId,campo,valor){
  const v=getVentas().find(x=>x.id===ventaId);
  if(!v)return;
  v[campo]=valor;
  guardar();
}
function updateVenta(id,campo,valor){
  const v=getVentas().find(x=>x.id===id);if(v){v[campo]=valor;guardar();renderCubaResumen();}
}
function eliminarVenta(id){diaData().ventas=getVentas().filter(x=>x.id!==id);guardar();renderVentas();}

// ── Helpers de stepper para ventas ──
function _ventaStep(id, campo, delta){
  const v = getVentas().find(x=>x.id===id); if(!v) return;
  const cur = parseInt(v[campo])||0;
  const nuevo = Math.max(0, cur+delta);
  v[campo] = nuevo>0?String(nuevo):'';
  guardar(); renderVentas();
}
function _ventaTalleStep(id, cantKey, delta){
  const v = getVentas().find(x=>x.id===id); if(!v) return;
  const cur = parseInt(v[cantKey])||0;
  const nuevo = Math.max(0, cur+delta);
  v[cantKey] = nuevo>0?String(nuevo):'';
  guardar(); renderVentas();
}

function renderVentas(){
  const cont=document.getElementById('venta-lista');
  if(!cont) return;

  const catCuba=(datos.catalogo||[]).filter(c=>c.tipo==='sin_tacc');
  const ventas=getVentas();

  // Sincronizar con catálogo
  catCuba.forEach(c=>{
    if(!ventas.find(v=>v.nombre===c.nombre)){
      ventas.push({id:uid(),nombre:c.nombre,cantidad:'',llevada:'',_deCatalogo:true,_categoria:c.categoria||'otros',_tieneTalle:c.tiene_talle||false});
    }
  });
  ventas.forEach(v=>{
    const cat=catCuba.find(c=>c.nombre===v.nombre);
    if(cat){v._deCatalogo=true;v._categoria=cat.categoria||'otros';v._tieneTalle=cat.tiene_talle||false;}
  });
  diaData().ventas=ventas;
  guardar();

  const deCatalogo=ventas.filter(v=>v._deCatalogo);
  const manuales=ventas.filter(v=>!v._deCatalogo);

  const porCat={};
  CAT_ORDEN.forEach(cat=>{porCat[cat]=[];});
  deCatalogo.forEach(v=>{const c=v._categoria||'otros';(porCat[c]||(porCat['otros'])).push(v);});

  const CAT_LABEL={tortas:'🎂 Tortas',mousses:'🍮 Mousses',bandejas:'🫙 Bandejas',cuadrados:'🟫 Cuadrados',congelados:'❄️ Congelados',otros:'📦 Otros'};
  const TALLES=['ch','md','gr'];

  // Stepper compacto: − N +
  function stp(val, onMinus, onPlus, onInput, accent=false){
    const n=parseInt(val)||0;
    const on=n>0;
    return `<div class="vg-stp${accent?' vg-stp-acc':''}${on?' vg-on':''}">
      <button class="vg-btn" onclick="${onMinus}">−</button>
      <input class="vg-num" type="number" min="0" value="${on?n:''}" placeholder="0" oninput="${onInput}">
      <button class="vg-btn" onclick="${onPlus}">＋</button>
    </div>`;
  }

  // Fila de producto SIN talle: una sola celda ancha bajo pedido y una bajo llevado
  function filaSimple(v, deletable=false){
    const hayP=(parseInt(v.cantidad)||0)>0;
    const hayL=(parseInt(v.llevada)||0)>0;
    const rowOn=hayP||hayL;
    return `<div class="vg-row${rowOn?' vg-row-on':''}">
      <div class="vg-nom${deletable?' vg-nom-del':''}">
        ${esc(v.nombre)}
        ${deletable?`<button class="vg-del-btn" onclick="eliminarVenta('${v.id}')">✕</button>`:''}
      </div>
      <div class="vg-celdas">
        <div class="vg-grupo">
          <div class="vg-celda-wide">
            ${stp(v.cantidad,
              `_ventaStep('${v.id}','cantidad',-1)`,
              `_ventaStep('${v.id}','cantidad',1)`,
              `(function(el){var x=getVentas().find(x=>x.id==='${v.id}');if(x){x.cantidad=el.value;guardar();}})(this)`
            )}
          </div>
        </div>
        <div class="vg-sep-vert"></div>
        <div class="vg-grupo vg-grupo-acc">
          <div class="vg-celda-wide">
            ${stp(v.llevada,
              `_ventaStep('${v.id}','llevada',-1)`,
              `_ventaStep('${v.id}','llevada',1)`,
              `(function(el){var x=getVentas().find(x=>x.id==='${v.id}');if(x){x.llevada=el.value;guardar();}})(this)`,
              true
            )}
          </div>
        </div>
      </div>
    </div>`;
  }

  // Fila de producto CON talle: 3 steppers bajo pedido + 3 bajo llevado, todo en una fila
  function fillaTalle(v){
    const hayDatos=TALLES.some(l=>(parseInt(v['_cant_'+l])||0)>0||(parseInt(v['_llev_'+l])||0)>0);
    const pedCeldas=TALLES.map(lbl=>{
      const k='_cant_'+lbl;
      return `<div class="vg-celda">
        ${stp(v[k],
          `_ventaTalleStep('${v.id}','${k}',-1)`,
          `_ventaTalleStep('${v.id}','${k}',1)`,
          `(function(el){var x=getVentas().find(x=>x.id==='${v.id}');if(x){x['${k}']=el.value;guardar();}})(this)`
        )}
      </div>`;
    }).join('');
    const llevCeldas=TALLES.map(lbl=>{
      const k='_llev_'+lbl;
      return `<div class="vg-celda">
        ${stp(v[k],
          `_ventaTalleStep('${v.id}','${k}',-1)`,
          `_ventaTalleStep('${v.id}','${k}',1)`,
          `(function(el){var x=getVentas().find(x=>x.id==='${v.id}');if(x){x['${k}']=el.value;guardar();}})(this)`,
          true
        )}
      </div>`;
    }).join('');
    return `<div class="vg-row${hayDatos?' vg-row-on':''}">
      <div class="vg-nom">${esc(v.nombre)}</div>
      <div class="vg-celdas">
        <div class="vg-grupo">${pedCeldas}</div>
        <div class="vg-sep-vert"></div>
        <div class="vg-grupo vg-grupo-acc">${llevCeldas}</div>
      </div>
    </div>`;
  }

  let html=`<div class="vg-tabla">
    <!-- Header de dos niveles -->
    <div class="vg-head-top">
      <div class="vg-head-nom"></div>
      <div class="vg-head-groups">
        <div class="vg-head-grupo">pedido</div>
        <div class="vg-head-grupo vg-head-acc">llevado</div>
      </div>
    </div>
    <div class="vg-head-sub">
      <div class="vg-head-nom"></div>
      <div class="vg-head-groups">
        <div class="vg-head-grupo">
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
      </div>
    </div>`;

  CAT_ORDEN.forEach(cat=>{
    const items=porCat[cat]||[];
    if(!items.length)return;
    // ¿algún item tiene datos cargados?
    const tieneData=items.some(v=>{
      if(v._tieneTalle) return ['ch','md','gr'].some(l=>(parseInt(v['_cant_'+l])||0)>0||(parseInt(v['_llev_'+l])||0)>0);
      return (parseInt(v.cantidad)||0)>0||(parseInt(v.llevada)||0)>0;
    });
    const abierto=tieneData;
    const catId='vg-cat-'+cat;
    html+=`<div class="vg-sep-cat" onclick="(function(el){const body=document.getElementById('${catId}');const open=body.style.display!=='none';body.style.display=open?'none':'block';el.querySelector('.vg-cat-arrow').textContent=open?'▶':'▼';})(this)" style="cursor:pointer;user-select:none;">
      <span class="vg-cat-arrow" style="font-size:.55rem;color:var(--ink-light);margin-right:5px;">${abierto?'▼':'▶'}</span>${CAT_LABEL[cat]||cat}
    </div>`;
    html+=`<div id="${catId}" style="display:${abierto?'block':'none'}">`;
    items.forEach(v=>{
      html+= v._tieneTalle ? fillaTalle(v) : filaSimple(v);
    });
    html+=`</div>`;
  });

  html+=`</div>`; // /vg-tabla

  // Sección libre
  if(manuales.length||true){
    html+=`<div class="vg-libre">
      <div class="vg-libre-titulo">✏️ Agregar producto</div>
      ${manuales.map(v=>filaSimple(v,true)).join('')}
      <div class="vg-libre-row">
        <input type="text" id="venta-nueva-nombre" placeholder="Nombre del producto..."
          class="vg-libre-input"
          onkeydown="if(event.key==='Enter'){agregarVentaManual();event.preventDefault();}">
        <button onclick="agregarVentaManual()" class="vg-libre-add">＋</button>
      </div>
    </div>`;
  }

  cont.innerHTML=html;
  renderCubaResumen();
}