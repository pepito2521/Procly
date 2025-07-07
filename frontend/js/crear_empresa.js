import { cargarLoader } from './loader.js';
import { cargarNavbarProclier } from './navbar.js';

document.addEventListener("DOMContentLoaded", async () => {
  await cargarLoader();
  await cargarNavbarProclier();

  document.body.classList.remove("oculto");
  
    const form = document.getElementById('form-crear-empresa');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const nombre = document.getElementById('nombre').value;
      const cuit = document.getElementById('cuit').value;
      const email_contacto = document.getElementById('email_contacto').value;
  
      try {
        const response = await fetch('https://procly.onrender.com/empresas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ nombre, cuit, email_contacto })
        });
  
        const result = await response.json();
  
        if (response.ok) {
          alert('Empresa creada exitosamente');
          form.reset();
        } else {
          alert(`Error: ${result.error}`);
        }
      } catch (error) {
        alert('Error al conectar con el servidor');
        console.error(error);
      }
    });
  });
  