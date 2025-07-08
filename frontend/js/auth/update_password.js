import { supabase } from '../supabaseClient.js';

const form = document.getElementById("update-password-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newPassword = document.getElementById("new-password").value;

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    alert("Error al actualizar contraseña: " + error.message);
  } else {
    alert("Contraseña actualizada correctamente.");
    window.location.href = "/index.html";
  }
});