import supabase from '../config/supabase.js';

export const getAdminDashboard = async (req, res) => {
  const empresaId = req.user.empresa_id;

  try {
    // Total de tickets de la empresa
    const { data: totalTickets, error: error1 } = await supabase
      .from('tickets')
      .select('ticket_id', { count: 'exact' })
      .eq('empresa_id', empresaId);

    // Tickets por estado
    const { data: statusCount, error: error2 } = await supabase
      .from('tickets')
      .select('estado, count:ticket_id', { groupBy: 'estado' })
      .eq('empresa_id', empresaId);

    // Top 5 usuarios por cantidad de tickets
    const { data: topUsers, error: error3 } = await supabase
      .from('tickets')
      .select('user_id, count:ticket_id', { groupBy: 'user_id' })
      .eq('empresa_id', empresaId)
      .order('count', { ascending: false })
      .limit(5);

    // Presupuesto total
    const { data: totalPresupuesto, error: error4 } = await supabase
      .rpc('sum_presupuesto_by_empresa', { input_empresa_id: empresaId });

    if (error1 || error2 || error3 || error4) throw error1 || error2 || error3 || error4;

    res.json({
      totalTickets: totalTickets.length,
      ticketsPorEstado: statusCount,
      topUsuarios: topUsers,
      presupuestoTotal: totalPresupuesto || 0
    });
  } catch (error) {
    console.error('Error en dashboard admin:', error.message);
    res.status(500).json({ error: 'Error al obtener datos del dashboard admin.' });
  }
};
