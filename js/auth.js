/**
 * ================================================================
 * AUTH.JS
 * Modal de bienvenida y sistema de login por pizarrón (PIN).

 * 
 *  * === MODAL BIENVENIDA / LOGIN (SISTEMA PIZARRÓN) ===
 * - abrirModalBienvenida(desdeCambioUsuario) → Abre modal de selección de local/usuario
 * - cerrarModalBienvenida()       → Cierra el modal de bienvenida
 * - pizPantallaLocales()          → Muestra pantalla de selección de local
 * - pizPantallaUsuarios(localId)  → Muestra pantalla de selección de usuario por local
 * - pizPantallaPin(localId, userId) → Muestra pantalla de ingreso de PIN
 * - pizTecla(tecla, localId, userId) → Maneja entrada de teclas numéricas o '⌫'
 * - pizEntrar(localId, userId, nombre, rol) → Ejecuta login y cierra modal
 * - pizMensajeConstruccion()      → Muestra mensaje "en construcción" para locales no disponibles
 *
 * Depende de (definidas en otros archivos):
 * - usuarioActivo          → data.js
 * - actualizarUIUsuario()  → app.js
 * - setLocal(localId)      → app.js
 * - chequearPendientesAyer() → pedidos.js
 * - initWarningCierre()    → navigation.js
 * ================================================================
 */

/* ================================================================
   MODAL BIENVENIDA — PIZARRÓN
   (Contiene la UI de selección de local, usuario y PIN)
================================================================ */

// Función anónima auto-ejecutada que define todo el sistema de bienvenida
(function () {
  const COLORES_POSTIT = ["y", "b", "g", "p"];
  const EMOJIS_POSTIT = ["🍮", "📦", "☎", "✏", "🧁", "📝"];

  const LOCALES_PIZ = [
    { id: "matienzo", nombre: "Matienzo", tag: "LOCAL PRINCIPAL" },
    {
      id: "cuba",
      nombre: "Cuba",
      tag: "EN CONSTRUCCIÓN",
      disabled: true,
    },
  ];

  const USUARIOS_PIZ = {
    matienzo: [
      { id: "admin", nombre: "👑 Admin", rol: "admin", pin: "1234" },
      { id: "u1", nombre: "👤 Usuario 1", rol: "empleado", pin: "0001" },
      { id: "u2", nombre: "👤 Usuario 2", rol: "empleado", pin: "0002" },
    ],
    cuba: [
      { id: "admin", nombre: "👑 Admin", rol: "admin", pin: "1234" },
      { id: "u1", nombre: "👤 Usuario 1", rol: "empleado", pin: "0001" },
    ],
  };

  // ────────────────────────────────────────────────────────────────
  // FUNCIÓN: pizPantallaPin
  // Descripción: Muestra la pantalla de ingreso de PIN para el usuario indicado.
  // ────────────────────────────────────────────────────────────────
  function pizPantallaPin(localId, userId) {
    const postits = document.getElementById("piz-postits-area");
    if (postits) postits.style.display = "none";
    const lineas = document.querySelectorAll(".piz-line");
    lineas.forEach((l) => (l.style.display = "none"));

    const usuario = (USUARIOS_PIZ[localId] || []).find((u) => u.id === userId);
    if (!usuario) return;
    const sec = document.getElementById("piz-login-section");
    if (!sec) return;

    const modal = document.getElementById("modal-setup-local");
    const desdeCambio = modal?._desdeCambioUsuario || false;
    const esDesktop = window.innerWidth >= 901;

    sec.innerHTML = `
    <div class="piz-pantalla piz-pin-wrap">
      <p class="piz-label">ingresá tu PIN · ${usuario.nombre.replace(
        /^\S+\s*/,
        ""
      )}</p>
      <div class="piz-pin-dots">
        <span class="piz-pin-dot" id="piz-dot-0"></span>
        <span class="piz-pin-dot" id="piz-dot-1"></span>
        <span class="piz-pin-dot" id="piz-dot-2"></span>
        <span class="piz-pin-dot" id="piz-dot-3"></span>
      </div>
      <p class="piz-pin-error" id="piz-pin-error"></p>
      
      ${
        esDesktop
          ? `
        <p class="piz-label" style="font-size:.7rem;margin-top:4px;">usá el teclado numérico</p>
      `
          : `
        <div class="piz-teclado">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"]
            .map(
              (k) => `
            <button class="piz-tecla${k === "" ? " invisible" : ""}" 
              ${k !== "" ? `onclick="pizTecla('${k}','${localId}','${usuario.id}')"` : ""}>
              ${k}
            </button>
          `
            )
            .join("")}
        </div>
      `
      }
      
      <button class="piz-back-btn" onclick="pizPantallaUsuarios('${localId}')">← volver</button>
      ${
        desdeCambio
          ? `
        <button class="piz-back-btn" onclick="cerrarModalBienvenida()" style="margin-top:4px;opacity:.5;">✕ cancelar</button>
      `
          : ""
      }
    </div>
  `;

    window._pinActual = "";

    if (esDesktop) {
      if (window._pizKeyListener) {
        document.removeEventListener("keydown", window._pizKeyListener);
      }
      window._pizKeyListener = function (e) {
        if (document.getElementById("modal-setup-local")?.style.display === "none")
          return;
        if (e.key >= "0" && e.key <= "9") {
          pizTecla(e.key, localId, usuario.id);
        } else if (e.key === "Backspace") {
          pizTecla("⌫", localId, usuario.id);
        } else if (e.key === "Escape") {
          if (desdeCambio) cerrarModalBienvenida();
          else pizPantallaUsuarios(localId);
        }
      };
      document.addEventListener("keydown", window._pizKeyListener);
    }
  }

  // ────────────────────────────────────────────────────────────────
  // FUNCIÓN: cerrarModalBienvenida
  // Descripción: Cierra el modal de bienvenida y limpia el listener de teclado.
  // ────────────────────────────────────────────────────────────────
  window.cerrarModalBienvenida = function () {
    const modal = document.getElementById("modal-setup-local");
    if (modal) modal.style.display = "none";
    document.querySelector(".piz-cerrar-x")?.remove();
    if (window._pizKeyListener) {
      document.removeEventListener("keydown", window._pizKeyListener);
      window._pizKeyListener = null;
    }
  };

  window.pizPantallaPin = pizPantallaPin;

  // ────────────────────────────────────────────────────────────────
  // FUNCIÓN: pizTecla
  // Descripción: Maneja la pulsación de tecla (numérica o borrar) en el PIN.
  // ────────────────────────────────────────────────────────────────
  window.pizTecla = function (tecla, localId, userId) {
    const usuario = (USUARIOS_PIZ[localId] || []).find((u) => u.id === userId);
    if (!usuario) return;

    if (tecla === "⌫") {
      window._pinActual = (window._pinActual || "").slice(0, -1);
    } else {
      if ((window._pinActual || "").length >= 4) return;
      window._pinActual = (window._pinActual || "") + tecla;
    }

    for (let i = 0; i < 4; i++) {
      const dot = document.getElementById(`piz-dot-${i}`);
      if (dot) dot.classList.toggle("activo", i < window._pinActual.length);
    }

    if (window._pinActual.length === 4) {
      if (window._pinActual === usuario.pin) {
        window.pizEntrar(localId, userId, usuario.nombre, usuario.rol);
      } else {
        window._pinActual = "";
        for (let i = 0; i < 4; i++) {
          const dot = document.getElementById(`piz-dot-${i}`);
          if (dot) dot.classList.remove("activo");
        }
        const err = document.getElementById("piz-pin-error");
        if (err) {
          err.textContent = "PIN incorrecto, intentá de nuevo";
          err.classList.add("visible");
          setTimeout(() => err.classList.remove("visible"), 2000);
        }
        const dots = document.querySelector(".piz-pin-dots");
        if (dots) {
          dots.classList.add("shake");
          setTimeout(() => dots.classList.remove("shake"), 400);
        }
      }
    }
  };

  // ────────────────────────────────────────────────────────────────
  // FUNCIÓN: renderPizPostits (privada)
  // Descripción: Renderiza los post-its dentro del pizarrón desde localStorage.
  // ────────────────────────────────────────────────────────────────
  function renderPizPostits() {
    const area = document.getElementById("piz-postits-area");
    if (!area) return;

    let notas = [];
    try {
      const bbRaw = localStorage.getItem("spa_blackboard_v3");
      const bbData = bbRaw ? JSON.parse(bbRaw) : null;
      notas = bbData && bbData.notas && bbData.notas.length
        ? bbData.notas.slice(0, 3).map((n) => ({ texto: n.titulo || n.cuerpo || "" }))
        : [];
    } catch (e) {}

    if (!notas.length) {
      notas = [
        { texto: "Bienvenida al sistema 🍮" },
        { texto: "Revisá los pedidos del día" },
        { texto: "Agregá notas en el Pizarrón" },
      ];
    }

    area.innerHTML = notas
      .map(
        (n, i) => `
      <div class="piz-postit ${COLORES_POSTIT[i % 4]}">
        <span class="piz-postit-emoji">${EMOJIS_POSTIT[i % 6]}</span>
        ${n.texto || n.contenido || ""}
      </div>
    `
      )
      .join("");
  }

  // ────────────────────────────────────────────────────────────────
  // FUNCIÓN: pizPantallaLocales
  // Descripción: Muestra la pantalla de selección de locales en el pizarrón.
  // ────────────────────────────────────────────────────────────────
  function pizPantallaLocales() {
    const postits = document.getElementById("piz-postits-area");
    if (postits) postits.style.display = "flex";
    const lineas = document.querySelectorAll(".piz-line");
    lineas.forEach((l) => (l.style.display = "block"));
    const sec = document.getElementById("piz-login-section");
    if (!sec) return;
    const modal = document.getElementById("modal-setup-local");
    const desdeCambio = modal?._desdeCambioUsuario || false;

    const pizarron = document.querySelector(".pizarron");
    pizarron?.querySelector(".piz-cerrar-x")?.remove();
    if (desdeCambio && pizarron) {
      const btnX = document.createElement("button");
      btnX.className = "piz-cerrar-x";
      btnX.textContent = "✕";
      btnX.onclick = cerrarModalBienvenida;
      pizarron.appendChild(btnX);
    }

    sec.innerHTML = `
    <div class="piz-pantalla">
      <p class="piz-label">seleccioná tu local</p>
      <div class="piz-locales">
        ${LOCALES_PIZ.map(
          (l) => `
          <button class="piz-local-btn${l.disabled ? " disabled" : ""}"
            onclick="${
              l.disabled
                ? "pizMensajeConstruccion()"
                : `pizPantallaUsuarios('${l.id}')`
            }">
            ${l.nombre}
            <span class="piz-local-tag">${l.tag}</span>
          </button>
        `
        ).join("")}
      </div>
    </div>
  `;
  }

  // ────────────────────────────────────────────────────────────────
  // FUNCIÓN: pizPantallaUsuarios
  // Descripción: Muestra la pantalla de selección de usuario para el local indicado.
  // ────────────────────────────────────────────────────────────────
  window.pizPantallaUsuarios = function (localId) {
    const postits = document.getElementById("piz-postits-area");
    if (postits) postits.style.display = "none";
    const lineas = document.querySelectorAll(".piz-line");
    lineas.forEach((l) => (l.style.display = "none"));

    const local = LOCALES_PIZ.find((l) => l.id === localId);
    const users = USUARIOS_PIZ[localId] || [];
    const sec = document.getElementById("piz-login-section");
    if (!sec) return;
    const modal = document.getElementById("modal-setup-local");
    const desdeCambio = modal?._desdeCambioUsuario || false;

    const pizarron = document.querySelector(".pizarron");
    pizarron?.querySelector(".piz-cerrar-x")?.remove();
    if (desdeCambio && pizarron) {
      const btnX = document.createElement("button");
      btnX.className = "piz-cerrar-x";
      btnX.textContent = "✕";
      btnX.onclick = cerrarModalBienvenida;
      pizarron.appendChild(btnX);
    }

    sec.innerHTML = `
    <div class="piz-pantalla">
      <p class="piz-label">quién sos · ${local.nombre}</p>
      <div class="piz-usuarios">
        ${users.map(
          (u) => `
          <button class="piz-usuario-btn" onclick="pizPantallaPin('${localId}', '${u.id}')">
            ${u.nombre}
            <span class="piz-rol">${u.rol}</span>
          </button>
        `
        ).join("")}
      </div>
      <button class="piz-back-btn" onclick="pizPantallaLocales()">← volver</button>
    </div>
  `;
  };

  window.pizPantallaLocales = pizPantallaLocales;

  // ────────────────────────────────────────────────────────────────
  // FUNCIÓN: pizEntrar
  // Descripción: Ejecuta el ingreso del usuario, actualiza usuarioActivo y cierra el modal.
  // ────────────────────────────────────────────────────────────────
  window.pizEntrar = function (localId, userId, nombre, rol) {
    if (typeof usuarioActivo !== "undefined") {
      usuarioActivo.id = userId;
      usuarioActivo.nombre = nombre.replace(/^.+?\s/, "");
      usuarioActivo.rol = userId === "admin" ? "admin" : "usuario";
      usuarioActivo.local = localId === "matienzo" ? null : localId;
    }
    if (typeof actualizarUIUsuario === "function") actualizarUIUsuario();
    if (typeof setLocal === "function") setLocal(localId);
    document.getElementById("modal-setup-local").style.display = "none";
    chequearPendientesAyer();
    initWarningCierre();
  };

  // ────────────────────────────────────────────────────────────────
  // FUNCIÓN: abrirModalBienvenida
  // Descripción: Abre el modal de bienvenida (puede ser desde cambio de usuario o al inicio).
  // ────────────────────────────────────────────────────────────────
  window.abrirModalBienvenida = function (desdeCambioUsuario = false) {
    const modal = document.getElementById("modal-setup-local");
    if (!modal) return;
    modal._desdeCambioUsuario = desdeCambioUsuario;
    modal.style.display = "flex";
    renderPizPostits();
    pizPantallaLocales();
  };

  // ────────────────────────────────────────────────────────────────
  // FUNCIÓN: pizMensajeConstruccion
  // Descripción: Muestra mensaje "en construcción" para locales no disponibles.
  // ────────────────────────────────────────────────────────────────
  function pizMensajeConstruccion() {
    const sec = document.getElementById("piz-login-section");
    if (!sec) return;
    sec.innerHTML = `
    <div class="piz-pantalla" style="text-align:center;">
      <p style="font-family:'Shadows Into Light',cursive; color:var(--chalk-dim); font-size:1.4rem; letter-spacing:2px; margin-bottom:8px;">
        🚧 en construcción 🚧
      </p>
      <p style="font-family:'Caveat',cursive; color:var(--chalk-dim); font-size:1rem; letter-spacing:1px; opacity:.7;">
        este local todavía no está disponible.
      </p>
      <button class="piz-back-btn" onclick="pizPantallaLocales()" style="margin-top:14px;">← volver</button>
    </div>
  `;
  }

  window.pizMensajeConstruccion = pizMensajeConstruccion;
})();