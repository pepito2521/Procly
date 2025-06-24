import supabase from '../config/supabase.js';

export const getUserDashboard = async (req, res) => {
  const userId = req.user.id;

  try {
    // Total de tickets del usuario
    const { data: totalTickets, error: error1 } = await supabase
      .from('tickets')
      .select('ticket_id', { count: 'exact' })
      .eq('user_id', userId);

    // Tickets por estado
    const { data: statusCount, error: error2 } = await supabase
      .from('tickets')
      .select('estado, count:ticket_id', { groupBy: 'estado' })
      .eq('user_id', userId);

    // Presupuesto total estimado
    const { data: totalPresupuesto, error: error3 } = await supabase
      .rpc('sum_presupuesto_by_user', { input_user_id: userId });

    if (error1 || error2 || error3) throw error1 || error2 || error3;

    res.json({
      totalTickets: totalTickets.length,
      ticketsPorEstado: statusCount,
      presupuestoTotal: totalPresupuesto || 0
    });
  } catch (error) {
    console.error('Error en dashboard usuario:', error.message);
    res.status(500).json({ error: 'Error al obtener datos del dashboard.' });
  }
};
