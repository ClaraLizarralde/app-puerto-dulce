(function(){
  function onEnter(input, handler){
    if(!input) return;
    input.addEventListener('keydown', (event)=>{
      if(event.key !== 'Enter') return;
      event.preventDefault();
      handler();
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const clearBuscadorBtn = document.getElementById('btn-clear-buscador');
    if(clearBuscadorBtn){
      clearBuscadorBtn.addEventListener('click', ()=>{
        const buscador = document.getElementById('buscador');
        if(buscador) buscador.value = '';
        if(typeof renderPedidos === 'function') renderPedidos();
      });
    }

    onEnter(document.getElementById('cuba-mp-input'), ()=>{
      if(typeof agregarItemMateriaPrima === 'function') agregarItemMateriaPrima();
    });

    onEnter(document.getElementById('cat-input'), ()=>{
      if(typeof agregarProductoCatalogo === 'function') agregarProductoCatalogo();
    });

    const npDiaCustom = document.getElementById('np-dia-custom');
    if(npDiaCustom){
      const handler = ()=>{
        if(typeof npOnCustomDia === 'function') npOnCustomDia();
      };
      npDiaCustom.addEventListener('change', handler);
      npDiaCustom.addEventListener('input', handler);
    }

    const npHoraMobile = document.getElementById('np-hora-mobile');
    if(npHoraMobile){
      npHoraMobile.addEventListener('input', ()=>{
        if(typeof npOnMobileTimeInput === 'function') npOnMobileTimeInput(npHoraMobile.value);
      });
    }

    const npNombre = document.getElementById('np-nombre');
    if(npNombre){
      npNombre.addEventListener('input', ()=>{
        if(typeof npOnNombreInput === 'function') npOnNombreInput();
      });
      npNombre.addEventListener('blur', ()=>{
        setTimeout(()=>{
          if(!window._npSeleccionandoAutocomp && typeof npOcultarAutocomp === 'function'){
            npOcultarAutocomp();
          }
        }, 200);
      });
    }

    const selectorSearch = document.getElementById('selector-search');
    if(selectorSearch){
      selectorSearch.addEventListener('input', ()=>{
        if(typeof renderSelectorLista === 'function') renderSelectorLista();
      });
    }

    onEnter(document.getElementById('piz-nota-input'), ()=>{
      if(typeof pizAgregarNota === 'function') pizAgregarNota();
    });
  });
})();
