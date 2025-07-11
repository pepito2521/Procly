document.addEventListener("seccion-cambiada", (e) => {
    if (e.detail === "dashboard") {
      cargarDatosKPIs();
    }
  });
  
async function cargarDatosKPIs() {
    const token = localStorage.getItem('supabaseToken');
    if (!token) {
      console.error("Usuario no autenticado (token faltante).");
      return;
    }
  
    const headers = { 'Authorization': `Bearer ${token}` };
  
    try {
      const [tickets, mensual, promedio, acumulado] = await Promise.all([
        fetch(`/stats/tickets-procesados`, { headers }).then(r => r.json()),
        fetch(`/stats/gasto-mensual`, { headers }).then(r => r.json()),
        fetch(`/stats/promedio-mensual`, { headers }).then(r => r.json()),
        fetch(`/stats/acumulado-anual`, { headers }).then(r => r.json())
      ]);

      if (!mensual || !promedio || !acumulado || !tickets) {
        console.warn("Algunos KPIs no pudieron cargarse.");
      }
  
      document.getElementById("kpi-gasto-mensual").textContent = `$${mensual.total?.toLocaleString() ?? 0}`;
      document.getElementById("kpi-promedio-mensual").textContent = `$${promedio.promedio?.toLocaleString() ?? 0}`;
      document.getElementById("kpi-acumulado").textContent = `$${acumulado.total?.toLocaleString() ?? 0}`;
      document.getElementById("kpi-tickets-procesados").textContent = tickets.total ?? 0;

      const mesActual = new Date().getMonth();
      const nombreMes = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][mesActual];
      document.getElementById("mesNombre").textContent = nombreMes;
      document.getElementById("mesNumero").textContent = `Mes ${mesActual + 1} de 12`;
  
    } catch (error) {
      console.error("Error cargando KPIs:", error);
    }
  }