document.addEventListener('DOMContentLoaded', async () => {
    const tabla = document.querySelector('#tabla-usuarios-proclier tbody');
  
    try {
      const response = await fetch('https://procly.onrender.com/admin/usuarios');
      const usuarios = await response.json();
  
      usuarios.forEach((usuario) => {
        const fila = document.createElement('tr');
  
        fila.innerHTML = `
          <td>${usuario.nombre} ${usuario.apellido}</td>
          <td>${usuario.email}</td>
          <td>${usuario.empresa}</td>
          <td>${usuario.role}</td>
          <td>${usuario.bloqueado ? 'Bloqueado' : 'Activo'}</td>
          <td>
            <button class="bloquear-btn" data-id="${usuario.id}">
              ${usuario.bloqueado ? 'Desbloquear' : 'Bloquear'}
            </button>
          </td>
        `;
  
        tabla.appendChild(fila);
      });
  
      tabla.addEventListener('click', async (e) => {
        if (e.target.classList.contains('bloquear-btn')) {
          const userId = e.target.dataset.id;
          const accion = e.target.textContent === 'Bloquear' ? true : false;
  
          const res = await fetch(`https://procly.onrender.com/admin/usuarios/${userId}/bloquear`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bloquear: accion })
          });
  
          if (res.ok) {
            location.reload();
          } else {
            alert('Error al actualizar el estado del usuario');
          }
        }
      });
  
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  });
  