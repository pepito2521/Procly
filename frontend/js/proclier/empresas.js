import { cargarLoader } from '../components/loader.js';
import { cargarNavbarProclier } from './components/navbar.js';

document.addEventListener('DOMContentLoaded', async () => {
  const tbody = document.getElementById('tablaEmpresas');
  const buscador = document.getElementById('buscadorEmpresas');
  const btnAgregar = document.getElementById('btnAgregarEmpresa');

  let empresas = [];

  // Cargar empresas desde el backend
  async function cargarEmpresas() {
    try {
      // Cambia la URL por la de tu backend
      const response = await fetch('/api/empresas');
      empresas = await response.json();

      mostrarEmpresas(empresas);
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="5">Error al cargar empresas</td></tr>`;
    }
  }

  // Mostrar empresas en la tabla
  function mostrarEmpresas(lista) {
    tbody.innerHTML = '';
    if (!lista.length) {
      tbody.innerHTML = `<tr><td colspan="4">No hay empresas registradas</td></tr>`;
      return;
    }
    lista.forEach(emp => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${emp.razon_social}</td>
        <td>${emp.cuit || '-'}</td>
        <td>
          <span class="estado-badge ${emp.is_active ? 'activa' : 'inactiva'}">
            ${emp.is_active ? 'Activa' : 'Inactiva'}
          </span>
        </td>
        <td>
          <button class="btn-editar" data-id="${emp.empresa_id}">Editar</button>
          <button class="btn-eliminar" data-id="${emp.empresa_id}">Eliminar</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  // Buscador
  buscador.addEventListener('input', (e) => {
    const valor = e.target.value.toLowerCase();
    const filtradas = empresas.filter(emp =>
      emp.razon_social.toLowerCase().includes(valor) ||
      (emp.cuit && emp.cuit.toLowerCase().includes(valor))
    );
    mostrarEmpresas(filtradas);
  });

  // Botón agregar (puedes abrir un modal aquí)
  btnAgregar.addEventListener('click', () => {
    alert('Funcionalidad para agregar empresa (pendiente)');
  });

  // Inicializar
  cargarEmpresas();
});
  