/* ══════════════════════════════════════════
   BLACKBOARD — lógica completa
   Prefijo: bb  (blackboard)
══════════════════════════════════════════ */

// ── Estado ──────────────────────────────
const BB = {
  notas:        [],   // [{ id, titulo, cuerpo }]
  notaActivaId: null,
  postits:      [],   // [{ id, x, y, color, texto }]
  stamps:       [],   // [{ id, x, y, emoji }]
  stampActivo:  null, // emoji del sellito seleccionado
};

// Sellitos disponibles
const BB_STAMPS = [
  '🎉','⭐','✅','❌','🔥','💯','👀','🎂','🍰','🍩',
  '☕','🌸','💪','🚀','😂','🤌','💅','🫶','🧁','🍫',
];

// ── Init ─────────────────────────────────
function bbInit() {
  bbCargarEstado();
  bbRenderNotas();
  bbRenderTablero();
  bbRenderStampBar();

  const area = document.getElementById('bb-tablero-area');
  if (area) area.addEventListener('click', bbTableroClick);
}

// ── Abrir / cerrar ───────────────────────
function abrirPizarron() {
  const el = document.getElementById('modal-pizarron');
  if (!el) return;
  el.classList.add('bb-visible');
  if (BB.notas.length === 0) bbNuevaNota();
}
function cerrarPizarron() { bbCerrar(); }   // alias para compatibilidad
function bbCerrar() {
  const el = document.getElementById('modal-pizarron');
  if (el) el.classList.remove('bb-visible');
  bbGuardarEstado();
}

// ════════════════════════════════════════
//  NOTAS (Google Keep style)
// ════════════════════════════════════════
function bbNuevaNota() {
  const nota = { id: bbUID(), titulo: '', cuerpo: '' };
  BB.notas.unshift(nota);
  BB.notaActivaId = nota.id;
  bbRenderNotas();
  bbGuardarEstado();
  // Foco en el título del editor
  setTimeout(() => {
    const t = document.getElementById('bb-editor-titulo');
    if (t) t.focus();
  }, 50);
}

function bbSeleccionarNota(id) {
  BB.notaActivaId = id;
  bbRenderNotas();
}

function bbEliminarNota(id, event) {
  event.stopPropagation();
  BB.notas = BB.notas.filter(n => n.id !== id);
  if (BB.notaActivaId === id) BB.notaActivaId = BB.notas[0]?.id || null;
  bbRenderNotas();
  bbGuardarEstado();
}

function bbGuardarEditorActivo() {
  const t = document.getElementById('bb-editor-titulo');
  const c = document.getElementById('bb-editor-cuerpo');
  if (!t || !c || !BB.notaActivaId) return;
  const nota = BB.notas.find(n => n.id === BB.notaActivaId);
  if (!nota) return;
  nota.titulo = t.value;
  nota.cuerpo = c.value;
  // Re-render tarjetas sin re-render del editor (evita perder foco)
  bbRenderListaNotas();
  bbGuardarEstado();
}

function bbRenderNotas() {
  bbRenderListaNotas();
  bbRenderEditorNota();
}

function bbRenderListaNotas() {
  const lista = document.getElementById('bb-notas-lista');
  if (!lista) return;

  if (BB.notas.length === 0) {
    lista.innerHTML = '<div class="bb-notas-empty">Sin notas aún.<br>Presioná + Nueva para empezar.</div>';
    return;
  }

  lista.innerHTML = BB.notas.map(n => `
    <div class="bb-nota-card ${n.id === BB.notaActivaId ? 'bb-nota-activa' : ''}"
         onclick="bbSeleccionarNota('${n.id}')">
      <div class="bb-nota-card-titulo">${bbEsc(n.titulo) || '<em style="opacity:.5">Sin título</em>'}</div>
      <div class="bb-nota-card-preview">${bbEsc(n.cuerpo) || '<span style="opacity:.4">Nota vacía</span>'}</div>
      <button class="bb-nota-card-del" onclick="bbEliminarNota('${n.id}', event)" title="Eliminar">✕</button>
    </div>
  `).join('');
}

function bbRenderEditorNota() {
  const editor = document.querySelector('.bb-nota-editor');
  if (!editor) return;

  if (!BB.notaActivaId) {
    editor.classList.add('bb-hidden');
    return;
  }
  const nota = BB.notas.find(n => n.id === BB.notaActivaId);
  if (!nota) { editor.classList.add('bb-hidden'); return; }

  editor.classList.remove('bb-hidden');
  const t = document.getElementById('bb-editor-titulo');
  const c = document.getElementById('bb-editor-cuerpo');
  if (t && document.activeElement !== t) t.value = nota.titulo;
  if (c && document.activeElement !== c) c.value = nota.cuerpo;
}

// ════════════════════════════════════════
//  TABLERO: post-its + sellitos
// ════════════════════════════════════════

// ── Stamp bar ────────────────────────────
function bbRenderStampBar() {
  const row = document.getElementById('bb-stamps-row');
  if (!row) return;
  row.innerHTML = BB_STAMPS.map(e =>
    `<button class="bb-stamp-btn ${BB.stampActivo===e?'bb-stamp-activo':''}"
      onclick="bbToggleStamp('${e}')" title="${e}">${e}</button>`
  ).join('');
}

function bbToggleStamp(emoji) {
  BB.stampActivo = BB.stampActivo === emoji ? null : emoji;
  const area = document.getElementById('bb-tablero-area');
  if (area) area.classList.toggle('bb-stamp-mode', !!BB.stampActivo);
  bbRenderStampBar();
}

// ── Click en el área ─────────────────────
function bbTableroClick(e) {
  if (!BB.stampActivo) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left - 15;
  const y = e.clientY - rect.top  - 15;
  const item = { id: bbUID(), x, y, emoji: BB.stampActivo };
  BB.stamps.push(item);
  bbRenderTablero();
  bbGuardarEstado();
}

// ── Post-its ─────────────────────────────
function bbAgregarPostit(color) {
  const area = document.getElementById('bb-tablero-area');
  const rect = area ? area.getBoundingClientRect() : { width:400, height:300 };
  const x = Math.random() * Math.max(0, rect.width  - 160);
  const y = Math.random() * Math.max(0, rect.height - 120);
  BB.postits.push({ id: bbUID(), x, y, color, texto: '' });
  bbRenderTablero();
  bbGuardarEstado();
}

function bbEliminarPostit(id) {
  BB.postits = BB.postits.filter(p => p.id !== id);
  bbRenderTablero();
  bbGuardarEstado();
}

function bbEliminarStamp(id) {
  BB.stamps = BB.stamps.filter(s => s.id !== id);
  bbRenderTablero();
  bbGuardarEstado();
}

function bbLimpiarTablero() {
  if (!confirm('¿Limpiar todos los post-its y sellitos del tablero?')) return;
  BB.postits = [];
  BB.stamps  = [];
  bbRenderTablero();
  bbGuardarEstado();
}

// ── Render tablero ───────────────────────
function bbRenderTablero() {
  const area = document.getElementById('bb-tablero-area');
  if (!area) return;
  area.innerHTML = '';

  BB.postits.forEach(p => {
    const el = document.createElement('div');
    el.className = 'bb-postit';
    el.style.cssText = `left:${p.x}px;top:${p.y}px;background:${p.color};`;
    el.dataset.id = p.id;
    el.innerHTML = `
      <button class="bb-postit-del" onclick="bbEliminarPostit('${p.id}')">✕</button>
      <textarea class="bb-postit-content"
        placeholder="Escribí acá..."
        onchange="bbUpdatePostit('${p.id}',this.value)"
        onblur="bbUpdatePostit('${p.id}',this.value)"
      >${bbEsc(p.texto)}</textarea>`;
    bbHacerArrastrable(el, p, 'postit');
    area.appendChild(el);
  });

  BB.stamps.forEach(s => {
    const el = document.createElement('div');
    el.className = 'bb-stamp-item';
    el.style.cssText = `left:${s.x}px;top:${s.y}px;`;
    el.dataset.id = s.id;
    el.innerHTML = `${s.emoji}<button class="bb-stamp-del" onclick="bbEliminarStamp('${s.id}')">✕</button>`;
    bbHacerArrastrable(el, s, 'stamp');
    area.appendChild(el);
  });
}

function bbUpdatePostit(id, valor) {
  const p = BB.postits.find(x => x.id === id);
  if (p) { p.texto = valor; bbGuardarEstado(); }
}

// ── Drag & Drop genérico ─────────────────
function bbHacerArrastrable(el, data, tipo) {
  let ox=0, oy=0, mx=0, my=0, dragging=false;

  el.addEventListener('mousedown', e => {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') return;
    e.preventDefault();
    dragging = true;
    ox = e.clientX - data.x;
    oy = e.clientY - data.y;
    el.style.zIndex = 100;
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const area = document.getElementById('bb-tablero-area');
    const rect = area.getBoundingClientRect();
    data.x = Math.max(0, Math.min(e.clientX - ox, rect.width  - el.offsetWidth));
    data.y = Math.max(0, Math.min(e.clientY - oy, rect.height - el.offsetHeight));
    el.style.left = data.x + 'px';
    el.style.top  = data.y + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (dragging) { dragging = false; el.style.zIndex = ''; bbGuardarEstado(); }
  });
}

// ════════════════════════════════════════
//  INTEGRACIÓN MODAL DE BIENVENIDA
//  Devuelve los post-its del tablero (hasta 4)
//  para mostrarlos en el modal de bienvenida
// ════════════════════════════════════════
function bbGetPostitsDelDia() {
  return BB.postits.slice(0, 4).map(p => ({
    color:  p.color,
    texto:  p.texto || '(sin texto)',
  }));
}

// ════════════════════════════════════════
//  PERSISTENCIA (localStorage)
// ════════════════════════════════════════
const BB_KEY = 'spa_blackboard_v1';

// DESPUÉS
function bbGuardarEstado() {
  try {
    localStorage.setItem(BB_KEY, JSON.stringify({
      notas:   BB.notas,
      postits: BB.postits,
      stamps:  BB.stamps,
    }));

    // ── Puente con el modal de bienvenida ──
    // renderPizPostits() lee datos.pizarron.notas,
    // así que sincronizamos el formato que espera
    if (!datos.pizarron) datos.pizarron = { notas: [], canvasDataURL: null };
    datos.pizarron.notas = BB.postits.map(p => ({
      texto:    p.texto || '',
      contenido: p.texto || '',   // renderPizPostits usa n.texto || n.contenido
      color:    p.color,
    }));

  } catch(e) { /* cuota excedida */ }
}

function bbCargarEstado() {
  try {
    const raw = localStorage.getItem(BB_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    BB.notas   = data.notas   || [];
    BB.postits = data.postits || [];
    BB.stamps  = data.stamps  || [];
    if (BB.notas.length) BB.notaActivaId = BB.notas[0].id;
  } catch(e) { /* datos corruptos */ }
  if (!datos.pizarron) datos.pizarron = { notas: [], canvasDataURL: null };
datos.pizarron.notas = BB.postits.map(p => ({
  texto:     p.texto || '',
  contenido: p.texto || '',
  color:     p.color,
}));
}

// ── Helpers ──────────────────────────────
function bbUID() {
  return Math.random().toString(36).slice(2,9) + Date.now().toString(36);
}
function bbEsc(str='') {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Arrancar cuando el DOM esté listo ────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bbInit);
} else {
  bbInit();
}