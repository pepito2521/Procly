const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// MIDDLEWARE: EMPRESA_ID DEL USUARIO AUTENTICADO
const getEmpresaId = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('empresa_id')
    .eq('profile_id', userId)
    .single();

  if (error) throw error;
  return data.empresa_id;
};


//1.KPIS: DIRECCIONES

    // TOTAL DIRECCIONES ACTIVAS
    router.get('/direcciones-totales', async (req, res) => {
        try {
        const userId = req.query.user_id;
        const empresaId = await getEmpresaId(userId);
    
        const { count, error } = await supabase
            .from('direcciones_entrega')
            .select('*', { count: 'exact', head: true })
            .eq('empresa_id', empresaId)
            .eq('is_active', true);
    
        if (error) throw error;
        res.json({ total: count });
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    });

    // LISTADO DE DIRECCIONES ACTIVAS
    router.get('/direcciones', async (req, res) => {
        try {
        const userId = req.query.user_id;
        const empresaId = await getEmpresaId(userId);
    
        const { data, error } = await supabase
            .from('direcciones_entrega')
            .select('*')
            .eq('empresa_id', empresaId)
            .eq('is_active', true);
    
        if (error) throw error;
        res.json({ direcciones: data });
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    });
 
    

//2.KPIS: DASHBOARD

    // TOTAL TICKETS PROCESADOS
    router.get('/tickets-procesados', async (req, res) => {
    try {
        const userId = req.query.user_id;
        const empresaId = await getEmpresaId(userId);

        const { count, error } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', empresaId);

        if (error) throw error;
        res.json({ total: count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    });

    // 🔹 Gasto mensual (sum de precio_seleccionado del mes actual)
    router.get('/gasto-mensual', async (req, res) => {
    try {
        const userId = req.query.user_id;
        const empresaId = await getEmpresaId(userId);

        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

        const { data, error } = await supabase
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
    });

    // 🔹 Promedio mensual (promedio anual de gasto)
    router.get('/promedio-mensual', async (req, res) => {
    try {
        const userId = req.query.user_id;
        const empresaId = await getEmpresaId(userId);

        const now = new Date();
        const startYear = new Date(now.getFullYear(), 0, 1).toISOString();
        const endYear = new Date(now.getFullYear(), 11, 31).toISOString();

        const { data, error } = await supabase
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
    });

    // 🔹 Acumulado anual (sum total precio_seleccionado)
    router.get('/acumulado-anual', async (req, res) => {
    try {
        const userId = req.query.user_id;
        const empresaId = await getEmpresaId(userId);

        const { data, error } = await supabase
        .from('tickets')
        .select('precio_seleccionado')
        .eq('empresa_id', empresaId);

        if (error) throw error;

        const total = data.reduce((acc, t) => acc + (t.precio_seleccionado || 0), 0);
        res.json({ total });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    });

    module.exports = router;
