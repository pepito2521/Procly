const { supabaseService } = require('../config/supabase');

// ENMPRESA_ID DEL USUARIO AUTENTICADO
const getEmpresaId = async (userId) => {
  const { data, error } = await supabaseService
    .from('profiles')
    .select('empresa_id')
    .eq('profile_id', userId)
    .single();

  if (error) throw error;
  return data.empresa_id;
};


// 1. DIRECCIONES

    // KPI: TOTAL DIRECCIONES
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

    // KPI: LISTADO DIRECCIONES
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



// 2. DASHBOARD

    // KPI: TOTAL TICKETS
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

    // KPI: GASTO MENSUAL
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

    // KPI: PROMEDIO MENSUAL
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

    // KPI: ACUMULADO ANUAL
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


// 3. USUARIOS

    // KPI: LISTADO DE USUARIOS
    const usuarios = async (req, res) => {
        try {
        const getEmpresaId = async (userId) => {
            const { data, error } = await supabaseService
                .from('profiles')
                .select('empresa_id')
                .eq('profile_id', userId)
                .single();
            
            if (error) throw new Error('No se pudo obtener empresa_id');
            return data.empresa_id;
            };
        
        const empresaId = await getEmpresaId(req.user.id);
        
        const { data, error } = await supabaseService
            .from('profiles')
            .select('profile_id, nombre, apellido, email, bloqueado, limite_gasto')
            .eq('empresa_id', empresaId)
            .order('apellido', { ascending: true });
    
        if (error) throw error;
    
        console.log("Usuarios encontrados:", data);
        res.json({ usuarios: data });
        } catch (err) {
        console.error("Error al buscar usuarios:", err.message);
        res.status(500).json({ error: err.message });
        }
    };

    // KPI: TOTAL USUARIOS
    const totalUsuarios = async (req, res) => {
        try {
        const empresaId = await getEmpresaId(req.user.id);
    
        const { count, error } = await supabaseService
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('empresa_id', empresaId);
    
        if (error) throw error;
    
        res.json({ total: count });
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    };

    // KPI: USUARIOS ACTIVOS
    const usuariosActivos = async (req, res) => {
        try {
        const empresaId = await getEmpresaId(req.user.id);
    
        const { count, error } = await supabaseService
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('empresa_id', empresaId)
            .eq('bloqueado', false);
    
        if (error) throw error;
    
        res.json({ total: count });
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    };
  
    // KPI: GASTO PROMEDIO MENSUAL POR USUARIO
    const gastoPromedioMensual = async (req, res) => {
        try {
        const empresaId = await getEmpresaId(req.user.id);
    
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    
        const { data: tickets, error: err1 } = await supabaseService
            .from('tickets')
            .select('precio_seleccionado')
            .eq('empresa_id', empresaId)
            .gte('created_at', firstDay)
            .lte('created_at', lastDay);
    
        if (err1) throw err1;
    
        const { count: totalUsuarios, error: err2 } = await supabaseService
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('empresa_id', empresaId);
    
        if (err2) throw err2;
    
        const totalGasto = tickets.reduce((acc, t) => acc + (t.precio_seleccionado || 0), 0);
        const promedio = totalUsuarios > 0 ? totalGasto / totalUsuarios : 0;
    
        res.json({ promedio });
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    };
  
  
  

// 4. ACTIVIDAD

    // KPI: LISTADO DE TICKETS DE LA EMPRESA
    const actividadTickets = async (req, res) => {
        try {
        const empresaId = await getEmpresaId(req.user.id);
    
        const { data, error } = await supabaseService
            .from('tickets')
            .select(`
            codigo_ticket,
            estado,
            categoria,
            precio_seleccionado,
            user_id,
            profiles:profiles!tickets_user_id_fkey (nombre, apellido)
            `)
            .eq('empresa_id', empresaId)
            .order('created_at', { ascending: false });
    
        if (error) throw error;
    
        const resultado = data.map(t => ({
            codigo_ticket: t.codigo_ticket,
            nombre: t.profiles?.nombre ?? '',
            apellido: t.profiles?.apellido ?? '',
            estado: t.estado,
            categoria: t.categoria,
            precio: t.estado === 'entregado'
            ? `$${t.precio_seleccionado?.toLocaleString() ?? '0'}`
            : 'En proceso'
        }));
    
        res.json({ tickets: resultado });
    
        } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
        }
    };

  // KPI: TICKETS ENTREGADOS
  const ticketsEntregados = async (req, res) => {
    try {
      const empresaId = await getEmpresaId(req.user.id);
  
      const { count, error } = await supabaseService
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', empresaId)
        .eq('estado', 'entregado');
  
      if (error) throw error;
  
      res.json({ total: count });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

    // KPI: TICKETS EN PROCESO
    const ticketsEnProceso = async (req, res) => {
    try {
        const empresaId = await getEmpresaId(req.user.id);

        const { count, error } = await supabaseService
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', empresaId)
        .not('estado', 'in', '("entregado","cancelado")');

        if (error) throw error;

        res.json({ total: count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    };

    const ticketsCancelados = async (req, res) => {
        try {
          const empresaId = await getEmpresaId(req.user.id);
      
          const { count, error } = await supabaseService
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .eq('empresa_id', empresaId)
            .eq('estado', 'cancelado');
      
          if (error) throw error;
      
          res.json({ total: count });
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
  acumuladoAnual,
  usuarios,
  totalUsuarios,
  usuariosActivos,
  gastoPromedioMensual,
  actividadTickets,
  ticketsEntregados,
  ticketsEnProceso,
  ticketsCancelados
};
