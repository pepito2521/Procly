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
  
        if (response.ok) {
          window.location.href = '/nuevo_ticket.html';
        } else {
          alert(`Error: ${result.error}`);
        }
      } catch (error) {
        alert('Error al conectar con el servidor.');
        console.error(error);
      }
    });
  });
  