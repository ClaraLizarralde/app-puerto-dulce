/* ══════════════════════════════════════════════════
   BLACKBOARD 
══════════════════════════════════════════════════ */

const BB_STAMPS = [
  '🎉','⭐','✅','❌','🔥','💯','👀','🎂','🍰','🍩',
  '☕','🌸','💪','🚀','😂','🤌','💅','🫶','🧁','🍫',
];
const BB_COLORES = ['#fef08a','#bae6fd','#bbf7d0','#fecdd3','#e9d5ff'];
const BB_FLOATS  = ['bb-float-a','bb-float-b','bb-float-c','bb-float-d'];
const BB_KEY     = 'spa_blackboard_v3';

const BB = {
  notas:       [],  // { id, titulo, cuerpo, color, sello, x, y, floatClass }
  stamps:      [],  // { id, emoji, x, y }
  stampActivo: null,
  leyendo:     null,
  editor:      { notaId: null, color: '#fef08a', sello: '' },
};

/* ── Init ─────────────────────────────────────── */
function bbInit() {
  bbCargarEstado();
  bbRenderStampGrid();
  bbRenderSelloPicker();
  bbRenderTablero();

  const tablero = document.getElementById('bb-tablero');
  if (tablero) tablero.addEventListener('click', bbTableroClick);

  document.addEventListener('keydown', bbKeydown);
  // cerrar grid de sellos al click fuera
  document.addEventListener('click', e => {
    if (!e.target.closest('.bb-sellos-wrap')) bbCerrarGridSellos();
  });
}

/* ── Teclado ──────────────────────────────────── */
function bbKeydown(e) {
  if (e.key === 'Escape') {
    if (document.getElementById('bb-nota-leer-overlay')?.classList.contains('bb-visible')) {
      bbCerrarLeer(); return;
    }
    if (document.getElementById('bb-nota-overlay')?.classList.contains('bb-visible')) {
      bbCerrarEditorNota(); return;
    }
    if (document.getElementById('bb-sellos-flotante')?.classList.contains('bb-visible')) {
      bbCerrarGridSellos(); return;
    }
    if (document.getElementById('modal-pizarron')?.classList.contains('bb-visible')) {
      bbCerrar(); return;
    }
  }
  if (!document.getElementById('modal-pizarron')?.classList.contains('bb-visible')) return;
  if (e.altKey && e.key.toLowerCase() === 'n') { e.preventDefault(); bbAbrirEditorNota(null); }
  if (e.altKey && e.key.toLowerCase() === 's') { e.preventDefault(); bbToggleGridSellos(); }
}

/* ── Abrir / Cerrar pizarrón ─────────────────── */
function abrirPizarron() {
  document.body.classList.add('bb-pizarron-open');
  document.getElementById('modal-pizarron')?.classList.add('bb-visible');
}

function cerrarPizarron() { bbCerrar(); }

function bbCerrar() {
  bbGuardarEstado();
  document.body.classList.remove('bb-pizarron-open');
  document.getElementById('modal-pizarron')?.classList.remove('bb-visible');
}

/* ── Grid de sellos flotante ─────────────────── */
function bbToggleGridSellos() {
  const flotante = document.getElementById('bb-sellos-flotante');
  const btn      = document.getElementById('bb-btn-sellos');
  if (!flotante) return;
  const abierto = flotante.classList.toggle('bb-visible');
  btn?.classList.toggle('bb-activo', abierto);
}
function bbCerrarGridSellos() {
  document.getElementById('bb-sellos-flotante')?.classList.remove('bb-visible');
  document.getElementById('bb-btn-sellos')?.classList.remove('bb-activo');
}

/* ── Sellos ──────────────────────────────────── */
function bbRenderStampGrid() {
  const grid = document.getElementById('bb-sellos-grid');
  if (!grid) return;
  grid.innerHTML = BB_STAMPS.map(e =>
    `<button class="bb-sello-btn ${BB.stampActivo===e?'bb-sello-activo':''}"
       onclick="bbSelectSello('${e}')">${e}</button>`
  ).join('');
}

function bbSelectSello(emoji) {
  BB.stampActivo = BB.stampActivo === emoji ? null : emoji;
  const tablero  = document.getElementById('bb-tablero');
  if (tablero) tablero.classList.toggle('bb-sello-mode', !!BB.stampActivo);

  const label = document.getElementById('bb-sello-activo-label');
  if (label) label.textContent = BB.stampActivo || '';

  bbRenderStampGrid();
}

function bbDeseleccionarSello() {
  BB.stampActivo = null;
  document.getElementById('bb-tablero')?.classList.remove('bb-sello-mode');
  document.getElementById('bb-sello-activo-label').textContent = '';
  bbRenderStampGrid();
  bbCerrarGridSellos();
}

/* ── Click en el tablero ─────────────────────── */
function bbTableroClick(e) {
  if (!BB.stampActivo) return;
  if (e.target.closest('.bb-postit') || e.target.closest('.bb-stamp')) return;

  const rect = e.currentTarget.getBoundingClientRect();
  BB.stamps.push({
    id:    bbUID(),
    emoji: BB.stampActivo,
    x:     e.clientX - rect.left - 16,
    y:     e.clientY - rect.top  - 16,
  });

  bbRenderTablero();
  bbGuardarEstado();
}

function bbEliminarStamp(id) {
  BB.stamps = BB.stamps.filter(s => s.id !== id);
  bbRenderTablero();
  bbGuardarEstado();
}

/* ── Editor de nota ──────────────────────────── */
function bbAbrirEditorNota(id) {
  const nota = id ? BB.notas.find(n => n.id === id) : null;
  BB.editor.notaId = id || null;
  BB.editor.color  = nota?.color || BB_COLORES[Math.floor(Math.random() * BB_COLORES.length)];
  BB.editor.sello  = nota?.sello || '';

  document.getElementById('bb-nota-titulo').value = nota?.titulo || '';
  document.getElementById('bb-nota-cuerpo').value = nota?.cuerpo  || '';
  document.getElementById('bb-nota-sello-actual').textContent = BB.editor.sello;

  bbSetColorNota(BB.editor.color, null);
  document.getElementById('bb-nota-overlay')?.classList.add('bb-visible');
  setTimeout(() => document.getElementById('bb-nota-titulo')?.focus(), 80);
}

function bbCerrarEditorNota() {
  document.getElementById('bb-nota-overlay')?.classList.remove('bb-visible');
  document.getElementById('bb-sello-picker-mini')?.classList.remove('bb-visible');
}

function bbGuardarNota() {
  const titulo = document.getElementById('bb-nota-titulo')?.value.trim() || '';
  const cuerpo = document.getElementById('bb-nota-cuerpo')?.value.trim() || '';
  if (!titulo && !cuerpo) { bbCerrarEditorNota(); return; }

  const { notaId, color, sello } = BB.editor;

  if (notaId) {
    const nota = BB.notas.find(n => n.id === notaId);
    if (nota) Object.assign(nota, { titulo, cuerpo, color, sello });
  } else {
    // posición aleatoria en el tablero
    const tablero = document.getElementById('bb-tablero');
    const w = tablero?.offsetWidth  || 600;
    const h = tablero?.offsetHeight || 400;
    BB.notas.push({
      id: bbUID(), titulo, cuerpo, color, sello,
      x: 40 + Math.random() * Math.max(0, w - 220),
      y: 40 + Math.random() * Math.max(0, h - 180),
      floatClass: BB_FLOATS[BB.notas.length % 4],
    });
  }

  bbCerrarEditorNota();
  bbRenderTablero();
  bbSincronizarDatos();
  bbGuardarEstado();
}

function bbEliminarNota(id, e) {
  e?.stopPropagation();
  BB.notas = BB.notas.filter(n => n.id !== id);
  bbRenderTablero();
  bbSincronizarDatos();
  bbGuardarEstado();
}

/* ── Color nota ──────────────────────────────── */
function bbSetColorNota(color, _btn) {
  BB.editor.color = color;
  const preview = document.getElementById('bb-nota-preview');
  if (preview) {
    preview.style.background = color;
    preview.style.color = color === '#bae6fd' ? '#0c2a3a' : '#3a3000';
  }
  document.querySelectorAll('.bb-color-dot').forEach(d =>
    d.classList.toggle('bb-color-activo', d.dataset.color === color)
  );
}

/* ── Sello en nota ───────────────────────────── */
function bbToggleSelloPicker() {
  document.getElementById('bb-sello-picker-mini')?.classList.toggle('bb-visible');
}
function bbSetSelloNota(emoji) {
  BB.editor.sello = emoji;
  document.getElementById('bb-nota-sello-actual').textContent = emoji;
  document.getElementById('bb-sello-picker-mini')?.classList.remove('bb-visible');
}
function bbRenderSelloPicker() {
  const picker = document.getElementById('bb-sello-picker-mini');
  if (!picker) return;
  picker.innerHTML =
    `<button class="bb-sello-mini-btn" onclick="bbSetSelloNota('')" title="Quitar">✕</button>` +
    BB_STAMPS.map(e =>
      `<button class="bb-sello-mini-btn" onclick="bbSetSelloNota('${e}')">${e}</button>`
    ).join('');
}

/* ── Render tablero ──────────────────────────── */
function bbRenderTablero() {
  const tablero = document.getElementById('bb-tablero');
  if (!tablero) return;

  // limpiar todo menos el hint de vacío
  tablero.querySelectorAll('.bb-postit, .bb-stamp').forEach(el => el.remove());

  const vacio = document.getElementById('bb-tablero-vacio');
  if (vacio) vacio.style.display = (BB.notas.length + BB.stamps.length) === 0 ? '' : 'none';

  // post-its
  BB.notas.forEach(n => {
    const textColor = n.color === '#bae6fd' ? '#0c2a3a' : '#3a3000';
    const el = document.createElement('div');
    el.className = `bb-postit ${n.floatClass || ''}`;
    el.style.cssText = `left:${n.x}px;top:${n.y}px;background:${n.color};color:${textColor};`;
    el.dataset.id = n.id;
    el.innerHTML = `
      <button class="bb-postit-del" onclick="bbEliminarNota('${n.id}',event)">✕</button>
      ${n.sello ? `<span class="bb-postit-sello">${n.sello}</span>` : ''}
      <span class="bb-postit-titulo">${bbEsc(n.titulo) || '<em style="opacity:.4">sin título</em>'}</span>
      <span class="bb-postit-preview">${bbEsc(n.cuerpo)}</span>
    `;
    // click para leer (solo si no está arrastrando)
    el.addEventListener('click', ev => {
      if (!ev.target.closest('.bb-postit-del') && !el.classList.contains('bb-dragging'))
        bbAbrirLeer(n.id);
    });
    bbHacerArrastrable(el, n, tablero);
    tablero.appendChild(el);
  });

  // sellos
  BB.stamps.forEach(s => {
    const el = document.createElement('div');
    el.className = 'bb-stamp';
    el.style.cssText = `left:${s.x}px;top:${s.y}px;`;
    el.dataset.id = s.id;
    el.innerHTML = `${s.emoji}<button class="bb-stamp-del" onclick="bbEliminarStamp('${s.id}')">✕</button>`;
    bbHacerArrastrable(el, s, tablero);
    tablero.appendChild(el);
  });
}

/* ── Leer nota ───────────────────────────────── */
function bbAbrirLeer(id) {
  const nota = BB.notas.find(n => n.id === id);
  if (!nota) return;
  BB.leyendo = id;
  const textColor = nota.color === '#bae6fd' ? '#0c2a3a' : '#3a3000';

  const modal = document.getElementById('bb-nota-leer-modal');
  if (modal) {
    modal.style.background = nota.color;
    modal.style.color      = textColor;
    modal.querySelectorAll('.bb-btn-chalk-sm').forEach(b => {
      b.style.borderColor = `${textColor}44`;
      b.style.color       = `${textColor}88`;
    });
  }
  document.getElementById('bb-leer-sello').textContent  = nota.sello  || '';
  document.getElementById('bb-leer-titulo').textContent = nota.titulo || '';
  document.getElementById('bb-leer-cuerpo').textContent = nota.cuerpo || '';
  document.getElementById('bb-nota-leer-overlay')?.classList.add('bb-visible');
}
function bbCerrarLeer() {
  document.getElementById('bb-nota-leer-overlay')?.classList.remove('bb-visible');
  BB.leyendo = null;
}
function bbEditarDesdeVista() {
  const id = BB.leyendo;
  bbCerrarLeer();
  if (id) bbAbrirEditorNota(id);
}

/* ── Drag & drop ─────────────────────────────── */
function bbHacerArrastrable(el, data, container) {
  let dragging = false, ox = 0, oy = 0, moved = false;

  el.addEventListener('mousedown', e => {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'TEXTAREA') return;
    dragging = true; moved = false;
    ox = e.clientX - data.x;
    oy = e.clientY - data.y;
    el.classList.add('bb-dragging');
    el.style.zIndex = 100;
    e.preventDefault();
  });

  const onMove = e => {
    if (!dragging) return;
    moved = true;
    const rect = container.getBoundingClientRect();
    data.x = Math.max(0, Math.min(e.clientX - ox, rect.width  - el.offsetWidth));
    data.y = Math.max(0, Math.min(e.clientY - oy, rect.height - el.offsetHeight));
    el.style.left = data.x + 'px';
    el.style.top  = data.y + 'px';
  };

  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    el.classList.remove('bb-dragging');
    el.style.zIndex = '';
    if (moved) bbGuardarEstado();
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup',   onUp);
}

/* ── Sincronizar con datos.pizarron ──────────── */
function bbSincronizarDatos() {
  if (typeof pizDatos !== 'function') return;
  const d = pizDatos();
  d.notas = BB.notas.map(n => ({
    texto:    n.titulo || n.cuerpo || '',
    contenido: n.cuerpo || '',
    color:    n.color,
    sello:    n.sello,
  }));
}

function bbGetPostitsDelDia() {
  return BB.notas.slice(0, 4).map(n => ({
    texto:    n.titulo || n.cuerpo || '',
    contenido: n.cuerpo || '',
    color:    n.color,
    sello:    n.sello,
  }));
}

/* ── Persistencia ────────────────────────────── */
function bbGuardarEstado() {
  try {
    localStorage.setItem(BB_KEY, JSON.stringify({ notas: BB.notas, stamps: BB.stamps }));
    bbSincronizarDatos();
  } catch(e) {}
}
function bbCargarEstado() {
  try {
    const raw = localStorage.getItem(BB_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    BB.notas  = data.notas  || [];
    BB.stamps = data.stamps || [];
    bbSincronizarDatos();
  } catch(e) {}
}

/* ── Helpers ─────────────────────────────────── */
function bbUID() { return Math.random().toString(36).slice(2,9) + Date.now().toString(36); }
function bbEsc(s='') {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── Arrancar ────────────────────────────────── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bbInit);
} else {
  bbInit();
}