import { supabase } from "/js/supabaseClient.js";
import { mostrarLoader, ocultarLoader } from '/js/components/loader.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.login-form');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await mostrarLoader();
  
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      try {
        // Siempre usar el backend de producción para evitar problemas de CORS
        const backendUrl = 'https://www.procly.net/auth/login';
        console.log('🔗 URL del backend:', backendUrl);
        
        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
  
        const result = await response.json();
        console.log('🔍 Respuesta completa del backend:', result);
        console.log('🔍 Status de la respuesta:', response.status);
        console.log('🔍 ¿Tiene session?:', !!result.session);
        console.log('🔍 ¿Tiene access_token?:', !!result.session?.access_token);
        console.log('🔍 redirectTo recibido:', result.redirectTo);
  
        if (response.ok && result.session?.access_token) {
          console.log('✅ Login exitoso, configurando sesión...');
          localStorage.setItem('supabaseToken', result.session.access_token);
          await supabase.auth.setSession({
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token
          });
          
          if (result.redirectTo) {
            console.log('🔄 Redirigiendo a:', result.redirectTo);
            window.location.href = result.redirectTo;
          } else {
            console.log('❌ No se encontró redirectTo en la respuesta');
            alert('No se encontró una URL de redirección');
          }
        } else {
          console.log('❌ Login falló o respuesta inválida');
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
  