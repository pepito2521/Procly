// VALIDACION DE CONTRASEÑAS

const password = document.getElementById('password');
const passwordCheck = document.getElementById('password-check');

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