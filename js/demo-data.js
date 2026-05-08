// ══════════════════════════════════════
//  DEMO DATA — Puerto Dulce
//  Cargar pedidos de muestra para demo
//  Borrar con: limpiarDemo()
// ══════════════════════════════════════

function _demoFechaKey(offsetDias) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDias);
  return d.toISOString().slice(0, 10);
}

function _demoHora(h, m) {
  return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0');
}

function _demoUid() {
  return Math.random().toString(36).slice(2, 10);
}

function _demoProd(nombre, tacc, tamano, cantidad, nota_prod) {
  return {
    id: _demoUid(),
    nombre,
    tipo: 'catalogo',
    tacc,           // 's' = sin TACC, 'c' = con TACC
    tamano: tamano || '',
    cantidad: cantidad || 1,
    listo: false,
    pedido_cuba: false,
    separado_cuba: false,
    nota_prod: nota_prod || '',
    extras: [],
    precio_libre: 0,
  };
}

function _demoPedido(cliente, tel, hora, productos, estado, pagado, metodo, nota, offsetDias) {
  return {
    id: _demoUid(),
    _demo: true,                          // marca para poder borrarlos
    cliente: cliente.toLowerCase().trim(),
    cliente_input: cliente,
    tel: tel || '',
    hora_entrega: hora,
    estado: estado || 'pendiente',
    pagado: pagado || false,
    metodoPago: metodo || '',
    notas: nota || '',
    productos,
    historial: [{ estado: estado || 'pendiente', ts: Date.now() }],
    creado: Date.now() - Math.floor(Math.random() * 3600000),
    fuera_horario: false,
  };
}

function cargarDemo() {
  // No cargar si ya hay pedidos reales (días con pedidos sin _demo)
  const hayReales = Object.values(datos.dias || {}).some(dd =>
    (dd.pedidos || []).some(p => !p._demo)
  );
  if (hayReales) {
    console.log('[DEMO] Ya hay pedidos reales, no se cargaron datos demo.');
    return;
  }

  const hoy    = _demoFechaKey(0);
  const man    = _demoFechaKey(1);
  const pasado = _demoFechaKey(2);
  const d3     = _demoFechaKey(3);
  const d4     = _demoFechaKey(4);

  if (!datos.dias) datos.dias = {};
  [hoy, man, pasado, d3, d4].forEach(k => {
    if (!datos.dias[k]) datos.dias[k] = { pedidos: [], ventas: [] };
  });

  // ── HOY ──────────────────────────────────────────────
  datos.dias[hoy].pedidos.push(
    _demoPedido('Valentina García', '+5491155443322', _demoHora(11,0),
      [_demoProd('Rogel','s','Mediano',1), _demoProd('Brownie','s','',3)],
      'listo', true, 'Transferencia', '', 0),

    _demoPedido('Marcos Ibáñez', '+5491144332211', _demoHora(12,30),
      [_demoProd('Chocotorta','c','Grande',1,'sin dulce de leche en la mitad'),
       _demoProd('American Cookies','c','',1)],
      'prod', false, '', 'Llamar antes de retirar', 0),

    _demoPedido('Cuba', '', _demoHora(15,0),
      [_demoProd('Cheese Cake','c','Mediano',2),
       _demoProd('Mousse de Chocolate','c','Chico',3),
       _demoProd('Brownie','c','',6)],
      'pendiente', false, '', '', 0),

    _demoPedido('Lucía Fernández', '+5491166554433', _demoHora(17,0),
      [_demoProd('Lemon Pie','s','Grande',1),
       _demoProd('Alfajor Maicena','s','',4)],
      'pendiente', false, '', '', 0),

    _demoPedido('Agustín Morales', '+5491177665544', _demoHora(17,30),
      [_demoProd('Tiramisú','s','Mediano',1,'extra cacao arriba')],
      'pendiente', true, 'Efectivo', '', 0),
  );

  // ── MAÑANA ───────────────────────────────────────────
  datos.dias[man].pedidos.push(
    _demoPedido('Sofía Ramírez', '+5491188776655', _demoHora(10,0),
      [_demoProd('Frutillas','s','Grande',1),
       _demoProd('Vela','s','',2)],
      'pendiente', false, '', 'El cumple es a las 20h', 1),

    _demoPedido('Tomás Herrera', '+5491199887766', _demoHora(11,30),
      [_demoProd('Mousse de Limon','s','Chico',2),
       _demoProd('Carrot Cake','s','',2)],
      'pendiente', false, '', '', 1),

    _demoPedido('Cuba', '', _demoHora(15,0),
      [_demoProd('Sacher','c','Mediano',1),
       _demoProd('Chaja','c','Grande',1),
       _demoProd('Pepas','c','',4)],
      'pendiente', false, '', '', 1),

    _demoPedido('Camila Torres', '+5491100998877', _demoHora(16,0),
      [_demoProd('Bom Bom','s','Grande',1,'decorar con frutos rojos'),
       _demoProd('Cocadas','s','',2)],
      'pendiente', true, 'Mercado Pago', '', 1),

    _demoPedido('Rodrigo Castillo', '+5491111009988', _demoHora(18,0),
      [_demoProd('Chocotorta','s','Mediano',1)],
      'pendiente', false, '', '', 1),
  );

  // ── PASADO MAÑANA ─────────────────────────────────────
  datos.dias[pasado].pedidos.push(
    _demoPedido('Florencia Acosta', '+5491122110099', _demoHora(10,30),
      [_demoProd('Rogel','s','Grande',1),
       _demoProd('Bengala','s','',4)],
      'pendiente', false, '', '', 2),

    _demoPedido('Nicolás Blanco', '+5491133221100', _demoHora(12,0),
      [_demoProd('Mousse de Chocolate','c','Grande',1),
       _demoProd('Oreo','c','',3)],
      'pendiente', false, '', 'Sin glaseado en la mousse', 2),

    _demoPedido('Cuba', '', _demoHora(15,0),
      [_demoProd('Frutillas','c','Mediano',2),
       _demoProd('Mix de Chocolate','c','',3),
       _demoProd('Budin de Manzana','c','',2)],
      'pendiente', false, '', '', 2),

    _demoPedido('Emilia Vega', '+5491144332200', _demoHora(16,30),
      [_demoProd('Cheese Cake','s','Chico',1),
       _demoProd('Cuadrado Cheesecake','s','',2),
       _demoProd('Alfajor Chocolate','s','',3)],
      'pendiente', true, 'Transferencia', '', 2),
  );

  // ── DÍA +3 ───────────────────────────────────────────
  datos.dias[d3].pedidos.push(
    _demoPedido('Julieta Paz', '+5491155441100', _demoHora(11,0),
      [_demoProd('Tiramisú','s','Grande',1,'con extra de café')],
      'pendiente', false, '', '', 3),

    _demoPedido('Sebastián Ríos', '+5491166552211', _demoHora(14,0),
      [_demoProd('Lemon Pie','c','Mediano',1),
       _demoProd('Red Velvet','s','',2)],
      'pendiente', false, '', '', 3),

    _demoPedido('Cuba', '', _demoHora(15,0),
      [_demoProd('Bom Bom','c','Grande',2),
       _demoProd('American Cookies','c','',5)],
      'pendiente', false, '', '', 3),
  );

  // ── DÍA +4 ───────────────────────────────────────────
  datos.dias[d4].pedidos.push(
    _demoPedido('Martina López', '+5491177663300', _demoHora(10,0),
      [_demoProd('Maracuja','s','Mediano',1),
       _demoProd('Conitos','s','',1)],
      'pendiente', false, '', 'Pago contra entrega', 4),

    _demoPedido('Diego Peralta', '+5491188774411', _demoHora(12,30),
      [_demoProd('Chocotorta','c','Grande',1),
       _demoProd('Pepas','c','',3)],
      'pendiente', true, 'Efectivo', '', 4),
  );

  guardar();
  if (typeof asignarIds === 'function') asignarIds();
  if (typeof renderAll === 'function') renderAll();
  if (typeof initPedidosBO === 'function') initPedidosBO();
  console.log('[DEMO] Pedidos de muestra cargados.');
}

// ── BORRAR DEMO ───────────────────────────────────────
function limpiarDemo() {
  Object.values(datos.dias || {}).forEach(dd => {
    if (dd.pedidos) dd.pedidos = dd.pedidos.filter(p => !p._demo);
  });
  guardar();
  if (typeof renderAll === 'function') renderAll();
  if (typeof initPedidosBO === 'function') initPedidosBO();
  console.log('[DEMO] Pedidos de muestra eliminados.');
}


// ── CATÁLOGO DEMO ─────────────────────────────────────
function cargarCatalogoDemo() {
  if (datos.catalogo && datos.catalogo.length > 0) return; // ya tiene catálogo
  datos.catalogo = [
  {
    "nombre": "Alfajor Chocolate",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 2900,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Alfajor Maicena",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 2900,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Alfajor Maicena Bandeja",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 7500,
    "categoria": "bandejas"
  },
  {
    "nombre": "American Cookies",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 7500,
    "categoria": "bandejas"
  },
  {
    "nombre": "Arrollado",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 8600,
    "categoria": "bandejas"
  },
  {
    "nombre": "Biscotti di Prato",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 7500,
    "categoria": "bandejas"
  },
  {
    "nombre": "Brownie",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 4300,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Budin banana",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 9200,
    "categoria": "bandejas"
  },
  {
    "nombre": "Budin Manzana",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 9200,
    "categoria": "bandejas"
  },
  {
    "nombre": "Budin Marmolado",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 9200,
    "categoria": "bandejas"
  },
  {
    "nombre": "Chipa",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 9200,
    "categoria": "congelados"
  },
  {
    "nombre": "Cocadas",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 7500,
    "categoria": "bandejas"
  },
  {
    "nombre": "Coquitos",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 7500,
    "categoria": "bandejas"
  },
  {
    "nombre": "Coco y Dulce de Leche",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 4300,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Colaciones",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 4300,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Conitos",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 10000,
    "categoria": "bandejas"
  },
  {
    "nombre": "Cuadrado Cheesecake",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 5500,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Otoñal Cuadrado",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 6400,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Carrot Cake",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 5500,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Florentinos Bandeja",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 9200,
    "categoria": "bandejas"
  },
  {
    "nombre": "Frola",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 4300,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Leicaj",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 4300,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Limonino",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 4300,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Manzana Cuadrado",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 5100,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Manzana Cuadrado light",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 5100,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Masitas de queso",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 9200,
    "categoria": "bandejas"
  },
  {
    "nombre": "Pan",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 9200,
    "categoria": "bandejas"
  },
  {
    "nombre": "Pepas",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 7500,
    "categoria": "bandejas"
  },
  {
    "nombre": "Pizza Grande 8p",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 15800,
    "categoria": "congelados"
  },
  {
    "nombre": "Pizza Grande 8p 4 quesos",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 16700,
    "categoria": "congelados"
  },
  {
    "nombre": "Pizza Individual",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 9900,
    "categoria": "congelados"
  },
  {
    "nombre": "Red Velvet",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 7200,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Scons de Queso",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 7500,
    "categoria": "bandejas"
  },
  {
    "nombre": "Sueño Chocolate y Naranja",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 4300,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Sueño Chocolate y DDL",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 4300,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Suffle de Ricota",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 4300,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Tarta Jamon y Queso",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 9900,
    "categoria": "congelados"
  },
  {
    "nombre": "Tarta Cebolla y Queso",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 9900,
    "categoria": "congelados"
  },
  {
    "nombre": "Tarta Verdura",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 9900,
    "categoria": "congelados"
  },
  {
    "nombre": "Alfajor CHATITOS Bandeja",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 7500,
    "categoria": "bandejas"
  },
  {
    "nombre": "American Cookies",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 7500,
    "categoria": "bandejas"
  },
  {
    "nombre": "Biscotti di Prato",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 7500,
    "categoria": "bandejas"
  },
  {
    "nombre": "Brownie",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 4300,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Budin de Manzana",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 9200,
    "categoria": "bandejas"
  },
  {
    "nombre": "Budin de Marmolado",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 9200,
    "categoria": "bandejas"
  },
  {
    "nombre": "Budin de Limón",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 9200,
    "categoria": "bandejas"
  },
  {
    "nombre": "Budín de Naranja",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 9200,
    "categoria": "bandejas"
  },
  {
    "nombre": "Carrot Cake",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 5500,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Chocotorta",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 7200,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Coco y Dulce de Leche",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 4300,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Colaciones",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 4300,
    "categoria": "bandejas"
  },
  {
    "nombre": "Cookies Choco blanco",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 7500,
    "categoria": "bandejas"
  },
  {
    "nombre": "Frola",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 4300,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Galesa",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 5800,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Leicaj",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 4300,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Limonino",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 4300,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Manzana Cuadrado",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 5100,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Mix de Chocolate",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 11000,
    "categoria": "bandejas"
  },
  {
    "nombre": "Mix Hungaro",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 11000,
    "categoria": "bandejas"
  },
  {
    "nombre": "Oreo",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 7200,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Pepas",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 7500,
    "categoria": "bandejas"
  },
  {
    "nombre": "Sabores de Oriente",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 6400,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Sueño Chocolate y DDL",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 4300,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Sueño Chocolate y Naranja",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 4300,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Torta Negra Escandinava",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 5800,
    "categoria": "cuadrados"
  },
  {
    "nombre": "Bom Bom",
    "tipo": "sin_tacc",
    "tiene_talle": true,
    "precio_chico": 21000,
    "precio_mediano": 29000,
    "precio_grande": 41000,
    "categoria": "tortas"
  },
  {
    "nombre": "Balcarce",
    "tipo": "sin_tacc",
    "tiene_talle": true,
    "precio_mediano": 44000,
    "precio_grande": 53000,
    "categoria": "tortas"
  },
  {
    "nombre": "Chajá",
    "tipo": "sin_tacc",
    "tiene_talle": true,
    "precio_mediano": 58000,
    "precio_grande": 69000,
    "categoria": "tortas"
  },
  {
    "nombre": "Chocotorta",
    "tipo": "sin_tacc",
    "tiene_talle": true,
    "precio_mediano": 60000,
    "precio_grande": 75000,
    "categoria": "tortas"
  },
  {
    "nombre": "Cheese Cake",
    "tipo": "sin_tacc",
    "tiene_talle": true,
    "precio_chico": 26000,
    "precio_mediano": 33000,
    "precio_grande": 46000,
    "categoria": "tortas"
  },
  {
    "nombre": "Coco y Dulce de Leche",
    "tipo": "sin_tacc",
    "tiene_talle": true,
    "precio_chico": 21000,
    "precio_mediano": 29000,
    "precio_grande": 41000,
    "categoria": "tortas"
  },
  {
    "nombre": "Frola",
    "tipo": "sin_tacc",
    "tiene_talle": true,
    "precio_mediano": 22000,
    "precio_grande": 31000,
    "categoria": "tortas"
  },
  {
    "nombre": "Frutillas",
    "tipo": "sin_tacc",
    "tiene_talle": true,
    "precio_chico": 31000,
    "precio_mediano": 44000,
    "precio_grande": 53000,
    "categoria": "tortas"
  },
  {
    "nombre": "Frutal",
    "tipo": "sin_tacc",
    "tiene_talle": true,
    "precio_chico": 31000,
    "precio_mediano": 44000,
    "precio_grande": 53000,
    "categoria": "tortas"
  },
  {
    "nombre": "Frutos del Bosque",
    "tipo": "sin_tacc",
    "tiene_talle": true,
    "precio_chico": 31000,
    "precio_mediano": 44000,
    "precio_grande": 53000,
    "categoria": "tortas"
  },
  {
    "nombre": "Frutos del Bosque con Marquisse",
    "tipo": "sin_tacc",
    "tiene_talle": true,
    "precio_mediano": 46000,
    "precio_grande": 55000,
    "categoria": "tortas"
  },
  {
    "nombre": "Key Lime Pie",
    "tipo": "sin_tacc",
    "tiene_talle": true,
    "precio_chico": 33000,
    "precio_mediano": 46000,
    "precio_grande": 60000,
    "categoria": "tortas"
  },
  {
    "nombre": "Lemon Pie",
    "tipo": "sin_tacc",
    "tiene_talle": true,
    "precio_chico": 21000,
    "precio_mediano": 29000,
    "precio_grande": 41000,
    "categoria": "tortas"
  },
  {
    "nombre": "Manzana streusel",
    "tipo": "sin_tacc",
    "tiene_talle": true,
    "precio_chico": 21000,
    "precio_mediano": 29000,
    "precio_grande": 41000,
    "categoria": "tortas"
  },
  {
    "nombre": "Maracujá",
    "tipo": "sin_tacc",
    "tiene_talle": true,
    "precio_chico": 29000,
    "precio_mediano": 42000,
    "precio_grande": 53000,
    "categoria": "mousses"
  },
  {
    "nombre": "Marqueese de Chocolate",
    "tipo": "sin_tacc",
    "tiene_talle": true,
    "precio_mediano": 33000,
    "precio_grande": 46000,
    "categoria": "tortas"
  },
  {
    "nombre": "Mousse de Chocolate",
    "tipo": "sin_tacc",
    "tiene_talle": true,
    "precio_chico": 26000,
    "precio_mediano": 40000,
    "precio_grande": 48000,
    "categoria": "mousses"
  },
  {
    "nombre": "Mousse de Limón",
    "tipo": "sin_tacc",
    "tiene_talle": true,
    "precio_chico": 26000,
    "precio_mediano": 40000,
    "precio_grande": 48000,
    "categoria": "mousses"
  },
  {
    "nombre": "Mousse de frutos del  bosque",
    "tipo": "sin_tacc",
    "tiene_talle": true,
    "precio_chico": 31000,
    "precio_mediano": 46000,
    "precio_grande": 55000,
    "categoria": "mousses"
  },
  {
    "nombre": "Mousse de  dulce de leche",
    "tipo": "sin_tacc",
    "tiene_talle": true,
    "precio_chico": 26000,
    "precio_mediano": 40000,
    "precio_grande": 48000,
    "categoria": "mousses"
  },
  {
    "nombre": "Otoñal",
    "tipo": "sin_tacc",
    "tiene_talle": true,
    "precio_chico": 28000,
    "precio_mediano": 43000,
    "precio_grande": 53000,
    "categoria": "tortas"
  },
  {
    "nombre": "Ricota",
    "tipo": "sin_tacc",
    "tiene_talle": true,
    "precio_chico": 21000,
    "precio_mediano": 29000,
    "precio_grande": 41000,
    "categoria": "tortas"
  },
  {
    "nombre": "Rogel",
    "tipo": "sin_tacc",
    "tiene_talle": true,
    "precio_chico": 36000,
    "precio_mediano": 52000,
    "precio_grande": 63000,
    "categoria": "tortas"
  },
  {
    "nombre": "Tiramisú",
    "tipo": "sin_tacc",
    "tiene_talle": true,
    "precio_chico": 26000,
    "precio_mediano": 33000,
    "precio_grande": 46000,
    "categoria": "tortas"
  },
  {
    "nombre": "Bariloche",
    "tipo": "sin_tacc",
    "tiene_talle": true,
    "precio_chico": 36000,
    "precio_mediano": 52000,
    "precio_grande": 63000,
    "categoria": "tortas"
  },
  {
    "nombre": "Zarzamora",
    "tipo": "sin_tacc",
    "tiene_talle": true,
    "precio_mediano": 51000,
    "precio_grande": 62000,
    "categoria": "tortas"
  },
  {
    "nombre": "Bom Bom",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_chico": 21000,
    "precio_mediano": 29000,
    "precio_grande": 41000,
    "categoria": "tortas"
  },
  {
    "nombre": "Balcarce(10p)",
    "tipo": "con_tacc",
    "tiene_talle": false,
    "precio_unico": 55000,
    "categoria": "tortas"
  },
  {
    "nombre": "Cabsha",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_mediano": 29000,
    "precio_grande": 41000,
    "categoria": "tortas"
  },
  {
    "nombre": "Chajá",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_mediano": 53000,
    "precio_grande": 63000,
    "categoria": "tortas"
  },
  {
    "nombre": "Cheese Cake",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_chico": 26000,
    "precio_mediano": 33000,
    "precio_grande": 46000,
    "categoria": "tortas"
  },
  {
    "nombre": "Chocotorta",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_mediano": 58000,
    "precio_grande": 70000,
    "categoria": "tortas"
  },
  {
    "nombre": "Coco y Dulce de Leche",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_chico": 21000,
    "precio_mediano": 29000,
    "precio_grande": 41000,
    "categoria": "tortas"
  },
  {
    "nombre": "Frutos del Bosque con Marquise",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_mediano": 46000,
    "precio_grande": 55000,
    "categoria": "tortas"
  },
  {
    "nombre": "Frola",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_mediano": 22000,
    "precio_grande": 31000,
    "categoria": "tortas"
  },
  {
    "nombre": "Frutillas",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_chico": 31000,
    "precio_mediano": 44000,
    "precio_grande": 53000,
    "categoria": "tortas"
  },
  {
    "nombre": "Frutal",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_chico": 31000,
    "precio_mediano": 44000,
    "precio_grande": 53000,
    "categoria": "tortas"
  },
  {
    "nombre": "Frutos del Bosque",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_chico": 31000,
    "precio_mediano": 44000,
    "precio_grande": 53000,
    "categoria": "tortas"
  },
  {
    "nombre": "Key Lime Pie",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_chico": 31000,
    "precio_mediano": 44000,
    "precio_grande": 53000,
    "categoria": "tortas"
  },
  {
    "nombre": "Lemon Pie",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_chico": 21000,
    "precio_mediano": 29000,
    "precio_grande": 41000,
    "categoria": "tortas"
  },
  {
    "nombre": "Manzana",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_chico": 21000,
    "precio_mediano": 29000,
    "precio_grande": 41000,
    "categoria": "tortas"
  },
  {
    "nombre": "Maracujá",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_chico": 29000,
    "precio_mediano": 42000,
    "precio_grande": 53000,
    "categoria": "tortas"
  },
  {
    "nombre": "Marqueese de Chocolate",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_mediano": 33000,
    "precio_grande": 46000,
    "categoria": "tortas"
  },
  {
    "nombre": "Mousse de Chocolate",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_chico": 26000,
    "precio_mediano": 40000,
    "precio_grande": 48000,
    "categoria": "mousses"
  },
  {
    "nombre": "Mousse de Limón",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_chico": 26000,
    "precio_mediano": 40000,
    "precio_grande": 48000,
    "categoria": "mousses"
  },
  {
    "nombre": "Mousse de frutos del  bosque",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_chico": 31000,
    "precio_mediano": 46000,
    "precio_grande": 55000,
    "categoria": "mousses"
  },
  {
    "nombre": "Mousse de  dulce de leche",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_chico": 26000,
    "precio_mediano": 40000,
    "precio_grande": 48000,
    "categoria": "mousses"
  },
  {
    "nombre": "Otoñal",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_chico": 28000,
    "precio_mediano": 43000,
    "precio_grande": 53000,
    "categoria": "tortas"
  },
  {
    "nombre": "Ricota",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_chico": 21000,
    "precio_mediano": 29000,
    "precio_grande": 41000,
    "categoria": "tortas"
  },
  {
    "nombre": "Rogel",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_chico": 36000,
    "precio_mediano": 52000,
    "precio_grande": 63000,
    "categoria": "tortas"
  },
  {
    "nombre": "Sacher",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_chico": 36000,
    "precio_mediano": 52000,
    "precio_grande": 63000,
    "categoria": "tortas"
  },
  {
    "nombre": "Tiramisú",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_chico": 26000,
    "precio_mediano": 33000,
    "precio_grande": 46000,
    "categoria": "tortas"
  },
  {
    "nombre": "New York Cheesecake",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_chico": 33000,
    "precio_mediano": 44000,
    "precio_grande": 55000,
    "categoria": "tortas"
  },
  {
    "nombre": "Zarzamora",
    "tipo": "con_tacc",
    "tiene_talle": true,
    "precio_mediano": 51000,
    "precio_grande": 62000,
    "categoria": "tortas"
  },
  {
    "nombre": "vela",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 1900,
    "categoria": "otros"
  },
  {
    "nombre": "bengala",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 2400,
    "categoria": "otros"
  },
  {
    "nombre": "cartel feliz cumple",
    "tipo": "sin_tacc",
    "tiene_talle": false,
    "precio_unico": 5000,
    "categoria": "otros"
  }
];
  guardar();
  console.log('[DEMO] Catálogo cargado (' + datos.catalogo.length + ' productos).');
}

// ── AUTO-CARGA ────────────────────────────────────────
// Se carga automáticamente si no hay ningún pedido real
(function() {
  const hayReales = Object.values(datos.dias || {}).some(dd =>
    (dd.pedidos || []).some(p => !p._demo)
  );
  cargarCatalogoDemo();
  cargarClientesDemo();
  if (!hayReales) cargarDemo();
})();

// ── CLIENTES FRECUENTES DEMO ──────────────────────────
function cargarClientesDemo() {
  if (datos.clientes && datos.clientes.length > 0) return;
  datos.clientes = [
    { id: _demoUid(), nombre: 'Valentina García',   tel: '+5491155443322', frecuente: true  },
    { id: _demoUid(), nombre: 'Marcos Ibáñez',      tel: '+5491144332211', frecuente: true  },
    { id: _demoUid(), nombre: 'Lucía Fernández',    tel: '+5491166554433', frecuente: true  },
    { id: _demoUid(), nombre: 'Sofía Ramírez',      tel: '+5491188776655', frecuente: true  },
    { id: _demoUid(), nombre: 'Camila Torres',      tel: '+5491100998877', frecuente: true  },
    { id: _demoUid(), nombre: 'Florencia Acosta',   tel: '+5491122110099', frecuente: true  },
    { id: _demoUid(), nombre: 'Martina López',      tel: '+5491177663300', frecuente: true  },
    { id: _demoUid(), nombre: 'Julieta Paz',        tel: '+5491155441100', frecuente: true  },
    { id: _demoUid(), nombre: 'Emilia Vega',        tel: '+5491144332200', frecuente: true  },
    { id: _demoUid(), nombre: 'Agustín Morales',    tel: '+5491177665544', frecuente: true  },
    { id: _demoUid(), nombre: 'Tomás Herrera',      tel: '+5491199887766', frecuente: false },
    { id: _demoUid(), nombre: 'Rodrigo Castillo',   tel: '+5491111009988', frecuente: false },
    { id: _demoUid(), nombre: 'Nicolás Blanco',     tel: '+5491133221100', frecuente: false },
    { id: _demoUid(), nombre: 'Sebastián Ríos',     tel: '+5491166552211', frecuente: false },
    { id: _demoUid(), nombre: 'Diego Peralta',      tel: '+5491188774411', frecuente: false },
    { id: _demoUid(), nombre: 'Matías Sosa',        tel: '+5491122334455', frecuente: false },
    { id: _demoUid(), nombre: 'Carolina Méndez',    tel: '+5491133445566', frecuente: true  },
    { id: _demoUid(), nombre: 'Daniela Quiroga',    tel: '+5491144556677', frecuente: false },
    { id: _demoUid(), nombre: 'Paula Suárez',       tel: '+5491155667788', frecuente: true  },
    { id: _demoUid(), nombre: 'Renata Olivares',    tel: '+5491166778899', frecuente: false },
  ];
  guardar();
  console.log('[DEMO] Clientes cargados (' + datos.clientes.length + ').');
}
