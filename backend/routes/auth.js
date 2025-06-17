const express = require('express');
const router = express.Router();
const { supabase, supabaseService } = require('../config/supabase');

// 1. SIGNUP
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
router.post('/signup', async (req, res) => {
  const { email, password, nombre, apellido, empresa_id } = req.body;

  // PASO 1: crear usuario en Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    console.error('Error de Supabase:', authError);
    return res.status(400).json({ error: `Error: ${authError.message}` });
  }

  const userId = authData.user?.id;
  await delay(1000); // 1 segundo

  // PASO 2: guardar datos adicionales en public.profiles
  const { error: profileError } = await supabaseService
    .from('profiles')
    .insert([
      {
        profile_id: userId, 
        nombre: nombre,
        apellido: apellido,
        empresa_id: empresa_id,
        role: 'usuario', 
      },
    ]);

  if (profileError) {
    return res.status(500).json({ error: `Error al crear perfil de usuario: ${profileError.message}` });
  }
  

  return res.status(201).json({ message: 'Usuario y perfil creados exitosamente' });
});

// 2. LOGIN - Iniciar sesión
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
  
    if (loginError) return res.status(401).json({ error: loginError.message });
  
    const userId = loginData.user?.id;
  
    // Traer el perfil para conocer el rol
    const { data: perfil, error: perfilError } = await supabaseService
      .from('profiles')
      .select('role')
      .eq('profile_id', userId)
      .single();
  
    if (perfilError) {
      console.error('Error al obtener el perfil del usuario:', perfilError.message);
      return res.status(500).json({ error: 'No se pudo obtener el rol del usuario' });
    }
  
    let redirectUrl;
    switch (perfil.role) {
      case 'admin':
        redirectUrl = '/menu_admin.html';
        break;
      case 'proclier':
        redirectUrl = '/menu_proclier.html';
        break;
      default:
        redirectUrl = '/nuevo_ticket.html';
    }
  
    return res.status(200).json({
      message: 'Login exitoso',
      session: loginData.session,
      user: loginData.user,
      redirectTo: redirectUrl
    });
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
    redirectTo: 'https://procly.onrender.com/update_password.html'
  });

  if (error) return res.status(400).json({ error: error.message });

  return res.status(200).json({ message: 'Email de recuperación enviado', data });
});

module.exports = router;
