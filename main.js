/**
 * VELOX Luxury Cars — main.js
 *
 * Módulos:
 *  1. Navbar scroll + menú móvil
 *  2. Scroll-spy (link activo)
 *  3. Filtro de flota (tabs)
 *  4. Animaciones reveal (IntersectionObserver)
 *  5. Cálculo de precio estimado
 *  6. Validación de formulario
 *  7. Envío del formulario (simulado)
 *  8. Contador de caracteres
 *  9. Seguimiento de CTAs
 * 10. Fecha mínima en inputs de fecha
 */

'use strict';

/* ─────────────────────────────────────────
   1. NAVBAR — scroll y menú móvil
───────────────────────────────────────── */

// Añade clase "scrolled" al pasar de 60px de scroll
(function () {
  var navbar = document.getElementById('navbar');
  if (!navbar) return;

  function actualizarNavbar() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }

  window.addEventListener('scroll', actualizarNavbar, { passive: true });
  actualizarNavbar(); // ejecutar al cargar por si ya hay scroll
})();

/**
 * Alterna el menú hamburguesa en móvil.
 * Llamado desde onclick del botón #navToggle en el HTML.
 */
function toggleMenu() {
  var menu   = document.getElementById('navMenu');
  var toggle = document.getElementById('navToggle');
  if (!menu || !toggle) return;

  var abierto = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(abierto));
  toggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
}

// Cierra el menú al hacer clic en cualquier enlace
(function () {
  document.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      var menu   = document.getElementById('navMenu');
      var toggle = document.getElementById('navToggle');
      if (menu)   menu.classList.remove('open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();


/* ─────────────────────────────────────────
   2. SCROLL-SPY — link activo en navbar
───────────────────────────────────────── */
(function () {
  var secciones = ['inicio', 'flota', 'nosotros', 'precios', 'contacto']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  var links = document.querySelectorAll('.nav-link[href^="#"]');
  if (!secciones.length || !links.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = entry.target.id;
        links.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  secciones.forEach(function (sec) { observer.observe(sec); });
})();


/* ─────────────────────────────────────────
   3. FILTRO DE FLOTA
───────────────────────────────────────── */

/**
 * Filtra las tarjetas de autos según la categoría.
 * Llamado desde onclick de cada .tab en el HTML.
 * @param {string}      categoria — 'todos' | 'sport' | 'lujo' | 'suv'
 * @param {HTMLElement} tabEl     — Botón tab clickeado
 */
function filtrar(categoria, tabEl) {
  // Actualizar tabs
  document.querySelectorAll('.tab').forEach(function (t) {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  tabEl.classList.add('active');
  tabEl.setAttribute('aria-selected', 'true');

  // Mostrar u ocultar tarjetas
  document.querySelectorAll('.car-card').forEach(function (card) {
    var coincide = categoria === 'todos' || card.dataset.cat === categoria;
    card.classList.toggle('oculto', !coincide);
  });
}


/* ─────────────────────────────────────────
   4. ANIMACIONES REVEAL
───────────────────────────────────────── */
(function () {
  var elementos = document.querySelectorAll('.reveal');
  if (!elementos.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // solo una vez
      }
    });
  }, { threshold: 0.1 });

  elementos.forEach(function (el) { observer.observe(el); });
})();


/* ─────────────────────────────────────────
   5. CÁLCULO DE PRECIO ESTIMADO
───────────────────────────────────────── */

// Precios base por vehículo (USD / día)
var PRECIOS_VEHICULO = {
  'ferrari-sf90':  2400,
  'lambo-huracan': 1900,
  'rolls-ghost':   3100,
  'bentley-gt':    2200,
  'porsche-911':   1500,
  'lambo-urus':    1800,
  'otro':          0
};

var PRECIO_CONDUCTOR = 400; // USD / día

/**
 * Recalcula y muestra el precio estimado.
 * Llamado desde onchange del select de vehículo, inputs de fecha y checkbox de conductor.
 */
function calcularPrecio() {
  var vehiculoEl   = document.getElementById('vehiculo');
  var inicioEl     = document.getElementById('fecha-inicio');
  var finEl        = document.getElementById('fecha-fin');
  var estimadoBox  = document.getElementById('precio-estimado');
  var estimadoVal  = document.getElementById('precio-val');

  if (!vehiculoEl || !inicioEl || !finEl || !estimadoBox || !estimadoVal) return;

  var key   = vehiculoEl.value;
  var start = new Date(inicioEl.value);
  var end   = new Date(finEl.value);

  // Verificar que todo esté seleccionado y las fechas sean válidas
  if (!key || key === 'otro' || !inicioEl.value || !finEl.value) {
    estimadoBox.hidden = true;
    return;
  }

  var dias = Math.ceil((end - start) / 86400000); // ms → días
  if (dias <= 0) { estimadoBox.hidden = true; return; }

  var base       = (PRECIOS_VEHICULO[key] || 0) * dias;
  var conductor  = document.querySelector('input[value="conductor"]:checked') ? PRECIO_CONDUCTOR * dias : 0;
  var total      = base + conductor;

  if (total > 0) {
    estimadoBox.hidden = false;
    estimadoVal.textContent = '$' + total.toLocaleString('en-US') + ' USD (' + dias + ' día' + (dias > 1 ? 's' : '') + ')';
  } else {
    estimadoBox.hidden = true;
  }
}


/* ─────────────────────────────────────────
   6. VALIDACIÓN DE CAMPOS
───────────────────────────────────────── */

/**
 * Valida un campo individual y muestra el error si aplica.
 * Llamado desde onblur de cada input en el HTML.
 * @param {HTMLElement} campo
 * @returns {boolean}
 */
function validar(campo) {
  var errorEl = document.getElementById(campo.id + '-err');
  var msg     = '';

  if (!campo.validity.valid) {
    if      (campo.validity.valueMissing)   msg = 'Este campo es obligatorio.';
    else if (campo.validity.typeMismatch)   msg = 'Formato no válido.';
    else if (campo.validity.tooShort)       msg = 'Mínimo ' + campo.minLength + ' caracteres.';
    else                                    msg = 'Valor incorrecto.';
    campo.style.borderColor = '#e05c5c';
  } else {
    campo.style.borderColor = '';
  }

  if (errorEl) errorEl.textContent = msg;
  return campo.validity.valid;
}


/* ─────────────────────────────────────────
   7. ENVÍO DEL FORMULARIO (simulado)
───────────────────────────────────────── */

/**
 * Gestiona el submit del formulario de reserva.
 * Llamado desde onsubmit del #reservaForm en el HTML.
 * @param {Event} e
 */
function enviarFormulario(e) {
  e.preventDefault();

  var form   = document.getElementById('reservaForm');
  var valido = true;

  // Validar inputs de texto requeridos
  form.querySelectorAll('input[required]:not([type="checkbox"])').forEach(function (campo) {
    if (!validar(campo)) valido = false;
  });

  // Validar selects requeridos
  form.querySelectorAll('select[required]').forEach(function (sel) {
    if (!sel.value) {
      sel.style.borderColor = '#e05c5c';
      valido = false;
    } else {
      sel.style.borderColor = '';
    }
  });

  // Validar checkbox de términos
  var terminos = form.querySelector('input[name="terminos"]');
  if (terminos && !terminos.checked) {
    terminos.parentElement.style.color = '#e05c5c';
    valido = false;
  } else if (terminos) {
    terminos.parentElement.style.color = '';
  }

  if (!valido) {
    // Ir al primer error visible
    var primerError = form.querySelector('[style*="e05c5c"]');
    if (primerError) {
      primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (primerError.focus) primerError.focus();
    }
    return;
  }

  // Simular envío con feedback visual
  var btn = document.getElementById('btnSubmit');
  if (btn) { btn.textContent = 'Enviando…'; btn.disabled = true; }

  setTimeout(function () {
    // Mostrar mensaje de éxito
    var ok = document.getElementById('form-ok');
    if (ok) {
      ok.hidden = false;
      ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Resetear formulario
    form.reset();
    var est = document.getElementById('precio-estimado');
    var cnt = document.getElementById('char-count');
    if (est) est.hidden = true;
    if (cnt) cnt.textContent = '0 / 500';

    if (btn) { btn.textContent = 'Solicitar reserva →'; btn.disabled = false; }

    // Ocultar éxito tras 7 segundos
    setTimeout(function () { if (ok) ok.hidden = true; }, 7000);

    console.log('[VELOX] Reserva enviada correctamente.');
  }, 1200);
}


/* ─────────────────────────────────────────
   8. CONTADOR DE CARACTERES
───────────────────────────────────────── */

/**
 * Actualiza el contador de caracteres del textarea de mensaje.
 * Llamado desde oninput del textarea #mensaje en el HTML.
 * @param {HTMLTextAreaElement} el
 */
function contarChars(el) {
  var cnt = document.getElementById('char-count');
  if (!cnt) return;
  var len = el.value.length;
  var max = el.maxLength || 500;
  cnt.textContent = len + ' / ' + max;
  cnt.style.color = len > max * 0.88 ? '#e05c5c' : '';
}


/* ─────────────────────────────────────────
   9. SEGUIMIENTO DE CTAs
───────────────────────────────────────── */

/**
 * Registra el clic en un CTA.
 * En producción se conectaría a Google Analytics / Plausible.
 * Llamado desde onclick en el HTML.
 * @param {string} origen — Identificador del lugar del clic
 */
function trackCTA(origen) {
  console.log('[VELOX] CTA → ' + origen + ' | ' + new Date().toISOString());
  // Si hay gtag: gtag('event', 'cta_click', { event_label: origen });
}

/**
 * Selecciona un auto en el formulario al clicar "Reservar" en una tarjeta.
 * Llamado desde onclick del .btn-card en cada tarjeta de auto.
 * @param {string} vehiculoKey — Valor del option en el select
 */
function elegirAuto(vehiculoKey) {
  var sel = document.getElementById('vehiculo');
  if (sel) {
    sel.value = vehiculoKey;
    calcularPrecio(); // recalcular si ya hay fechas
  }
  trackCTA('card-' + vehiculoKey);
  // El href="#contacto" de btn-card ya desplaza al formulario
}


/* ─────────────────────────────────────────
   10. FECHA MÍNIMA EN INPUTS DE FECHA
───────────────────────────────────────── */
(function () {
  var inicio = document.getElementById('fecha-inicio');
  var fin    = document.getElementById('fecha-fin');
  if (!inicio || !fin) return;

  // Fecha mínima = mañana
  var manana = new Date();
  manana.setDate(manana.getDate() + 1);
  var minStr = manana.toISOString().split('T')[0];

  inicio.min = minStr;
  fin.min    = minStr;

  // Al elegir fecha inicio, actualizar mínimo de fin y recalcular
  inicio.addEventListener('change', function () {
    fin.min = inicio.value || minStr;
    if (fin.value && fin.value < inicio.value) fin.value = '';
    calcularPrecio();
  });
})();


/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  console.log('[VELOX] Página lista.');
});
