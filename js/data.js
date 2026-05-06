// ══════════════════════════════════════════════════════════════════
// FIREBASE — PUNTO DE INTEGRACIÓN
// ══════════════════════════════════════════════════════════════════
// Cuando conectes Firebase, descomentar el bloque en index.html.
// Luego reemplazar las funciones guardar() y una nueva cargarDatos()
// para que lean/escriban en Firestore en lugar de localStorage.
//
// Estructura de datos en Firestore:
//   locales/{localId}/dias/{fechaKey}  → { pedidos, ventas, especial, ... }
//   locales/{localId}/meta             → { catalogo, clientes, archivados, ... }
//
// Detección automática: si window._fb existe (Firebase cargado),
// guardar() usará setDoc(); si no, usará localStorage como ahora.
//
// Ejemplo mínimo de guardar() con Firebase:
//
//   async function guardarFirebase() {
//     if (!window._fb || !datos.localId) return;
//     const { db } = window._fb;
//     const ref = doc(db, 'locales', datos.localId, 'meta', 'datos');
//     await setDoc(ref, datos);
//   }
//
// Por ahora TODO usa localStorage — no hay nada que cambiar acá todavía.
// ══════════════════════════════════════════════════════════════════


// ── AUTO-BACKUP HORARIO ──
// Guarda un snapshot en localStorage cada hora, conserva las últimas 6 versiones.
// Claves: pd_backup_0 ... pd_backup_5 (rotación circular) + pd_backup_meta
const BACKUP_MAX = 6;
const BACKUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hora

let usuarioActivo = {
  id: 'admin',
  nombre: 'Admin',
  rol: 'admin',        // 'admin' | 'usuario'
  local: null          // null = todos, 'matienzo' | 'cuba' = solo ese
};

let filtro='todos';
let hayCambios=false;
let _selCb=null;
let _pagoId=null,_pagoMetodo=null,_pagoDeshacer=false;
let _genCb=null;
let _expandido=null;
let _catTipo='sin_tacc';
let _catTalleOn=true;

// ── DATOS ──
let datos=JSON.parse(localStorage.getItem('pd_v8')||'null');
if(!datos){
  const viejo=JSON.parse(localStorage.getItem('pd_v7')||localStorage.getItem('pd_v6')||localStorage.getItem('pd_v5')||'null');
  const hoy=fechaKey(new Date());
  datos={dias:{[hoy]:{pedidos:[],ventas:[]}},catalogo:[],clientes:[],archivados:[],itemEstados:{}};
  if(viejo){
    datos.dias=viejo.dias||datos.dias;
    datos.clientes=viejo.clientes||[];
    datos.archivados=viejo.archivados||[];
    datos.itemEstados=viejo.itemEstados||{};
    if(viejo.catalogo&&viejo.catalogo.length){
      datos.catalogo=viejo.catalogo.map(x=>{
        if(typeof x==='string')return{nombre:x,tipo:'sin_tacc',tiene_talle:true,precio:0};
        return{...x,tiene_talle:x.tiene_talle!==false,precio:x.precio||0};
      });
    }
  }
  localStorage.setItem('pd_v8',JSON.stringify(datos));
}
if(!datos.catalogo)datos.catalogo=[];
if(!datos.clientes)datos.clientes=[];
if(!datos.archivados)datos.archivados=[];
if(!datos.itemEstados)datos.itemEstados={};
if(!datos.notasCuba)datos.notasCuba=[];
if(typeof datos.notasCuba==='string')datos.notasCuba=datos.notasCuba.trim()?[{id:uid(),txt:datos.notasCuba,hecho:false}]:[];
// ── LOCAL ID (base para futura migración a Firebase multi-tenant) ──
// Si no está seteado, el modal de setup lo pedirá al arrancar
if(!datos.localId) datos.localId = null;
if(!datos.nombre_local) datos.nombre_local = null;


// ── HORARIOS POR LOCAL ──
// Estructura: { [localId]: { [diaSemana 0-6]: { open: "HH:MM", close: "HH:MM" } | null } }
// null = cerrado ese día. 0=domingo,1=lunes,...,6=sábado
const HORARIOS_DEFAULT = {
  matienzo: {
    0: { open: '09:30', close: '13:00' }, // domingo (cierra antes)
    1: null,                               // lunes cerrado
    2: { open: '09:30', close: '18:00' }, // martes
    3: { open: '09:30', close: '18:00' }, // miércoles
    4: { open: '09:30', close: '18:00' }, // jueves
    5: { open: '09:30', close: '18:00' }, // viernes
    6: { open: '09:30', close: '18:00' }, // sábado
  },
  cuba: {
    0: null,
    1: null,
    2: { open: '09:00', close: '20:00' },
    3: { open: '09:00', close: '20:00' },
    4: { open: '09:00', close: '20:00' },
    5: { open: '09:00', close: '20:00' },
    6: { open: '09:00', close: '20:00' },
  },
};
// Migrar si no existe
if(!datos.horariosLocales) datos.horariosLocales = JSON.parse(JSON.stringify(HORARIOS_DEFAULT));
// Asegurar que locales nuevos tengan defaults
Object.keys(HORARIOS_DEFAULT).forEach(lid => {
  if(!datos.horariosLocales[lid]) datos.horariosLocales[lid] = JSON.parse(JSON.stringify(HORARIOS_DEFAULT[lid]));
});

// Hora de corte para pedidos del mismo día (pedir para hoy hasta esta hora)
if(!datos.cortePedidosHoy) datos.cortePedidosHoy = { matienzo: '14:00', cuba: '14:00' };
if(!datos.horaLlegadaCuba) datos.horaLlegadaCuba = '16:00';

datos.catalogo=datos.catalogo.map(x=>({
  nombre: x.nombre||'',
  tipo: normalizarTipo(x.tipo||'sin_tacc'),
  tiene_talle: x.tiene_talle!==false,
  precio: x.precio||0,
  precio_chico: x.precio_chico||0,
  precio_mediano: x.precio_mediano||0,
  precio_grande: x.precio_grande||0,
  categoria: (x.categoria&&['tortas','mousses','bandejas','cuadrados','congelados','otros'].includes(x.categoria))
    ? x.categoria
    : 'otros',
}));
let diaActual=(()=>{
  const hoy=fechaKey(new Date());
  // Si existe hoy, usarlo
  if(datos.dias[hoy])return hoy;
  // Buscar el día futuro más próximo
  const futurosCercanos=Object.keys(datos.dias).filter(k=>k>hoy).sort();
  if(futurosCercanos.length)return futurosCercanos[0];
  // Si no hay futuros, crear hoy
  datos.dias[hoy]={pedidos:[],ventas:[]};
  return hoy;
})();

// ── ESTADO DEL LOCAL ──
// Devuelve { estado: 'abierto'|'cerrando'|'cerrado', texto, color }
function getEstadoLocal(){
  const localId = datos.localId || 'matienzo';
  const hoy = new Date();
  const diaSemana = hoy.getDay();
  const horarios = datos.horariosLocales || HORARIOS_DEFAULT;
  const horLocal = horarios[localId] || horarios['matienzo'];
  const rango = horLocal[diaSemana];
  if(!rango) return { estado:'cerrado', texto:'Cerrado hoy', color:'var(--ink-light)' };

  const nowMin = hoy.getHours()*60 + hoy.getMinutes();
  const [oh,om] = rango.open.split(':').map(Number);
  const [ch,cm] = rango.close.split(':').map(Number);
  const openMin  = oh*60+om;
  const closeMin = ch*60+cm;

  if(nowMin < openMin)  return { estado:'cerrado',  texto:`Abre a las ${rango.open}`, color:'var(--amber)' };
  if(nowMin > closeMin) return { estado:'cerrado',  texto:'Cerrado',                  color:'var(--ink-light)' };
  if(closeMin - nowMin <= 30) return { estado:'cerrando', texto:`Cierra a las ${rango.close}`, color:'var(--amber)' };
  return { estado:'abierto', texto:`Abierto hasta ${rango.close}`, color:'var(--green)' };
}


function guardar(){
  localStorage.setItem('pd_v8',JSON.stringify(datos));
  if (typeof setSyncGuardado === 'function') setSyncGuardado();
  if (typeof autoBackupCheck === 'function') autoBackupCheck();
}


function autoBackupCheck(){
  const meta = JSON.parse(localStorage.getItem('pd_backup_meta') || '{"last":0,"next":0}');
  const ahora = Date.now();
  if(ahora - meta.last < BACKUP_INTERVAL_MS) return; // aún no pasó 1 hora
  const slot = meta.next % BACKUP_MAX;
  const snapshot = { ts: ahora, data: JSON.stringify(datos) };
  try {
    localStorage.setItem(`pd_backup_${slot}`, JSON.stringify(snapshot));
    meta.last = ahora;
    meta.next = slot + 1;
    localStorage.setItem('pd_backup_meta', JSON.stringify(meta));
  } catch(e) {
    // localStorage lleno — no hacer nada, no interrumpir el flujo
  }
}

// También correr al cargar la página
setTimeout(autoBackupCheck, 5000);

function listarBackups(){
  const backups = [];
  for(let i = 0; i < BACKUP_MAX; i++){
    try {
      const raw = localStorage.getItem(`pd_backup_${i}`);
      if(!raw) continue;
      const b = JSON.parse(raw);
      backups.push({ slot: i, ts: b.ts, fecha: new Date(b.ts).toLocaleString('es-AR') });
    } catch(e){}
  }
  return backups.sort((a,b) => b.ts - a.ts);
}

function restaurarBackup(slot){
  try {
    const raw = localStorage.getItem(`pd_backup_${slot}`);
    if(!raw){ alert('Backup no encontrado.'); return; }
    const b = JSON.parse(raw);
    const fecha = new Date(b.ts).toLocaleString('es-AR');
    abrirModalGen(
      `¿Restaurar backup?`,
      `Se van a reemplazar TODOS los datos actuales con el backup del ${fecha}. Esta acción no se puede deshacer.`,
      () => {
        datos = JSON.parse(b.data);
        localStorage.setItem('pd_v8', b.data);
        location.reload();
      },
      'danger'
    );
  } catch(e) {
    alert('Error al leer el backup: ' + e.message);
  }
}

function renderBackupsList(){
  const wrap = document.getElementById('backups-lista');
  if(!wrap) return;
  const backups = listarBackups();
  if(!backups.length){
    wrap.innerHTML = '<div style="font-size:.72rem;color:var(--ink-light);font-style:italic;">Sin backups aún. Se genera uno automáticamente cada hora.</div>';
    return;
  }
  wrap.innerHTML = backups.map(b => `
    <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);">
      <span style="flex:1;font-size:.75rem;color:var(--ink);">🕐 ${b.fecha}</span>
      <button onclick="restaurarBackup(${b.slot})" style="font-family:'Outfit',sans-serif;font-size:.65rem;font-weight:500;padding:4px 10px;border:1.5px solid var(--amber,#ca8a04);border-radius:6px;background:transparent;color:var(--amber,#ca8a04);cursor:pointer;">Restaurar</button>
    </div>
  `).join('');
}

// ── TOAST ──
function diaData(){return datos.dias[diaActual]||(datos.dias[diaActual]={pedidos:[],ventas:[]},datos.dias[diaActual]);}
function getPedidos(){return diaData().pedidos;}
function getVentas(){return diaData().ventas||[];}
function getAllPedidos(){return Object.values(datos.dias).flatMap(d=>d.pedidos||[]);}

// ── DÍAS NAV ──
// ── ARCHIVO AUTOMÁTICO DE DÍAS PASADOS ──
function archivarDiasPasadosAuto(hoy){
  Object.keys(datos.dias).forEach(k=>{
    if(k>=hoy)return; // solo días pasados
    const dData=datos.dias[k];
    if(!dData||!dData.pedidos||!dData.pedidos.length)return;
    // Verificar si ya fue archivado (todos los pedidos están en archivados)
    const [y,m,d]=k.split('-').map(Number);
    const f=new Date(y,m-1,d);
    const nomDia=DIAS_FULL[f.getDay()];
    const pedidosNoArchivados=dData.pedidos.filter(p=>{
      return !datos.archivados.some(a=>a.id===p.id);
    });
    if(!pedidosNoArchivados.length)return;
    // Archivar automáticamente los pedidos no archivados del día pasado
    pedidosNoArchivados.forEach(p=>{
      datos.archivados.push({...p,_fecha:k,_nomDia:nomDia,_archivadoTs:Date.now(),_autoArchivado:true});
    });
    dData.pedidos=[];
    guardar();
  });
}

// ── INIT ──
if(!datos.itemEstados)datos.itemEstados={};
if(!window._hechoSet)window._hechoSet={hoy:new Set(),manana:new Set()};
if(!window._prodCache)window._prodCache={};
document.getElementById('cat-talle-toggle-wrap').className='cat-tiene-talle on';

// Resincronizar _categoria en los items de venta ya guardados,
// por si fueron guardados cuando el catálogo no tenía la categoría correcta
(function resincCategoriasVentas(){
  Object.values(datos.dias).forEach(dData=>{
    if(!dData.ventas)return;
    dData.ventas.forEach(v=>{
      const cat=datos.catalogo.find(c=>c.nombre===v.nombre);
      if(cat&&cat.categoria){v._categoria=cat.categoria;}
    });
  });
})();


// Modo un solo local: asegurar siempre matienzo como localId
if(!datos.localId){
  datos.localId = 'matienzo';
  datos.nombre_local = 'Puerto Dulce — Matienzo';
  guardar();
  // Mostrar bienvenida la primera vez
  setTimeout(() => {
    if (typeof abrirModalBienvenida === 'function') abrirModalBienvenida();
  }, 400);
}

// ── PERMISOS ──
const PERMISOS = {
  admin:   ['exportar', 'importar', 'reportes', 'config', 'pedidos'],
  empleado:['pedidos'],
};

function tienePermiso(permiso) {
  const rol = usuarioActivo?.rol || 'empleado';
  return PERMISOS[rol]?.includes(permiso) ?? false;
}
/* ================================================================
   MODAL BIENVENIDA — PIZARRÓN
================================================================ */
(function(){
  const COLORES_POSTIT = ['y','b','g','p'];
  const EMOJIS_POSTIT  = ['🍮','📦','☎','✏','🧁','📝'];

  const LOCALES_PIZ = [
    { id: 'matienzo', nombre: 'Matienzo', tag: 'LOCAL PRINCIPAL' },
    { id: 'cuba',     nombre: 'Cuba',     tag: 'EN CONSTRUCCIÓN', disabled: true },
  ];

const USUARIOS_PIZ = {
  matienzo: [
    { id: 'admin', nombre: '👑 Admin',    rol: 'admin',    pin: '1234' },
    { id: 'u1',    nombre: '👤 Usuario 1', rol: 'empleado', pin: '0001' },
    { id: 'u2',    nombre: '👤 Usuario 2', rol: 'empleado', pin: '0002' },
  ],
  cuba: [
    { id: 'admin', nombre: '👑 Admin',    rol: 'admin',    pin: '1234' },
    { id: 'u1',    nombre: '👤 Usuario 1', rol: 'empleado', pin: '0001' },
  ],
};
function pizPantallaPin(localId, userId) {
  const postits = document.getElementById('piz-postits-area');
  if (postits) postits.style.display = 'none';
  const lineas = document.querySelectorAll('.piz-line');
  lineas.forEach(l => l.style.display = 'none');

  const usuario = (USUARIOS_PIZ[localId]||[]).find(u=>u.id===userId);
  if (!usuario) return;
  const sec = document.getElementById('piz-login-section');
  if (!sec) return;

  const modal = document.getElementById('modal-setup-local');
  const desdeCambio = modal?._desdeCambioUsuario || false;
  const esDesktop = window.innerWidth >= 901;

  sec.innerHTML = `
    <div class="piz-pantalla piz-pin-wrap">
      <p class="piz-label">ingresá tu PIN · ${usuario.nombre.replace(/^\S+\s*/,'')}</p>
      <div class="piz-pin-dots">
        <span class="piz-pin-dot" id="piz-dot-0"></span>
        <span class="piz-pin-dot" id="piz-dot-1"></span>
        <span class="piz-pin-dot" id="piz-dot-2"></span>
        <span class="piz-pin-dot" id="piz-dot-3"></span>
      </div>
      <p class="piz-pin-error" id="piz-pin-error"></p>
      
      ${esDesktop ? `
        <p class="piz-label" style="font-size:.7rem;margin-top:4px;">usá el teclado numérico</p>
      ` : `
        <div class="piz-teclado">
          ${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(k => `
            <button class="piz-tecla${k===''?' invisible':''}" 
              ${k!==''?`onclick="pizTecla('${k}','${localId}','${usuario.id}')"`:''}>
              ${k}
            </button>
          `).join('')}
        </div>
      `}
      
      <button class="piz-back-btn" onclick="pizPantallaUsuarios('${localId}')">← volver</button>
      ${desdeCambio ? `
        <button class="piz-back-btn" onclick="cerrarModalBienvenida()" style="margin-top:4px;opacity:.5;">✕ cancelar</button>
      ` : ''}
    </div>
  `;

  window._pinActual = '';

  // Teclado físico en desktop
  if (esDesktop) {
    // Limpiar listener anterior si existe
    if (window._pizKeyListener) {
      document.removeEventListener('keydown', window._pizKeyListener);
    }
    window._pizKeyListener = function(e) {
      // Solo actuar si el modal está abierto
      if (document.getElementById('modal-setup-local')?.style.display === 'none') return;
      
      if (e.key >= '0' && e.key <= '9') {
        pizTecla(e.key, localId, usuario.id);
      } else if (e.key === 'Backspace') {
        pizTecla('⌫', localId, usuario.id);
      } else if (e.key === 'Escape') {
        if (desdeCambio) cerrarModalBienvenida();
        else pizPantallaUsuarios(localId);
      }
    };
    document.addEventListener('keydown', window._pizKeyListener);
  }
}

// Función para cerrar el modal desde cambio usuario
window.cerrarModalBienvenida = function() {
  const modal = document.getElementById('modal-setup-local');
  if (modal) modal.style.display = 'none';
  document.querySelector('.piz-cerrar-x')?.remove(); // ← agregá esta línea
  if (window._pizKeyListener) {
    document.removeEventListener('keydown', window._pizKeyListener);
    window._pizKeyListener = null;
  }
};
window.pizPantallaPin = pizPantallaPin;

window.pizTecla = function(tecla, localId, userId) {
  const usuario = (USUARIOS_PIZ[localId]||[]).find(u=>u.id===userId);
  if (!usuario) return;

  if (tecla === '⌫') {
    window._pinActual = (window._pinActual||'').slice(0,-1);
  } else {
    if ((window._pinActual||'').length >= 4) return;
    window._pinActual = (window._pinActual||'') + tecla;
  }

  // Actualizar dots
  for (let i=0; i<4; i++) {
    const dot = document.getElementById(`piz-dot-${i}`);
    if (dot) dot.classList.toggle('activo', i < window._pinActual.length);
  }

  // Verificar PIN cuando llega a 4
  if (window._pinActual.length === 4) {
    if (window._pinActual === usuario.pin) {
      window.pizEntrar(localId, userId, usuario.nombre, usuario.rol);
    } else {
      // Error — shake
      window._pinActual = '';
      for (let i=0; i<4; i++) {
        const dot = document.getElementById(`piz-dot-${i}`);
        if (dot) dot.classList.remove('activo');
      }
      const err = document.getElementById('piz-pin-error');
      if (err) {
        err.textContent = 'PIN incorrecto, intentá de nuevo';
        err.classList.add('visible');
        setTimeout(()=>err.classList.remove('visible'), 2000);
      }
      const dots = document.querySelector('.piz-pin-dots');
      if (dots) {
        dots.classList.add('shake');
        setTimeout(()=>dots.classList.remove('shake'), 400);
      }
    }
  }
};
  function renderPizPostits() {
    const area = document.getElementById('piz-postits-area');
    if (!area) return;

    // Toma notas reales del pizarrón, o usa placeholders
    let notas = [];
    try {
const bbRaw = localStorage.getItem('spa_blackboard_v3');
const bbData = bbRaw ? JSON.parse(bbRaw) : null;
notas = (bbData && bbData.notas && bbData.notas.length)
  ? bbData.notas.slice(0, 3).map(n => ({ texto: n.titulo || n.cuerpo || '' }))
  : [];
    } catch(e) {}

    if (!notas.length) {
      notas = [
        { texto: 'Bienvenida al sistema 🍮' },
        { texto: 'Revisá los pedidos del día' },
        { texto: 'Agregá notas en el Pizarrón' },
      ];
    }

    area.innerHTML = notas.map((n, i) => `
      <div class="piz-postit ${COLORES_POSTIT[i % 4]}">
        <span class="piz-postit-emoji">${EMOJIS_POSTIT[i % 6]}</span>
        ${n.texto || n.contenido || ''}
      </div>
    `).join('');
  }

function pizPantallaLocales() {
  const postits = document.getElementById('piz-postits-area');
  if (postits) postits.style.display = 'flex';
  const lineas = document.querySelectorAll('.piz-line');
  lineas.forEach(l => l.style.display = 'block');
  const sec = document.getElementById('piz-login-section');
  if (!sec) return;
  const modal = document.getElementById('modal-setup-local');
  const desdeCambio = modal?._desdeCambioUsuario || false;

  // Botón X en el pizarron
  const pizarron = document.querySelector('.pizarron');
  pizarron?.querySelector('.piz-cerrar-x')?.remove();
  if (desdeCambio && pizarron) {
    const btnX = document.createElement('button');
    btnX.className = 'piz-cerrar-x';
    btnX.textContent = '✕';
    btnX.onclick = cerrarModalBienvenida;
    pizarron.appendChild(btnX);
  }

  sec.innerHTML = `
    <div class="piz-pantalla">
      <p class="piz-label">seleccioná tu local</p>
      <div class="piz-locales">
        ${LOCALES_PIZ.map(l => `
          <button class="piz-local-btn${l.disabled ? ' disabled' : ''}"
            onclick="${l.disabled ? 'pizMensajeConstruccion()' : `pizPantallaUsuarios('${l.id}')`}">
            ${l.nombre}
            <span class="piz-local-tag">${l.tag}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

window.pizPantallaUsuarios = function(localId) {
  const postits = document.getElementById('piz-postits-area');
  if (postits) postits.style.display = 'flex';
  const lineas = document.querySelectorAll('.piz-line');
  lineas.forEach(l => l.style.display = 'block');
  const local = LOCALES_PIZ.find(l => l.id === localId);
  const users = USUARIOS_PIZ[localId] || [];
  const sec = document.getElementById('piz-login-section');
  if (!sec) return;
  const modal = document.getElementById('modal-setup-local');
  const desdeCambio = modal?._desdeCambioUsuario || false;

  // Botón X en el pizarron
  const pizarron = document.querySelector('.pizarron');
  pizarron?.querySelector('.piz-cerrar-x')?.remove();
  if (desdeCambio && pizarron) {
    const btnX = document.createElement('button');
    btnX.className = 'piz-cerrar-x';
    btnX.textContent = '✕';
    btnX.onclick = cerrarModalBienvenida;
    pizarron.appendChild(btnX);
  }

  sec.innerHTML = `
    <div class="piz-pantalla">
      <p class="piz-label">quién sos · ${local.nombre}</p>
      <div class="piz-usuarios">
        ${users.map(u => `
          <button class="piz-usuario-btn" onclick="pizPantallaPin('${localId}', '${u.id}')">
            ${u.nombre}
            <span class="piz-rol">${u.rol}</span>
          </button>
        `).join('')}
      </div>
      <button class="piz-back-btn" onclick="pizPantallaLocales()">← volver</button>
    </div>
  `;
};
  window.pizPantallaLocales = pizPantallaLocales;

  window.pizEntrar = function(localId, userId, nombre, rol) {
    // Setea usuario activo
    if (typeof usuarioActivo !== 'undefined') {
      usuarioActivo.id     = userId;
      usuarioActivo.nombre = nombre.replace(/^.+?\s/, '');
      usuarioActivo.rol    = (userId === 'admin') ? 'admin' : 'usuario';
      usuarioActivo.local  = (localId === 'matienzo') ? null : localId;
    }
    // Actualiza UI de usuario si existe
    if (typeof actualizarUIUsuario === 'function') actualizarUIUsuario();
    // Llama al setLocal real
    if (typeof setLocal === 'function') setLocal(localId);
     const modal = document.getElementById('modal-setup-local');
    if (modal) modal.style.display = 'none';
  };

  // Abre el modal
window.abrirModalBienvenida = function(desdeCambioUsuario = false) {
  const modal = document.getElementById('modal-setup-local');
  if (!modal) return;
  modal._desdeCambioUsuario = desdeCambioUsuario;
  modal.style.display = 'flex';
  renderPizPostits();
  pizPantallaLocales();
};

  // Exponer para que el flow de inicio lo llame
  // Si ya tenés lógica de "mostrar setup al iniciar", reemplazala por:
  //   abrirModalBienvenida()
  function pizMensajeConstruccion() {
  const sec = document.getElementById('piz-login-section');
  if (!sec) return;
  sec.innerHTML = `
    <div class="piz-pantalla" style="text-align:center;">
      <p style="font-family:'Shadows Into Light',cursive; color:var(--chalk-dim); font-size:1.4rem; letter-spacing:2px; margin-bottom:8px;">
        🚧 en construcción 🚧
      </p>
      <p style="font-family:'Caveat',cursive; color:var(--chalk-dim); font-size:1rem; letter-spacing:1px; opacity:.7;">
        este local todavía no está disponible.      </p>
      <button class="piz-back-btn" onclick="pizPantallaLocales()" style="margin-top:14px;">← volver</button>
    </div>
  `;
}
window.pizMensajeConstruccion = pizMensajeConstruccion;
})();

function selectMobileSubtab(parent, id, el) {
  // Ocultar selector screen
  const screen = document.getElementById('subtab-screen-' + parent);
  if (screen) screen.classList.remove('active');

  // Llamar la función correspondiente
  if (parent === 'produccion') {
    showProdTab(id, document.getElementById('prodtab-' + id));
  } else if (parent === 'cuba') {
    showCubaTab(id, document.getElementById('cubatab-' + id));
  } else if (parent === 'config') {
    showCfgTab(id, document.getElementById('cfgtab-' + id));
  }
}