import { supabase } from "/js/supabaseClient.js";
import { mostrarLoader, ocultarLoader } from '/js/components/loader.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Limpiar tokens inválidos al cargar la página de login
    await limpiarTokensInvalidos();
    
    const form = document.querySelector('.login-form');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await mostrarLoader();
  
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      try {
        const backendUrl = 'https://www.procly.net/auth/login';
        
        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
  
        const result = await response.json();
  
        if (response.ok && result.session?.access_token) {
          localStorage.setItem('supabaseToken', result.session.access_token);
          await supabase.auth.setSession({
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token
          });
          
          if (result.redirectTo) {
            window.location.href = result.redirectTo;
          } else {
            alert('No se encontró una URL de redirección');
          }
        } else {
          const mensaje = result.error || 'Credenciales inválidas o formato inesperado.';
          alert(`Error: ${mensaje}`);
          console.error('Respuesta inválida:', result);
        }
        
      } catch (error) {
        alert('Error al conectar con el servidor.');
        console.error(error);
      } finally {
        ocultarLoader();
      }
    });
  });

// Función para limpiar tokens inválidos y evitar errores de consola
async function limpiarTokensInvalidos() {
  try {
    // Verificar si hay un token almacenado
    const token = localStorage.getItem('supabaseToken');
    if (!token) {
      return; // No hay token, no hay nada que limpiar
    }

    // Intentar verificar si el token es válido
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      // Token inválido o expirado, limpiar todo
      console.log('🧹 Limpiando tokens inválidos...');
      localStorage.removeItem('supabaseToken');
      await supabase.auth.signOut();
    }
  } catch (error) {
    // Si hay cualquier error, limpiar todo por seguridad
    console.log('🧹 Error verificando token, limpiando...');
    localStorage.removeItem('supabaseToken');
    await supabase.auth.signOut();
  }
}
  