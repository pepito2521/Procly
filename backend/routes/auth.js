const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');


router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(201).json({ message: 'Usuario registrado correctamente', data });
});

module.exports = router;
