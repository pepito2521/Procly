const { supabaseService } = require('../config/supabase');

// 🔹 Utilidad para obtener empresa_id a partir del usuario autenticado
const getEmpresaId = async (userId) => {
  const { data, error } = await supabaseService
    .from('profiles')
    .select('empresa_id')
    .eq('profile_id', userId)
    .single();

  if (error) throw error;
  return data.empresa_id;
};

// 📊 KPI: Total de direcciones activas
const direccionesTotales = async (req, res) => {
  try {
    const empresaId = await getEmpresaId(req.user.id);

    const { count, error } = await supabaseService
      .from('direcciones_entrega')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresaId)
      .eq('is_active', true);

    if (error) throw error;
    res.json({ total: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📋 Listado de direcciones activas
const direcciones = async (req, res) => {
  try {
    const empresaId = await getEmpresaId(req.user.id);

    const { data, error } = await supabaseService
      .from('direcciones_entrega')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('is_active', true);

    if (error) throw error;
    res.json({ direcciones: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Total tickets procesados
const ticketsProcesados = async (req, res) => {
  try {
    const empresaId = await getEmpresaId(req.user.id);

    const { count, error } = await supabaseService
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresaId);

    if (error) throw error;
    res.json({ total: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 💰 Gasto mensual
const gastoMensual = async (req, res) => {
  try {
    const empresaId = await getEmpresaId(req.user.id);

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    const { data, error } = await supabaseService
      .from('tickets')
      .select('precio_seleccionado')
      .eq('empresa_id', empresaId)
      .gte('created_at', firstDay)
      .lte('created_at', lastDay);

    if (error) throw error;

    const total = data.reduce((acc, t) => acc + (t.precio_seleccionado || 0), 0);
    res.json({ total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📈 Promedio mensual
const promedioMensual = async (req, res) => {
  try {
    const empresaId = await getEmpresaId(req.user.id);

    const now = new Date();
    const startYear = new Date(now.getFullYear(), 0, 1).toISOString();
    const endYear = new Date(now.getFullYear(), 11, 31).toISOString();

    const { data, error } = await supabaseService
      .from('tickets')
      .select('precio_seleccionado, created_at')
      .eq('empresa_id', empresaId)
      .gte('created_at', startYear)
      .lte('created_at', endYear);

    if (error) throw error;

    const sum = data.reduce((acc, t) => acc + (t.precio_seleccionado || 0), 0);
    const promedio = sum / 12;

    res.json({ promedio });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📊 Acumulado anual
const acumuladoAnual = async (req, res) => {
  try {
    const empresaId = await getEmpresaId(req.user.id);

    const { data, error } = await supabaseService
      .from('tickets')
      .select('precio_seleccionado')
      .eq('empresa_id', empresaId);

    if (error) throw error;

    const total = data.reduce((acc, t) => acc + (t.precio_seleccionado || 0), 0);
    res.json({ total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  direccionesTotales,
  direcciones,
  ticketsProcesados,
  gastoMensual,
  promedioMensual,
  acumuladoAnual
};
