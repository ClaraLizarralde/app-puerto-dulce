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
  document.getElementById('sync-dot').className='sync-dot amarillo';
  document.getElementById('sync-txt').textContent='Sin guardar';
  hayCambios=true;
}
function setSyncGuardado(){
  document.getElementById('sync-dot').className='sync-dot verde';
  document.getElementById('sync-txt').textContent='Guardado';
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