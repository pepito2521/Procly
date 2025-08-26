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

  // VALIDACIÓN DEL INPUT CUIT - Solo números, sin espacios
  cuit.addEventListener('input', (e) => {
    // Eliminar todo lo que no sea número
    let valor = e.target.value.replace(/\D/g, '');
    
    // Limitar a 11 dígitos
    if (valor.length > 11) {
      valor = valor.slice(0, 11);
    }
    
    // Actualizar el valor del input
    e.target.value = valor;
  });

  // Prevenir pegar texto que no sea numérico
  cuit.addEventListener('paste', (e) => {
    e.preventDefault();
    
    // Obtener solo números del texto pegado
    const textoPegado = (e.clipboardData || window.clipboardData).getData('text');
    const soloNumeros = textoPegado.replace(/\D/g, '');
    
    // Insertar solo números en la posición del cursor
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    const valorActual = e.target.value;
    
    const nuevoValor = valorActual.substring(0, start) + soloNumeros + valorActual.substring(end);
    
    // Limitar a 11 dígitos
    if (nuevoValor.length <= 11) {
      e.target.value = nuevoValor;
      e.target.setSelectionRange(start + soloNumeros.length, start + soloNumeros.length);
    }
  });

  // Prevenir arrastrar y soltar texto no numérico
  cuit.addEventListener('drop', (e) => {
    e.preventDefault();
    
    const textoArrastrado = e.dataTransfer.getData('text');
    const soloNumeros = textoArrastrado.replace(/\D/g, '');
    
    if (soloNumeros) {
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const valorActual = e.target.value;
      
      const nuevoValor = valorActual.substring(0, start) + soloNumeros + valorActual.substring(end);
      
      if (nuevoValor.length <= 11) {
        e.target.value = nuevoValor;
        e.target.setSelectionRange(start + soloNumeros.length, start + soloNumeros.length);
      }
    }
  });

  // ENVÍO DEL FORMULARIO
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (password.value !== passwordCheck.value) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch('/auth/signup', {
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
