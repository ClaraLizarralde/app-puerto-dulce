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


function toggleUsuarioMenu(){
  document.getElementById('usuario-menu').classList.toggle('hidden');
}

function cambiarUsuario(id, nombre, rol){
  usuarioActivo = { id, nombre, rol, local: id==='u1'?'cuba': id==='u2'?'matienzo':null };
  const inicial = nombre[0].toUpperCase();
  document.querySelectorAll('.usuario-avatar').forEach(el => el.textContent = inicial);
  document.getElementById('usuario-nombre').textContent = nombre;
  document.getElementById('usuario-nombre-header').textContent = nombre;
  document.getElementById('usuario-menu').classList.add('hidden');
}

// cerrar al clickear afuera
document.addEventListener('click', e => {
  if(!e.target.closest('.btn-usuario') && !e.target.closest('.usuario-menu'))
    document.getElementById('usuario-menu').classList.add('hidden');
});