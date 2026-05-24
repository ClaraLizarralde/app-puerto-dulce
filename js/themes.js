/* ══════════════════════════════════════
   THEMES.JS — Efectos por tema
   ══════════════════════════════════════ */

const ThemeEffects = (() => {

  // ── Estado ──
  let currentTheme = null;
  let cleanupFns   = [];

  // ── Paleta retro ──
  const RETRO_COLORS = ['#7dd4f0','#f07820','#48b030','#f0d020','#8040c0','#e03020','#4090d0','#ffffff'];

  /* ════════════════════════════════════
     AUDIO — Web Audio API (sin archivos)
     ════════════════════════════════════ */
  let audioCtx = null;

  function getAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function beep(freq = 440, type = 'square', duration = 0.08, vol = 0.08) {
    try {
      const ctx = getAudio();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch(e) {}
  }

  function soundClick()  { beep(520, 'square',   0.07, 0.09); }
  function soundHover()  { beep(660, 'square',   0.04, 0.04); }
  function soundSuccess(){ 
    beep(523, 'square', 0.08, 0.09);
    setTimeout(() => beep(659, 'square', 0.08, 0.09), 80);
    setTimeout(() => beep(784, 'square', 0.12, 0.09), 160);
  }
  function soundError()  { 
    beep(220, 'sawtooth', 0.12, 0.08);
    setTimeout(() => beep(180, 'sawtooth', 0.10, 0.08), 100);
  }
  function soundConfetti() {
    [523,659,784,1047].forEach((f,i) => setTimeout(() => beep(f,'square',0.09,0.07), i*60));
  }

  /* ════════════════════════════════════
     CURSOR PIXEL ART
     ════════════════════════════════════ */
  function initCursor() {
    // Canvas del cursor
    const cvs = document.createElement('canvas');
    cvs.width  = 16;
    cvs.height = 20;
    cvs.id     = 'retro-cursor';
    Object.assign(cvs.style, {
      position:       'fixed',
      top:            '0',
      left:           '0',
      pointerEvents:  'none',
      zIndex:         '999999',
      imageRendering: 'pixelated',
      display:        'none',
    });
    document.body.appendChild(cvs);

    const ctx = cvs.getContext('2d');
    const K = '#1a1010', W = '#ffffff', T = null;

    // Pixel art cursor — flecha 10×12 pixels (cada pixel = 2×2 en canvas 16×20... en realidad dibujo en 8×10 y escalo ×2)
    const PIXELS = [
      [K,T,T,T,T,T,T,T],
      [K,K,T,T,T,T,T,T],
      [K,W,K,T,T,T,T,T],
      [K,W,W,K,T,T,T,T],
      [K,W,W,W,K,T,T,T],
      [K,W,W,W,W,K,T,T],
      [K,W,W,W,W,W,K,T],
      [K,W,W,K,K,T,T,T],
      [K,W,K,W,K,T,T,T],
      [K,K,T,T,W,K,T,T],
    ];

    const SZ = 2;
    ctx.clearRect(0,0,16,20);
    PIXELS.forEach((row,r) => row.forEach((col,c) => {
      if (!col) return;
      ctx.fillStyle = col;
      ctx.fillRect(c*SZ, r*SZ, SZ, SZ);
    }));

    // Ocultar cursor real
    const styleEl = document.createElement('style');
    styleEl.id = 'retro-cursor-style';
    styleEl.textContent = '[data-theme="retro"] * { cursor: none !important; }';
    document.head.appendChild(styleEl);

    const onMove = e => {
      cvs.style.left    = (e.clientX + 2) + 'px';
      cvs.style.top     = e.clientY + 'px';
      cvs.style.display = 'block';
    };
    const onLeave = () => { cvs.style.display = 'none'; };

    document.addEventListener('mousemove',  onMove);
    document.addEventListener('mouseleave', onLeave);

    return () => {
      cvs.remove();
      styleEl.remove();
      document.removeEventListener('mousemove',  onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }

  /* ════════════════════════════════════
     PARTÍCULAS — canvas overlay
     ════════════════════════════════════ */
  function initParticles() {
    const cvs = document.createElement('canvas');
    cvs.id = 'retro-particles';
    Object.assign(cvs.style, {
      position:      'fixed',
      inset:         '0',
      pointerEvents: 'none',
      zIndex:        '99998',
      width:         '100%',
      height:        '100%',
    });
    document.body.appendChild(cvs);

    const ctx = cvs.getContext('2d');
    let particles = [];
    let rafId;
    let lastX = 0, lastY = 0;

    function resize() {
      cvs.width  = window.innerWidth;
      cvs.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function addParticle(x, y, vx, vy, size, color) {
      particles.push({ x, y, vx, vy, size, color, life: 1, decay: 0.04 + Math.random()*0.04 });
    }

    const onMove = e => {
      const mx = e.clientX, my = e.clientY;
      const dx = mx - lastX, dy = my - lastY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > 4) {
        const n = Math.min(Math.floor(dist / 5) + 1, 4);
        for (let i = 0; i < n; i++) {
          addParticle(
            mx + (Math.random()-.5)*8,
            my + (Math.random()-.5)*8,
            (Math.random()-.5)*2.5 - dx*0.04,
            (Math.random()-.5)*2.5 - dy*0.04 - 0.8,
            Math.random() > .5 ? 4 : 2,
            RETRO_COLORS[Math.floor(Math.random()*RETRO_COLORS.length)]
          );
        }
        lastX = mx; lastY = my;
      }
    };

    function loop() {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.15;
        p.life -= p.decay;
        if (p.life <= 0) { particles.splice(i,1); continue; }
        ctx.globalAlpha = p.life;
        ctx.fillStyle   = p.color;
        const s = Math.round(p.size);
        ctx.fillRect(Math.round(p.x), Math.round(p.y), s, s);
      }
      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(loop);
    }
    loop();

    document.addEventListener('mousemove', onMove);

    return () => {
      cvs.remove();
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
    };
  }

  /* ════════════════════════════════════
     SONIDOS — clicks y hovers
     ════════════════════════════════════ */
  function initSounds() {
    // Elementos interactivos que suenan al hover
    const HOVER_SEL = 'button, .tab, .po-chip, .po-btn-sm, .btn-nuevo-pedido-sidebar, .tabs-collapse-btn';
    // Elementos que suenan al click
    const CLICK_SEL = 'button, .tab, .po-chip, .po-btn-sm, .btn-nuevo-pedido-sidebar, .po-btn-exp, .po-exp-estado-opt, .tabs-collapse-btn, [onclick]';

    const onHover = e => {
      if (e.target.closest(HOVER_SEL)) soundHover();
    };
    const onClick = e => {
      if (e.target.closest(CLICK_SEL)) soundClick();
    };

    document.addEventListener('mouseover', onHover);
    document.addEventListener('click',     onClick);

    return () => {
      document.removeEventListener('mouseover', onHover);
      document.removeEventListener('click',     onClick);
    };
  }

  /* ════════════════════════════════════
     CONFETTI — al cambiar estado pedido
     ════════════════════════════════════ */
  function initConfetti() {
    const cvs = document.createElement('canvas');
    cvs.id = 'retro-confetti';
    Object.assign(cvs.style, {
      position:      'fixed',
      inset:         '0',
      pointerEvents: 'none',
      zIndex:        '999997',
      width:         '100%',
      height:        '100%',
    });
    document.body.appendChild(cvs);

    const ctx = cvs.getContext('2d');
    let pieces = [];
    let rafId;
    let running = false;

    function resize() {
      cvs.width  = window.innerWidth;
      cvs.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function spawnBurst(x, y) {
      soundConfetti();
      for (let i = 0; i < 40; i++) {
        const angle = (Math.PI * 2 / 40) * i + (Math.random()-.5)*.3;
        const speed = 3 + Math.random()*5;
        pieces.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3,
          size: Math.random() > .5 ? 6 : 4,
          color: RETRO_COLORS[Math.floor(Math.random()*RETRO_COLORS.length)],
          life: 1,
          decay: 0.015 + Math.random()*0.01,
          rot: Math.random() * Math.PI,
          rotV: (Math.random()-.5) * 0.2,
        });
      }
      if (!running) loop();
    }

    // Exponer globalmente para que el app pueda llamarlo
    window.retroConfetti = (x, y) => {
      if (currentTheme !== 'retro') return;
      // Si no se pasan coordenadas, explotar desde el centro
      spawnBurst(
        x ?? window.innerWidth  / 2,
        y ?? window.innerHeight / 2
      );
    };

    function loop() {
      running = true;
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i];
        p.x   += p.vx;
        p.y   += p.vy;
        p.vy  += 0.25;
        p.rot += p.rotV;
        p.life -= p.decay;
        if (p.life <= 0) { pieces.splice(i,1); continue; }
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle   = p.color;
        ctx.translate(Math.round(p.x), Math.round(p.y));
        ctx.rotate(p.rot);
        const s = Math.round(p.size);
        ctx.fillRect(-s/2, -s/2, s, s);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      if (pieces.length > 0) {
        rafId = requestAnimationFrame(loop);
      } else {
        running = false;
        ctx.clearRect(0,0,cvs.width,cvs.height);
      }
    }

    // Interceptar cambios de estado — observar clicks en badges de estado
    const onStateClick = e => {
      const badge = e.target.closest('.po-exp-estado-opt, .po-estado-badge');
      if (!badge) return;
      const rect = badge.getBoundingClientRect();
      spawnBurst(rect.left + rect.width/2, rect.top + rect.height/2);
    };
    document.addEventListener('click', onStateClick);

    return () => {
      cvs.remove();
      cancelAnimationFrame(rafId);
      document.removeEventListener('click', onStateClick);
      window.removeEventListener('resize', resize);
      delete window.retroConfetti;
    };
  }

  /* ════════════════════════════════════
     ACTIVAR / DESACTIVAR
     ════════════════════════════════════ */
  function activate(theme) {
    if (currentTheme === theme) return;
    deactivate();
    currentTheme = theme;

    if (theme === 'retro') {
      cleanupFns.push(initCursor());
      cleanupFns.push(initParticles());
      cleanupFns.push(initSounds());
      cleanupFns.push(initConfetti());
    }
    // Acá se pueden agregar efectos para otros temas en el futuro
  }

  function deactivate() {
    cleanupFns.forEach(fn => fn());
    cleanupFns = [];
    currentTheme = null;
  }

  /* ════════════════════════════════════
     INIT — observar cambios de tema
     ════════════════════════════════════ */
  function init() {
    const body = document.body;

    // Activar si ya hay un tema al cargar
    const initial = body.closest('[data-theme]')?.dataset.theme
      || document.documentElement.dataset.theme
      || null;
    if (initial) activate(initial);

    // Observar cambios en data-theme
    const observer = new MutationObserver(() => {
      const theme = document.documentElement.dataset.theme
        || document.body.dataset.theme
        || null;
      if (theme !== currentTheme) {
        if (theme) activate(theme);
        else deactivate();
      }
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    observer.observe(document.body,            { attributes: true, attributeFilter: ['data-theme'] });

    return () => { observer.disconnect(); deactivate(); };
  }

  return { init, activate, deactivate };

})();

// Arrancar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ThemeEffects.init());
} else {
  ThemeEffects.init();
}