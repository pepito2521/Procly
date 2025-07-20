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

    // Función helper para manejar fetch con mejor manejo de errores
    async function fetchWithErrorHandling(url, headers) {
      try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
          console.warn(`Error HTTP ${response.status} para ${url}`);
          return null;
        }
        const text = await response.text();
        if (!text) {
          console.warn(`Respuesta vacía para ${url}`);
          return null;
        }
        try {
          return JSON.parse(text);
        } catch (parseError) {
          console.warn(`Error parseando JSON para ${url}:`, text);
          return null;
        }
      } catch (fetchError) {
        console.warn(`Error en fetch para ${url}:`, fetchError);
        return null;
      }
    }

    // Cargar todos los KPIs en paralelo con mejor manejo de errores
    const [
      gastoMensual,
      promedioMensual,
      acumulado,
      ticketsProcesados,
      usuariosTotales,
      usuariosNuevos,
      mesActual
    ] = await Promise.all([
      fetchWithErrorHandling('/stats/gasto-mensual', headers),
      fetchWithErrorHandling('/stats/promedio-mensual', headers),
      fetchWithErrorHandling('/stats/acumulado-anual', headers),
      fetchWithErrorHandling('/stats/tickets-procesados', headers),
      fetchWithErrorHandling('/stats/usuarios-totales', headers),
      fetchWithErrorHandling('/stats/usuarios-nuevos-mes', headers),
      fetchWithErrorHandling('/stats/mes-actual', headers)
    ]);

    // Actualizar KPIs en el DOM con valores por defecto
    document.getElementById("kpi-gasto-mensual").textContent = `$${(gastoMensual?.total || 0).toLocaleString()}`;
    document.getElementById("kpi-promedio-mensual").textContent = `$${(promedioMensual?.promedio || 0).toLocaleString()}`;
    document.getElementById("kpi-acumulado").textContent = `$${(acumulado?.total || 0).toLocaleString()}`;
    document.getElementById("kpi-tickets-procesados").textContent = ticketsProcesados?.total || '0';
    document.getElementById("kpi-usuarios-totales").textContent = usuariosTotales?.total || '0';
    document.getElementById("kpi-usuarios-nuevos").textContent = 
      (usuariosNuevos?.nuevos || 0) === 0 
        ? "Ningún usuario nuevo este mes" 
        : `${usuariosNuevos.nuevos} nuevo${usuariosNuevos.nuevos > 1 ? 's' : ''} este mes`;
    document.getElementById("mesNombre").textContent = mesActual?.nombre || 'Mes Actual';
    document.getElementById("mesNumero").textContent = mesActual?.numero || '';

  } catch (error) {
    console.error("Error al cargar KPIs:", error);
    // Mostrar valores por defecto en caso de error
    document.getElementById("kpi-gasto-mensual").textContent = '$0';
    document.getElementById("kpi-promedio-mensual").textContent = '$0';
    document.getElementById("kpi-acumulado").textContent = '$0';
    document.getElementById("kpi-tickets-procesados").textContent = '0';
    document.getElementById("kpi-usuarios-totales").textContent = '0';
    document.getElementById("kpi-usuarios-nuevos").textContent = 'Ningún usuario nuevo este mes';
    document.getElementById("mesNombre").textContent = 'Mes Actual';
    document.getElementById("mesNumero").textContent = '';
  }
}

async function cargarGrafico() {
  try {
    const token = localStorage.getItem('supabaseToken');
    if (!token) return;

    const headers = { 'Authorization': `Bearer ${token}` };
    
    // Función helper para manejar fetch con mejor manejo de errores
    async function fetchWithErrorHandling(url, headers) {
      try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
          console.warn(`Error HTTP ${response.status} para ${url}`);
          return null;
        }
        const text = await response.text();
        if (!text) {
          console.warn(`Respuesta vacía para ${url}`);
          return null;
        }
        try {
          return JSON.parse(text);
        } catch (parseError) {
          console.warn(`Error parseando JSON para ${url}:`, text);
          return null;
        }
      } catch (fetchError) {
        console.warn(`Error en fetch para ${url}:`, fetchError);
        return null;
      }
    }

    const data = await fetchWithErrorHandling('/stats/gastos-mensuales', headers);
    
    const ctx = document.getElementById('monthlyChart');
    if (!ctx) return;

    // Preparar datos para el gráfico
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthlyTotals = data?.monthlyTotals || Array(12).fill(0);

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: meses,
        datasets: [{
          label: 'Gastos Mensuales',
          data: monthlyTotals,
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