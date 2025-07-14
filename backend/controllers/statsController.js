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

        if (error) throw error;
        res.json({ total: count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    };

    // KPI: DIRECCIONES ACTIVAS
    const getDireccionesActivas = async (req, res) => {
        try {
            const empresaId = await getEmpresaId(req.user.id);
        
            const { count, error } = await supabaseService
            .from('direcciones_entrega')
            .select('*', { count: 'exact', head: true })
            .eq('empresa_id', empresaId)
            .eq('is_active', true);
        
            if (error) throw error;
        
            res.json({ total: count });
        } catch (error) {
          console.error("Error al obtener direcciones activas:", error.message);
          res.status(500).json({ error: "Error al obtener direcciones activas" });
        }
      };


    // KPI: DIRECCIONES BLOQUEADAS
    const getDireccionesBloqueadas = async (req, res) => {
        try {
          const empresaId = await getEmpresaId(req.user.id);
      
          const { count, error } = await supabaseService
            .from('direcciones_entrega')
            .select('*', { count: 'exact', head: true })
            .eq('empresa_id', empresaId)
            .eq('is_active', false);
      
          if (error) throw error;
      
          res.json({ total: count });
        } catch (error) {
          console.error("Error al obtener direcciones bloqueadas:", error.message);
          res.status(500).json({ error: "Error al obtener direcciones bloqueadas" });
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

        if (error) throw error;
        res.json({ direcciones: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    };
    // CREAR DIRECCIÓN DE ENTREGA
    const crearDireccion = async (req, res) => {
        try {
        const empresaId = await getEmpresaId(req.user.id);
        const { nombre, direccion, ciudad, provincia, codigo_postal, pais, is_active } = req.body;
        const { error } = await supabaseService
            .from('direcciones_entrega')
            .insert([
            {
                empresa_id: empresaId,
                nombre,
                direccion,
                ciudad,
                provincia,
                codigo_postal,
                pais,
                is_active: is_active !== undefined ? is_active : true
            }
            ]);
        if (error) throw error;
        res.json({ success: true });
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    };

    // EDITAR DIRECCIÓN DE ENTREGA
    const editarDireccion = async (req, res) => {
        try {
        const direccionId = req.params.id;
        const empresaId = await getEmpresaId(req.user.id);
    
        const { data: direccion, error: errorDireccion } = await supabaseService
            .from('direcciones_entrega')
            .select('empresa_id')
            .eq('direccion_id', direccionId)
            .single();
        if (errorDireccion) throw errorDireccion;
        if (!direccion || direccion.empresa_id !== empresaId) {
            return res.status(403).json({ error: 'No autorizado para editar esta dirección' });
        }
    
        const { nombre, direccion: dir, ciudad, provincia, codigo_postal, pais, is_active } = req.body;
        const { error } = await supabaseService
            .from('direcciones_entrega')
            .update({
            nombre,
            direccion: dir,
            ciudad,
            provincia,
            codigo_postal,
            pais,
            is_active
            })
            .eq('direccion_id', direccionId);
    
        if (error) throw error;
        res.json({ success: true });
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    };

    // ELIMINAR DIRECCIÓN DE ENTREGA
    const eliminarDireccion = async (req, res) => {
        try {
            const direccionId = req.params.id;
            const empresaId = await getEmpresaId(req.user.id);
            // Validar que la dirección pertenezca a la empresa
            const { data: direccion, error: errorDireccion } = await supabaseService
                .from('direcciones_entrega')
                .select('empresa_id')
                .eq('direccion_id', direccionId)
                .single();
            if (errorDireccion) throw errorDireccion;
            if (!direccion || direccion.empresa_id !== empresaId) {
                return res.status(403).json({ error: 'No autorizado para eliminar esta dirección' });
            }
            // Eliminar la dirección
            const { error } = await supabaseService
                .from('direcciones_entrega')
                .delete()
                .eq('direccion_id', direccionId);
            if (error) throw error;
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };


// 2. DASHBOARD
    // KPI: TOTAL TICKETS
    const ticketsTotales = async (req, res) => {
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

    // KPI: GASTO MES EN CURSO
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

    // KPI: GASTOS MENSUALES AÑO EN CURSO
    const gastosMensuales = async (req, res) => {
        try {
          const empresaId = await getEmpresaId(req.user.id);
          const now = new Date();
          const year = now.getFullYear();
          const monthlyTotals = Array(12).fill(0);
      
          const { data, error } = await supabaseService
            .from('tickets')
            .select('precio_seleccionado, created_at')
            .eq('empresa_id', empresaId)
            .gte('created_at', `${year}-01-01`)
            .lte('created_at', `${year}-12-31`);
      
          if (error) throw error;
      
          data.forEach(ticket => {
            const month = new Date(ticket.created_at).getMonth(); // 0 = enero
            monthlyTotals[month] += ticket.precio_seleccionado || 0;
          });
      
          res.json({ monthlyTotals });
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

    // KPI: USUARIOS NUEVOS ESTE MES
    const usuariosNuevosEsteMes = async (req, res) => {
        try {
        const empresaId = await getEmpresaId(req.user.id);
    
        const primerDiaMes = new Date();
        primerDiaMes.setDate(1);
        primerDiaMes.setHours(0, 0, 0, 0);
    
        const { count, error } = await supabaseService
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('empresa_id', empresaId)
            .gte('created_at', primerDiaMes.toISOString());
    
        if (error) throw error;
    
        res.json({ nuevos: count });
        } catch (err) {
        console.error("Error en usuariosNuevosEsteMes:", err.message);
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

    // KPI: % de USUARIOS ACTIVOS
    const porcentajeUsuariosActivos = async (req, res) => {
        try {
        const empresaId = await getEmpresaId(req.user.id);
    
        // Total usuarios
        const { count: total, error: totalError } = await supabaseService
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('empresa_id', empresaId);
    
        if (totalError) throw totalError;
    
        // Usuarios activos (no bloqueados)
        const { count: activos, error: activosError } = await supabaseService
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('empresa_id', empresaId)
            .eq('bloqueado', false);
    
        if (activosError) throw activosError;
    
        const porcentaje = total > 0 ? Math.round((activos / total) * 100) : 0;
    
        res.json({ porcentaje });
        } catch (err) {
        console.error("Error en porcentajeUsuariosActivos:", err.message);
        res.status(500).json({ error: err.message });
        }
    };

    // KPI: USUARIOS BLOQUEADOS
    const usuariosBloqueados = async (req, res) => {
        try {
            const empresaId = await getEmpresaId(req.user.id);
            const { count, error } = await supabaseService
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('empresa_id', empresaId)
                .eq('bloqueado', true);
            if (error) throw error;
            res.json({ total: count });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    // KPI: % de USUARIOS BLOQUEADOS
    const porcentajeUsuariosBloqueados = async (req, res) => {
        try {
            const empresaId = await getEmpresaId(req.user.id);
            // Total usuarios
            const { count: total, error: totalError } = await supabaseService
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('empresa_id', empresaId);
            if (totalError) throw totalError;
            // Usuarios bloqueados
            const { count: bloqueados, error: bloqueadosError } = await supabaseService
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('empresa_id', empresaId)
                .eq('bloqueado', true);
            if (bloqueadosError) throw bloqueadosError;
            const porcentaje = total > 0 ? Math.round((bloqueados / total) * 100) : 0;
            res.json({ porcentaje });
        } catch (err) {
            console.error("Error en porcentajeUsuariosBloqueados:", err.message);
            res.status(500).json({ error: err.message });
        }
    };
  
  
    // KPI: ACUMULADO GASTO POR USUARIO
    const gastoTotalPorUsuario = async (req, res) => {
        try {
        const empresaId = await getEmpresaId(req.user.id);
    
        const { data: usuarios, error: errorUsuarios } = await supabaseService
            .from('profiles')
            .select('profile_id, nombre, apellido, email, bloqueado, limite_gasto')
            .eq('empresa_id', empresaId);
    
        if (errorUsuarios) throw errorUsuarios;
    
        const { data: tickets, error: errorTickets } = await supabaseService
            .from('tickets')
            .select('user_id, precio_seleccionado')
            .eq('empresa_id', empresaId);
    
        if (errorTickets) throw errorTickets;
    
        const usuariosConGasto = usuarios.map(u => {
            const gasto = tickets
            .filter(t => t.user_id === u.profile_id)
            .reduce((acc, t) => acc + (t.precio_seleccionado || 0), 0);
    
            return {
            ...u,
            gasto_total: gasto
            };
        });
    
        res.json({ usuarios: usuariosConGasto });
        } catch (err) {
        console.error("Error en gastoTotalPorUsuario:", err.message);
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
            nombre,
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
            nombre_ticket: t.nombre ?? '',
            estado: t.estado,
            categoria: t.categoria,
            precio: (t.precio_seleccionado != null && Number(t.precio_seleccionado) > 0)
                ? `$${Number(t.precio_seleccionado).toLocaleString()}`
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
        .eq('estado', 'Entregado');

  
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
        .not('estado', 'in', '("Entregado","Cancelado")');


        if (error) throw error;

        res.json({ total: count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    };

    // KPI: TICKETS CANCELADOS
    const ticketsCancelados = async (req, res) => {
        try {
          const empresaId = await getEmpresaId(req.user.id);
      
          const { count, error } = await supabaseService
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .eq('empresa_id', empresaId)
            .eq('estado', 'Cancelado');

      
          if (error) throw error;
      
          res.json({ total: count });
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      };

    // KPI: TENDENCIA TICKETS VS MES ANTERIOR
    const tendenciaTicketsVsMesAnterior = async (req, res) => {
        try {
        const empresaId = await getEmpresaId(req.user.id);
        const now = new Date();
        const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

        const { count: total_tickets, error: errorTotal } = await supabaseService
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .eq('empresa_id', empresaId);
        if (errorTotal) throw errorTotal;

        const { count: total_mes_anterior, error: errorMesAnt } = await supabaseService
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .eq('empresa_id', empresaId)
            .gte('created_at', firstDayPrevMonth.toISOString())
            .lte('created_at', lastDayPrevMonth.toISOString());
        if (errorMesAnt) throw errorMesAnt;
    
        let tendencia = 0;
        if (total_mes_anterior > 0) {
            tendencia = Math.round(((total_tickets - total_mes_anterior) / total_mes_anterior) * 100);
        }
        res.json({ tendencia });
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    };
  
  // KPI: % TICKETS ENTREGADOS
  const porcentajeTicketsEntregados = async (req, res) => {
    try {
      const empresaId = await getEmpresaId(req.user.id);
      const { count: total_tickets, error: errorTotal } = await supabaseService
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', empresaId);
      if (errorTotal) throw errorTotal;
      const { count: entregados, error: errorEntregados } = await supabaseService
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', empresaId)
        .eq('estado', 'Entregado');
      if (errorEntregados) throw errorEntregados;
      const porcentaje = total_tickets > 0 ? Math.round((entregados / total_tickets) * 100) : 0;
      res.json({ porcentaje });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  // KPI: % TICKETS EN CURSO
  const porcentajeTicketsEnCurso = async (req, res) => {
    try {
      const empresaId = await getEmpresaId(req.user.id);
      const { count: total_tickets, error: errorTotal } = await supabaseService
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', empresaId);
      if (errorTotal) throw errorTotal;
      const { count: en_curso, error: errorEnCurso } = await supabaseService
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', empresaId)
        .not('estado', 'in', '("Entregado","Cancelado")');
      if (errorEnCurso) throw errorEnCurso;
      const porcentaje = total_tickets > 0 ? Math.round((en_curso / total_tickets) * 100) : 0;
      res.json({ porcentaje });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  // KPI: % TICKETS CANCELADOS
  const porcentajeTicketsCancelados = async (req, res) => {
    try {
      const empresaId = await getEmpresaId(req.user.id);
      const { count: total_tickets, error: errorTotal } = await supabaseService
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', empresaId);
      if (errorTotal) throw errorTotal;
      const { count: cancelados, error: errorCancelados } = await supabaseService
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', empresaId)
        .eq('estado', 'Cancelado');
      if (errorCancelados) throw errorCancelados;
      const porcentaje = total_tickets > 0 ? Math.round((cancelados / total_tickets) * 100) : 0;
      res.json({ porcentaje });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

module.exports = {
  direccionesTotales,
  getDireccionesActivas,
  getDireccionesBloqueadas,
  direcciones,
  ticketsTotales,
  gastoMensual,
  promedioMensual,
  acumuladoAnual,
  usuarios,
  usuariosNuevosEsteMes,
  totalUsuarios,
  usuariosActivos,
  porcentajeUsuariosActivos,
  actividadTickets,
  ticketsEntregados,
  ticketsEnProceso,
  ticketsCancelados,
  gastoTotalPorUsuario,
  gastosMensuales,
  usuariosBloqueados,
  porcentajeUsuariosBloqueados,
  eliminarDireccion,
  editarDireccion,
  crearDireccion,
  tendenciaTicketsVsMesAnterior,
  porcentajeTicketsEntregados,
  porcentajeTicketsEnCurso,
  porcentajeTicketsCancelados
};
