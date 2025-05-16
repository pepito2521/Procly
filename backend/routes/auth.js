const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// 1. SIGNUP - Registrar nuevo usuario
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return res.status(400).json({ error: error.message });

  return res.status(201).json({ message: 'Usuario registrado correctamente', data });
});

// 2. LOGIN - Iniciar sesión
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return res.status(401).json({ error: error.message });

  return res.status(200).json({ message: 'Login exitoso', data });
});

// 3. LOGOUT - Cerrar sesión
router.post('/logout', async (req, res) => {
  const { error } = await supabase.auth.signOut();

  if (error) return res.status(400).json({ error: error.message });

  return res.status(200).json({ message: 'Sesión cerrada correctamente' });
});

// 4. RECUPERAR CONTRASEÑA - Enviar link de recuperación
router.post('/recover-password', async (req, res) => {
  const { email } = req.body;

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'http://localhost:3000/auth/update-password'
  });

  if (error) return res.status(400).json({ error: error.message });

  return res.status(200).json({ message: 'Email de recuperación enviado', data });
});

module.exports = router;
