document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.signup-form');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const passwordCheck = document.getElementById('password-check');
  const firstname = document.getElementById('firstname');
  const lastname = document.getElementById('lastname');
  const cuit = document.getElementById('cuit');

  // VALIDACIÓN EN TIEMPO REAL DE CONTRASEÑAS
  function validarPasswords() {
    const passVal = password.value;
    const checkVal = passwordCheck.value;

    if (!checkVal) {
      passwordCheck.classList.remove('valid', 'invalid');
      return;
    }

    if (passVal === checkVal) {
      password.classList.add('valid');
      password.classList.remove('invalid');
      passwordCheck.classList.add('valid');
      passwordCheck.classList.remove('invalid');
    } else {
      password.classList.add('invalid');
      password.classList.remove('valid');
      passwordCheck.classList.add('invalid');
      passwordCheck.classList.remove('valid');
    }
  }

  password.addEventListener('input', validarPasswords);
  passwordCheck.addEventListener('input', validarPasswords);

  // ENVÍO DEL FORMULARIO
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (password.value !== passwordCheck.value) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch('https://procly.net/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.value,
          password: password.value,
          nombre: firstname.value,
          apellido: lastname.value,
          empresa_id: cuit.value
        })
      });

      const result = await response.json();

      if (response.ok) {
        window.location.href = '/app/auth/success_signup.html';
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('Error al conectar con el servidor.');
      console.error(error);
    }
  });
});
