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
      const [tickets, mensual, promedio, acumulado, totalUsuarios, usuariosNuevos] = await Promise.all([
        fetch(`/stats/tickets-procesados`, { headers }).then(r => r.json()),
        fetch(`/stats/gasto-mensual`, { headers }).then(r => r.json()),
        fetch(`/stats/promedio-mensual`, { headers }).then(r => r.json()),
        fetch(`/stats/acumulado-anual`, { headers }).then(r => r.json()),
        fetch(`/stats/usuarios-totales`, { headers }).then(r => r.json()),
        fetch(`/stats/usuarios-nuevos-mes`, { headers }).then(r => r.json())
      ]);

      if (!mensual || !promedio || !acumulado || !tickets || !totalUsuarios || !usuariosNuevos) {
        console.warn("Algunos KPIs no pudieron cargarse.");
      }
  
      document.getElementById("kpi-gasto-mensual").textContent = `$${mensual.total?.toLocaleString() ?? 0}`;
      document.getElementById("kpi-promedio-mensual").textContent = `$${promedio.promedio?.toLocaleString() ?? 0}`;
      document.getElementById("kpi-acumulado").textContent = `$${acumulado.total?.toLocaleString() ?? 0}`;
      document.getElementById("kpi-tickets-procesados").textContent = tickets.total ?? 0;
      document.getElementById("kpi-usuarios-totales").textContent = totalUsuarios.total ?? 0;
      document.getElementById("kpi-usuarios-nuevos").textContent = `${usuariosNuevos.nuevos === 0 ? "Ningún usuario nuevo este mes" : usuariosNuevos.nuevos + (usuariosNuevos.nuevos === 1 ? " nuevo este mes" : " nuevos este mes")}`;

      const mesActual = new Date().getMonth();
      const nombreMes = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][mesActual];
      document.getElementById("mesNombre").textContent = nombreMes;
      document.getElementById("mesNumero").textContent = `Mes ${mesActual + 1} de 12`;

      cargarGraficoGastosMensuales();
  
    } catch (error) {
      console.error("Error cargando KPIs:", error);
    }
  }

  // CHART: GASTOS MENSUALES
async function cargarGraficoGastosMensuales() {
  const token = localStorage.getItem('supabaseToken');
  const headers = { 'Authorization': `Bearer ${token}` };
  const response = await fetch('/stats/gastos-mensuales', { headers });
  const data = await response.json();

  const ctx = document.getElementById('monthlyChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [{
        label: 'Gasto mensual ($)',
        data: data.monthlyTotals,
        borderColor: '#508991',
        backgroundColor: 'rgba(80,137,145,0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#508991'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + value.toLocaleString();
            }
          }
        }
      }
    }
  });
}