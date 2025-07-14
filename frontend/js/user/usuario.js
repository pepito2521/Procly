// NAVEGACION MODULAR

document.addEventListener("DOMContentLoaded", () => {
  const secciones = {
    nuevo_ticket: { nombre: "Nuevo Ticket", archivo: "nuevo_ticket.html", js: "/js/user/nuevo_ticket.js" },
    mis_tickets: { nombre: "Mis Tickets", archivo: "mis_tickets.html", js: "/js/user/mis_tickets.js" },
    manual: { nombre: "Manual", archivo: "manual.html", js: "/js/user/manual.js" }
  };

  const dynamicContent = document.getElementById("dynamicContent");
  const pageTitle = document.getElementById("pageTitle");

  async function cargarSeccion(seccion) {
    const info = secciones[seccion];
    if (!info) return;
    try {
      const resp = await fetch(`/user/components/${info.archivo}`);
      const html = await resp.text();
      dynamicContent.innerHTML = html;
      pageTitle.textContent = info.nombre;
      marcarActivo(seccion);
      if (info.js) {
        import(info.js)
          .then(mod => {
            if (typeof mod.initDetalleTicket === 'function') mod.initDetalleTicket();
            // ...otros inits según la sección...
          })
          .catch(e => console.error("Error cargando JS de sección:", e));
      }
    } catch (e) {
      dynamicContent.innerHTML = `<p style='padding:2rem;'>No se pudo cargar la sección.</p>`;
    }
  }

  function marcarActivo(seccion) {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-section') === seccion);
    });
  }

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const seccion = btn.getAttribute('data-section');
      cargarSeccion(seccion);
    });
  });

  // Cargar sección por defecto
  cargarSeccion('nuevo_ticket');
});

// Aquí puedes poner lógica global, listeners generales, utilidades, etc.
