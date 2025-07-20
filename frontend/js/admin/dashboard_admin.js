// DASHBOARD ADMIN - COMPONENT
import { supabase } from "/js/supabaseClient.js";

export function initDashboard() {
  console.log("Inicializando Dashboard Admin...");
  cargarKPIs();
  cargarGrafico();
}

async function cargarKPIs() {
  try {
    const token = localStorage.getItem('supabaseToken');
    if (!token) {
      console.error("Token no disponible.");
      return;
    }

    const headers = { 'Authorization': `Bearer ${token}` };

    // Cargar todos los KPIs en paralelo
    const [
      gastoMensual,
      promedioMensual,
      acumulado,
      ticketsProcesados,
      usuariosTotales,
      usuariosNuevos,
      mesActual
    ] = await Promise.all([
      fetch('/stats/gasto-mensual', { headers }).then(r => r.json()),
      fetch('/stats/promedio-mensual', { headers }).then(r => r.json()),
      fetch('/stats/acumulado-anual', { headers }).then(r => r.json()),
      fetch('/stats/tickets-procesados', { headers }).then(r => r.json()),
      fetch('/stats/usuarios-totales', { headers }).then(r => r.json()),
      fetch('/stats/usuarios-nuevos-mes', { headers }).then(r => r.json()),
      fetch('/stats/mes-actual', { headers }).then(r => r.json())
    ]);

    // Actualizar KPIs en el DOM
    document.getElementById("kpi-gasto-mensual").textContent = `$${gastoMensual.gasto?.toLocaleString() ?? '0'}`;
    document.getElementById("kpi-promedio-mensual").textContent = `$${promedioMensual.promedio?.toLocaleString() ?? '0'}`;
    document.getElementById("kpi-acumulado").textContent = `$${acumulado.acumulado?.toLocaleString() ?? '0'}`;
    document.getElementById("kpi-tickets-procesados").textContent = ticketsProcesados.total ?? '0';
    document.getElementById("kpi-usuarios-totales").textContent = usuariosTotales.total ?? '0';
    document.getElementById("kpi-usuarios-nuevos").textContent = 
      usuariosNuevos.nuevos === 0 
        ? "Ningún usuario nuevo este mes" 
        : `${usuariosNuevos.nuevos} nuevo${usuariosNuevos.nuevos > 1 ? 's' : ''} este mes`;
    document.getElementById("mesNombre").textContent = mesActual.nombre ?? 'Mes Actual';
    document.getElementById("mesNumero").textContent = mesActual.numero ?? '';

  } catch (error) {
    console.error("Error al cargar KPIs:", error);
  }
}

async function cargarGrafico() {
  try {
    const token = localStorage.getItem('supabaseToken');
    if (!token) return;

    const headers = { 'Authorization': `Bearer ${token}` };
    const response = await fetch('/stats/gastos-mensuales', { headers });
    const data = await response.json();

    const ctx = document.getElementById('monthlyChart');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels || [],
        datasets: [{
          label: 'Gastos Mensuales',
          data: data.data || [],
          borderColor: '#508991',
          backgroundColor: 'rgba(80, 137, 145, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
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

  } catch (error) {
    console.error("Error al cargar gráfico:", error);
  }
}