
// (renderCfgLocal se llama desde showCfgTab cuando id==='local')

// ══════════════════════════════════════
// PIZARRÓN
// ══════════════════════════════════════

// ── Estado ──
let _pizModo = 'postit';
let _pizColor = '#ffffff';
let _pizSize = 3;
let _pizDrawing = false;
let _pizLastX = 0, _pizLastY = 0;
let _pizDragPostit = null;
let _pizDragOX = 0, _pizDragOY = 0;

const PIZ_COLORES_POSTIT = [
  '#fef08a','#fde68a','#fed7aa','#fca5a5',
  '#bbf7d0','#bae6fd','#ddd6fe','#fbcfe8'
];

function pizDatos(){
  if(!datos.pizarron) datos.pizarron = { notas:[], canvasDataURL:null };
  return datos.pizarron;
}

// ── Abrir / cerrar ──
function abrirPizarron(){
  const modal = document.getElementById('modal-pizarron');
  if(!modal) return;
  const titEl = document.getElementById('piz-titulo-dia');
  if(titEl){
    const [y,m,d] = diaActual.split('-').map(Number);
    const f = new Date(y,m-1,d);
    titEl.textContent = `📌 Pizarrón · ${DIAS_FULL[f.getDay()]} ${d} de ${MESES[m-1]}`;
  }
  modal.classList.add('visible');
  pizSetModo('postit');
  requestAnimationFrame(()=>{
    pizInitCanvas();
    pizRenderPostits();
  });
}

function cerrarPizarron(){
  pizGuardarCanvas();
  const modal = document.getElementById('modal-pizarron');
  if(modal) modal.classList.remove('visible');
}

// ── Canvas ──
function pizGetCanvas(){ return document.getElementById('piz-canvas'); }
function pizGetCtx(){ const c=pizGetCanvas(); return c?c.getContext('2d'):null; }

function pizInitCanvas(){
  const c = pizGetCanvas(); if(!c) return;
  const body = document.getElementById('piz-body');
  c.width = body.offsetWidth;
  c.height = body.offsetHeight;
  const pd = pizDatos();
  if(pd.canvasDataURL){
    const img = new Image();
    img.onload = ()=>{ pizGetCtx().drawImage(img,0,0); };
    img.src = pd.canvasDataURL;
  }
  // Bind events
  pizBindCanvas(c);
}

function pizGuardarCanvas(){
  const c = pizGetCanvas(); if(!c) return;
  try{ pizDatos().canvasDataURL = c.toDataURL(); guardar(); } catch(e){}
}

function pizLimpiarCanvas(){
  const ctx = pizGetCtx(); if(!ctx) return;
  const c = pizGetCanvas();
  ctx.clearRect(0,0,c.width,c.height);
  pizDatos().canvasDataURL = null;
  guardar();
}

// ── Bind canvas events (llamado al init) ──
let _pizCanvasBound = false;
function pizBindCanvas(c){
  if(_pizCanvasBound) return;
  _pizCanvasBound = true;

  function getPos(e){
    const rect = c.getBoundingClientRect();
    const sx = c.width/rect.width, sy = c.height/rect.height;
    const src = e.touches ? e.touches[0] : e;
    return { x:(src.clientX-rect.left)*sx, y:(src.clientY-rect.top)*sy };
  }
  function startDraw(e){
    if(!c.classList.contains('drawing-active')) return;
    e.preventDefault();
    _pizDrawing=true;
    const p=getPos(e); _pizLastX=p.x; _pizLastY=p.y;
  }
  function moveDraw(e){
    if(!_pizDrawing) return;
    e.preventDefault();
    const ctx=pizGetCtx(); if(!ctx) return;
    const p=getPos(e);
    ctx.save();
    if(_pizModo==='borrador'){
      ctx.globalCompositeOperation='destination-out';
      ctx.lineWidth=_pizSize*6;
    } else {
      ctx.globalCompositeOperation='source-over';
      ctx.strokeStyle=_pizColor;
      ctx.lineWidth=_pizSize;
      ctx.globalAlpha=0.80+Math.random()*0.20;
      ctx.shadowColor=_pizColor;
      ctx.shadowBlur=_pizSize>6?2:0;
    }
    ctx.lineCap='round';ctx.lineJoin='round';
    ctx.beginPath();ctx.moveTo(_pizLastX,_pizLastY);ctx.lineTo(p.x,p.y);ctx.stroke();
    ctx.restore();
    _pizLastX=p.x; _pizLastY=p.y;
  }
  function endDraw(){ _pizDrawing=false; }

  c.addEventListener('mousedown',startDraw);
  c.addEventListener('mousemove',moveDraw);
  c.addEventListener('mouseup',endDraw);
  c.addEventListener('mouseleave',endDraw);
  c.addEventListener('touchstart',startDraw,{passive:false});
  c.addEventListener('touchmove',moveDraw,{passive:false});
  c.addEventListener('touchend',endDraw);
}

// ── Modo / color / tamaño ──
function pizSetModo(modo){
  _pizModo=modo;
  const c=pizGetCanvas();
  const pi=document.getElementById('piz-postits');
  const wrap=document.getElementById('piz-nota-input-wrap');
  const colores=document.getElementById('piz-colores');
  const sizes=document.getElementById('piz-sizes');
  ['tiza','postit','borrador'].forEach(m=>{
    const btn=document.getElementById('piz-btn-'+m);
    if(btn)btn.classList.toggle('active',m===modo);
  });
  if(modo==='tiza'||modo==='borrador'){
    if(c)c.classList.add('drawing-active');
    if(pi)pi.classList.remove('postits-active');
    if(wrap)wrap.style.display='none';
    if(colores)colores.style.opacity=modo==='tiza'?'1':'0.35';
    if(sizes)sizes.style.opacity=modo==='tiza'?'1':'0.35';
    if(c)c.style.cursor=modo==='borrador'?'cell':'crosshair';
  } else {
    if(c)c.classList.remove('drawing-active');
    if(pi)pi.classList.add('postits-active');
    if(wrap)wrap.style.display='';
    if(colores)colores.style.opacity='0.35';
    if(sizes)sizes.style.opacity='0.35';
  }
}

function pizSetColor(color,btn){
  _pizColor=color;
  document.querySelectorAll('.piz-color-btn').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
}

function pizSetSize(size,btn){
  _pizSize=size;
  document.querySelectorAll('.piz-size-btn').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
}

// ── Post-its ──
function pizAgregarNota(){
  const inp=document.getElementById('piz-nota-input');
  const texto=(inp?inp.value:'').trim();
  if(!texto)return;
  const pd=pizDatos();
  const color=PIZ_COLORES_POSTIT[pd.notas.length%PIZ_COLORES_POSTIT.length];
  const body=document.getElementById('piz-body');
  const bw=body?body.offsetWidth:600;
  const bh=body?body.offsetHeight:400;
  const x=20+Math.random()*Math.max(bw-200,100);
  const y=20+Math.random()*Math.max(bh-200,80);
  const rot=parseFloat((Math.random()*7-3.5).toFixed(1));
  pd.notas.push({id:uid(),texto,color,x,y,rot});
  guardar();
  if(inp)inp.value='';
  pizRenderPostits();
  setTimeout(()=>{ if(inp)inp.focus(); },50);
}

function pizEliminarNota(id){
  pizDatos().notas=pizDatos().notas.filter(n=>n.id!==id);
  guardar();
  pizRenderPostits();
}

function pizRenderPostits(){
  const cont=document.getElementById('piz-postits');
  if(!cont)return;
  const pd=pizDatos();
  cont.innerHTML=pd.notas.map(n=>`
    <div class="piz-postit" id="piz-postit-${n.id}" data-id="${n.id}"
      style="left:${n.x}px;top:${n.y}px;background:${n.color};--rot:${n.rot}deg;"
      onmousedown="pizStartDragPostit(event,'${n.id}')"
      ontouchstart="pizStartDragPostit(event,'${n.id}')">
      <div class="piz-postit-pin">📌</div>
      <button class="piz-postit-del" onmousedown="event.stopPropagation()" onclick="pizEliminarNota('${n.id}')">✕</button>
      <div class="piz-postit-text">${esc(n.texto)}</div>
    </div>
  `).join('');
}

// ── Drag post-its ──
function pizStartDragPostit(e,id){
  if(e.target.classList.contains('piz-postit-del'))return;
  e.preventDefault();
  const el=document.getElementById('piz-postit-'+id);
  if(!el)return;
  _pizDragPostit=id;
  const rect=el.getBoundingClientRect();
  const cx=e.touches?e.touches[0].clientX:e.clientX;
  const cy=e.touches?e.touches[0].clientY:e.clientY;
  _pizDragOX=cx-rect.left; _pizDragOY=cy-rect.top;
  el.style.zIndex=99;
  const rot=pizDatos().notas.find(n=>n.id===id)?.rot||0;
  el.style.transform=`rotate(${rot}deg) scale(1.05)`;

  const onMove=(e2)=>{
    if(!_pizDragPostit)return;
    const mx=e2.touches?e2.touches[0].clientX:e2.clientX;
    const my=e2.touches?e2.touches[0].clientY:e2.clientY;
    const br=document.getElementById('piz-body').getBoundingClientRect();
    let nx=mx-br.left-_pizDragOX;
    let ny=my-br.top-_pizDragOY;
    nx=Math.max(0,Math.min(nx,br.width-165));
    ny=Math.max(0,Math.min(ny,br.height-95));
    el.style.left=nx+'px'; el.style.top=ny+'px';
  };
  const onEnd=()=>{
    if(!_pizDragPostit)return;
    const nota=pizDatos().notas.find(n=>n.id===_pizDragPostit);
    if(nota&&el){ nota.x=parseFloat(el.style.left)||0; nota.y=parseFloat(el.style.top)||0; guardar(); }
    el.style.zIndex=''; el.style.transform='';
    _pizDragPostit=null;
    document.removeEventListener('mousemove',onMove);
    document.removeEventListener('mouseup',onEnd);
    document.removeEventListener('touchmove',onMove);
    document.removeEventListener('touchend',onEnd);
  };
  document.addEventListener('mousemove',onMove);
  document.addEventListener('mouseup',onEnd);
  document.addEventListener('touchmove',onMove,{passive:false});
  document.addEventListener('touchend',onEnd);
}

// // ── Auto-abrir una vez por día ──
// (function pizAutoAbrir(){
//   const hoyKey=fechaKey(new Date());
//   const lastOpen=localStorage.getItem('pd_piz_lastopen');
//   if(lastOpen!==hoyKey){
//     setTimeout(()=>{
//       localStorage.setItem('pd_piz_lastopen',hoyKey);
//       abrirPizarron();
//     }, datos.localId ? 700 : 1300);
//   }
// })();

// Cerrar con Escape
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    const m=document.getElementById('modal-pizarron');
    if(m&&m.classList.contains('visible')) cerrarPizarron();
  }
});

// Guardar canvas al salir de la página
window.addEventListener('beforeunload',()=>{
  const m=document.getElementById('modal-pizarron');
  if(m&&m.classList.contains('visible')) pizGuardarCanvas();
});