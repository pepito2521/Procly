document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.login-form');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      try {
        const response = await fetch('https://procly.onrender.com/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
  
        const result = await response.json();
  
        if (response.ok && result.session?.access_token) {
          localStorage.setItem('supabaseToken', result.session.access_token);
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
      }
    });
  });
  