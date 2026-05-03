//TOAST
function mostrarToastGuardado(){
  const t=document.getElementById('toast-guardado');
  if(!t)return;
  t.classList.add('visible');
  clearTimeout(t._timer);
  t._timer=setTimeout(()=>t.classList.remove('visible'),2000);
}
// ── SYNC ──
function setSyncPendiente(){
  ['sync-dot','sync-dot-banner'].forEach(id=>{const el=document.getElementById(id);if(el)el.className='sync-dot amarillo';});
  ['sync-txt','sync-txt-banner'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent='Sin guardar';});
  hayCambios=true;
}
function setSyncGuardado(){
  ['sync-dot','sync-dot-banner'].forEach(id=>{const el=document.getElementById(id);if(el)el.className='sync-dot verde';});
  ['sync-txt','sync-txt-banner'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent='Guardado';});
  hayCambios=false;
}
window.addEventListener('beforeunload',e=>{if(hayCambios){e.preventDefault();e.returnValue='';}});

document.addEventListener('click',e=>{
  if(!e.target.closest('.autocomplete-wrap'))
    document.getElementById('autocomplete-lista').classList.remove('visible');
});

// ── Actualizar estado del local cada minuto ──
setInterval(renderEstadoLocal, 60000);

renderDiasNav();renderAll();renderCatalogo();renderArchivadosGlobal(); 




function actualizarUIUsuario() {
  if (!usuarioActivo) return;
  const nombre = usuarioActivo.nombre || '—';
  const rol    = usuarioActivo.rol || '';
  
  document.querySelectorAll('.usuario-nombre').forEach(el => el.textContent = nombre);
  
  const menuHeader = document.getElementById('usuario-nombre-menu');
  if (menuHeader) menuHeader.textContent = nombre;
  
const menuRol = document.getElementById('usuario-rol-menu');
if (menuRol) menuRol.textContent = usuarioActivo.rol === 'admin' ? 'Administrador' : 'Empleado';
  
  const menu = document.getElementById('usuario-menu');
  if (menu) menu.classList.add('hidden');
}

function toggleUsuarioMenu(btnId){
  const menu = document.getElementById('usuario-menu');
  const btn = document.getElementById(btnId);
  const rect = btn.getBoundingClientRect();
  
  menu.style.width = rect.width + 'px';
  menu.style.right = (window.innerWidth - rect.right) + 'px';

  // Si viene del sidebar → expande arriba
  // Si viene del header → expande abajo
  if (btnId === 'btn-usuario') {
    menu.style.top = (rect.top - 140) + 'px'; // ajustá el 110 según altura del menú
    menu.style.bottom = 'auto';
  } else {
    menu.style.top = (rect.bottom + 8) + 'px';
    menu.style.bottom = 'auto';
  }

  menu.classList.toggle('hidden');
  if (menu.classList.contains('hidden')) {
    menu.style.display = 'none';
  } else {
    menu.style.display = 'block';
  }
}
// cerrar al clickear afuera
document.addEventListener('click', e => {
  if(!e.target.closest('.btn-usuario') && !e.target.closest('.usuario-menu'))
    document.getElementById('usuario-menu').classList.add('hidden');
});

function abrirModalCambioUsuario() {
  // TODO: abrir modal
  console.log('cambiar usuario');
}

actualizarUIUsuario();

function abrirModalCambioUsuario() {
  document.getElementById('usuario-menu').style.display = 'none';
  abrirModalBienvenida();
}